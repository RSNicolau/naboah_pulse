import React from 'react';
import { Bot, ArrowRight, ArrowRightLeft, MessageCircle, Zap, ShieldCheck } from 'lucide-react';

const activeHandoffs = [
    { id: '1', from: 'Pulse Support', to: 'Pulse Sales', reason: 'Identificação de Up-sell', time: 'Há 2m', status: 'completed' },
    { id: '2', from: 'Pulse Sales', to: 'Pulse Support', reason: 'Dúvida Técnica Pós-Venda', time: 'Há 15m', status: 'completed' },
];

export default function AgentHandoffMonitor() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl">
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <ArrowRightLeft className="text-ai-accent w-5 h-5" /> Fluxo de Colaboração
                </h3>
                <p className="text-text-3 text-[10px] uppercase font-bold tracking-widest">Monitoramento em Tempo Real de Handoffs da Squad</p>
            </div>

            <div className="flex flex-col gap-4">
                {activeHandoffs.map((h) => (
                    <div key={h.id} className="p-5 bg-bg-0 border border-stroke rounded-2xl flex items-center justify-between group hover:border-ai-accent/30 transition-all">
                        <div className="flex items-center gap-6">
                            {/* From Agent */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Bot size={20} />
                                </div>
                                <span className="text-xs font-bold text-white">{h.from}</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <ArrowRight className="text-ai-accent animate-pulse" size={16} />
                                <span className="text-[8px] font-black text-text-3 uppercase">{h.time}</span>
                            </div>

                            {/* To Agent */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center text-ai-accent group-hover:scale-110 transition-transform">
                                    <Bot size={20} />
                                </div>
                                <span className="text-xs font-bold text-white">{h.to}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <Zap size={12} className="text-warning" />
                                <span className="text-xs font-bold text-white">{h.reason}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={12} className="text-success" />
                                <span className="text-[9px] text-success font-black uppercase">Contexto Sincronizado</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-4 bg-surface-1 border border-stroke rounded-2xl text-[10px] font-black text-text-3 hover:text-white hover:border-text-3 transition-all uppercase tracking-widest">
                Ver Histórico Completo de Colaboração
            </button>
        </div>
    );
}
