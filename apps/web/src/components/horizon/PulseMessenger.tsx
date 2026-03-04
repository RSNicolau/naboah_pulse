"use client";
import React, { useState } from 'react';
import { Send, X, MessageCircle, Paperclip, Mic, Sparkles, Smile } from 'lucide-react';

export default function PulseMessenger() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: '1', role: 'ai', text: 'Olá! Sou o Jarvis. Como posso transformar sua experiência hoje?' }
    ]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-[999]"
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-10 right-10 w-[380px] h-[600px] bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden z-[999] animate-in fade-in slide-in-from-bottom-5">

            {/* Messenger Header */}
            <div className="bg-primary p-6 flex flex-col gap-4 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative">
                            <Sparkles size={18} className="text-white" fill="white" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-primary rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-widest">Pulse Horizon</span>
                            <span className="text-[10px] text-white/70 font-bold italic">Powered by Jarvis AI</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-bg-1/50">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${m.role === 'ai'
                                ? 'bg-bg-0 text-white border border-stroke rounded-bl-none'
                                : 'bg-primary text-white rounded-br-none'
                            }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-bg-1 border-t border-stroke">
                <div className="bg-bg-0 border border-stroke rounded-2xl p-2 flex items-center gap-2 group focus-within:border-primary transition-all">
                    <button className="p-2 text-text-3 hover:text-white"><Paperclip size={16} /></button>
                    <input
                        type="text"
                        placeholder="Escreva sua mensagem..."
                        className="flex-1 bg-transparent border-none text-[11px] font-bold text-white focus:ring-0 outline-none placeholder:text-text-3"
                    />
                    <button className="p-2 text-text-3 hover:text-white"><Mic size={16} /></button>
                    <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        <Send size={16} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="text-[8px] font-black text-text-3 uppercase tracking-widest opacity-40">Naboah Pulse v31.2</span>
                </div>
            </div>

        </div>
    );
}
