import React from 'react';
import { AlertCircle, UserMinus, ShieldAlert, ArrowRight, MessageSquare, Phone, MoreHorizontal } from 'lucide-react';

const risks = [
    { id: '1', customer: 'Empresa Alpha Tech', score: 24, trend: 'down', reason: 'Engajamento caiu 60% nos últimos 14 dias', owner: 'Rodrigo' },
    { id: '2', customer: 'Lojas Americanas S.A', score: 42, trend: 'stable', reason: '3 tickets de suporte críticos abertos', owner: 'Ana' },
];

export default function ChurnRiskAlert() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl overflow-hidden relative group">

            {/* Risk Pattern Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="text-error w-5 h-5" /> Radar de Churn
                    </h3>
                    <span className="text-[10px] text-text-3 font-black uppercase tracking-widest">Prevenção Preditiva Pulse</span>
                </div>
                <button className="text-text-3 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
            </div>

            <div className="flex flex-col gap-4">
                {risks.map((r) => (
                    <div key={r.id} className="p-5 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-4 group/card hover:border-error/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error group-hover/card:scale-110 transition-transform">
                                    <UserMinus size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">{r.customer}</span>
                                    <span className="text-[10px] font-medium text-text-3">Owner: {r.owner}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-xl font-black tracking-tighter ${r.score < 30 ? 'text-error' : 'text-warning'}`}>
                                    {r.score}
                                </span>
                                <span className="text-[8px] font-black uppercase text-text-3">Health Score</span>
                            </div>
                        </div>

                        <div className="p-3 bg-surface-1 border border-stroke rounded-xl">
                            <p className="text-[10px] font-bold text-text-2 italic flex items-center gap-2">
                                <AlertCircle size={12} className="text-warning shrink-0" />
                                "{r.reason}"
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2.5 bg-error/10 hover:bg-error/20 border border-error/20 text-error rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                <MessageSquare size={12} /> RETER VIA CHAT
                            </button>
                            <button className="w-11 h-10 bg-bg-1 border border-stroke rounded-xl flex items-center justify-center text-text-3 hover:text-white transition-all">
                                <Phone size={14} />
                            </button>
                            <button className="w-11 h-10 bg-bg-1 border border-stroke rounded-xl flex items-center justify-center text-text-3 hover:text-white transition-all">
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-4 bg-surface-1 border border-stroke rounded-2xl text-[10px] font-black text-text-3 hover:text-white hover:border-text-3 transition-all uppercase tracking-widest">
                Analisar Base Completa (LTV vs Risco)
            </button>

        </div>
    );
}
