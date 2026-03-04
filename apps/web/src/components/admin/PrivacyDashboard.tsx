"use client";
import React, { useState } from 'react';
import { ShieldAlert, Fingerprint, FileSearch, Trash2, Download, CheckCircle, AlertCircle, History, Lock } from 'lucide-react';

export default function PrivacyDashboard() {
    const [auditLogs] = useState([
        { id: '1', action: 'Delete Contact', user: 'Admin', time: '10 min atrás', status: 'VERIFIED' },
        { id: '2', action: 'Export Reports', user: 'Finance', time: '1h atrás', status: 'VERIFIED' },
        { id: '3', action: 'Change Permission', user: 'Security Bot', time: '5h atrás', status: 'VERIFIED' },
    ]);

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
                                {auditLogs.map((log) => (
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
                                ))}
                            </div>
                            <div className="p-4 bg-surface-1/20 border-t border-stroke text-center">
                                <button className="text-[10px] font-bold text-primary hover:underline">Ver log completo de auditoria (3.421 registros)</button>
                            </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
