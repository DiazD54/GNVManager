import { useState, useEffect } from 'react';
import ThermodynamicCalculator from './components/ThermodynamicCalculator';
import ReconciliationLedger from './components/ReconciliationLedger';
import { reconciliationService, CreateReconciliationDTO, ReconciliationRecord } from './core/api/reconciliation.service';
import { Activity } from 'lucide-react';
import { psiToBar, celsiusToKelvin } from './core/utils/UnitConversion';

function App() {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);

  // 1. Cargar el historial desde Supabase al iniciar
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await reconciliationService.getHistory();
        setRecords(history);
      } catch (error) {
        console.error("Error al conectar con la base de datos", error);
      }
    };
    fetchHistory();
  }, []);

  // 2. Guardar un nuevo registro en Supabase
  const handleSaveCharge = async (chargeData: any) => {
    try {
      // Formatear los datos para la API
      const dto: CreateReconciliationDTO = {
        moduleCapacityLiters: chargeData.capacity,
        initialPressureBar: chargeData.unit === 'psi' ? psiToBar(chargeData.initial.p) : chargeData.initial.p,
        initialTempK: celsiusToKelvin(chargeData.initial.t),
        finalPressureBar: chargeData.unit === 'psi' ? psiToBar(chargeData.final.p) : chargeData.final.p,
        finalTempK: celsiusToKelvin(chargeData.final.t),
        calculatedMassKg: chargeData.mass_kg,
        calculatedVolumeSm3: chargeData.volume_Sm3
      };

      const savedRecord = await reconciliationService.saveRecord(dto);
      
      // Añadir al principio de la lista de la pantalla
      setRecords(prev => [savedRecord, ...prev]);
    } catch (error) {
      console.error("Error guardando el registro", error);
      alert("Hubo un error guardando el registro en la base de datos.");
    }
  };

  const handleAddSale = async (id: string, saleVolume_Sm3: number) => {
    try {
      // Llamar al backend para actualizar la venta
      const updatedRecord = await reconciliationService.updateSaleVolume(id, saleVolume_Sm3);
      
      // Actualizar el estado local para que UI reaccione instantáneamente
      setRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ));
    } catch (error) {
      console.error("Error guardando la venta", error);
      alert("No se pudo guardar la venta en la base de datos.");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans selection:bg-[#FFD700] selection:text-black">
      <div className="max-w-[1600px] mx-auto space-y-12">
        <header className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b-4 border-black">
          <div className="bg-[#FFD700] p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <Activity className="w-10 h-10 text-black stroke-[3px]" />
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-black" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
              GNV Manager
            </h1>
            <p className="text-xl text-black font-bold mt-2 uppercase tracking-widest bg-[#FFD700] inline-block px-2 border-2 border-black">
              Ingeniería Térmica & Conciliación
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 xl:grid-cols-5 gap-12 items-start">
          <div className="xl:col-span-3">
            <ThermodynamicCalculator onSaveCharge={handleSaveCharge} />
          </div>
          
          <div className="xl:col-span-2 xl:sticky xl:top-12 h-[85vh]">
            <ReconciliationLedger records={records} onAddSale={handleAddSale} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
