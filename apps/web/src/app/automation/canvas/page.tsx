import React from 'react';
import FlowCanvas from '@/components/automation/FlowCanvas';
import NodeLibrary from '@/components/automation/NodeLibrary';
import { GitBranch, Box, History, Zap, Sparkles } from 'lucide-react';

export default function AutomationCanvasPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Header Designer */}
            <div className="px-8 py-6 border-b border-stroke flex items-center justify-between bg-bg-1/50 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-ai-accent/10 border border-ai-accent/20 flex items-center justify-center text-ai-accent shadow-2xl shadow-ai-accent/20">
                        <GitBranch size={24} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-white tracking-tight uppercase tracking-wider">Pulse Flow Designer</h1>
                            <span className="px-2 py-0.5 bg-success/10 border border-success/30 rounded-md text-[8px] font-black text-success uppercase">Live</span>
                        </div>
                        <p className="text-text-3 text-[10px] font-medium tracking-tight">Criando: Automação de Recuperação de Carrinho v4.2</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-bg-0 border border-stroke rounded-xl overflow-hidden p-1">
                        <button className="px-4 py-2 bg-surface-2 text-white text-[10px] font-black rounded-lg uppercase">Designer</button>
                        <button className="px-4 py-2 text-text-3 text-[10px] font-black hover:text-white uppercase transition-colors">Monitor</button>
                        <button className="px-4 py-2 text-text-3 text-[10px] font-black hover:text-white uppercase transition-colors">Histórico</button>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-bg-1 border border-stroke flex items-center justify-center text-text-3 hover:text-white transition-all">
                        <History size={18} />
                    </button>
                </div>
            </div>

            {/* Main Designer Layout */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-8 bg-bg-1/20">
                    <FlowCanvas />
                </div>
                <NodeLibrary />
            </div>

            {/* Status Bar Footer */}
            <div className="h-10 px-8 border-t border-stroke bg-bg-1/80 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Motor de Execução: Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={12} className="text-primary" />
                        <span className="text-[9px] font-bold text-text-2">Jarvis otimizou 3 conexões neste fluxo.</span>
                    </div>
                </div>
                <div className="text-[9px] font-black text-text-3 uppercase tracking-widest">
                    Última alteração: há poucos segundos por r_nicolau
                </div>
            </div>

        </div>
    );
}
