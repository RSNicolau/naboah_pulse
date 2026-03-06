"use client";

import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Shield, Plus, X, Loader2, Edit2, Trash2, Zap, Globe,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

type Role = {
    id: string;
    department_id: string;
    name: string;
    description: string;
    permissions_json: string[];
    default_skills_json: string[];
    autonomy_level: string;
    max_executions_day: number;
    external_api_allowed: boolean;
    is_system: boolean;
    created_at: string;
};

type Department = { id: string; name: string };

const AUTONOMY_COLORS: Record<string, string> = {
    auto: 'text-success',
    semi: 'text-warning',
    manual: 'text-text-3',
};

const AUTONOMY_LEVELS = ['auto', 'semi', 'manual'];

export default function AIEngineRolesTab() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);
    const [saving, setSaving] = useState(false);
    const [filterDept, setFilterDept] = useState('');
    const [form, setForm] = useState({
        name: '', description: '', department_id: '',
        permissions: '', default_skills: '',
        autonomy_level: 'semi', max_executions_day: 100,
        external_api_allowed: false,
    });

    useEffect(() => {
        Promise.all([
            apiGet<Role[]>('/ai-engine/roles'),
            apiGet<Department[]>('/ai-engine/departments'),
        ]).then(([r, d]) => {
            setRoles(r);
            setDepartments(d);
        }).catch(() => toast.error('Erro ao carregar roles'))
          .finally(() => setLoading(false));
    }, []);

    function openCreate() {
        setEditing(null);
        setForm({
            name: '', description: '', department_id: departments[0]?.id || '',
            permissions: '', default_skills: '',
            autonomy_level: 'semi', max_executions_day: 100,
            external_api_allowed: false,
        });
        setShowModal(true);
    }

    function openEdit(role: Role) {
        setEditing(role);
        setForm({
            name: role.name, description: role.description || '',
            department_id: role.department_id,
            permissions: role.permissions_json.join(', '),
            default_skills: role.default_skills_json.join(', '),
            autonomy_level: role.autonomy_level,
            max_executions_day: role.max_executions_day,
            external_api_allowed: role.external_api_allowed,
        });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim() || !form.department_id) return;
        setSaving(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            department_id: form.department_id,
            permissions_json: form.permissions.split(',').map(s => s.trim()).filter(Boolean),
            default_skills_json: form.default_skills.split(',').map(s => s.trim()).filter(Boolean),
            autonomy_level: form.autonomy_level,
            max_executions_day: form.max_executions_day,
            external_api_allowed: form.external_api_allowed,
        };
        try {
            if (editing) {
                const updated = await apiPut<Role>(`/ai-engine/roles/${editing.id}`, payload);
                setRoles(prev => prev.map(r => r.id === editing.id ? updated : r));
                toast.success('Role atualizado');
            } else {
                const created = await apiPost<Role>('/ai-engine/roles', payload);
                setRoles(prev => [...prev, created]);
                toast.success('Role criado');
            }
            setShowModal(false);
        } catch { toast.error('Erro ao salvar role'); }
        finally { setSaving(false); }
    }

    async function handleDelete(role: Role) {
        if (role.is_system) { toast.error('Cannot delete system role'); return; }
        try {
            await apiDelete(`/ai-engine/roles/${role.id}`);
            setRoles(prev => prev.filter(r => r.id !== role.id));
            toast.success(`${role.name} removido`);
        } catch { toast.error('Erro ao remover role'); }
    }

    const filtered = filterDept ? roles.filter(r => r.department_id === filterDept) : roles;
    const deptName = (id: string) => departments.find(d => d.id === id)?.name ?? id;

    return (
        <div className="flex flex-col gap-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Roles</h3>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        className="bg-surface-1 border border-stroke rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none">
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <button onClick={openCreate} className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2">
                    <Plus size={14} /> New Role
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="card h-44 animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 gap-3">
                    <Shield size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum role encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(role => (
                        <div key={role.id} className="card-premium !rounded-2xl p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Shield size={14} className="text-primary" />
                                        {role.name}
                                        {role.is_system && <Badge variant="primary" size="sm">System</Badge>}
                                    </h4>
                                    <p className="text-[10px] text-text-3 mt-0.5">{role.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-surface-1 rounded-lg p-2 border border-stroke/50">
                                    <p className="text-[8px] font-bold text-text-3 uppercase">Dept</p>
                                    <span className="text-[10px] font-bold text-white">{deptName(role.department_id)}</span>
                                </div>
                                <div className="bg-surface-1 rounded-lg p-2 border border-stroke/50">
                                    <p className="text-[8px] font-bold text-text-3 uppercase">Autonomy</p>
                                    <span className={`text-[10px] font-bold capitalize ${AUTONOMY_COLORS[role.autonomy_level]}`}>{role.autonomy_level}</span>
                                </div>
                                <div className="bg-surface-1 rounded-lg p-2 border border-stroke/50">
                                    <p className="text-[8px] font-bold text-text-3 uppercase">Max/Day</p>
                                    <span className="text-[10px] font-bold text-white">{role.max_executions_day}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {role.permissions_json.slice(0, 3).map(p => (
                                    <span key={p} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded-md">{p}</span>
                                ))}
                                {role.permissions_json.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-surface-2 text-text-3 text-[8px] font-bold rounded-md">+{role.permissions_json.length - 3}</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-stroke/50">
                                <div className="flex items-center gap-2">
                                    {role.external_api_allowed && (
                                        <span className="flex items-center gap-1 text-[9px] text-ai font-bold">
                                            <Globe size={10} /> API
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(role)} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-3 hover:text-white">
                                        <Edit2 size={13} />
                                    </button>
                                    {!role.is_system && (
                                        <button onClick={() => handleDelete(role)} className="p-1.5 hover:bg-critical/10 rounded-lg transition-colors text-text-3 hover:text-critical">
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="card-premium !rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 animate-scale-in max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {editing ? 'Edit Role' : 'New Role'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-text-3 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Department *</label>
                                <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50">
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Description</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 resize-none h-16" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Permissions (comma-separated)</label>
                                <input type="text" value={form.permissions} onChange={e => setForm(f => ({ ...f, permissions: e.target.value }))}
                                    placeholder="ai.skills.*, ai.executions.view"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Default Skills (comma-separated)</label>
                                <input type="text" value={form.default_skills} onChange={e => setForm(f => ({ ...f, default_skills: e.target.value }))}
                                    placeholder="ticket_resolve, kb_search"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Autonomy Level</label>
                                <div className="flex gap-2">
                                    {AUTONOMY_LEVELS.map(lvl => (
                                        <button key={lvl} onClick={() => setForm(f => ({ ...f, autonomy_level: lvl }))}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${form.autonomy_level === lvl ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-1 text-text-3 border-stroke'}`}>
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Max Exec/Day</label>
                                    <input type="number" value={form.max_executions_day} onChange={e => setForm(f => ({ ...f, max_executions_day: parseInt(e.target.value) || 0 }))}
                                        className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="flex flex-col gap-1.5 items-center justify-end">
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">External API</label>
                                    <button onClick={() => setForm(f => ({ ...f, external_api_allowed: !f.external_api_allowed }))}
                                        className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.external_api_allowed ? 'bg-success justify-end' : 'bg-surface-2 justify-start'}`}>
                                        <div className="w-4 h-4 bg-white rounded-full mx-0.5" />
                                    </button>
                                </div>
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
        </div>
    );
}
