"use client";

import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Brain, Zap, Play, Pause, Settings,
    Plus, X, Loader2, ShieldCheck, Users
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

type Agent = {
    id: string;
    name: string;
    role: string;
    status: string;
    intelligence_level: string;
    skills_json: string[];
    playbook_id: string;
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    acting:   { label: 'Active',   dot: 'bg-success animate-pulse', badge: 'bg-success/10 text-success border-success/20' },
    thinking: { label: 'Thinking', dot: 'bg-primary animate-pulse', badge: 'bg-primary/10 text-primary border-primary/20' },
    idle:     { label: 'Idle',     dot: 'bg-text-3',                badge: 'bg-surface-2 text-text-3 border-stroke' },
    paused:   { label: 'Paused',   dot: 'bg-warning',               badge: 'bg-warning/10 text-warning border-warning/20' },
};

const IQ_CONFIG: Record<string, { label: string; color: string }> = {
    genius:   { label: 'Genius',   color: 'text-primary' },
    high:     { label: 'High',     color: 'text-ai' },
    standard: { label: 'Standard', color: 'text-text-2' },
};

const DEPT_MAP: Record<string, string> = {
    pb_support:  'Support',
    pb_sales:    'Sales',
    pb_security: 'Security',
    pb_growth:   'Marketing',
};

const DEPARTMENTS = ['support', 'sales', 'security', 'marketing'];
const IQ_LEVELS = ['standard', 'high', 'genius'];

type AIDept = { id: string; name: string };
type AIRoleOption = { id: string; name: string; department_id: string };

type NewAgentForm = {
    name: string; role: string; intelligence_level: string; department: string;
    department_id: string; role_id: string; autonomy_level: string;
    max_executions_day: number; external_api_allowed: boolean;
};

export default function AgentGrid() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aiDepts, setAiDepts] = useState<AIDept[]>([]);
    const [aiRoles, setAiRoles] = useState<AIRoleOption[]>([]);
    const defaultForm: NewAgentForm = {
        name: '', role: '', intelligence_level: 'standard', department: 'support',
        department_id: '', role_id: '', autonomy_level: 'semi',
        max_executions_day: 100, external_api_allowed: false,
    };
    const [form, setForm] = useState<NewAgentForm>(defaultForm);

    async function load() {
        setLoading(true);
        try {
            const data = await apiGet<Agent[]>('/agents/team/squad');
            setAgents(data);
        } catch (e) { toast.error('Erro ao carregar agentes'); }
        finally { setLoading(false); }
    }

    useEffect(() => {
        load();
        apiGet<AIDept[]>('/ai-engine/departments').then(setAiDepts).catch(() => {});
        apiGet<AIRoleOption[]>('/ai-engine/roles').then(setAiRoles).catch(() => {});
    }, []);

    async function toggleStatus(agent: Agent) {
        setToggling(agent.id);
        const next = ['acting', 'thinking'].includes(agent.status) ? 'paused' : 'acting';
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: next } : a));
        try { await apiPatch(`/agents/team/${agent.id}/status`, {}); }
        catch { load(); }
        finally { setToggling(null); }
    }

    async function handleDeploy() {
        if (!form.name.trim() || !form.role.trim()) return;
        setSaving(true);
        try {
            const created = await apiPost<Agent>('/agents/team/agents', {
                name: form.name.trim(), role: form.role.trim(),
                intelligence_level: form.intelligence_level,
                department: form.department, skills: [],
                department_id: form.department_id || undefined,
                role_id: form.role_id || undefined,
                autonomy_level: form.autonomy_level,
                max_executions_day: form.max_executions_day,
                external_api_allowed: form.external_api_allowed,
            });
            setAgents(prev => [...prev, created]);
            setForm(defaultForm);
            setShowModal(false);
        } catch (e) { toast.error('Erro ao criar agente'); }
        finally { setSaving(false); }
    }

    const activeCount = agents.filter(a => ['acting', 'thinking'].includes(a.status)).length;

    return (
        <div className="flex flex-col h-full bg-bg-0">

            <div className="p-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Users className="text-primary w-6 h-6" />
                        </div>
                        Agents Department
                    </h2>
                    <p className="text-text-3 text-xs">Deploy and orchestrate your autonomous AI workforce.</p>
                </div>
                <div className="flex items-center gap-4">
                    {!loading && (
                        <div className="flex items-center gap-3 bg-bg-1 border border-stroke px-4 py-2.5 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-bold text-white">{activeCount}</span>
                            <span className="text-[10px] text-text-3 font-bold uppercase">active</span>
                            <span className="text-text-3 mx-1">·</span>
                            <span className="text-xs font-bold text-white">{agents.length}</span>
                            <span className="text-[10px] text-text-3 font-bold uppercase">total</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary px-5 py-2.5 text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <Zap size={14} /> Deploy Agent
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-bg-1 border border-stroke rounded-3xl p-6 flex flex-col gap-6 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-2" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="h-4 w-32 bg-surface-2 rounded" />
                                        <div className="h-3 w-20 bg-surface-2 rounded" />
                                    </div>
                                </div>
                                <div className="h-16 bg-surface-2 rounded-xl" />
                                <div className="h-10 bg-surface-2 rounded-xl" />
                            </div>
                        ))
                    ) : (
                        agents.map((agent) => {
                            const sc = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle;
                            const iq = IQ_CONFIG[agent.intelligence_level] ?? IQ_CONFIG.standard;
                            const dept = DEPT_MAP[agent.playbook_id] ?? 'General';
                            const isActive = ['acting', 'thinking'].includes(agent.status);

                            return (
                                <div key={agent.id} className="card-premium !rounded-3xl p-6 flex flex-col gap-5 group relative overflow-hidden animate-fade-in">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ${isActive ? 'bg-gradient-to-br from-primary/15 to-ai/10 border border-primary/20' : 'bg-surface-2 border border-stroke'}`}>
                                                <Brain size={28} className={isActive ? 'text-primary' : 'text-text-3'} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white leading-tight">{agent.name}</h3>
                                                <p className="text-[10px] text-text-3 mt-0.5">{agent.role}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={agent.status === 'acting' || agent.status === 'thinking' ? 'success' : agent.status === 'paused' ? 'warning' : 'neutral'}
                                            size="md"
                                            dot
                                        >
                                            {sc.label}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-surface-1 rounded-xl p-3 border border-stroke/50">
                                            <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest mb-1">IQ Level</p>
                                            <span className={`text-sm font-black flex items-center gap-1.5 ${iq.color}`}>
                                                <Zap size={12} className="fill-current" /> {iq.label}
                                            </span>
                                        </div>
                                        <div className="bg-surface-1 rounded-xl p-3 border border-stroke/50">
                                            <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest mb-1">Department</p>
                                            <span className="text-sm font-black text-white">{dept}</span>
                                        </div>
                                    </div>

                                    {agent.skills_json?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {agent.skills_json.slice(0, 3).map(skill => (
                                                <span key={skill} className="px-2 py-0.5 bg-surface-2 border border-stroke text-[9px] font-bold text-text-3 rounded-lg uppercase tracking-wide">
                                                    {skill.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                            {agent.skills_json.length > 3 && (
                                                <span className="px-2 py-0.5 bg-surface-2 border border-stroke text-[9px] font-bold text-text-3 rounded-lg">+{agent.skills_json.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-stroke/50">
                                        <button
                                            onClick={() => window.location.href = '/ai-engine'}
                                            className="p-2 hover:bg-surface-2 rounded-lg text-text-3 hover:text-white transition-colors"
                                            title="Configurar no AI Engine"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(agent)}
                                            disabled={toggling === agent.id}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border transition-all disabled:opacity-50 ${
                                                isActive
                                                    ? 'bg-critical/10 text-critical border-critical/20 hover:bg-critical/20'
                                                    : 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                                            }`}
                                        >
                                            {toggling === agent.id
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : isActive ? <Pause size={12} /> : <Play size={12} />}
                                            {isActive ? 'Pause' : 'Resume'}
                                        </button>
                                    </div>

                                    <div className="absolute -right-5 -bottom-5 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                        <ShieldCheck size={120} className="text-white" />
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {!loading && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="card !border-dashed !rounded-3xl p-6 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:!border-primary/30 min-h-[280px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-surface-2 border border-white/[0.06] flex items-center justify-center text-text-3 group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/[0.06] transition-all">
                                <Plus size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-white mb-1">Scale your workforce</p>
                                <p className="text-[10px] text-text-3 max-w-[160px]">Deploy a new autonomous agent to optimize your operations.</p>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="card-premium !rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 animate-scale-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Deploy New Agent</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-text-3 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Agent Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Pulse Finance"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Role *</label>
                                <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Ex: Finance Analyst"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Department</label>
                                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors">
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">IQ Level</label>
                                <div className="flex gap-2">
                                    {IQ_LEVELS.map(lvl => (
                                        <button key={lvl} onClick={() => setForm(f => ({ ...f, intelligence_level: lvl }))}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${form.intelligence_level === lvl ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-1 text-text-3 border-stroke hover:border-stroke/80'}`}>
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Enterprise 2.0 Fields */}
                            {aiDepts.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">AI Department</label>
                                    <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                                        className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors">
                                        <option value="">None</option>
                                        {aiDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            )}
                            {aiRoles.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">AI Role</label>
                                    <select value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                                        className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors">
                                        <option value="">None</option>
                                        {aiRoles.filter(r => !form.department_id || r.department_id === form.department_id).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Autonomy</label>
                                <div className="flex gap-2">
                                    {(['manual', 'semi', 'auto'] as const).map(lvl => (
                                        <button key={lvl} onClick={() => setForm(f => ({ ...f, autonomy_level: lvl }))}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${form.autonomy_level === lvl ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-1 text-text-3 border-stroke hover:border-stroke/80'}`}>
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-2.5">
                                Cancelar
                            </button>
                            <button onClick={handleDeploy} disabled={saving || !form.name.trim() || !form.role.trim()}
                                className="flex-1 btn-primary py-2.5 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                {saving && <Loader2 size={12} className="animate-spin" />}
                                Deploy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
