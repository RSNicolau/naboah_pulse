'use client';
import React, { useState } from 'react';
import { Sparkles, Command, Send, RefreshCw, Layout, Smartphone, Monitor, Code, Plus } from 'lucide-react';
import GenerativeWidget from '@/components/visionary/GenerativeWidget';
import AdaptiveSidebar from '@/components/visionary/AdaptiveSidebar';

export default function VisionaryLabPage() {
    const [prompt, setPrompt] = useState('');

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Lab Header */}
            <div className="px-10 py-8 border-b border-stroke flex items-center justify-between bg-bg-1/50 backdrop-blur-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-3xl bg-ai-accent/10 border border-ai-accent/20 flex items-center justify-center text-ai-accent shadow-2xl shadow-ai-accent/20">
                        <Command size={28} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase tracking-widest flex items-center gap-3">
                            Visionary Lab <span className="text-[10px] px-2 py-0.5 bg-ai-accent/20 text-ai-accent border border-ai-accent/30 rounded-md">Research Mode</span>
                        </h1>
                        <p className="text-text-3 font-medium text-sm">Laboratório de IA para Geração e Orquestração de Interfaces Adaptativas.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-bg-0 border border-stroke rounded-2xl p-1">
                        <button className="p-3 bg-surface-2 text-white rounded-xl"><Monitor size={18} /></button>
                        <button className="p-3 text-text-3 hover:text-white transition-colors"><Smartphone size={18} /></button>
                        <button className="p-3 text-text-3 hover:text-white transition-colors"><Code size={18} /></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">

                {/* Main Demo Space */}
                <div className="flex-1 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">

                    {/* Command Input Area */}
                    <div className="max-w-4xl mx-auto w-full relative">
                        <div className="absolute inset-x-0 -top-20 -bottom-20 bg-ai-accent/5 blur-[120px] pointer-events-none rounded-full"></div>
                        <div className="bg-bg-1 border border-stroke p-2 rounded-[2.5rem] flex items-center gap-4 shadow-2xl relative z-10 backdrop-blur-xl">
                            <div className="w-12 h-12 rounded-full bg-ai-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-ai-accent/30">
                                <Sparkles size={24} fill="white" />
                            </div>
                            <input
                                type="text"
                                placeholder="Jarvis, mude a interface para modo vendas e crie um gráfico de projeção..."
                                className="flex-1 bg-transparent border-none text-white font-bold placeholder:text-text-3 text-lg focus:ring-0 outline-none px-2"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button className="w-12 h-12 rounded-full bg-surface-2 text-white flex items-center justify-center hover:bg-ai-accent transition-all group">
                                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-8 mt-6">
                            {['Modo Foco', 'Visão Estratégica', 'Operação Crítica', 'Análise de Churn'].map((tag) => (
                                <button key={tag} className="text-[10px] font-black text-text-3 uppercase tracking-widest hover:text-ai-accent transition-colors">
                                    # {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generated Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                        <GenerativeWidget
                            type="chart"
                            title="Projeção de Fechamento"
                            data={{}}
                        />
                        <GenerativeWidget
                            type="suggested_action"
                            title="Jarvis Suggestion"
                            data={{}}
                        />
                        <GenerativeWidget
                            type="kpi"
                            title="Sinal de Churn"
                            data={{ value: '4.2%', trend: '-1.5% from avg' }}
                        />

                        {/* Placeholders for visual expansion */}
                        <div className="border border-dashed border-stroke rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 opacity-50">
                            <Plus size={32} className="text-text-3" />
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Aguardando Comando</span>
                        </div>
                    </div>
                </div>

                <AdaptiveSidebar context="sales" />
            </div>

            {/* Lab Status Bar */}
            <div className="h-10 px-10 border-t border-stroke bg-bg-1 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ai-accent animate-pulse"></div>
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Interface Engine: Adaptive v4.2-Lab</span>
                    </div>
                    <span className="text-[9px] font-bold text-text-2">Latência de Geração: 420ms</span>
                </div>
                <div className="text-[9px] font-black text-text-3 uppercase tracking-widest flex items-center gap-2">
                    <Layout size={12} /> Jarvis Sync Active
                </div>
            </div>

        </div>
    );
}
