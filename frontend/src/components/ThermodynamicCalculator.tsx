import { useState, useEffect } from 'react';
import { thermodynamicsService } from '../core/api/thermodynamic.service';
import { psiToBar, celsiusToKelvin, barToPsi } from '../core/utils/UnitConversion';
import { MODULE_PRESETS } from '../domain/modulePresets';
import { ArrowRight, Gauge, Thermometer, Activity, Check, Snowflake } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function ThermodynamicCalculator({ onSaveCharge }) {
  const [capacity, setCapacity] = useState(MODULE_PRESETS[0].capacity_L);
  const [pressureUnit, setPressureUnit] = useState('bar');

  const [piInput, setPiInput] = useState(50);
  const [tiInput, setTiInput] = useState(25);
  const [pfInput, setPfInput] = useState(250);
  const [tfInput, setTfInput] = useState(45);

  const [result, setResult] = useState({ 
    mass_kg: 0, 
    volume_Sm3: 0, 
    massInitial_kg: 0, 
    massFinal_kg: 0,
    zInitial: 1.0,
    zFinal: 1.0,
    stabilizedPressureBar: 0,
    stabilizedTempCelsius: 20,
    thermalPressureLossBar: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    const fetchCalculation = async () => {
      setIsLoading(true);
      try {
        const p_i_bar = pressureUnit === 'psi' ? psiToBar(piInput) : piInput;
        const p_f_bar = pressureUnit === 'psi' ? psiToBar(pfInput) : pfInput;

        const t_i_K = celsiusToKelvin(tiInput);
        const t_f_K = celsiusToKelvin(tfInput);

        const calculated = await thermodynamicsService.calculateTransfer(
          Number(p_i_bar), t_i_K, Number(p_f_bar), t_f_K, capacity
        );
        
        setResult({
          mass_kg: calculated.massTransferredKg,
          volume_Sm3: calculated.volumeTransferredSm3,
          massInitial_kg: calculated.initialMassKg,
          massFinal_kg: calculated.finalMassKg,
          zInitial: calculated.zInitial ?? 1.0,
          zFinal: calculated.zFinal ?? 1.0,
          stabilizedPressureBar: calculated.stabilizedPressureBar ?? 0,
          stabilizedTempCelsius: calculated.stabilizedTempCelsius ?? 20,
          thermalPressureLossBar: calculated.thermalPressureLossBar ?? 0
        });
      } catch (error) {
        console.error("Error al calcular la termodinámica:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculation();
  }, [capacity, pressureUnit, piInput, tiInput, pfInput, tfInput]);

  const handleSave = () => {
    onSaveCharge({
      timestamp: new Date().toISOString(),
      capacity,
      initial: { p: piInput, t: tiInput },
      final: { p: pfInput, t: tfInput },
      unit: pressureUnit,
      mass_kg: result.mass_kg,
      volume_Sm3: result.volume_Sm3
    });
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const maxNominalPressure = pressureUnit === 'psi' ? 3600 : 250;
  const initialPercent = Math.min(100, Math.max(0, (piInput / maxNominalPressure) * 100));
  const finalPercent = Math.min(100, Math.max(0, (pfInput / maxNominalPressure) * 100));
  const deltaPercent = Math.max(0, Math.min(100 - initialPercent, finalPercent - initialPercent));
  const deltaPressure = Math.max(0, pfInput - piInput);

  const stabilizedPressureDisp = pressureUnit === 'psi' ? barToPsi(result.stabilizedPressureBar) : result.stabilizedPressureBar;
  const thermalPressureLossDisp = pressureUnit === 'psi' ? barToPsi(result.thermalPressureLossBar) : result.thermalPressureLossBar;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-300 dark:border-zinc-700 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h2 className="text-2xl font-serif text-[var(--color-text-primary)]">Calculadora Termodinámica</h2>
            <span className="ui-badge bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[10px] font-mono tracking-wider">
              AGA-8 DC-92 • ISO 12213-2
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">Calcula la transferencia de masa y propiedades termodinámicas para módulos GNV.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Módulo</span>
            <Select value={capacity.toString()} onValueChange={(val) => setCapacity(Number(val))}>
              <SelectTrigger className="w-[180px] h-10 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs font-medium">
                <SelectValue placeholder="Seleccionar módulo" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_PRESETS.map(preset => (
                  <SelectItem key={preset.id} value={preset.capacity_L.toString()}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Unidad</span>
            <Select 
              value={pressureUnit} 
              onValueChange={(newUnit) => {
                if (newUnit === 'psi' && pressureUnit === 'bar') {
                  setPiInput(Math.round(barToPsi(piInput)));
                  setPfInput(Math.round(barToPsi(pfInput)));
                } else if (newUnit === 'bar' && pressureUnit === 'psi') {
                  setPiInput(Math.round(psiToBar(piInput)));
                  setPfInput(Math.round(psiToBar(pfInput)));
                }
                setPressureUnit(newUnit);
              }}
            >
              <SelectTrigger className="w-[100px] h-10 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs font-medium">
                <SelectValue placeholder="Unidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">bar</SelectItem>
                <SelectItem value="psi">psi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        
        {/* Initial State */}
        <div className="ui-card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif mb-6 flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <span className="ui-badge bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">Estado 1</span>
              Condición Inicial (Talón)
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  <Gauge className="w-4 h-4 stroke-[1.5px]"/> Presión Remanente
                </label>
                <div className="relative">
                  <input 
                    type="number" min="0" step="1"
                    value={piInput} onChange={(e) => setPiInput(Number(e.target.value))}
                    className="ui-input text-lg pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)] font-mono">{pressureUnit}</span>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  <Thermometer className="w-4 h-4 stroke-[1.5px]"/> Temperatura Remanente
                </label>
                <div className="relative">
                  <input 
                    type="number" step="0.1"
                    value={tiInput} onChange={(e) => setTiInput(Number(e.target.value))}
                    className="ui-input text-lg pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)] font-mono">°C</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-[var(--color-text-secondary)] uppercase">Factor Z₁:</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
                {result.zInitial ? result.zInitial.toFixed(4) : '1.0000'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-secondary)] mr-1.5">Masa:</span>
              <span className="font-mono text-base font-semibold">{result.massInitial_kg.toFixed(2)} kg</span>
            </div>
          </div>
        </div>

        {/* Central arrow for desktop */}
        <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-accent)] rounded-full w-9 h-9 border border-[var(--color-border)] shadow-sm z-10 hover:scale-105 transition-transform">
          <ArrowRight className="w-4 h-4 stroke-[2px]" />
        </div>

        {/* Final State */}
        <div className="ui-card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif mb-6 flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <span className="ui-badge bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-accent)]">Estado 2</span>
              Corte Compresor
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  <Gauge className="w-4 h-4 stroke-[1.5px]"/> Presión Final
                </label>
                <div className="relative">
                  <input 
                    type="number" min="0" step="1"
                    value={pfInput} onChange={(e) => setPfInput(Number(e.target.value))}
                    className="ui-input text-lg pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)] font-mono">{pressureUnit}</span>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  <Thermometer className="w-4 h-4 stroke-[1.5px]"/> Temperatura Final
                </label>
                <div className="relative">
                  <input 
                    type="number" step="0.1"
                    value={tfInput} onChange={(e) => setTfInput(Number(e.target.value))}
                    className="ui-input text-lg pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)] font-mono">°C</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-[var(--color-text-secondary)] uppercase">Factor Z₂:</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-accent)]">
                {result.zFinal ? result.zFinal.toFixed(4) : '1.0000'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-secondary)] mr-1.5">Masa:</span>
              <span className="font-mono text-base font-semibold">{result.massFinal_kg.toFixed(2)} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Micro Cylinder Gauge / Monitor de Llenado */}
      <div className="ui-card p-5 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[var(--color-accent)] animate-pulse" />
            <span className="text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Perfil de Presurización del Módulo</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
            <span>ΔP Neta: <strong className="text-[var(--color-text-primary)] font-mono">+{deltaPressure} {pressureUnit}</strong></span>
            <span>•</span>
            <span>Llenado: <strong className="text-[var(--color-text-primary)] font-mono">{finalPercent.toFixed(0)}%</strong></span>
          </div>
        </div>

        {/* Cylinder Fill Bar Graphic */}
        <div className="relative h-5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 border border-[var(--color-border)] overflow-hidden p-0.5 flex items-center">
          {/* Remanente segment */}
          <div 
            className="h-full rounded-l-full bg-slate-300/60 dark:bg-zinc-700/60 border-r border-dashed border-[var(--color-border)] transition-all duration-500 flex items-center justify-end pr-1.5"
            style={{ width: `${initialPercent}%` }}
            title={`Remanente: ${piInput} ${pressureUnit}`}
          >
            {initialPercent >= 15 && (
              <span className="text-[9px] font-mono text-[var(--color-text-secondary)] font-semibold">
                {piInput}
              </span>
            )}
          </div>

          {/* Transferida (Delta) segment - Electric Cyan gradient */}
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 rounded-r-full shadow-xs transition-all duration-500 flex items-center justify-center min-w-[2px]"
            style={{ width: `${deltaPercent}%` }}
            title={`Inyección Neta: +${deltaPressure} ${pressureUnit}`}
          >
            {deltaPercent >= 12 && (
              <span className="text-[10px] font-mono text-white font-bold tracking-tight">
                +{deltaPressure}
              </span>
            )}
          </div>
        </div>

        {/* Gauge Scale Markers */}
        <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-secondary)] px-1">
          <span>0 {pressureUnit}</span>
          <span className="text-center opacity-60">Escala de Servicio ({maxNominalPressure} {pressureUnit} Nom.)</span>
          <span>{maxNominalPressure} {pressureUnit}</span>
        </div>
      </div>

      {/* Pronóstico de Estabilización Térmica en Reposo */}
      <div className="ui-card p-5 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 border border-blue-500/20">
            <Snowflake className="w-5 h-5 stroke-[1.75px]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Presión Estabilizada en Reposo ({result.stabilizedTempCelsius}°C)</h4>
              <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                Anti-Merma Falsa
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xl leading-relaxed">
              Al enfriarse el gas de <strong className="font-mono text-[var(--color-text-primary)]">{tfInput}°C</strong> a <strong className="font-mono text-[var(--color-text-primary)]">{result.stabilizedTempCelsius}°C</strong> ambiente, el manómetro caerá normalmente <strong className="text-blue-600 dark:text-blue-400 font-mono">-{thermalPressureLossDisp.toFixed(1)} {pressureUnit}</strong> por contracción térmica isocórica. <span className="underline decoration-blue-500/30">No representa fuga ni pérdida de masa.</span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0 sm:border-l sm:border-[var(--color-border)] sm:pl-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-0.5">Lectura Manométrica Fría</span>
          <span className="text-2xl font-mono font-bold text-[var(--color-text-primary)] tracking-tight">
            {stabilizedPressureDisp.toFixed(1)} <span className="text-sm font-sans font-normal text-[var(--color-text-secondary)]">{pressureUnit}</span>
          </span>
        </div>
      </div>

      {/* Results Panel */}
      <div className="ui-card flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <div className="flex-1 w-full text-center md:text-left">
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">Carga Neta Transferida</p>
          <div className="flex items-baseline justify-center md:justify-start gap-4 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-serif tracking-tight text-[var(--color-text-primary)]">{result.mass_kg.toFixed(2)}</span>
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">kg</span>
            </div>
            <span className="text-[var(--color-text-secondary)] text-2xl font-light">/</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-serif tracking-tight text-[var(--color-text-primary)]">{result.volume_Sm3.toFixed(2)}</span>
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Sm³</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          className={`ui-button w-full md:w-auto transition-all duration-300 ${isSavedFeedback ? 'bg-emerald-600 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''}`}
        >
          {isSavedFeedback ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[2.5px]" />
              Guardado
            </span>
          ) : (
            'Guardar Cálculo'
          )}
        </button>
      </div>

    </div>
  );
}
