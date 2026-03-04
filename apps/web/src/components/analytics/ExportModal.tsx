"use client";
import React, { useState } from 'react';
import { X, FileText, Table, FileJson, Download, Check } from 'lucide-react';

export default function ExportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [format, setFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const handleExport = () => {
        setIsExporting(true);
        // Simular o trigger do download via API
        window.location.href = 'http://localhost:8000/reports/export/csv';
        setTimeout(() => {
            setIsExporting(false);
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-bg-0/60 animate-in fade-in">
            <div className="w-full max-w-md bg-bg-1 border border-stroke rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-stroke flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Exportar Relatório</h3>
                    <button onClick={onClose} className="text-text-3 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-text-3 uppercase tracking-widest">Selecione o Formato</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'csv', icon: Table, label: 'CSV' },
                                { id: 'pdf', icon: FileText, label: 'PDF' },
                                { id: 'json', icon: FileJson, label: 'JSON' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFormat(f.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${format === f.id ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-1 border-stroke text-text-3 hover:border-text-2'
                                        }`}
                                >
                                    <f.icon size={24} />
                                    <span className="text-[10px] font-bold">{f.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-text-3 uppercase tracking-widest">Incluir Dados de</label>
                        <div className="flex flex-col gap-2">
                            {['Mensagens e Conversas', 'Ativos de Conteúdo', 'Performance de Agentes', 'Métricas de Billing'].map(item => (
                                <label key={item} className="flex items-center gap-3 p-3 bg-surface-1/50 border border-stroke rounded-xl cursor-pointer hover:bg-surface-2 transition-colors group">
                                    <div className="w-4 h-4 rounded border border-stroke flex items-center justify-center group-hover:border-primary transition-colors">
                                        <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-40"></div>
                                    </div>
                                    <span className="text-xs text-text-2 font-medium">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-surface-1/30 border-t border-stroke flex gap-3 mt-2">
                    <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-text-2 hover:bg-surface-2 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 py-3 px-4 bg-primary rounded-xl text-white font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isExporting ? <Check size={16} /> : <Download size={16} />}
                        {isExporting ? 'Processando...' : 'Iniciar Exportação'}
                    </button>
                </div>
            </div>
        </div>
    );
}
