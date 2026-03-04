"use client";

import React, { useEffect, useState } from 'react';
import { Palette, Image as ImageIcon, Globe, Bot, Save, Check, Loader2 } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { toast } from '@/lib/toast';

type BrandingData = {
    primary_color: string;
    ai_name: string;
    logo_url: string | null;
    custom_domain: string | null;
};

export default function BrandingSettings() {
    const [primaryColor, setPrimaryColor] = useState('#0066FF');
    const [aiName, setAiName] = useState('Jarvis');
    const [customDomain, setCustomDomain] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        apiGet<BrandingData>('/settings/branding')
            .then((data) => {
                setPrimaryColor(data.primary_color ?? '#0066FF');
                setAiName(data.ai_name ?? 'Jarvis');
                setCustomDomain(data.custom_domain ?? '');
            })
            .catch(() => toast.error('Erro ao carregar branding'))
            .finally(() => setLoading(false));
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            await apiPatch('/settings/branding', {
                primary_color: primaryColor,
                ai_name: aiName,
                custom_domain: customDomain || null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            toast.error('Erro ao guardar branding');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                                <Palette className="text-primary w-6 h-6" />
                            </div>
                            White-label & Branding
                        </h2>
                        <p className="text-text-3 text-sm">Personalize a identidade visual da sua plataforma Pulse.</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="jarvis-gradient px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : saved ? (
                            <Check size={18} />
                        ) : (
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                        )}
                        {saved ? 'Salvo!' : 'Salvar Alterações'}
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[0, 1].map((i) => (
                            <div key={i} className="bg-bg-1 border border-stroke rounded-2xl p-6 animate-pulse">
                                <div className="h-4 w-32 bg-surface-2 rounded mb-6" />
                                <div className="flex flex-col gap-4">
                                    <div className="h-10 w-full bg-surface-2 rounded-xl" />
                                    <div className="h-24 w-full bg-surface-2 rounded-2xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identidade Visual */}
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Palette size={16} className="text-text-3" /> Identidade Visual
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-text-3 uppercase tracking-widest">Cor Primária</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-12 h-12 rounded-lg bg-surface-2 border border-stroke cursor-pointer overflow-hidden p-0"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="flex-1 bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-text-3 uppercase tracking-widest">Logo da Plataforma</label>
                                    <div className="border-2 border-dashed border-stroke rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-surface-1/30 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-3 group-hover:text-primary transition-colors">
                                            <ImageIcon size={24} />
                                        </div>
                                        <span className="text-xs text-text-3">Arraste o logo ou clique para fazer upload</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Jarvis Persona */}
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Bot size={16} className="text-text-3" /> Jarvis Persona
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-text-3 uppercase tracking-widest">Nome da IA</label>
                                    <input
                                        type="text"
                                        value={aiName}
                                        onChange={(e) => setAiName(e.target.value)}
                                        placeholder="Ex: Jarvis, PulseAI, Nexus..."
                                        className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-text-3 uppercase tracking-widest">Domínio Customizado</label>
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-1 border border-stroke rounded-xl">
                                        <Globe size={16} className="text-text-3 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={customDomain}
                                            onChange={(e) => setCustomDomain(e.target.value)}
                                            placeholder="app.suamarca.com"
                                            className="bg-transparent border-none text-sm text-white focus:ring-0 w-full outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-3 italic">Configure o CNAME no seu DNS para apontar para pulse.naboah.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Preview */}
                <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Preview</h3>
                    <div className="p-12 bg-bg-0 rounded-xl border border-stroke/50 flex items-center justify-center relative overflow-hidden">
                        <div className="w-64 bg-bg-1 border border-stroke rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded" style={{ backgroundColor: primaryColor }} />
                                <span className="text-xs font-bold text-white">{aiName} Dashboard</span>
                            </div>
                            <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ backgroundColor: primaryColor, width: '65%' }} />
                            </div>
                            <button className="py-2.5 rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                                Ação Primária
                            </button>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-32 bg-surface-2 rounded-full border border-stroke/50 flex flex-col items-center justify-center gap-4">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {aiName.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
