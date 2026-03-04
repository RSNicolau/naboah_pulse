"use client";
import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, Hash, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

export default function UnifiedDialer({ onClose }: { onClose?: () => void }) {
    const [number, setNumber] = useState('');
    const [isCalling, setIsCalling] = useState(false);
    const [duration, setDuration] = useState(0);

    const dial = (digit: string) => setNumber(prev => prev + digit);
    const backspace = () => setNumber(prev => prev.slice(0, -1));

    const startCall = () => {
        if (number.length < 3) return;
        setIsCalling(true);
    };

    const endCall = () => {
        setIsCalling(false);
        setDuration(0);
    };

    return (
        <div className="w-80 bg-bg-1 border-2 border-primary/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pulse Phone</span>
                </div>
                <button onClick={onClose} className="text-text-3 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            {isCalling ? (
                <div className="flex flex-col items-center gap-8 py-4 z-10 transition-all">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-ai-accent flex items-center justify-center shadow-xl shadow-primary/20 ring-4 ring-bg-1">
                        <Phone size={32} className="text-white animate-bounce" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold text-white tracking-widest">{number}</span>
                        <span className="text-xs text-text-3 font-medium uppercase tracking-tighter">Chamada em Curso (00:45)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full px-4">
                        {[
                            { icon: Mic, label: 'Mute', active: false },
                            { icon: Pause, label: 'Hold', active: false },
                            { icon: Volume2, label: 'Speaker', active: true },
                        ].map((tool, i) => (
                            <button key={i} className="flex flex-col items-center gap-2 group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${tool.active ? 'bg-primary border-primary text-white' : 'bg-surface-1 border-stroke text-text-3 group-hover:border-text-3'}`}>
                                    <tool.icon size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-text-3 uppercase">{tool.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={endCall}
                        className="mt-4 w-full py-4 bg-error hover:bg-error-dark text-white rounded-[1.25rem] flex items-center justify-center gap-3 shadow-lg shadow-error/20 transition-all font-black text-sm uppercase tracking-widest ring-4 ring-error/10"
                    >
                        <PhoneOff size={20} /> ENCERRAR CHAMADA
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6 z-10">
                    <div className="bg-bg-0 border border-stroke rounded-2xl p-4 flex flex-col items-end gap-1 relative overflow-hidden group">
                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Insira o número..."
                            className="bg-transparent text-2xl font-black text-white w-full text-right outline-none tracking-tighter placeholder:text-text-3/50"
                        />
                        <button onClick={backspace} className="text-[10px] font-bold text-text-3 hover:text-white uppercase transition-colors tracking-widest">Apagar</button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                            <button
                                key={digit}
                                onClick={() => dial(digit)}
                                className="w-full aspect-square rounded-2xl bg-surface-1 border border-stroke flex flex-col items-center justify-center hover:bg-bg-0 hover:border-primary transition-all group active:scale-95"
                            >
                                <span className="text-xl font-bold text-white group-hover:text-primary">{digit}</span>
                                {digit === '0' && <span className="text-[8px] text-text-3 -mt-1">+</span>}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={startCall}
                        disabled={number.length < 3}
                        className="w-full py-4 bg-success hover:bg-success-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[1.25rem] flex items-center justify-center gap-3 shadow-lg shadow-success/20 transition-all font-black text-sm uppercase tracking-widest ring-4 ring-success/10"
                    >
                        <Phone size={20} /> INICIAR CHAMADA
                    </button>
                </div>
            )}

            {/* Recent History Mini */}
            {!isCalling && (
                <div className="pt-4 border-t border-stroke flex flex-col gap-3">
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Chamadas Recentes</span>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs group cursor-pointer">
                            <div className="flex items-center gap-2">
                                <ArrowDownLeft size={14} className="text-error" />
                                <span className="text-white font-bold tracking-tight">+55 11 9884...</span>
                            </div>
                            <span className="text-[9px] text-text-3 uppercase font-medium">Há 5m</span>
                        </div>
                        <div className="flex items-center justify-between text-xs group cursor-pointer">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight size={14} className="text-success" />
                                <span className="text-white font-bold tracking-tight">+55 41 332...</span>
                            </div>
                            <span className="text-[9px] text-text-3 uppercase font-medium">Ontem</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
