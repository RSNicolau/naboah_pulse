"use client";

import React, { useEffect, useState, useRef } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Kanban, TrendingUp, Plus, MoreVertical,
    Star, X, Loader2, Trash2, DollarSign
} from 'lucide-react';

type Stage = {
    id: string;
    name: string;
    order: number;
    color: string | null;
};

type Deal = {
    id: string;
    title: string;
    value: number;
    currency: string;
    status: string;
    lead_score: number | null;
    stage_id: string;
    contact_name: string | null;
    contact_email: string | null;
    created_at: string;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function scoreColor(score: number | null) {
    if (!score) return 'text-text-3';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-critical';
}

type NewDealForm = { title: string; value: string; contact_name: string; stage_id: string };

export default function PipelineBoard() {
    const [stages, setStages] = useState<Stage[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<NewDealForm>({ title: '', value: '', contact_name: '', stage_id: '' });
    const [saving, setSaving] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    async function load() {
        setLoading(true);
        try {
            const [s, d] = await Promise.all([
                apiGet<Stage[]>('/sales/stages'),
                apiGet<Deal[]>('/sales/deals'),
            ]);
            setStages(s.sort((a, b) => a.order - b.order));
            setDeals(d);
            if (!form.stage_id && s.length > 0) setForm(f => ({ ...f, stage_id: s[0].id }));
        } catch (e) {
            toast.error('Erro ao carregar pipeline');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    // Close menu on outside click
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // Drag handlers
    function onDragStart(e: React.DragEvent, dealId: string) {
        setDragId(dealId);
        e.dataTransfer.effectAllowed = 'move';
    }

    function onDragOver(e: React.DragEvent, stageId: string) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(stageId);
    }

    async function onDrop(e: React.DragEvent, stageId: string) {
        e.preventDefault();
        setDragOver(null);
        if (!dragId) return;
        const deal = deals.find(d => d.id === dragId);
        if (!deal || deal.stage_id === stageId) { setDragId(null); return; }

        // Optimistic update
        setDeals(prev => prev.map(d => d.id === dragId ? { ...d, stage_id: stageId } : d));
        setDragId(null);

        try {
            await apiPatch(`/sales/deals/${dragId}/stage?stage_id=${stageId}`, {});
        } catch {
            load(); // revert on error
        }
    }

    async function handleCreate() {
        if (!form.title.trim() || !form.value) return;
        setSaving(true);
        try {
            const created = await apiPost<Deal>('/sales/deals', {
                title: form.title.trim(),
                value: parseFloat(form.value),
                stage_id: form.stage_id || stages[0]?.id,
                contact_name: form.contact_name.trim() || null,
            });
            setDeals(prev => [created, ...prev]);
            setForm(f => ({ ...f, title: '', value: '', contact_name: '' }));
            setShowModal(false);
        } catch (e) {
            toast.error('Erro ao criar deal');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(dealId: string) {
        setOpenMenu(null);
        setDeals(prev => prev.filter(d => d.id !== dealId));
        try {
            await apiDelete(`/sales/deals/${dealId}`);
        } catch {
            load();
        }
    }

    const totalValue = deals.filter(d => d.status === 'open').reduce((s, d) => s + d.value, 0);
    const openCount = deals.filter(d => d.status === 'open').length;

    return (
        <div className="flex flex-col h-full bg-bg-0">

            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Kanban className="text-primary w-6 h-6" />
                        </div>
                        Pipeline de Vendas
                    </h2>
                    <p className="text-text-3 text-xs">Gestão visual de oportunidades e receita projetada.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-6 bg-bg-1 border border-stroke p-4 rounded-2xl">
                        <div className="flex flex-col gap-0.5 pr-6 border-r border-stroke">
                            <span className="text-[10px] uppercase font-bold text-text-3">Pipeline</span>
                            {loading
                                ? <div className="h-5 w-24 bg-surface-2 rounded animate-pulse" />
                                : <span className="text-base font-black text-white">{formatCurrency(totalValue)}</span>}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold text-text-3">Deals</span>
                            {loading
                                ? <div className="h-5 w-8 bg-surface-2 rounded animate-pulse" />
                                : <div className="flex items-center gap-1.5">
                                    <span className="text-base font-black text-white">{openCount}</span>
                                    <TrendingUp size={12} className="text-success" />
                                </div>}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={14} /> Novo Deal
                    </button>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto p-8 pt-4 custom-scrollbar">
                {loading ? (
                    <div className="flex gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-72 flex flex-col gap-3">
                                <div className="h-6 w-32 bg-surface-2 rounded animate-pulse" />
                                {[1, 2].map(j => (
                                    <div key={j} className="h-32 bg-bg-1 border border-stroke rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex gap-6 min-h-[500px]">
                        {stages.map((stage) => {
                            const stageDeals = deals.filter(d => d.stage_id === stage.id);
                            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
                            const isOver = dragOver === stage.id;

                            return (
                                <div
                                    key={stage.id}
                                    className={`w-72 flex-shrink-0 flex flex-col gap-3 transition-all ${isOver ? 'scale-[1.01]' : ''}`}
                                    onDragOver={e => onDragOver(e, stage.id)}
                                    onDragLeave={() => setDragOver(null)}
                                    onDrop={e => onDrop(e, stage.id)}
                                >
                                    {/* Column header */}
                                    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isOver ? 'border-primary/40 bg-primary/5' : 'border-stroke bg-bg-1/50'}`}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: stage.color ?? '#7B61FF' }}
                                            />
                                            <span className="text-[11px] font-black text-white uppercase tracking-wider">{stage.name}</span>
                                            <span className="bg-surface-2 px-1.5 py-0.5 rounded text-[9px] text-text-3 font-bold">{stageDeals.length}</span>
                                        </div>
                                        {stageDeals.length > 0 && (
                                            <span className="text-[9px] font-bold text-text-3">{formatCurrency(stageValue)}</span>
                                        )}
                                    </div>

                                    {/* Cards */}
                                    <div className="flex flex-col gap-3 flex-1">
                                        {stageDeals.length === 0 && (
                                            <div className={`flex-1 min-h-[80px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${isOver ? 'border-primary/60 bg-primary/5 text-primary' : 'border-stroke/40 text-text-3'}`}>
                                                <span className="text-[11px] font-medium">{isOver ? 'Soltar aqui' : 'Sem deals'}</span>
                                            </div>
                                        )}
                                        {stageDeals.map((deal) => (
                                            <div
                                                key={deal.id}
                                                draggable
                                                onDragStart={e => onDragStart(e, deal.id)}
                                                onDragEnd={() => { setDragId(null); setDragOver(null); }}
                                                className={`bg-bg-1 border rounded-xl p-4 shadow-md cursor-grab active:cursor-grabbing transition-all group select-none ${dragId === deal.id ? 'opacity-40 border-primary' : 'border-stroke hover:border-primary/50'}`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white italic flex-shrink-0"
                                                        style={{ backgroundColor: (stage.color ?? '#7B61FF') + '33', border: `1px solid ${stage.color ?? '#7B61FF'}44` }}
                                                    >
                                                        {(deal.contact_name ?? deal.title).slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="relative" ref={openMenu === deal.id ? menuRef : null}>
                                                        <button
                                                            onClick={() => setOpenMenu(openMenu === deal.id ? null : deal.id)}
                                                            className="text-text-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white"
                                                        >
                                                            <MoreVertical size={14} />
                                                        </button>
                                                        {openMenu === deal.id && (
                                                            <div className="absolute right-0 top-6 z-30 bg-surface-2 border border-stroke rounded-xl shadow-2xl min-w-[140px] py-1">
                                                                <button
                                                                    onClick={() => handleDelete(deal.id)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-critical hover:bg-critical/10 transition-colors"
                                                                >
                                                                    <Trash2 size={12} /> Eliminar deal
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <h4 className="text-xs font-bold text-white mb-0.5 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                    {deal.title}
                                                </h4>
                                                {deal.contact_name && (
                                                    <span className="text-[10px] text-text-3 block mb-3">{deal.contact_name}</span>
                                                )}

                                                <div className="flex items-center justify-between pt-3 border-t border-stroke mt-3">
                                                    <span className="text-xs font-black text-white">{formatCurrency(deal.value)}</span>
                                                    {deal.lead_score != null && (
                                                        <div className="flex items-center gap-1">
                                                            <Star size={10} className={`fill-current ${scoreColor(deal.lead_score)}`} />
                                                            <span className={`text-[10px] font-black ${scoreColor(deal.lead_score)}`}>{deal.lead_score}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Drop zone hint when dragging */}
                                        {dragId && dragOver !== stage.id && (
                                            <div className="py-4 border-2 border-dashed border-stroke/40 rounded-xl flex items-center justify-center text-[10px] text-text-3 font-bold">
                                                Soltar aqui
                                            </div>
                                        )}

                                        {/* New deal button per column */}
                                        <button
                                            onClick={() => { setForm(f => ({ ...f, stage_id: stage.id })); setShowModal(true); }}
                                            className="py-2.5 border border-dashed border-stroke rounded-xl text-text-3 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:border-primary/40 hover:text-primary transition-all mt-auto"
                                        >
                                            <Plus size={12} /> Novo deal
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-3 bg-bg-1 border-t border-stroke flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] font-bold text-text-3 uppercase tracking-tighter">Jarvis Lead Scoring Engine — ativo</span>
            </div>

            {/* New Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Novo Deal</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-text-3 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Título *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Ex: Expansão Enterprise"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Valor (BRL) *</label>
                                <input
                                    type="number"
                                    value={form.value}
                                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                    placeholder="0.00"
                                    min="0"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Empresa / Contacto</label>
                                <input
                                    type="text"
                                    value={form.contact_name}
                                    onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                                    placeholder="Ex: TechCorp SA"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Estágio</label>
                                <select
                                    value={form.stage_id}
                                    onChange={e => setForm(f => ({ ...f, stage_id: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    {stages.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-stroke rounded-xl text-xs font-bold text-text-2 hover:text-white hover:border-stroke/80 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving || !form.title.trim() || !form.value}
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 size={12} className="animate-spin" />}
                                Criar Deal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
