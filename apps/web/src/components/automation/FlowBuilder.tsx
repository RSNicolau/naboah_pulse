"use client";

import React, { useEffect, useState } from 'react';
import {
    Zap, Plus, Trash2, ToggleLeft, ToggleRight, Bot, GitBranch,
    Bell, Clock, Loader2, X, CheckCircle2, Play,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { toast } from '@/lib/toast';

type Trigger = {
    id: string;
    name: string;
    trigger_type: string;
    action_type: string;
    is_active: boolean;
    condition_label: string;
    config_json: Record<string, string>;
    action_params_json: Record<string, string>;
    last_run_at: string | null;
    created_at: string;
};

const TRIGGER_TYPES = [
    { value: 'message_received',   label: 'Nova Mensagem Recebida' },
    { value: 'conversation_closed', label: 'Conversa Encerrada' },
    { value: 'ticket_created',     label: 'Ticket Criado' },
    { value: 'deal_updated',       label: 'Deal Atualizado' },
    { value: 'cron',               label: 'Agendamento (Cron)' },
    { value: 'webhook',            label: 'Webhook Externo' },
];

const ACTION_TYPES = [
    { value: 'notify_team',   label: 'Notificar Equipa' },
    { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
    { value: 'send_email',    label: 'Enviar Email' },
    { value: 'ai_analyze',   label: 'Jarvis: Analisar com IA' },
    { value: 'create_ticket', label: 'Criar Ticket de Suporte' },
    { value: 'update_deal',   label: 'Atualizar Deal no CRM' },
];

const CHANNELS = ['whatsapp', 'instagram', 'email'];
const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const STAGES = [
    { value: 'stg_1', label: 'Lead Qualificado' },
    { value: 'stg_2', label: 'Apresentação' },
    { value: 'stg_3', label: 'Negociação' },
    { value: 'stg_4', label: 'Fechamento' },
];
const CRON_SCHEDULES = [
    { value: 'daily_9am',  label: 'Todos os dias às 9h' },
    { value: 'hourly',     label: 'A cada hora' },
    { value: 'weekly_mon', label: 'Segundas-feiras' },
];

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
    message_received:    <Zap size={14} className="text-warning" />,
    conversation_closed: <CheckCircle2 size={14} className="text-success" />,
    ticket_created:      <Bell size={14} className="text-critical" />,
    deal_updated:        <GitBranch size={14} className="text-primary" />,
    cron:                <Clock size={14} className="text-ai" />,
    webhook:             <Zap size={14} className="text-ai-accent" />,
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
    notify_team:  <Bell size={14} className="text-warning" />,
    send_whatsapp: <Zap size={14} className="text-success" />,
    send_email:   <Zap size={14} className="text-primary" />,
    ai_analyze:   <Bot size={14} className="text-ai-accent" />,
    create_ticket: <Plus size={14} className="text-critical" />,
    update_deal:  <GitBranch size={14} className="text-ai" />,
};

function triggerLabel(type: string): string {
    return TRIGGER_TYPES.find((t) => t.value === type)?.label ?? type;
}
function actionLabel(type: string): string {
    return ACTION_TYPES.find((a) => a.value === type)?.label ?? type;
}
function timeAgo(iso: string | null): string {
    if (!iso) return 'Nunca executado';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora mesmo';
    if (m < 60) return `${m}min atrás`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
}

type NewForm = {
    name: string;
    trigger_type: string;
    action_type: string;
    // conditions
    channel: string;
    keyword: string;
    priority: string;
    stage: string;
    schedule: string;
};

const DEFAULT_FORM: NewForm = {
    name: '',
    trigger_type: TRIGGER_TYPES[0].value,
    action_type: ACTION_TYPES[0].value,
    channel: '', keyword: '', priority: '', stage: '', schedule: 'daily_9am',
};

export default function FlowBuilder() {
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<NewForm>(DEFAULT_FORM);
    const [saving, setSaving] = useState(false);
    const [runningId, setRunningId] = useState<string | null>(null);

    async function load() {
        try {
            const data = await apiGet<Trigger[]>('/automation/triggers');
            setTriggers(data);
        } catch (e) {
            toast.error('Erro ao carregar automações');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function toggleTrigger(id: string) {
        setTriggers((ts) => ts.map((t) => t.id === id ? { ...t, is_active: !t.is_active } : t));
        try {
            await apiPatch(`/automation/triggers/${id}/toggle`, {});
        } catch {
            load();
        }
    }

    async function deleteTrigger(id: string) {
        setTriggers((ts) => ts.filter((t) => t.id !== id));
        try {
            await apiDelete(`/automation/triggers/${id}`);
        } catch {
            load();
        }
    }

    async function runTrigger(id: string) {
        setRunningId(id);
        try {
            const res = await apiPost<{ last_run_at: string }>(`/automation/triggers/${id}/run`, {});
            setTriggers((ts) => ts.map((t) => t.id === id ? { ...t, last_run_at: res.last_run_at } : t));
        } catch (e) {
            toast.error('Erro ao executar trigger');
        } finally {
            setRunningId(null);
        }
    }

    async function createTrigger() {
        if (!form.name.trim()) return;
        setSaving(true);

        // Build config_json from condition fields
        const config: Record<string, string> = {};
        if (form.trigger_type === 'message_received') {
            if (form.channel) config.channel = form.channel;
            if (form.keyword) config.keyword = form.keyword;
        } else if (form.trigger_type === 'ticket_created') {
            if (form.priority) config.priority = form.priority;
        } else if (form.trigger_type === 'deal_updated') {
            if (form.stage) config.stage = form.stage;
        } else if (form.trigger_type === 'cron') {
            config.schedule = form.schedule;
        }

        try {
            const created = await apiPost<Trigger>('/automation/triggers', {
                name: form.name.trim(),
                trigger_type: form.trigger_type,
                action_type: form.action_type,
                config_json: config,
            });
            setTriggers((ts) => [created, ...ts]);
            setForm(DEFAULT_FORM);
            setShowModal(false);
        } catch (e) {
            toast.error('Erro ao criar automação');
        } finally {
            setSaving(false);
        }
    }

    const activeCount = triggers.filter((t) => t.is_active).length;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Zap className="text-primary w-6 h-6" />
                            </div>
                            Automation Rules
                        </h2>
                        <p className="text-text-3 text-sm">
                            {activeCount} regra{activeCount !== 1 ? 's' : ''} ativa{activeCount !== 1 ? 's' : ''} de {triggers.length} total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="jarvis-gradient px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Plus size={14} /> Nova Regra
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Ativas',   value: activeCount,                    color: 'text-success', border: 'border-success/20' },
                        { label: 'Pausadas', value: triggers.length - activeCount,  color: 'text-text-3',  border: 'border-stroke' },
                        { label: 'Total',    value: triggers.length,                color: 'text-primary', border: 'border-primary/20' },
                    ].map((s) => (
                        <div key={s.label} className={`bg-bg-1 border ${s.border} rounded-2xl p-4 flex flex-col gap-1`}>
                            {loading
                                ? <div className="h-7 w-8 bg-surface-2 rounded animate-pulse" />
                                : <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>}
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Triggers list */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-bg-1 border border-stroke rounded-2xl p-5 flex gap-4 animate-pulse">
                                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                    <div className="w-9 h-9 rounded-xl bg-surface-2" />
                                    <div className="w-px h-4 bg-surface-2" />
                                    <div className="w-9 h-9 rounded-xl bg-surface-2" />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="h-3.5 w-48 bg-surface-2 rounded" />
                                    <div className="h-2.5 w-64 bg-surface-2 rounded" />
                                    <div className="h-2 w-32 bg-surface-2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : triggers.length === 0 ? (
                    <div className="bg-bg-1 border border-dashed border-stroke rounded-2xl p-12 flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
                            <Zap size={28} className="text-text-3" />
                        </div>
                        <p className="text-sm text-text-3">Sem regras de automação. Crie a sua primeira.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="jarvis-gradient px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-primary/20"
                        >
                            <Plus size={14} className="inline mr-1" /> Nova Regra
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {triggers.map((trigger) => (
                            <div
                                key={trigger.id}
                                className={`bg-bg-1 border rounded-2xl p-5 flex items-center gap-4 transition-all group ${
                                    trigger.is_active ? 'border-stroke hover:border-stroke/80' : 'border-stroke/30 opacity-60'
                                }`}
                            >
                                {/* Flow icons */}
                                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                    <div className="w-9 h-9 rounded-xl bg-surface-1 border border-stroke flex items-center justify-center">
                                        {TRIGGER_ICONS[trigger.trigger_type] ?? <Zap size={14} className="text-text-3" />}
                                    </div>
                                    <div className="w-px h-3 bg-stroke" />
                                    <div className="w-9 h-9 rounded-xl bg-surface-1 border border-stroke flex items-center justify-center">
                                        {ACTION_ICONS[trigger.action_type] ?? <Bot size={14} className="text-text-3" />}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-sm font-bold text-white truncate">{trigger.name}</span>
                                        {trigger.is_active && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-success/10 text-success border border-success/20 rounded-full uppercase flex-shrink-0">Ativa</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-text-3 flex-wrap">
                                        <span>SE <span className="text-text-2 font-bold">{triggerLabel(trigger.trigger_type)}</span></span>
                                        {trigger.condition_label && (
                                            <span className="bg-surface-2 px-1.5 py-0.5 rounded text-text-3 font-medium">{trigger.condition_label}</span>
                                        )}
                                        <span>→</span>
                                        <span>ENTÃO <span className="text-text-2 font-bold">{actionLabel(trigger.action_type)}</span></span>
                                    </div>
                                    <p className="text-[9px] text-text-3 mt-1.5 flex items-center gap-1">
                                        <Clock size={9} /> {timeAgo(trigger.last_run_at)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => runTrigger(trigger.id)}
                                        disabled={runningId === trigger.id}
                                        title="Simular execução"
                                        className="p-2 rounded-lg text-text-3 hover:text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                                    >
                                        {runningId === trigger.id
                                            ? <Loader2 size={14} className="animate-spin" />
                                            : <Play size={14} />}
                                    </button>
                                    <button
                                        onClick={() => toggleTrigger(trigger.id)}
                                        title={trigger.is_active ? 'Pausar' : 'Ativar'}
                                        className="p-2 rounded-lg text-text-3 hover:text-white hover:bg-surface-1 transition-colors"
                                    >
                                        {trigger.is_active
                                            ? <ToggleRight size={20} className="text-success" />
                                            : <ToggleLeft size={20} />}
                                    </button>
                                    <button
                                        onClick={() => deleteTrigger(trigger.id)}
                                        title="Eliminar"
                                        className="p-2 rounded-lg text-text-3 hover:text-critical hover:bg-critical/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-1 border border-primary/30 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Nova Regra</h3>
                            <button onClick={() => { setShowModal(false); setForm(DEFAULT_FORM); }} className="text-text-3 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Nome *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Ex: Auto-responder WhatsApp..."
                                className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {/* Trigger type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Gatilho (SE)</label>
                            <select
                                value={form.trigger_type}
                                onChange={(e) => setForm(f => ({ ...f, trigger_type: e.target.value }))}
                                className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>

                        {/* Condition fields — vary by trigger_type */}
                        {form.trigger_type === 'message_received' && (
                            <div className="flex flex-col gap-3 bg-surface-1/50 rounded-xl p-4 border border-stroke/50">
                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Condições</p>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-text-3">Canal (opcional)</label>
                                    <select
                                        value={form.channel}
                                        onChange={(e) => setForm(f => ({ ...f, channel: e.target.value }))}
                                        className="bg-surface-1 border border-stroke rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="">Qualquer canal</option>
                                        {CHANNELS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-text-3">Palavras-chave (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        value={form.keyword}
                                        onChange={(e) => setForm(f => ({ ...f, keyword: e.target.value }))}
                                        placeholder="oi, olá, ajuda..."
                                        className="bg-surface-1 border border-stroke rounded-lg px-3 py-2 text-xs text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                        )}

                        {form.trigger_type === 'ticket_created' && (
                            <div className="flex flex-col gap-1.5 bg-surface-1/50 rounded-xl p-4 border border-stroke/50">
                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Condições</p>
                                <label className="text-[10px] text-text-3">Prioridade (opcional)</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="">Qualquer prioridade</option>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                </select>
                            </div>
                        )}

                        {form.trigger_type === 'deal_updated' && (
                            <div className="flex flex-col gap-1.5 bg-surface-1/50 rounded-xl p-4 border border-stroke/50">
                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Condições</p>
                                <label className="text-[10px] text-text-3">Etapa do Pipeline</label>
                                <select
                                    value={form.stage}
                                    onChange={(e) => setForm(f => ({ ...f, stage: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="">Qualquer etapa</option>
                                    {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        )}

                        {form.trigger_type === 'cron' && (
                            <div className="flex flex-col gap-1.5 bg-surface-1/50 rounded-xl p-4 border border-stroke/50">
                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Agendamento</p>
                                <div className="flex flex-col gap-2">
                                    {CRON_SCHEDULES.map(s => (
                                        <label key={s.value} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="schedule"
                                                value={s.value}
                                                checked={form.schedule === s.value}
                                                onChange={() => setForm(f => ({ ...f, schedule: s.value }))}
                                                className="accent-primary"
                                            />
                                            <span className="text-xs text-text-2 group-hover:text-white transition-colors">{s.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Ação (ENTÃO)</label>
                            <select
                                value={form.action_type}
                                onChange={(e) => setForm(f => ({ ...f, action_type: e.target.value }))}
                                className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                        </div>

                        {/* Preview */}
                        <div className="bg-surface-1/50 rounded-xl p-3 border border-stroke/50">
                            <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest mb-1.5">Preview</p>
                            <p className="text-xs text-text-2">
                                SE <span className="text-white font-bold">{triggerLabel(form.trigger_type)}</span>
                                {form.trigger_type === 'message_received' && form.channel && ` · ${form.channel}`}
                                {form.trigger_type === 'cron' && ` · ${CRON_SCHEDULES.find(s => s.value === form.schedule)?.label ?? ''}`}
                                {' → '}<span className="text-white font-bold">{ACTION_TYPES.find(a => a.value === form.action_type)?.label}</span>
                            </p>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => { setShowModal(false); setForm(DEFAULT_FORM); }}
                                className="flex-1 py-2.5 border border-stroke rounded-xl text-xs font-bold text-text-2 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createTrigger}
                                disabled={saving || !form.name.trim()}
                                className="flex-1 jarvis-gradient py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 size={12} className="animate-spin" />}
                                Criar Regra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
