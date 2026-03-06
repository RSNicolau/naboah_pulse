"use client";

import React, { useEffect, useState, useRef } from 'react';
import { apiGet, apiUpload, apiPatch } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    Package, Upload, ChevronDown, ChevronRight, Zap, Power,
    CheckCircle2, XCircle, AlertTriangle, Loader2, FileText, Clock,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

type Skill = {
    id: string;
    name: string;
    description: string;
    category: string;
    is_active: boolean;
    execution_count: number;
    last_executed_at: string | null;
};

type SkillPackage = {
    id: string;
    name: string;
    version: number;
    description: string;
    author: string;
    status: string;
    skills_count: number;
    created_at: string;
    updated_at: string;
};

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'critical' | 'neutral' | 'primary'; label: string }> = {
    active:     { variant: 'success',  label: 'Active' },
    pending:    { variant: 'warning',  label: 'Pending' },
    validating: { variant: 'primary',  label: 'Validating' },
    inactive:   { variant: 'neutral',  label: 'Inactive' },
    error:      { variant: 'critical', label: 'Error' },
};

const CAT_COLORS: Record<string, string> = {
    general:   'bg-text-3/10 text-text-3',
    crm:       'bg-primary/10 text-primary',
    support:   'bg-success/10 text-success',
    sales:     'bg-warning/10 text-warning',
    marketing: 'bg-ai/10 text-ai',
    security:  'bg-critical/10 text-critical',
    analytics: 'bg-info/10 text-info',
};

export default function AIEngineSkillsTab() {
    const [packages, setPackages] = useState<SkillPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [expandedPkg, setExpandedPkg] = useState<string | null>(null);
    const [skills, setSkills] = useState<Record<string, Skill[]>>({});
    const [loadingSkills, setLoadingSkills] = useState<string | null>(null);
    const [reportModal, setReportModal] = useState<{ pkg: SkillPackage; report: any } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        apiGet<SkillPackage[]>('/ai-engine/skills/packages')
            .then(setPackages)
            .catch(() => toast.error('Erro ao carregar skill packages'))
            .finally(() => setLoading(false));
    }, []);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const pkg = await apiUpload<SkillPackage>('/ai-engine/skills/packages/upload', file);
            setPackages(prev => [pkg, ...prev]);
            toast.success(`Package "${pkg.name}" uploaded`);
        } catch {
            toast.error('Erro ao fazer upload do package');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    }

    async function expandPackage(pkg: SkillPackage) {
        if (expandedPkg === pkg.id) { setExpandedPkg(null); return; }
        setExpandedPkg(pkg.id);
        if (!skills[pkg.id]) {
            setLoadingSkills(pkg.id);
            try {
                const detail = await apiGet<{ skills: Skill[] }>(`/ai-engine/skills/packages/${pkg.id}`);
                setSkills(prev => ({ ...prev, [pkg.id]: detail.skills ?? [] }));
            } catch { toast.error('Erro ao carregar skills'); }
            finally { setLoadingSkills(null); }
        }
    }

    async function togglePackage(pkg: SkillPackage) {
        try {
            const updated = await apiPatch<SkillPackage>(`/ai-engine/skills/packages/${pkg.id}/toggle`, {});
            setPackages(prev => prev.map(p => p.id === pkg.id ? updated : p));
            toast.success(`${updated.name} → ${updated.status}`);
        } catch { toast.error('Erro ao alterar status'); }
    }

    async function toggleSkill(skillId: string, pkgId: string) {
        try {
            const updated = await apiPatch<Skill>(`/ai-engine/skills/${skillId}/toggle`, {});
            setSkills(prev => ({
                ...prev,
                [pkgId]: (prev[pkgId] ?? []).map(s => s.id === skillId ? updated : s),
            }));
        } catch { toast.error('Erro ao alterar skill'); }
    }

    async function showReport(pkg: SkillPackage) {
        try {
            const report = await apiGet(`/ai-engine/skills/packages/${pkg.id}/report`);
            setReportModal({ pkg, report });
        } catch { toast.error('Erro ao carregar relatório'); }
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Upload Bar */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Skill Packages</h3>
                <div className="flex gap-3">
                    <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={handleUpload} />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
                    >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploading ? 'Uploading...' : 'Upload Package'}
                    </button>
                </div>
            </div>

            {/* Package List */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2].map(i => <div key={i} className="card h-28 animate-pulse" />)}
                </div>
            ) : packages.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 gap-3">
                    <Package size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum skill package encontrado.</p>
                    <button onClick={() => fileRef.current?.click()} className="btn-primary px-4 py-2 text-xs mt-2">
                        Upload First Package
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {packages.map(pkg => {
                        const sb = STATUS_BADGE[pkg.status] ?? STATUS_BADGE.pending;
                        const expanded = expandedPkg === pkg.id;

                        return (
                            <div key={pkg.id} className="card-premium !rounded-2xl overflow-hidden">
                                {/* Header Row */}
                                <div
                                    className="p-5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => expandPackage(pkg)}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Package size={22} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-white truncate">{pkg.name}</h4>
                                            <span className="text-[10px] text-text-3 font-bold">v{pkg.version}</span>
                                        </div>
                                        <p className="text-[11px] text-text-3 truncate">{pkg.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-[10px] text-text-3 font-bold">{pkg.skills_count} skills</span>
                                        <Badge variant={sb.variant} size="sm" dot>{sb.label}</Badge>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); togglePackage(pkg); }}
                                            className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors"
                                            title="Toggle active"
                                        >
                                            <Power size={14} className={pkg.status === 'active' ? 'text-success' : 'text-text-3'} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); showReport(pkg); }}
                                            className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors"
                                            title="Validation report"
                                        >
                                            <FileText size={14} className="text-text-3" />
                                        </button>
                                        {expanded ? <ChevronDown size={16} className="text-text-3" /> : <ChevronRight size={16} className="text-text-3" />}
                                    </div>
                                </div>

                                {/* Expanded Skills */}
                                {expanded && (
                                    <div className="border-t border-stroke/50 bg-bg-0/50">
                                        {loadingSkills === pkg.id ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 size={20} className="text-primary animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-stroke/30">
                                                {(skills[pkg.id] ?? []).map(skill => (
                                                    <div key={skill.id} className="px-5 py-3 flex items-center gap-4">
                                                        <Zap size={14} className={skill.is_active ? 'text-primary' : 'text-text-3'} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs font-bold text-white">{skill.name}</span>
                                                            <p className="text-[10px] text-text-3 truncate">{skill.description}</p>
                                                        </div>
                                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${CAT_COLORS[skill.category] ?? CAT_COLORS.general}`}>
                                                            {skill.category}
                                                        </span>
                                                        <span className="text-[10px] text-text-3 font-bold w-16 text-right">
                                                            {skill.execution_count} runs
                                                        </span>
                                                        <button
                                                            onClick={() => toggleSkill(skill.id, pkg.id)}
                                                            className={`w-8 h-4 rounded-full transition-colors flex items-center ${skill.is_active ? 'bg-success justify-end' : 'bg-surface-2 justify-start'}`}
                                                        >
                                                            <div className="w-3 h-3 bg-white rounded-full mx-0.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(skills[pkg.id] ?? []).length === 0 && (
                                                    <div className="py-6 text-center text-text-3 text-xs">No skills in this package.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Validation Report Modal */}
            {reportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setReportModal(null)}>
                    <div className="card-premium !rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Validation Report</h3>
                            <button onClick={() => setReportModal(null)} className="text-text-3 hover:text-white">
                                <XCircle size={18} />
                            </button>
                        </div>
                        <div className="text-xs text-text-2">
                            <p className="font-bold mb-2">{reportModal.pkg.name} v{reportModal.pkg.version}</p>
                            <div className="flex items-center gap-2 mb-3">
                                {reportModal.report.valid
                                    ? <><CheckCircle2 size={14} className="text-success" /><span className="text-success font-bold">Valid</span></>
                                    : <><XCircle size={14} className="text-critical" /><span className="text-critical font-bold">Invalid</span></>
                                }
                            </div>
                            {reportModal.report.errors?.length > 0 && (
                                <div className="mb-3">
                                    <p className="font-bold text-critical mb-1">Errors:</p>
                                    {reportModal.report.errors.map((e: string, i: number) => (
                                        <div key={i} className="flex items-start gap-1.5 text-text-3 mb-1">
                                            <XCircle size={10} className="text-critical mt-0.5 flex-shrink-0" />
                                            <span>{e}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {reportModal.report.warnings?.length > 0 && (
                                <div>
                                    <p className="font-bold text-warning mb-1">Warnings:</p>
                                    {reportModal.report.warnings.map((w: string, i: number) => (
                                        <div key={i} className="flex items-start gap-1.5 text-text-3 mb-1">
                                            <AlertTriangle size={10} className="text-warning mt-0.5 flex-shrink-0" />
                                            <span>{w}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {reportModal.report.validated_at && (
                                <p className="text-text-3 mt-3 flex items-center gap-1">
                                    <Clock size={10} /> Validated: {new Date(reportModal.report.validated_at).toLocaleString('pt-BR')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
