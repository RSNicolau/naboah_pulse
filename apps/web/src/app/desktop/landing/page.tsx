import React from 'react';
import GlobalShortcutManager from '@/components/desktop/GlobalShortcutManager';
import SystemTrayPreview from '@/components/desktop/SystemTrayPreview';
import { Monitor, Download, Apple, Wind, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function DesktopLandingPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Desktop Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-10">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center shadow-2xl relative group">
                        <Monitor size={40} />
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-bg-0 text-white">
                            <Apple size={20} fill="white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase tracking-widest">
                            Pulse Desktop
                        </h1>
                        <p className="text-text-3 font-medium text-xl mt-2 italic max-w-lg">Sua inteligência omnichannel, nativa e onipresente.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="flex items-center gap-4 px-10 py-5 bg-primary text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-transform active:scale-95">
                        <Download size={20} /> BAIXAR PARA MACOS
                    </button>
                    <button className="flex items-center gap-4 px-10 py-5 bg-bg-1 border border-stroke text-white rounded-[2rem] text-xs font-black uppercase tracking-widest">
                        <Wind size={20} /> WINDOWS APP
                    </button>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Workspace Integration</h2>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-10">
                    <GlobalShortcutManager />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-4 shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase italic">Offline Brain</h3>
                            <p className="text-[11px] text-text-3 font-medium leading-relaxed">
                                Sincronização em tempo real do seu banco de dados local. Trabalhe sem internet e deixe o Pulse AI cuidar do sync ao reconectar.
                            </p>
                        </div>
                        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-4 shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-ai-accent/10 text-ai-accent flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase italic">Native Encryption</h3>
                            <p className="text-[11px] text-text-3 font-medium leading-relaxed">
                                Segurança de nível de kernel. Suas mensagens e dados de clientes operam em sandbox nativa e criptografada.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic ml-4">Tray Interface Preview</span>
                        <div className="flex justify-center p-8 bg-bg-1 border border-stroke rounded-[3rem] shadow-inner">
                            <SystemTrayPreview />
                        </div>
                    </div>

                    <div className="mt-auto p-8 bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 rounded-[2.5rem] flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Zap size={18} className="text-primary animate-pulse" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Global Overlay Ready</span>
                        </div>
                        <p className="text-[10px] font-medium text-text-2">
                            Ative a overlay para que o Pulse AI flutue sobre seus outros aplicativos, permitindo resumos instantâneos de planilhas, PDFs e e-mails externos.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
}
