import { useState } from 'react';
import { History, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';

import { ReconciliationRecord } from '../core/api/reconciliation.service';

export default function ReconciliationLedger({ records, onAddSale }: { records: ReconciliationRecord[], onAddSale: (id: string, vol: number) => void }) {
  return (
    <div className="brutal-card flex flex-col h-full bg-white">
      <div className="flex items-center gap-4 border-b-4 border-slate-800 pb-6 mb-8">
        <div className="bg-black p-3 shadow-sm shadow-slate-300">
          <History className="w-8 h-8 text-white stroke-[2px]" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">Libro Mayor</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Conciliación de Inventario</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-8">
        {records.length === 0 ? (
          <div className="text-center bg-[#f4f4f5] border-2 border-slate-800 p-10 shadow-sm shadow-slate-300">
            <FileSpreadsheet className="w-20 h-20 mx-auto mb-6 text-black stroke-[1.5px]" />
            <p className="text-xl font-black uppercase">Sin Registros</p>
            <p className="text-sm mt-2 font-bold text-slate-600">Calcula y guarda una carga para comenzar.</p>
          </div>
        ) : (
          records.map((record) => {
            const hasSale = record.saleVolumeSm3 !== undefined && record.saleVolumeSm3 !== null;
            const discrepancy = hasSale ? record.calculatedVolumeSm3 - record.saleVolumeSm3! : 0;
            const percentage = hasSale ? (discrepancy / record.calculatedVolumeSm3) * 100 : 0;
            const isWarning = percentage > 2 || percentage < -2;

            return (
              <div key={record.id} className="bg-white border-2 border-slate-800 shadow-sm shadow-slate-300 p-6">
                <div className="flex justify-between items-start mb-6 border-b-2 border-slate-800 pb-4">
                  <div className="text-sm font-bold bg-black text-white px-3 py-1 uppercase tracking-widest">
                    Mod {record.moduleCapacityLiters.toLocaleString()}L
                  </div>
                  <div className="text-sm text-black font-mono font-bold">
                    {new Date(record.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="border-2 border-slate-800 p-4 bg-[#E2E8F0] relative">
                    <span className="absolute -top-3 left-4 bg-white border-2 border-slate-800 px-2 text-xs font-black uppercase tracking-widest">Carga</span>
                    <p className="text-2xl font-black font-mono text-black mt-2">{record.calculatedVolumeSm3.toFixed(2)} <span className="text-base text-slate-600 font-sans">Sm³</span></p>
                  </div>
                  
                  <div className="border-2 border-slate-800 p-4 bg-white relative">
                    <span className="absolute -top-3 left-4 bg-white border-2 border-slate-800 px-2 text-xs font-black uppercase tracking-widest">Venta</span>
                    {hasSale ? (
                      <p className="text-2xl font-black font-mono text-black mt-2">{record.saleVolumeSm3!.toFixed(2)} <span className="text-base text-slate-600 font-sans">Sm³</span></p>
                    ) : (
                      <span className="text-sm font-bold text-slate-400 block mt-3 uppercase">Pendiente</span>
                    )}
                  </div>
                </div>

                {!hasSale ? (
                  <div className="mt-6 border-t-2 border-slate-800 pt-4">
                    <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Venta Registrada (Sm³)</label>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        placeholder="Ej. 3000.5"
                        className="brutal-input flex-1 text-xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            onAddSale(record.id, Number(e.target.value));
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            onAddSale(record.id, Number(e.target.value));
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`mt-6 p-4 border-2 border-slate-800 flex items-center justify-between ${isWarning ? 'bg-[#FF4500] text-white' : 'bg-[#00FF7F] text-black'} shadow-sm shadow-slate-300`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 border-2 border-slate-800">
                        {isWarning ? <AlertTriangle className="w-6 h-6 text-black stroke-[2px]" /> : <CheckCircle2 className="w-6 h-6 text-black stroke-[2px]" />}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest">
                          {isWarning ? 'Alerta Merma' : 'OK'}
                        </p>
                        <p className="text-xl font-black font-mono">
                          {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right bg-white text-black border-2 border-slate-800 px-4 py-2">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Diferencia</p>
                      <span className="text-lg font-black font-mono">
                        {discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
