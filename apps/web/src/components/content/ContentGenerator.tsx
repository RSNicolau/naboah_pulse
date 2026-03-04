"use client";

import React, { useEffect, useState } from 'react';
import {
    Wand2, ShieldCheck, AlertTriangle, Loader2, Save, Trash2,
    CheckCircle2, Copy, RotateCcw, FileText,
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from '@/lib/toast';

type GenerateResult = {
    title: string;
    body: string;
    platform: string;
    tone: string;
    qa_status: string;
    risk_score: number;
    risk_alert: string;
    brand_voice_ok: boolean;
};

type ContentAsset = {
    id: string;
    title: string;
    body: string;
    type: string;
    qa_status: string;
    risk_score: number;
    created_at: string;
    metadata_json: { platform?: string; tone?: string };
};

const PLATFORMS = [
    { value: 'Instagram Reel', label: 'Instagram Reel' },
    { value: 'LinkedIn Post',  label: 'LinkedIn Post' },
    { value: 'Email Campaign', label: 'Email Campaign' },
    { value: 'Facebook Ad',    label: 'Facebook Ad' },
];

const TONES = [
    { value: 'Professional', label: 'Professional' },
    { value: 'Witty/Funny',  label: 'Witty/Funny' },
    { value: 'Educational',  label: 'Educational' },
    { value: 'Urgent',       label: 'Urgent' },
];

const QA_COLORS: Record<string, string> = {
    pending:  'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-critical/10 text-critical border-critical/20',
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}min atrás`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
}

export default function ContentGenerator() {
    const [prompt, setPrompt]       = useState('');
    const [platform, setPlatform]   = useState('Instagram Reel');
    const [tone, setTone]           = useState('Professional');
    const [generating, setGenerating] = useState(false);
    const [result, setResult]       = useState<GenerateResult | null>(null);
    const [saving, setSaving]       = useState(false);
    const [saved, setSaved]         = useState(false);
    const [copied, setCopied]       = useState(false);
    const [drafts, setDrafts]       = useState<ContentAsset[]>([]);
    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function loadDrafts() {
        try {
            const data = await apiGet<ContentAsset[]>('/content/assets');
            setDrafts(data);
        } catch (e) { toast.error('Erro ao carregar drafts'); }
        finally { setLoadingDrafts(false); }
    }

    useEffect(() => { loadDrafts(); }, []);

    async function handleGenerate() {
        if (!prompt.trim()) return;
        setGenerating(true);
        setResult(null);
        setSaved(false);
        try {
            const data = await apiPost<GenerateResult>('/content/generate', {
                prompt, platform, tone,
            });
            setResult(data);
        } catch (e) { toast.error('Erro ao gerar conteúdo'); }
        finally { setGenerating(false); }
    }

    async function handleSaveDraft() {
        if (!result) return;
        setSaving(true);
        try {
            await apiPost('/content/assets', {
                title:      result.title,
                body:       result.body,
                platform:   result.platform,
                tone:       result.tone,
                qa_status:  result.qa_status,
                risk_score: result.risk_score,
            });
            setSaved(true);
            loadDrafts();
        } catch (e) { toast.error('Erro ao guardar draft'); }
        finally { setSaving(false); }
    }

    async function handleApprove(id: string) {
        try {
            await apiPost(`/content/assets/${id}/approve`, {});
            setDrafts(prev => prev.map(d => d.id === id ? { ...d, qa_status: 'approved' } : d));
        } catch (e) { toast.error('Erro ao aprovar asset'); }
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        setDrafts(prev => prev.filter(d => d.id !== id));
        try {
            await apiDelete(`/content/assets/${id}`);
        } catch {
            loadDrafts();
        } finally {
            setDeletingId(null);
        }
    }

    function copyToClipboard() {
        if (!result) return;
        navigator.clipboard.writeText(result.body);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl jarvis-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                            <Wand2 className="text-white w-6 h-6" />
                        </div>
                        Pulse Content Studio
                    </h2>
                    <p className="text-text-3 text-sm">Gere scripts, legendas e variações de campanha com IA.</p>
                </div>

                {/* Generator form */}
                <div className="surface-glass p-6 rounded-2xl border border-stroke/50 flex flex-col gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva a sua ideia de conteúdo (ex: 'Script curto para lançamento de funcionalidade — foco em produtividade')..."
                        className="w-full bg-transparent text-text-1 text-sm focus:outline-none min-h-[100px] resize-none placeholder:text-text-3"
                    />
                    <div className="flex items-center justify-between border-t border-stroke/30 pt-4 flex-wrap gap-3">
                        <div className="flex gap-3 flex-wrap">
                            <select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="bg-surface-2 border border-stroke rounded-lg px-3 py-1.5 text-xs text-text-2 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                            >
                                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="bg-surface-2 border border-stroke rounded-lg px-3 py-1.5 text-xs text-text-2 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                            >
                                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            className="jarvis-gradient px-6 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> A gerar...</>
                                : <><Wand2 className="w-4 h-4" /> Gerar com Pulse AI</>}
                        </button>
                    </div>
                </div>

                {/* Output + QA — shown after generation */}
                {(generating || result) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Generated output */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Output Gerado</h3>
                            <div className="bg-bg-1 border border-stroke rounded-2xl p-5 min-h-[240px] flex flex-col gap-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-0.5 h-full jarvis-gradient" />

                                {generating ? (
                                    <div className="flex flex-col gap-3 animate-pulse flex-1">
                                        <div className="h-3 w-24 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-full bg-surface-2 rounded" />
                                        <div className="h-2.5 w-5/6 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-4/5 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-full bg-surface-2 rounded mt-2" />
                                        <div className="h-2.5 w-3/4 bg-surface-2 rounded" />
                                    </div>
                                ) : result && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white px-2 py-0.5 bg-surface-2 rounded-md truncate max-w-[60%]">
                                                {result.title}
                                            </span>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                    onClick={copyToClipboard}
                                                    title="Copiar"
                                                    className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-3 hover:text-white"
                                                >
                                                    {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => { setResult(null); setSaved(false); }}
                                                    title="Limpar"
                                                    className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-3 hover:text-white"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-text-1 leading-relaxed whitespace-pre-wrap flex-1">
                                            {result.body}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* QA Panel */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Pulse AI QA & Compliance</h3>
                            <div className="bg-bg-1 border border-stroke rounded-2xl p-5 flex flex-col gap-5">
                                {generating ? (
                                    <div className="flex flex-col gap-4 animate-pulse">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-surface-2 flex-shrink-0" />
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="h-3 w-32 bg-surface-2 rounded" />
                                                <div className="h-2.5 w-48 bg-surface-2 rounded" />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-surface-2 flex-shrink-0" />
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="h-3 w-28 bg-surface-2 rounded" />
                                                <div className="h-2.5 w-40 bg-surface-2 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                ) : result && (
                                    <>
                                        {/* Brand Voice */}
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${result.brand_voice_ok ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
                                                <ShieldCheck className={`w-5 h-5 ${result.brand_voice_ok ? 'text-success' : 'text-warning'}`} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white mb-0.5">Brand Voice</h4>
                                                <p className="text-[11px] text-text-3">
                                                    {result.brand_voice_ok
                                                        ? 'Tom alinhado com as directrizes da marca.'
                                                        : 'Tom fora do padrão — revise antes de publicar.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Risk Assessment */}
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${result.risk_score < 0.15 ? 'bg-success/10 border border-success/20' : result.risk_score < 0.25 ? 'bg-warning/10 border border-warning/20' : 'bg-critical/10 border border-critical/20'}`}>
                                                <AlertTriangle className={`w-5 h-5 ${result.risk_score < 0.15 ? 'text-success' : result.risk_score < 0.25 ? 'text-warning' : 'text-critical'}`} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white mb-0.5">
                                                    Risk Score: {Math.round(result.risk_score * 100)}%
                                                </h4>
                                                <p className="text-[11px] text-text-3">{result.risk_alert}</p>
                                            </div>
                                        </div>

                                        <hr className="border-stroke" />

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleSaveDraft}
                                                disabled={saving || saved}
                                                className="w-full py-2.5 jarvis-gradient rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                {saving
                                                    ? <><Loader2 size={12} className="animate-spin" /> A guardar...</>
                                                    : saved
                                                    ? <><CheckCircle2 size={12} /> Draft Guardado</>
                                                    : <><Save size={12} /> Guardar Draft</>}
                                            </button>
                                            <button
                                                onClick={handleGenerate}
                                                disabled={generating}
                                                className="w-full py-2.5 bg-surface-2 text-text-1 text-xs font-bold rounded-xl border border-stroke hover:bg-surface-1 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RotateCcw size={12} /> Nova Variação
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Drafts list */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={11} /> Drafts Guardados ({drafts.length})
                        </h3>
                    </div>

                    {loadingDrafts ? (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="bg-bg-1 border border-stroke rounded-2xl p-4 animate-pulse flex gap-4">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="h-3 w-48 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-64 bg-surface-2 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : drafts.length === 0 ? (
                        <div className="bg-bg-1 border border-stroke border-dashed rounded-2xl p-8 text-center">
                            <FileText size={24} className="text-text-3 mx-auto mb-3" />
                            <p className="text-sm text-text-3">Nenhum draft guardado ainda.</p>
                            <p className="text-[11px] text-text-3 mt-1">Gere conteúdo acima e clique em "Guardar Draft".</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className="bg-bg-1 border border-stroke rounded-2xl p-4 flex items-start gap-4 hover:border-stroke/80 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-xs font-bold text-white truncate">{draft.title}</span>
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${QA_COLORS[draft.qa_status] ?? QA_COLORS.pending}`}>
                                                {draft.qa_status}
                                            </span>
                                            <span className="text-[9px] font-bold text-text-3 bg-surface-2 px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                                                {draft.metadata_json?.platform ?? draft.type}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-text-3 line-clamp-2">{draft.body}</p>
                                        <p className="text-[9px] text-text-3 mt-1.5">{timeAgo(draft.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {draft.qa_status !== 'approved' && (
                                            <button
                                                onClick={() => handleApprove(draft.id)}
                                                title="Aprovar"
                                                className="p-2 hover:bg-success/10 rounded-lg text-text-3 hover:text-success transition-colors"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(draft.id)}
                                            disabled={deletingId === draft.id}
                                            title="Eliminar"
                                            className="p-2 hover:bg-critical/10 rounded-lg text-text-3 hover:text-critical transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === draft.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
