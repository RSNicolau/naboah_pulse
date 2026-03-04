"use client";
import React, { useState, useEffect } from 'react';
import { Mic, Zap, MessageSquare, AlertCircle, Quote, Sparkles, Smile, Frown, Meh } from 'lucide-react';

const mockTranscript = [
    { sender: 'client', text: 'Olá, bom dia. Gostaria de saber sobre o status do meu pedido #1234.' },
    { sender: 'agent', text: 'Bom dia! Com certeza, me informe seu CPF para eu localizar sua conta.' },
    { sender: 'client', text: 'O número é 123.456.789-00.' },
    { sender: 'agent', text: 'Localizei aqui. O pedido já saiu do nosso centro de distribuição e deve chegar amanhã.' },
    { sender: 'client', text: 'Ah, que ótimo! Muito obrigado pela ajuda.' },
];

export default function CallTranscriber() {
    const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');

    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl h-full relative overflow-hidden">

            {/* Real-time Indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ai-accent/10 border border-ai-accent/20 flex items-center justify-center text-ai-accent relative">
                        <Mic size={20} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-ping"></div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">Pulse Voice Transcriber</h3>
                        <span className="text-[9px] text-text-3 font-medium uppercase tracking-tighter">Powered by Jarvis Audio Intelligence</span>
                    </div>
                </div>

                {/* Sentiment Badge */}
                <div className="flex items-center gap-3 bg-surface-1 px-4 py-2 rounded-2xl border border-stroke">
                    <span className="text-[10px] font-black text-text-3 uppercase">Sentimento</span>
                    {sentiment === 'positive' && (
                        <div className="flex items-center gap-2 text-success">
                            <Smile size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Positivo</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-4">
                {mockTranscript.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-2 ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === 'agent' ? 'text-primary' : 'text-ai-accent'}`}>
                                {msg.sender === 'agent' ? 'Você (Agente)' : 'Cliente'}
                            </span>
                            <span className="text-[8px] text-text-3">14:02:{i}</span>
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed border ${msg.sender === 'agent'
                                ? 'bg-bg-0 border-stroke text-text-2'
                                : 'bg-surface-1 border-ai-accent/20 text-white shadow-lg shadow-ai-accent/5'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Real-time listening indicator */}
                <div className="flex items-center gap-3 text-text-3 italic text-[10px] animate-pulse py-4">
                    <Sparkles size={12} className="text-ai-accent" />
                    <span>Jarvis está ouvindo e transcrevendo...</span>
                </div>
            </div>

            {/* AI Summary Sidebar / Bottom Section */}
            <div className="p-6 bg-gradient-to-r from-ai-accent/5 to-primary/5 border border-ai-accent/20 rounded-[1.5rem] flex flex-col gap-4">
                <div className="flex items-center gap-3 text-ai-accent">
                    <Zap size={16} className="fill-ai-accent" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Insights ao vivo (Jarvis)</span>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-4 p-3 bg-bg-0/50 rounded-xl border border-stroke">
                        <Quote className="text-text-3 flex-shrink-0" size={12} />
                        <p className="text-[10px] text-text-2 leading-relaxed">O cliente mencionou o pedido <span className="text-white font-bold">#1234</span>. Sugerido: Conferir status na conta Loggi.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
