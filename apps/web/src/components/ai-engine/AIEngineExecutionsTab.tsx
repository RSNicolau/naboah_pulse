"use client";

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Activity, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle,
    ShieldAlert, ChevronDown,
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import Badge from '@/components/ui/Badge';

type Execution = {
    id: string;
    agent_id: string;
    skill_id: string;
    triggered_by: string;
    status: string;
    input_json: Record<string, any>;
    output_json: Record<string, any> | null;
    error_message: string | null;
    permission_check_json: Record<string, any>;
    execution_time_ms: number | null;
    created_at: string;
};

type ExecStats = {
    total_today: number;
    total_all: number;
    completed: number;
    failed: number;
    blocked: number;
    avg_time_ms: number;
};

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'critical' | 'neutral' | 'primary'; label: string }> = {
    completed: { variant: 'success',  label: 'Completed' },
    running:   { variant: 'primary',  label: 'Running' },
    pending:   { variant: 'warning',  label: 'Pending' },
    failed:    { variant: 'critical', label: 'Failed' },
    blocked:   { variant: 'neutral',  label: 'Blocked' },
};

export default function AIEngineExecutionsTab() {
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [stats, setStats] = useState<ExecStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterAgent, setFilterAgent] = useState('');

    useEffect(() => {
        const params = new URLSearchParams();
        if (filterStatus) params.set('status', filterStatus);
        if (filterAgent) params.set('agent_id', filterAgent);
        const qs = params.toString();

        Promise.all([
            apiGet<Execution[]>(`/ai-engine/executions${qs ? `?${qs}` : ''}`),
            apiGet<ExecStats>('/ai-engine/executions/stats'),
        ]).then(([execs, s]) => {
            setExecutions(execs);
            setStats(s);
        }).catch(() => toast.error('Erro ao carregar executions'))
          .finally(() => setLoading(false));
    }, [filterStatus, filterAgent]);

    function formatMs(ms: number | null): string {
        if (ms === null) return '—';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    }

    function formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    const successRate = stats && stats.total_all > 0
        ? ((stats.completed / stats.total_all) * 100).toFixed(1) + '%'
        : '—';

    return (
        <div className="flex flex-col gap-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Today" value={stats?.total_today ?? '—'} icon={Activity} iconColor="text-primary" loading={loading} />
                <MetricCard label="Success Rate" value={successRate} icon={CheckCircle2} iconColor="text-success" loading={loading} />
                <MetricCard label="Failed" value={stats?.failed ?? '—'} icon={XCircle} iconColor="text-critical" loading={loading} />
                <MetricCard label="Blocked" value={stats?.blocked ?? '—'} icon={ShieldAlert} iconColor="text-warning" loading={loading} />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Execution Log</h3>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setLoading(true); }}
                    className="bg-surface-1 border border-stroke rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none">
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="blocked">Blocked</option>
                    <option value="running">Running</option>
                    <option value="pending">Pending</option>
                </select>
                <input type="text" placeholder="Filter by agent ID..." value={filterAgent}
                    onChange={e => { setFilterAgent(e.target.value); setLoading(true); }}
                    className="bg-surface-1 border border-stroke rounded-lg px-3 py-1.5 text-[10px] text-white placeholder:text-text-3 focus:outline-none w-40" />
            </div>

            {/* Execution Table */}
            {loading ? (
                <div className="card h-64 animate-pulse" />
            ) : executions.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 gap-3">
                    <Activity size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhuma execução encontrada.</p>
                </div>
            ) : (
                <div className="card !p-0 overflow-hidden">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-stroke">
                                {['Agent', 'Skill', 'Status', 'Triggered By', 'Duration', 'Date', ''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-text-3 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {executions.map(exec => {
                                const sb = STATUS_BADGE[exec.status] ?? STATUS_BADGE.pending;
                                const isExpanded = expanded === exec.id;
                                return (
                                    <React.Fragment key={exec.id}>
                                        <tr
                                            className="border-b border-stroke/30 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                            onClick={() => setExpanded(isExpanded ? null : exec.id)}
                                        >
                                            <td className="px-4 py-3 font-bold text-white">{exec.agent_id}</td>
                                            <td className="px-4 py-3 text-text-2">{exec.skill_id}</td>
                                            <td className="px-4 py-3"><Badge variant={sb.variant} size="sm" dot>{sb.label}</Badge></td>
                                            <td className="px-4 py-3 text-text-3">{exec.triggered_by}</td>
                                            <td className="px-4 py-3 text-text-2 font-mono">{formatMs(exec.execution_time_ms)}</td>
                                            <td className="px-4 py-3 text-text-3">{formatDate(exec.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <ChevronDown size={12} className={`text-text-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-bg-0/50">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[9px] font-black text-text-3 uppercase tracking-widest mb-1">Input</p>
                                                            <pre className="bg-surface-1 rounded-lg p-3 text-[10px] text-text-2 overflow-x-auto max-h-32 border border-stroke/50">
                                                                {JSON.stringify(exec.input_json, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-text-3 uppercase tracking-widest mb-1">
                                                                {exec.error_message ? 'Error' : 'Output'}
                                                            </p>
                                                            {exec.error_message ? (
                                                                <div className="bg-critical/5 border border-critical/20 rounded-lg p-3 text-[10px] text-critical">
                                                                    {exec.error_message}
                                                                </div>
                                                            ) : exec.output_json ? (
                                                                <pre className="bg-surface-1 rounded-lg p-3 text-[10px] text-text-2 overflow-x-auto max-h-32 border border-stroke/50">
                                                                    {JSON.stringify(exec.output_json, null, 2)}
                                                                </pre>
                                                            ) : (
                                                                <p className="text-[10px] text-text-3">No output</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Permission Check */}
                                                    {exec.permission_check_json && Object.keys(exec.permission_check_json).length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-[9px] font-black text-text-3 uppercase tracking-widest mb-1">Permission Check</p>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {Object.entries(exec.permission_check_json.checks ?? {}).map(([layer, passed]) => (
                                                                    <span key={layer} className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                                                        passed ? 'bg-success/10 text-success' : 'bg-critical/10 text-critical'
                                                                    }`}>
                                                                        {passed ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                                                                        {layer}
                                                                    </span>
                                                                ))}
                                                                {exec.permission_check_json.blocked_by && (
                                                                    <span className="text-[9px] text-critical font-bold ml-2">
                                                                        Blocked by: {exec.permission_check_json.blocked_by}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
