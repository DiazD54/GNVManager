import { useState, useEffect } from 'react';
import ThermodynamicCalculator from './components/ThermodynamicCalculator';
import ReconciliationLedger from './components/ReconciliationLedger';
import { Activity } from 'lucide-react';

function App() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('gnv_records');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved records');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gnv_records', JSON.stringify(records));
  }, [records]);

  const handleSaveCharge = (chargeData) => {
    const newRecord = {
      ...chargeData,
      id: crypto.randomUUID()
    };
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleAddSale = (id, saleVolume_Sm3) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, saleVolume_Sm3 } : record
    ));
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
