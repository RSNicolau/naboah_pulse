import React from 'react';
import { Calculator, BookOpen, MessageSquare, Phone, Zap, ArrowRight, Settings2, Sparkles, Box } from 'lucide-react';

interface Tool {
    id: string;
    label: string;
    icon: any;
    active?: boolean;
}

const contextTools: Record<string, Tool[]> = {
    sales: [
        { id: '1', label: 'Price Calculator', icon: Calculator, active: true },
        { id: '2', label: 'Sales Playbook', icon: BookOpen },
        { id: '3', label: 'Order History', icon: Box },
    ],
    support: [
        { id: '4', label: 'Knowledge Base', icon: BookOpen, active: true },
        { id: '5', label: 'Debug Console', icon: Settings2 },
        { id: '6', label: 'SLA Monitor', icon: Zap },
    ]
};

export default function AdaptiveSidebar({ context = 'sales' }: { context?: 'sales' | 'support' }) {
    const tools = contextTools[context];

    return (
        <div className="w-[280px] bg-bg-1 border-l border-stroke flex flex-col h-full shadow-2xl relative">

            <div className="p-8 border-b border-stroke flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Contexto Detectado</span>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                        <span className="text-[9px] font-black text-white uppercase">{context}</span>
                    </div>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-tighter flex items-center gap-2">
                    Dynamic Workspace
                </h3>
            </div>

            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-tighter px-2 opacity-50">Ferramentas Sugeridas</span>
                    <div className="flex flex-col gap-2">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between group/tool ${tool.active
                                        ? 'bg-ai-accent/10 border-ai-accent/30 text-white'
                                        : 'bg-bg-0 border-stroke text-text-3 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <tool.icon size={18} className={tool.active ? 'text-ai-accent' : 'text-text-3'} />
                                    <span className="text-[11px] font-bold tracking-tight">{tool.label}</span>
                                </div>
                                {tool.active && <ArrowRight size={14} className="text-ai-accent opacity-0 group-hover/tool:opacity-100 transition-opacity" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contextual Smart Helper */}
                <div className="p-6 bg-surface-2 border border-stroke rounded-3xl flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={40} className="text-ai-accent" />
                    </div>
                    <div className="flex items-center gap-2 text-ai-accent">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-[9px] font-black uppercase tracking-widest">IA Auto-Action</span>
                    </div>
                    <p className="text-[10px] text-text-2 leading-relaxed">
                        Com base nesta conversa, o Pulse AI sugere abrir o <strong>Calculador de Margem</strong> para facilitar a negociação de desconto.
                    </p>
                    <button className="w-full py-3 bg-bg-1 border border-stroke rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-ai-accent hover:border-ai-accent transition-all">
                        EXECUTAR AGORA
                    </button>
                </div>
            </div>

            <div className="mt-auto p-8 bg-bg-0 border-t border-stroke">
                <div className="flex items-center justify-between text-[9px] font-black text-text-3 uppercase tracking-widest">
                    <span>Adaptive Engine v4</span>
                    <span className="text-ai-accent">Syncing...</span>
                </div>
            </div>

        </div>
    );
}
