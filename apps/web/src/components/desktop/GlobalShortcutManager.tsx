import React from 'react';
import { Command, Zap, Keyboard, Monitor, Bell, ShieldCheck } from 'lucide-react';

export default function GlobalShortcutManager() {
    const shortcuts = [
        { id: '1', name: 'Invocação Pulse AI', keys: '⌘ ⇧ P', description: 'Abre a overlay do Pulse AI sobre qualquer app.' },
        { id: '2', name: 'Captura Rápida', keys: '⌘ ⇧ K', description: 'Cria uma nota ou lead instantaneamente.' },
        { id: '3', name: 'Toggle Huddle', keys: '⌘ ⇧ H', description: 'Entra/Sai da sala de áudio ativa.' },
        { id: '4', name: 'Modo Foco', keys: '⌘ ⇧ F', description: 'Silencia notificações e ativa Pulse AI auto-reply.' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Keyboard size={24} className="text-primary" /> System Shortcuts
                    </h3>
                    <p className="text-xs text-text-3 font-medium">Configure como o Pulse interage com seu SO.</p>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:border-primary transition-all">
                    RESET DEFAULT
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((s) => (
                    <div key={s.id} className="p-6 bg-bg-0 border border-stroke rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-white tracking-tight">{s.name}</span>
                            <span className="text-[10px] font-medium text-text-3 leading-relaxed">{s.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-surface-2 rounded-xl border border-white/5 text-[10px] font-black text-white min-w-[80px] text-center shadow-inner">
                                {s.keys}
                            </div>
                            <button className="p-2 text-text-3 hover:text-white transition-colors">
                                <Zap size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Feature Toggle */}
            <div className="p-8 bg-surface-2/30 border border-white/5 rounded-[2.5rem] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                            <Monitor size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">App Nativo Ativo</span>
                            <span className="text-[9px] font-bold text-success/70 uppercase">v1.4.2 stable - macOS</span>
                        </div>
                    </div>
                    <div className="w-14 h-8 bg-success rounded-full flex items-center px-1 shadow-lg shadow-success/20">
                        <div className="w-6 h-6 bg-white rounded-full ml-auto"></div>
                    </div>
                </div>
            </div>

        </div>
    );
}
