import { History, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ReconciliationRecord } from '../core/api/reconciliation.service';

export default function ReconciliationLedger({ records, onAddSale }: { records: ReconciliationRecord[], onAddSale: (id: string, vol: number) => void }) {
  return (
    <div className="flex flex-col h-full bg-transparent">
      
      <div className="flex items-center gap-3 border-b border-slate-300 dark:border-zinc-700 pb-6 mb-6">
        <div className="text-[var(--color-text-primary)]">
          <History className="w-6 h-6 stroke-[1.5px]" />
        </div>
        <div>
          <h2 className="text-xl font-serif text-[var(--color-text-primary)]">Libro Mayor</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Conciliación de inventario y mermas</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {records.length === 0 ? (
          <div className="text-center ui-card bg-transparent border-dashed">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-secondary)] stroke-[1.5px]" />
            <p className="text-lg font-serif">Sin Registros</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Calcula y guarda una carga para comenzar.</p>
          </div>
        ) : (
          records.map((record) => {
            const hasSale = record.saleVolumeSm3 !== undefined && record.saleVolumeSm3 !== null;
            const discrepancy = hasSale ? record.calculatedVolumeSm3 - record.saleVolumeSm3! : 0;
            const percentage = hasSale ? (discrepancy / record.calculatedVolumeSm3) * 100 : 0;
            // Warning if shrinkage is greater than 2% or we somehow gained more than 2%
            const isWarning = percentage > 2 || percentage < -2;

            return (
              <div key={record.id} className="ui-card p-5 space-y-4 shadow-sm hover:shadow transition-shadow">
                
                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                  <span className="ui-badge bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)]">
                    Mod {record.moduleCapacityLiters.toLocaleString()}L
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                    {new Date(record.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Cálculo</span>
                    <p className="text-xl font-mono text-[var(--color-text-primary)]">
                      {record.calculatedVolumeSm3.toFixed(2)} <span className="text-sm font-sans text-[var(--color-text-secondary)]">Sm³</span>
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Venta Real</span>
                    {hasSale ? (
                      <p className="text-xl font-mono text-[var(--color-text-primary)]">
                        {record.saleVolumeSm3!.toFixed(2)} <span className="text-sm font-sans text-[var(--color-text-secondary)]">Sm³</span>
                      </p>
                    ) : (
                      <span className="text-sm font-medium text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">Pendiente</span>
                    )}
                  </div>
                </div>

                {!hasSale ? (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Registrar Venta (Sm³)</label>
                    <input
                      type="number"
                      placeholder="Ej. 3000.5"
                      className="ui-input h-10 text-sm"
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' && e.target.value) {
                          onAddSale(record.id, Number(e.target.value));
                          e.target.value = '';
                        }
                      }}
                      onBlur={(e: any) => {
                        if (e.target.value) {
                          onAddSale(record.id, Number(e.target.value));
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className={`mt-2 p-3 rounded-md flex items-center justify-between border ${isWarning ? 'bg-[var(--color-alert-red-bg)] border-[var(--color-alert-red-border)] text-[var(--color-alert-red-text)]' : 'bg-[var(--color-alert-green-bg)] border-[var(--color-alert-green-border)] text-[var(--color-alert-green-text)]'}`}>
                    <div className="flex items-center gap-3">
                      {isWarning ? <AlertCircle className="w-5 h-5 stroke-[1.5px]" /> : <CheckCircle2 className="w-5 h-5 stroke-[1.5px]" />}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {isWarning ? 'Alerta Merma' : 'Conciliado'}
                        </p>
                        <p className="text-sm font-medium">
                          {discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)} Sm³ dif.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">% Merma</p>
                      <span className="text-base font-mono font-bold drop-shadow-[0_0_10px_currentColor]">
                        {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
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
