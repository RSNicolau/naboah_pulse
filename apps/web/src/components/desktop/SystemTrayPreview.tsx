import React from 'react';
import { Activity, MessageSquare, Brain, Target, Circle, ExternalLink, Settings } from 'lucide-react';

export default function SystemTrayPreview() {
    return (
        <div className="w-80 bg-bg-1/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            {/* Tray Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Pulse Online</span>
                </div>
                <Settings size={14} className="text-text-3" />
            </div>

            {/* Quick Stats */}
            <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare size={16} className="text-secondary" />
                        <span className="text-xs font-bold text-white">Inbox</span>
                    </div>
                    <span className="px-2 py-0.5 bg-error text-white text-[9px] font-black rounded-full">12 NOVOS</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain size={16} className="text-primary" />
                        <span className="text-xs font-bold text-white">Jarvis Thinking</span>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => <Circle key={i} size={4} className="text-primary fill-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-2 pb-2">
                <div className="flex flex-col gap-1 p-2 bg-bg-0 border border-white/5 rounded-2xl">
                    {[
                        { icon: Target, label: 'Sales Overview', color: 'text-ai-accent' },
                        { icon: Activity, label: 'Neural Health', color: 'text-success' },
                        { icon: ExternalLink, label: 'Open Main App', color: 'text-white' },
                    ].map((action, i) => (
                        <button key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group">
                            <action.icon size={16} className={`${action.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-[11px] font-bold text-text-2 group-hover:text-white transition-colors">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 py-3 bg-bg-0 border-t border-white/5 flex items-center justify-center">
                <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Naboah Pulse Desktop v1.4.2</span>
            </div>

        </div>
    );
}
