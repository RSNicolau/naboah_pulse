'use client';
import React, { useEffect, useState } from 'react';
import { Upload, Link as LinkIcon, FileText, Database, Plus, RefreshCw, Check, Clock, Trash2, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type KnowledgeSource = {
    id: string;
    name: string;
    type: string;
    status: string;
    synced_at: string;
};

export default function SourceManager() {
    const [sources, setSources] = useState<KnowledgeSource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<KnowledgeSource[]>('/neural/knowledge/sources')
            .then(setSources)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function timeAgo(iso: string): string {
        if (!iso) return 'Aguardando...';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} min atrás`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} horas atrás`;
        return `${Math.floor(hours / 24)} dias atrás`;
    }

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Neural Sources</h3>
                    <p className="text-xs text-text-3 font-medium">Conecte fontes de dados para o cérebro do Pulse AI.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-bg-0 border border-stroke rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:border-primary transition-all">
                        <Upload size={16} className="text-primary" /> UPLOAD PDF
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Plus size={16} /> NEW SOURCE
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-primary animate-spin" />
                </div>
            ) : sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Database size={28} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhuma fonte de conhecimento configurada.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {sources.map((s) => (
                        <div key={s.id} className="p-6 bg-bg-0 border border-stroke rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${s.status === 'active' ? 'bg-success/10 text-success' :
                                        s.status === 'indexing' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                                    }`}>
                                    {s.type === 'file' && <FileText size={24} />}
                                    {s.type === 'url' && <LinkIcon size={24} />}
                                    {(s.type === 'integration' || (s.type !== 'file' && s.type !== 'url')) && <Database size={24} />}
                                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-0 flex items-center justify-center ${s.status === 'active' ? 'bg-success' : s.status === 'indexing' ? 'bg-primary' : 'bg-error'
                                        }`}>
                                        {s.status === 'active' ? <Check size={8} className="text-white" /> : <Clock size={8} className="text-white" />}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white tracking-tight">{s.name}</span>
                                    <span className="text-[10px] font-medium text-text-3 uppercase tracking-widest">Sincronizado {timeAgo(s.synced_at)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 text-text-3 hover:text-white transition-colors"><RefreshCw size={18} /></button>
                                <button className="p-3 text-text-3 hover:text-error transition-colors"><Trash2 size={18} /></button>
                                <button className="px-5 py-2.5 bg-surface-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">EDITAR</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Auto-Crawler Tip */}
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                    <RefreshCw size={80} className="text-primary" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <RefreshCw size={24} className="text-white animate-spin-slow" />
                </div>
                <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pulse AI Autopilot sync</span>
                    <p className="text-xs text-text-2 font-medium leading-relaxed">
                        O Pulse AI está programado para re-indexar sua Central de Ajuda toda madrugada às 03:00 AM para garantir que as respostas estejam sempre atualizadas.
                    </p>
                </div>
            </div>

        </div>
    );
}
