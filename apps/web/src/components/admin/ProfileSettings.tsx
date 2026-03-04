"use client";

import React, { useEffect, useState } from 'react';
import {
    UserCircle, Mail, Lock, Bell, Check, Loader2, Save, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { toast } from '@/lib/toast';

// ---------------------------------------------------------------------------
// Notification preferences — stored in localStorage
// ---------------------------------------------------------------------------
const PREF_KEY = 'nb_notif_prefs';

type NotifPrefs = {
    message:      boolean;
    ticket:       boolean;
    deal:         boolean;
    conversation: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
    message: true, ticket: true, deal: true, conversation: true,
};

function loadPrefs(): NotifPrefs {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}') }; }
    catch { return DEFAULT_PREFS; }
}

function savePrefs(prefs: NotifPrefs) {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProfileSettings() {
    const { user } = useAuth();

    // Profile state
    const [displayName, setDisplayName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]         = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPass, setShowNewPass]         = useState(false);
    const [savingPassword, setSavingPassword]   = useState(false);

    // Notification prefs
    const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setDisplayName(user.user_metadata.full_name as string);
        }
        setPrefs(loadPrefs());
    }, [user]);

    // ---- Profile save ----
    async function handleSaveProfile() {
        if (!displayName.trim()) return;
        setSavingProfile(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: displayName.trim() },
            });
            if (error) throw error;
            toast.success('Perfil atualizado');
        } catch (e: unknown) {
            toast.error((e as Error).message ?? 'Erro ao atualizar perfil');
        } finally {
            setSavingProfile(false);
        }
    }

    // ---- Password save ----
    async function handleSavePassword() {
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error('As passwords não coincidem');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('A password deve ter pelo menos 6 caracteres');
            return;
        }
        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success('Password alterada com sucesso');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: unknown) {
            toast.error((e as Error).message ?? 'Erro ao alterar password');
        } finally {
            setSavingPassword(false);
        }
    }

    // ---- Notif prefs toggle ----
    function togglePref(key: keyof NotifPrefs) {
        const next = { ...prefs, [key]: !prefs[key] };
        setPrefs(next);
        savePrefs(next);
        toast.success('Preferências guardadas');
    }

    const NOTIF_OPTIONS: { key: keyof NotifPrefs; label: string; desc: string }[] = [
        { key: 'message',      label: 'Novas mensagens',    desc: 'Notificações para mensagens inbound' },
        { key: 'ticket',       label: 'Novos tickets',      desc: 'Tickets criados no Helpdesk' },
        { key: 'deal',         label: 'Novos deals',        desc: 'Deals adicionados ao CRM' },
        { key: 'conversation', label: 'Novas conversas',    desc: 'Conversas iniciadas em qualquer canal' },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                        <UserCircle className="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Perfil & Conta</h2>
                        <p className="text-text-3 text-sm">Gerencie os seus dados de acesso e preferências.</p>
                    </div>
                </div>

                {/* Account info */}
                <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                        <UserCircle size={15} className="text-text-3" /> Informação da conta
                    </h3>

                    {/* Email — read only */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-3 uppercase tracking-widest flex items-center gap-1.5">
                            <Mail size={11} /> Email
                        </label>
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-1/40 border border-stroke/50 rounded-xl">
                            <span className="text-sm text-text-2">{user?.email ?? '—'}</span>
                            <span className="ml-auto text-[9px] font-bold text-text-3 bg-surface-2 px-2 py-0.5 rounded-full border border-stroke uppercase">Verificado</span>
                        </div>
                    </div>

                    {/* Display name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-3 uppercase tracking-widest">Nome de exibição</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="O seu nome..."
                            className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 outline-none transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile || !displayName.trim()}
                        className="self-start jarvis-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                        {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Guardar perfil
                    </button>
                </div>

                {/* Password change */}
                <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                        <Lock size={15} className="text-text-3" /> Alterar password
                    </h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-3 uppercase tracking-widest">Nova password</label>
                            <div className="relative">
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:border-primary/50 outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-white transition-colors"
                                >
                                    {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-3 uppercase tracking-widest">Confirmar password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repetir nova password"
                                className={`bg-surface-1 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                                    confirmPassword && confirmPassword !== newPassword
                                        ? 'border-critical/50 focus:border-critical'
                                        : confirmPassword && confirmPassword === newPassword
                                        ? 'border-success/50'
                                        : 'border-stroke focus:border-primary/50'
                                }`}
                            />
                            {confirmPassword && confirmPassword !== newPassword && (
                                <p className="text-[10px] text-critical">As passwords não coincidem</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSavePassword}
                        disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
                        className="self-start px-5 py-2.5 rounded-xl text-sm font-bold bg-bg-0 border border-stroke text-text-1 flex items-center gap-2 hover:border-primary/40 hover:text-white transition-all disabled:opacity-50"
                    >
                        {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Atualizar password
                    </button>
                </div>

                {/* Notification preferences */}
                <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                        <Bell size={15} className="text-text-3" /> Preferências de notificações
                    </h3>

                    <div className="flex flex-col gap-3">
                        {NOTIF_OPTIONS.map(({ key, label, desc }) => (
                            <label
                                key={key}
                                className="flex items-center justify-between gap-4 p-4 bg-bg-0 border border-stroke rounded-xl cursor-pointer hover:border-primary/30 transition-colors group"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-text-1 group-hover:text-white transition-colors">{label}</span>
                                    <span className="text-[11px] text-text-3">{desc}</span>
                                </div>
                                {/* Toggle switch */}
                                <button
                                    type="button"
                                    onClick={() => togglePref(key)}
                                    className={`relative w-10 h-6 rounded-full border transition-all flex-shrink-0 ${
                                        prefs[key]
                                            ? 'bg-primary border-primary/60 shadow-lg shadow-primary/20'
                                            : 'bg-surface-2 border-stroke'
                                    }`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                        prefs[key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </label>
                        ))}
                    </div>

                    <p className="text-[10px] text-text-3 italic">
                        As preferências são guardadas localmente e aplicadas ao painel de notificações.
                    </p>
                </div>

            </div>
        </div>
    );
}
