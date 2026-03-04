"use client";
import React, { useState } from 'react';
import { Shield, Smartphone, Globe, LogOut, Key, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SecuritySettings() {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [sessions, setSessions] = useState([
        { id: 'sess_1', device: 'Chrome on macOS', location: 'São Paulo, BR', current: true, date: 'Agora' },
        { id: 'sess_2', device: 'Pulse App on iPhone', location: 'Rio de Janeiro, BR', current: false, date: '2 horas atrás' },
    ]);

    const handleToggleMFA = () => {
        setMfaEnabled(!mfaEnabled);
    };

    const handleRevokeSession = (id: string) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center shadow-lg shadow-success/10">
                                <Shield className="text-success w-6 h-6" />
                            </div>
                            Segurança Enterprise
                        </h2>
                        <p className="text-text-3 text-sm">Gerencie a proteção da sua conta e controles de acesso.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* MFA Section */}
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Smartphone size={16} className="text-text-3" /> Autenticação de Dois Fatores (MFA)
                                </h3>
                                <p className="text-xs text-text-3">Adicione uma camada extra de segurança usando um app autenticador.</p>
                            </div>
                            <button
                                onClick={handleToggleMFA}
                                className={`w-12 h-6 rounded-full transition-all relative ${mfaEnabled ? 'bg-success' : 'bg-surface-2'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${mfaEnabled ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {mfaEnabled && (
                            <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck className="text-success" size={24} />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-white">MFA Ativado</span>
                                    <span className="text-[10px] text-text-3">Sua conta está protegida por verificação secundária.</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sessions Section */}
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Globe size={16} className="text-text-3" /> Sessões Ativas
                        </h3>
                        <div className="flex flex-col gap-3">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between p-4 bg-surface-1/50 border border-stroke rounded-xl group hover:border-text-3/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-3">
                                            {session.device.includes('iPhone') ? <Smartphone size={20} /> : <Globe size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{session.device}</span>
                                                {session.current && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Esta sessão</span>}
                                            </div>
                                            <span className="text-[10px] text-text-3">{session.location} • {session.date}</span>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            className="p-2 text-text-3 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SSO Integration */}
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Key size={16} className="text-text-3" /> Configuração de SSO (SAML/OIDC)
                                </h3>
                                <p className="text-xs text-text-3">Integre com Okta, Azure AD ou Google Workspace.</p>
                            </div>
                            <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">PLAN PRO / ENTERPRISE</div>
                        </div>
                        <div className="p-4 bg-surface-1 border border-dashed border-stroke rounded-xl flex items-center justify-center gap-2 text-text-3 text-xs">
                            <AlertTriangle size={14} /> Fale com seu gerente de conta para ativar o SSO.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
