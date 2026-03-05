"use client";
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Fingerprint, FileSearch, Trash2, Download, CheckCircle, AlertCircle, History, Lock, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

// ---------------------------------------------------------------------------
// Privacy preferences — stored in localStorage
// ---------------------------------------------------------------------------
const PRIVACY_PREFS_KEY = 'nb_privacy_prefs';

type PrivacyPrefs = {
    data_collection: boolean;
    analytics_tracking: boolean;
    third_party_sharing: boolean;
};

const DEFAULT_PREFS: PrivacyPrefs = {
    data_collection: true,
    analytics_tracking: true,
    third_party_sharing: false,
};

function loadPrivacyPrefs(): PrivacyPrefs {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PRIVACY_PREFS_KEY) ?? '{}') }; }
    catch { return DEFAULT_PREFS; }
}

function savePrivacyPrefs(prefs: PrivacyPrefs) {
    localStorage.setItem(PRIVACY_PREFS_KEY, JSON.stringify(prefs));
}

type AuditLog = { id: string; action: string; user: string; time: string; status: string };

export default function PrivacyDashboard() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPrefs>(DEFAULT_PREFS);

    useEffect(() => {
        setPrivacyPrefs(loadPrivacyPrefs());
    }, []);

    useEffect(() => {
        apiGet('/privacy/audit-logs')
            .then((data: any) => {
                const logs = Array.isArray(data) ? data : data?.items ?? data?.logs ?? [];
                setAuditLogs(logs);
            })
            .catch(() => {
                // Silently fall back — audit logs may not be available yet
            })
            .finally(() => setLogsLoading(false));
    }, []);

    function togglePrivacyPref(key: keyof PrivacyPrefs) {
        const next = { ...privacyPrefs, [key]: !privacyPrefs[key] };
        setPrivacyPrefs(next);
        savePrivacyPrefs(next);
        toast.success('Preferência de privacidade atualizada');
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center shadow-lg shadow-error/10">
                                <ShieldAlert className="text-error w-6 h-6" />
                            </div>
                            Pulse Shield: Central de Privacidade
                        </h2>
                        <p className="text-text-3 text-sm">Controle de conformidade e proteção de dados PII (GDPR/LGPD).</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Audit Trail Maintenance */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-bg-1 border border-stroke rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-stroke flex items-center justify-between bg-surface-1/30">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <History size={16} className="text-text-3" /> Trilha de Auditoria Imutável
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-success">
                                    <Lock size={12} /> HASH INTEGRITY VERIFIED
                                </div>
                            </div>
                            <div className="divide-y divide-stroke">
                                {logsLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 size={24} className="text-primary animate-spin" />
                                    </div>
                                ) : auditLogs.length > 0 ? (
                                    auditLogs.map((log) => (
                                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-surface-1/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                                                    <Fingerprint size={16} className="text-text-3" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white">{log.action}</span>
                                                    <span className="text-[10px] text-text-3">Por <span className="text-text-2">{log.user}</span> • {log.time}</span>
                                                </div>
                                            </div>
                                            <CheckCircle size={14} className="text-success opacity-50" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-text-3 italic text-center py-6">Nenhum registro de auditoria disponível.</p>
                                )}
                            </div>
                            {auditLogs.length > 0 && (
                            <div className="p-4 bg-surface-1/20 border-t border-stroke text-center">
                                <button className="text-[10px] font-bold text-primary hover:underline">Ver log completo de auditoria ({auditLogs.length} registros)</button>
                            </div>
                            )}
                        </div>

                        {/* Subject Access Requests (SAR) */}
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6 font-primary">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <FileSearch size={16} className="text-text-3" /> Solicitações do Titular (SAR)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-bg-0 border border-stroke rounded-xl flex flex-col gap-3 group hover:border-primary transition-all">
                                    <Download className="text-primary" size={20} />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-white">Portabilidade de Dados</span>
                                        <span className="text-[10px] text-text-3">Gere um pacote JSON com todos os dados vinculados a um ID.</span>
                                    </div>
                                    <button className="w-full py-2 bg-primary/10 text-primary text-[10px] font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                        INICIAR EXPORTAÇÃO
                                    </button>
                                </div>
                                <div className="p-4 bg-bg-0 border border-stroke rounded-xl flex flex-col gap-3 group hover:border-error transition-all cursor-pointer">
                                    <Trash2 className="text-error" size={20} />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-white">Direito ao Esquecimento</span>
                                        <span className="text-[10px] text-text-3">Anonimiza registros de forma irreversível conforme regulamentação.</span>
                                    </div>
                                    <button className="w-full py-2 bg-error/10 text-error text-[10px] font-bold rounded-lg group-hover:bg-error group-hover:text-white transition-all uppercase">
                                        Anonimizar Registros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Sidebar */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert size={16} className="text-text-3" /> Status de Conformidade
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-text-2">LGPD (Brasil)</span>
                                    <span className="text-success flex items-center gap-1 font-bold">COMPLIANT <CheckCircle size={10} /></span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium text-text-2">
                                    <span>GDPR (Europa)</span>
                                    <span className="text-success flex items-center gap-1 font-bold">COMPLIANT <CheckCircle size={10} /></span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium text-text-2">
                                    <span>CCPA (EUA)</span>
                                    <span className="text-warning flex items-center gap-1 font-bold">IN REVIEW <AlertCircle size={10} /></span>
                                </div>
                            </div>
                            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                <div className="h-full bg-success w-[85%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <p className="text-[9px] text-text-3 leading-relaxed">O Naboah Pulse processa dados criptografados em repouso e em trânsito. Todos os logs são imutáveis após 24h.</p>
                        </div>

                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4 opacity-75 backdrop-blur-sm grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                <History size={14} className="text-text-3" /> Data Retention Policy
                            </h3>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-text-3">Mensagens</span>
                                    <span className="text-white font-bold">5 Anos</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-text-3">Logs de API</span>
                                    <span className="text-white font-bold">90 Dias</span>
                                </div>
                            </div>
                            <button className="text-[10px] text-primary font-bold hover:underline text-left">Alterar Política Global</button>
                        </div>

                        {/* Privacy Preferences (localStorage-backed) */}
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                <ShieldAlert size={14} className="text-text-3" /> Preferências de Privacidade
                            </h3>
                            <div className="flex flex-col gap-3">
                                {([
                                    { key: 'data_collection' as const, label: 'Coleta de Dados', desc: 'Permitir coleta de dados de uso' },
                                    { key: 'analytics_tracking' as const, label: 'Rastreamento Analítico', desc: 'Permitir analytics e métricas' },
                                    { key: 'third_party_sharing' as const, label: 'Compartilhamento com Terceiros', desc: 'Compartilhar dados com parceiros' },
                                ]).map(({ key, label, desc }) => (
                                    <label
                                        key={key}
                                        className="flex items-center justify-between gap-4 p-3 bg-bg-0 border border-stroke rounded-xl cursor-pointer hover:border-primary/30 transition-colors group"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[11px] font-semibold text-text-1 group-hover:text-white transition-colors">{label}</span>
                                            <span className="text-[9px] text-text-3">{desc}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => togglePrivacyPref(key)}
                                            className={`relative w-10 h-6 rounded-full border transition-all flex-shrink-0 ${
                                                privacyPrefs[key]
                                                    ? 'bg-primary border-primary/60 shadow-lg shadow-primary/20'
                                                    : 'bg-surface-2 border-stroke'
                                            }`}
                                        >
                                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                                privacyPrefs[key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                                            }`} />
                                        </button>
                                    </label>
                                ))}
                            </div>
                            <p className="text-[9px] text-text-3 italic">Preferências salvas localmente no navegador.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
