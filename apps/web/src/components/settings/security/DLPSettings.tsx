import React from 'react';
import { EyeOff, ShieldCheck, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';

const policies = [
    { id: '1', name: 'Mask Credit Card Numbers', type: 'AI Entity', action: 'Mask (****)', status: 'Active' },
    { id: '2', name: 'Block Passport Details', type: 'Regex Pattern', action: 'Block & Log', status: 'Active' },
    { id: '3', name: 'Notify sensitive PII', type: 'AI Entity', action: 'Alert Admin', status: 'Paused' },
];

export default function DLPSettings() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl relative group">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                        <EyeOff size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">Políticas de DLP</h3>
                        <span className="text-[9px] text-text-3 font-black uppercase tracking-tighter">Data Loss Prevention (LGPD/GDPR)</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    <Plus size={14} /> NOVA POLÍTICA
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {policies.map((p) => (
                    <div key={p.id} className="p-6 bg-bg-0 border border-stroke rounded-2xl flex items-center justify-between group/row hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-1.5 h-10 rounded-full bg-primary/40"></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{p.name}</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[9px] font-black text-text-3 uppercase tracking-tighter flex items-center gap-1">
                                        <Database size={10} /> {p.type}
                                    </span>
                                    <span className="text-[9px] font-black text-primary uppercase tracking-tighter flex items-center gap-1">
                                        <ShieldCheck size={10} /> {p.action}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={12} className={p.status === 'Active' ? 'text-success' : 'text-text-3'} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'text-white' : 'text-text-3'}`}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-bg-1 border border-stroke rounded-xl text-text-3 hover:text-white transition-all"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-surface-1 border border-dashed border-stroke rounded-2xl flex items-center gap-4">
                <Sparkles size={16} className="text-ai-accent" />
                <p className="text-[11px] text-text-2 font-medium">
                    <span className="font-bold text-white uppercase tracking-tighter">Pulse Insight:</span> Detectamos 23 tentativas de compartilhamento de cartões de crédito no chatbot de suporte nas últimas 24h. Sua política de DLP evitou um possível incidente de conformidade.
                </p>
            </div>

        </div>
    );
}
