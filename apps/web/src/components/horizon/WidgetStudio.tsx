"use client";
import React, { useState } from 'react';
import { Palette, Code, Globe, Shield, Save, Copy, Check, Eye, Smartphone, Monitor, X } from 'lucide-react';
import PulseMessenger from './PulseMessenger';

export default function WidgetStudio() {
    const [copied, setCopied] = useState(false);
    const scriptCode = `<script src="https://api.naboah.com/v1/horizon/loader.js" data-id="nab_928371"></script>`;

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex overflow-hidden">

            {/* Editor Panel */}
            <div className="w-[450px] bg-bg-1 border-r border-stroke p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">

                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Horizon Studio</h3>
                    <p className="text-xs text-text-3 font-medium leading-relaxed">Customize a identidade visual e as regras de segurança do seu widget público.</p>
                </div>

                {/* Identity Section */}
                <div className="flex flex-col gap-6">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Palette size={14} className="text-primary" /> Identidade Visual
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-white uppercase">Cor Primária</span>
                            <div className="flex items-center gap-2 p-3 bg-bg-0 border border-stroke rounded-xl">
                                <div className="w-5 h-5 rounded bg-primary"></div>
                                <span className="text-[10px] font-black text-text-3">#7C3AED</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-white uppercase">Cor de Sotaque</span>
                            <div className="flex items-center gap-2 p-3 bg-bg-0 border border-stroke rounded-xl">
                                <div className="w-5 h-5 rounded bg-success"></div>
                                <span className="text-[10px] font-black text-text-3">#10B981</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="flex flex-col gap-6">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield size={14} className="text-success" /> Domínios Autorizados
                    </span>
                    <div className="flex flex-col gap-3">
                        {['naboah.com', 'staging.naboah.com'].map(d => (
                            <div key={d} className="p-4 bg-bg-0 border border-stroke rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{d}</span>
                                <button className="text-text-3 hover:text-error transition-colors"><X size={14} /></button>
                            </div>
                        ))}
                        <button className="w-full py-4 border-2 border-dashed border-stroke rounded-2xl text-[10px] font-black text-text-3 hover:border-primary hover:text-white transition-all uppercase tracking-widest">
                            ADICIONAR DOMÍNIO
                        </button>
                    </div>
                </div>

                {/* Installation Code */}
                <div className="flex flex-col gap-6 pt-6 border-t border-stroke">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Code size={14} className="text-ai-accent" /> Código de Instalação
                    </span>
                    <div className="bg-bg-0 border border-stroke p-4 rounded-2xl flex flex-col gap-4">
                        <code className="text-[10px] text-ai-accent font-bold break-all leading-relaxed">
                            {scriptCode}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'COPIADO!' : 'COPIAR SCRIPT'}
                        </button>
                    </div>
                </div>

                <button className="mt-8 py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                    <Save size={18} /> SALVAR WIDGET
                </button>

            </div>

            {/* Preview Panel */}
            <div className="flex-1 bg-bg-0 relative flex items-center justify-center p-20">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Preview Frame */}
                <div className="max-w-4xl w-full aspect-video bg-bg-1 border border-stroke rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-stroke flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-error/40"></div>
                            <div className="w-3 h-3 rounded-full bg-warning/40"></div>
                            <div className="w-3 h-3 rounded-full bg-success/40"></div>
                        </div>
                        <div className="flex items-center gap-4 text-text-3">
                            <Monitor size={16} className="text-white" />
                            <Smartphone size={16} />
                        </div>
                    </div>
                    <div className="flex-1 p-10 flex flex-col gap-4">
                        <div className="w-2/3 h-8 bg-stroke/20 rounded-lg"></div>
                        <div className="w-full h-8 bg-stroke/10 rounded-lg"></div>
                        <div className="w-full h-8 bg-stroke/10 rounded-lg"></div>
                        <div className="w-1/2 h-8 bg-stroke/10 rounded-lg"></div>
                    </div>

                    {/* Injected Widget Preview */}
                    <PulseMessenger />
                </div>

                <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest text-right">Preview de Produção</span>
                    <span className="text-[8px] text-success font-black text-right animate-pulse">● LIVE UPDATING</span>
                </div>
            </div>

        </div>
    );
}
