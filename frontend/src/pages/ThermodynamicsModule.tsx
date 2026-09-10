import { useState, useEffect } from 'react';
import ThermodynamicCalculator from '../components/ThermodynamicCalculator';
import ReconciliationLedger from '../components/ReconciliationLedger';
import { reconciliationService, CreateReconciliationDTO, ReconciliationRecord } from '../core/api/reconciliation.service';
import { psiToBar, celsiusToKelvin } from '../core/utils/UnitConversion';

export default function ThermodynamicsModule() {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);

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

  const handleSaveCharge = async (chargeData: any) => {
    try {
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
      setRecords(prev => [savedRecord, ...prev]);
    } catch (error) {
      console.error("Error guardando el registro", error);
      alert("Hubo un error guardando el registro en la base de datos.");
    }
  };

  const handleAddSale = async (id: string, saleVolume_Sm3: number) => {
    try {
      const updatedRecord = await reconciliationService.updateSaleVolume(id, saleVolume_Sm3);
      setRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ));
    } catch (error) {
      console.error("Error guardando la venta", error);
      alert("No se pudo guardar la venta en la base de datos.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-12 items-start h-full">
      <div className="xl:col-span-3">
        <ThermodynamicCalculator onSaveCharge={handleSaveCharge} />
      </div>
      
      <div className="xl:col-span-2 h-[calc(100vh-140px)] sticky top-0">
        <ReconciliationLedger records={records} onAddSale={handleAddSale} />
      </div>
    </div>
  );
}
