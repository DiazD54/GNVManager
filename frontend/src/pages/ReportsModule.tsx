import { Construction } from 'lucide-react';

export default function ReportsModule() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] border-2 border-dashed border-slate-800 bg-white p-8">
      <div className="bg-[#FFD700] p-6 border-2 border-slate-800 shadow-md shadow-slate-300 mb-8 transform -rotate-6">
        <Construction className="w-16 h-16 text-black stroke-[2px]" />
      </div>
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-center">
        Módulo en Construcción
      </h2>
      <p className="text-xl font-bold uppercase tracking-widest text-slate-500 text-center max-w-lg">
        El sistema de reportes de auditoría y análisis de tendencias estará disponible en la próxima actualización.
      </p>
    </div>
  );
}
