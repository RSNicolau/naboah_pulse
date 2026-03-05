'use client';

import React, { useState } from 'react';
import KnowledgeHealth from '@/components/neural/KnowledgeHealth';
import SourceManager from '@/components/neural/SourceManager';
import { Brain, Sparkles, MessageSquare, Zap, Target, Search, Send } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function NeuralKnowledgePage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [asking, setAsking] = useState(false);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;
        setAsking(true);
        setAnswer(null);
        try {
            const data = await apiPost('/neural/knowledge/ask', { question: question.trim() });
            setAnswer(typeof data === 'string' ? data : data?.answer ?? data?.response ?? JSON.stringify(data));
            toast.success('Resposta recebida');
        } catch {
            toast.error('Erro ao consultar o Neural');
        } finally {
            setAsking(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Neural Header */}
            <div className="px-10 py-10 border-b border-stroke flex items-center justify-between bg-bg-1/50 backdrop-blur-2xl">
                <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-2xl shadow-primary/30 relative group">
                        <Brain size={32} />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-4 border-bg-0">
                            <Sparkles size={10} className="text-white" fill="white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase tracking-widest flex items-center gap-4">
                            Pulse Neural <span className="text-[11px] px-3 py-1 bg-primary/20 text-primary border border-primary/40 rounded-full font-bold">RAG v2.0 READY</span>
                        </h1>
                        <p className="text-text-3 font-medium text-lg mt-1 italic">O centro nevrálgico da inteligência autônoma do seu negócio.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1 px-6">
                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Neural Sync Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">OPTIMIZED</span>
                        </div>
                    </div>
                    <button className="w-16 h-16 rounded-2xl bg-surface-2 bg-bg-1 flex items-center justify-center text-text-3 hover:text-white transition-all border border-stroke">
                        <Target size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-10 flex flex-col gap-12 overflow-y-auto custom-scrollbar">

                <section className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Knowledge Overview</h2>
                    </div>
                    <KnowledgeHealth />
                </section>

                <section className="flex flex-col gap-6 pb-20">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Data Sources & Sync</h2>
                    </div>
                    <SourceManager />
                </section>

            </div>

            {/* Neural AI Command Bar */}
            <div className="px-10 border-t border-stroke bg-bg-1 flex flex-col relative">
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                {/* Answer display */}
                {answer && (
                    <div className="pt-3 pb-2 border-b border-stroke/50">
                        <div className="flex items-start gap-3">
                            <Brain size={14} className="text-primary mt-0.5 shrink-0" />
                            <p className="text-[11px] font-medium text-white leading-relaxed">{answer}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleAsk} className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8 flex-1">
                        <div className="flex items-center gap-3 flex-1">
                            <Search size={16} className="text-text-3" />
                            <span className="text-[10px] font-black text-text-2 uppercase tracking-widest">Testar Cérebro:</span>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Faça uma pergunta difícil para testar o conhecimento do Pulse AI..."
                                className="flex-1 bg-transparent border-none text-[10px] font-bold text-white focus:ring-0 outline-none placeholder:text-text-3"
                            />
                            <button
                                type="submit"
                                disabled={asking || !question.trim()}
                                className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/30 transition-all disabled:opacity-40"
                            >
                                {asking ? '...' : <Send size={12} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 ml-6">
                        <div className="flex items-center gap-2 text-text-3">
                            <Zap size={14} className="text-secondary" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Model: Pulse-Neural-Large</span>
                        </div>
                        <div className="h-8 w-px bg-stroke"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Confidence:</span>
                            <div className="w-24 h-1.5 bg-bg-0 rounded-full overflow-hidden">
                                <div className="w-[94%] h-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
}
