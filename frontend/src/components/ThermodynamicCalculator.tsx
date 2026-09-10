import { useState, useEffect } from 'react';
import { thermodynamicsService } from '../core/api/thermodynamic.service';
import { psiToBar, celsiusToKelvin, barToPsi } from '../core/utils/UnitConversion';
import { MODULE_PRESETS } from '../domain/modulePresets';
import { Settings2, ArrowRight, Gauge, Thermometer, Database } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function ThermodynamicCalculator({ onSaveCharge }) {
  const [capacity, setCapacity] = useState(MODULE_PRESETS[0].capacity_L);
  const [pressureUnit, setPressureUnit] = useState('bar');

  const [piInput, setPiInput] = useState(50);
  const [tiInput, setTiInput] = useState(25);
  const [pfInput, setPfInput] = useState(250);
  const [tfInput, setTfInput] = useState(45);

  const [result, setResult] = useState({ mass_kg: 0, volume_Sm3: 0, massInitial_kg: 0, massFinal_kg: 0 });

  const [isLoading, setIsLoading] = useState(false);

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
          massFinal_kg: calculated.finalMassKg
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
  };

  return (
    <div className="brutal-card flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-black pb-6 gap-6">
        <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 stroke-[3px]" />
          Motor Térmico
        </h2>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-widest bg-black text-white px-2 py-1">Módulo</span>
            <Select value={capacity.toString()} onValueChange={(val) => setCapacity(Number(val))}>
              <SelectTrigger className="w-[180px]">
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
            <span className="text-sm font-bold uppercase tracking-widest bg-black text-white px-2 py-1">Unidad</span>
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
              <SelectTrigger className="w-[110px]">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative">
        {/* Condiciones Iniciales */}
        <div className="brutal-panel-inner bg-[#E2E8F0]">
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 border-b-2 border-black pb-2">
            <span className="bg-black text-white w-8 h-8 flex items-center justify-center text-lg">1</span>
            Estado Inicial
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm font-bold uppercase mb-2">
                <span className="flex items-center gap-2"><Gauge className="w-5 h-5 stroke-[3px]"/> Presión Remanente</span>
              </label>
              <div className="relative">
                <input 
                  type="number" min="0" step="1"
                  value={piInput} onChange={(e) => setPiInput(Number(e.target.value))}
                  className="brutal-input w-full text-2xl pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">{pressureUnit}</span>
              </div>
            </div>
            
            <div>
              <label className="flex items-center justify-between text-sm font-bold uppercase mb-2">
                <span className="flex items-center gap-2"><Thermometer className="w-5 h-5 stroke-[3px]"/> Temperatura Remanente</span>
              </label>
              <div className="relative">
                <input 
                  type="number" step="0.1"
                  value={tiInput} onChange={(e) => setTiInput(Number(e.target.value))}
                  className="brutal-input w-full text-2xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">°C</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center">
            <span className="font-bold uppercase text-xs">Masa calculada</span>
            <span className="font-black font-mono text-xl">{result.massInitial_kg.toFixed(2)} kg</span>
          </div>
        </div>

        {/* Flecha central (solo desktop) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center bg-[#FFD700] border-4 border-black w-14 h-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
          <ArrowRight className="w-8 h-8 stroke-[3px] text-black" />
        </div>

        {/* Condiciones Finales */}
        <div className="brutal-panel-inner bg-white">
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 border-b-2 border-black pb-2">
            <span className="bg-black text-[#FFD700] w-8 h-8 flex items-center justify-center text-lg">2</span>
            Corte Compresor
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm font-bold uppercase mb-2">
                <span className="flex items-center gap-2"><Gauge className="w-5 h-5 stroke-[3px]"/> Presión Final</span>
              </label>
              <div className="relative">
                <input 
                  type="number" min="0" step="1"
                  value={pfInput} onChange={(e) => setPfInput(Number(e.target.value))}
                  className="brutal-input w-full text-2xl pr-16 bg-[#FEF9C3]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">{pressureUnit}</span>
              </div>
            </div>
            
            <div>
              <label className="flex items-center justify-between text-sm font-bold uppercase mb-2">
                <span className="flex items-center gap-2"><Thermometer className="w-5 h-5 stroke-[3px]"/> Temperatura Final</span>
              </label>
              <div className="relative">
                <input 
                  type="number" step="0.1"
                  value={tfInput} onChange={(e) => setTfInput(Number(e.target.value))}
                  className="brutal-input w-full text-2xl pr-12 bg-[#FEF9C3]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">°C</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center">
            <span className="font-bold uppercase text-xs">Masa calculada</span>
            <span className="font-black font-mono text-xl">{result.massFinal_kg.toFixed(2)} kg</span>
          </div>
        </div>
      </div>

      <div className="border-4 border-black bg-[#18181B] text-white p-8 flex flex-col xl:flex-row items-center justify-between gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-6 w-full xl:w-auto">
          <div className="bg-[#FFD700] p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hidden md:block">
            <Database className="w-12 h-12 text-black stroke-[3px]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#FFD700] uppercase tracking-widest font-black mb-2">Carga Neta Transferida</p>
            <div className="flex items-baseline gap-6 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono">{result.mass_kg.toFixed(2)}</span>
                <span className="text-xl font-bold">kg</span>
              </div>
              <span className="text-slate-600 text-4xl font-light hidden sm:inline">/</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-white">{result.volume_Sm3.toFixed(2)}</span>
                <span className="text-xl font-bold text-slate-400">Sm³</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          className="brutal-btn w-full xl:w-auto text-xl py-4 px-10"
        >
          Guardar Registro
        </button>
      </div>
    </div>
  );
}
