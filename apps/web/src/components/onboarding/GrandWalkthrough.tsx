"use client";
import React, { useState } from 'react';
import { Sparkles, Map, ChevronRight, X, Play, ShieldCheck, Zap } from 'lucide-react';

export default function GrandWalkthrough() {
    const [step, setStep] = useState(0);
    const [isOpen, setIsOpen] = useState(true);

    const steps = [
        { title: 'O Coração do Pulse', desc: 'Sua Unified Inbox centraliza todas as interações humanas e de IA em um só fluxo.', icon: Zap, target: 'Inbox' },
        { title: 'Pulse AI Everywhere', desc: 'Use CMD+K para comandar o Pulse via linguagem natural a qualquer momento.', icon: Sparkles, target: 'Search' },
        { title: 'Estratégia Quantun', desc: 'Seus novos AI Strategy Insights simulam o futuro do seu negócio em segundos.', icon: ShieldCheck, target: 'Insights' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">

            <div className="w-[600px] bg-bg-1 border border-primary/30 rounded-[4rem] p-12 flex flex-col gap-10 shadow-[0_0_100px_rgba(var(--color-primary),0.2)] relative overflow-hidden">

                {/* Quantum Glow Background */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 blur-[80px] rounded-full"></div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                            <Map size={24} />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Grand Walkthrough</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-3 text-text-3 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-6 py-4">
                    <div className="w-20 h-20 bg-primary/5 border border-primary/20 rounded-3xl flex items-center justify-center text-primary mb-2">
                        {React.createElement(steps[step].icon, { size: 40 })}
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{steps[step].title}</h2>
                    <p className="text-lg text-text-2 font-medium leading-relaxed italic">"{steps[step].desc}"</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`}></div>
                        ))}
                    </div>
                    <button
                        onClick={() => step < steps.length - 1 ? setStep(step + 1) : setIsOpen(false)}
                        className="px-10 py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all"
                    >
                        {step === steps.length - 1 ? 'START PULSE' : 'NEXT STEP'} <ChevronRight size={18} />
                    </button>
                </div>

            </div>

        </div>
    );
}
