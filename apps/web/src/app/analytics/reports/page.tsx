import React, { useState } from 'react';
import ReportingDashboard from '@/components/analytics/ReportingDashboard';
import ExportModal from '@/components/analytics/ExportModal';

export default function ReportsPage() {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    return (
        <div className="h-full relative overflow-y-auto custom-scrollbar">
            {/* 
        No componente real de Dashboard, o botão de exportação chamaria 
        a abertura do modal. Aqui simulamos o estado.
      */}
            <ReportingDashboard />

            {/* Trigger flutuante para facilitar o teste no MVP */}
            <button
                onClick={() => setIsExportModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <div className="absolute -top-12 right-0 bg-bg-1 border border-stroke px-3 py-1.5 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Opções de Exportação
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </button>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </div>
    );
}
