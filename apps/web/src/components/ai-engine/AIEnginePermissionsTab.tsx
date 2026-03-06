"use client";

import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Shield, Loader2, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';

type MatrixEntry = {
    role_id: string;
    role_name: string;
    permissions: Record<string, boolean>;
};

type CheckResult = {
    allowed: boolean;
    blocked_by: string | null;
    reason: string;
    checks: Record<string, boolean>;
};

const CATEGORIES = ['general', 'crm', 'support', 'sales', 'marketing', 'security', 'analytics'];

export default function AIEnginePermissionsTab() {
    const [matrix, setMatrix] = useState<MatrixEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Permission check
    const [checkForm, setCheckForm] = useState({ agent_id: '', skill_id: '', user_id: 'user_system' });
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

    useEffect(() => {
        apiGet<MatrixEntry[]>('/ai-engine/permissions/matrix')
            .then(setMatrix)
            .catch(() => toast.error('Erro ao carregar permission matrix'))
            .finally(() => setLoading(false));
    }, []);

    async function runCheck() {
        if (!checkForm.agent_id || !checkForm.skill_id) return;
        setChecking(true);
        setCheckResult(null);
        try {
            const result = await apiPost<CheckResult>('/ai-engine/permissions/check', checkForm);
            setCheckResult(result);
        } catch { toast.error('Erro ao verificar permissão'); }
        finally { setChecking(false); }
    }

    return (
        <div className="flex flex-col gap-8">

            {/* Permission Matrix */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Shield size={16} className="text-primary" /> Permission Matrix
                </h3>

                {loading ? (
                    <div className="card h-48 animate-pulse" />
                ) : matrix.length === 0 ? (
                    <div className="card flex flex-col items-center justify-center py-12 gap-3">
                        <Shield size={32} className="text-text-3" />
                        <p className="text-sm text-text-3">No roles configured.</p>
                    </div>
                ) : (
                    <div className="card !p-0 overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-stroke">
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-text-3 uppercase tracking-widest sticky left-0 bg-bg-1 z-10">Role</th>
                                    {CATEGORIES.map(cat => (
                                        <th key={cat} className="px-3 py-3 text-[10px] font-black text-text-3 uppercase tracking-widest text-center">{cat}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map(entry => (
                                    <tr key={entry.role_id} className="border-b border-stroke/30 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 font-bold text-white sticky left-0 bg-bg-1 z-10">{entry.role_name}</td>
                                        {CATEGORIES.map(cat => {
                                            const allowed = entry.permissions[cat];
                                            return (
                                                <td key={cat} className="px-3 py-3 text-center">
                                                    <div className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${
                                                        allowed ? 'bg-success/10' : 'bg-critical/10'
                                                    }`}>
                                                        {allowed
                                                            ? <CheckCircle2 size={14} className="text-success" />
                                                            : <XCircle size={14} className="text-critical" />
                                                        }
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Permission Check Tool */}
            <div className="card-premium !rounded-2xl p-6 flex flex-col gap-5">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Permission Check</h3>
                <p className="text-[10px] text-text-3">Test if an agent can execute a specific skill.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Agent ID</label>
                        <input type="text" value={checkForm.agent_id} onChange={e => setCheckForm(f => ({ ...f, agent_id: e.target.value }))}
                            placeholder="ag_support"
                            className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Skill ID</label>
                        <input type="text" value={checkForm.skill_id} onChange={e => setCheckForm(f => ({ ...f, skill_id: e.target.value }))}
                            placeholder="skill_kb_search"
                            className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={runCheck} disabled={checking || !checkForm.agent_id || !checkForm.skill_id}
                            className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2">
                            {checking ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                            Check
                        </button>
                    </div>
                </div>

                {checkResult && (
                    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${
                        checkResult.allowed ? 'bg-success/5 border-success/20' : 'bg-critical/5 border-critical/20'
                    }`}>
                        <div className="flex items-center gap-2">
                            {checkResult.allowed
                                ? <><CheckCircle2 size={16} className="text-success" /><span className="text-sm font-bold text-success">Allowed</span></>
                                : <><XCircle size={16} className="text-critical" /><span className="text-sm font-bold text-critical">Blocked</span></>
                            }
                        </div>
                        {checkResult.reason && (
                            <p className="text-xs text-text-2">{checkResult.reason}</p>
                        )}
                        {checkResult.blocked_by && (
                            <p className="text-xs text-text-3">Blocked by: <span className="text-critical font-bold">{checkResult.blocked_by}</span></p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(checkResult.checks).map(([layer, passed]) => (
                                <span key={layer} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
                                    passed ? 'bg-success/10 text-success' : 'bg-critical/10 text-critical'
                                }`}>
                                    {passed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                    {layer}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
