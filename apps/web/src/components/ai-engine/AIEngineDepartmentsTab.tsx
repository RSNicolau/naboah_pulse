"use client";

import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Building2, Plus, X, Loader2, Users, Edit2, Trash2, ChevronRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

type Department = {
    id: string;
    name: string;
    description: string;
    head_agent_id: string | null;
    is_active: boolean;
    settings_json: Record<string, any>;
    created_at: string;
};

type AgentSummary = {
    id: string;
    name: string;
    status: string;
    role: string;
};

export default function AIEngineDepartmentsTab() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Department | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', head_agent_id: '' });
    const [agentsModal, setAgentsModal] = useState<{ dept: Department; agents: AgentSummary[] } | null>(null);

    useEffect(() => {
        apiGet<Department[]>('/ai-engine/departments')
            .then(setDepartments)
            .catch(() => toast.error('Erro ao carregar departments'))
            .finally(() => setLoading(false));
    }, []);

    function openCreate() {
        setEditing(null);
        setForm({ name: '', description: '', head_agent_id: '' });
        setShowModal(true);
    }

    function openEdit(dept: Department) {
        setEditing(dept);
        setForm({ name: dept.name, description: dept.description || '', head_agent_id: dept.head_agent_id || '' });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editing) {
                const updated = await apiPut<Department>(`/ai-engine/departments/${editing.id}`, form);
                setDepartments(prev => prev.map(d => d.id === editing.id ? updated : d));
                toast.success('Department atualizado');
            } else {
                const created = await apiPost<Department>('/ai-engine/departments', form);
                setDepartments(prev => [...prev, created]);
                toast.success('Department criado');
            }
            setShowModal(false);
        } catch { toast.error('Erro ao salvar department'); }
        finally { setSaving(false); }
    }

    async function handleDelete(dept: Department) {
        try {
            await apiDelete(`/ai-engine/departments/${dept.id}`);
            setDepartments(prev => prev.filter(d => d.id !== dept.id));
            toast.success(`${dept.name} removido`);
        } catch { toast.error('Erro ao remover department'); }
    }

    async function showAgents(dept: Department) {
        try {
            const agents = await apiGet<AgentSummary[]>(`/ai-engine/departments/${dept.id}/agents`);
            setAgentsModal({ dept, agents });
        } catch { toast.error('Erro ao carregar agentes'); }
    }

    return (
        <div className="flex flex-col gap-6">

            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Departments</h3>
                <button onClick={openCreate} className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2">
                    <Plus size={14} /> New Department
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="card h-40 animate-pulse" />)}
                </div>
            ) : departments.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 gap-3">
                    <Building2 size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum department criado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map(dept => (
                        <div key={dept.id} className="card-premium !rounded-2xl p-5 flex flex-col gap-4 group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Building2 size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{dept.name}</h4>
                                        <p className="text-[10px] text-text-3 mt-0.5">{dept.description}</p>
                                    </div>
                                </div>
                                <Badge variant={dept.is_active ? 'success' : 'neutral'} size="sm" dot>
                                    {dept.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-stroke/50">
                                <button
                                    onClick={() => showAgents(dept)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-text-3 hover:text-white transition-colors"
                                >
                                    <Users size={12} /> View Agents <ChevronRight size={10} />
                                </button>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(dept)} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-3 hover:text-white">
                                        <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => handleDelete(dept)} className="p-1.5 hover:bg-critical/10 rounded-lg transition-colors text-text-3 hover:text-critical">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="card-premium !rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 animate-scale-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {editing ? 'Edit Department' : 'New Department'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-text-3 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ex: Engineering"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Description</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Department purpose..."
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 resize-none h-20" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-2.5">Cancel</button>
                            <button onClick={handleSave} disabled={saving || !form.name.trim()}
                                className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2">
                                {saving && <Loader2 size={12} className="animate-spin" />}
                                {editing ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Agents List Modal */}
            {agentsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAgentsModal(null)}>
                    <div className="card-premium !rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{agentsModal.dept.name} — Agents</h3>
                            <button onClick={() => setAgentsModal(null)} className="text-text-3 hover:text-white"><X size={16} /></button>
                        </div>
                        {agentsModal.agents.length === 0 ? (
                            <p className="text-sm text-text-3 py-4 text-center">No agents in this department.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {agentsModal.agents.map(a => (
                                    <div key={a.id} className="flex items-center gap-3 bg-surface-1 rounded-xl px-4 py-3 border border-stroke/50">
                                        <div className={`w-2 h-2 rounded-full ${['acting', 'thinking'].includes(a.status) ? 'bg-success animate-pulse' : 'bg-text-3'}`} />
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-white">{a.name}</span>
                                            <span className="text-[10px] text-text-3 ml-2">{a.role}</span>
                                        </div>
                                        <span className="text-[10px] text-text-3 capitalize">{a.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
