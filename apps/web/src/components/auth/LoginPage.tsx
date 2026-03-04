"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
            } else if (data.session) {
                // Auto-confirmed — session created, app will redirect
            } else {
                // Email confirmation required — auto-login
                const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
                if (loginErr) {
                    setSuccess('Conta criada! Verifica o teu email para confirmar.');
                }
            }
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-bg-0 flex items-center justify-center z-50 overflow-hidden">

            {/* Single ambient glow — centered, subtle */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 700px 500px at 50% 40%, rgba(123,97,255,0.07) 0%, transparent 70%)',
                }}
            />

            <div className="relative w-full max-w-[360px] mx-6 flex flex-col gap-8">

                {/* Logo mark */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl jarvis-gradient flex items-center justify-center shadow-glow-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity="0.1"/>
                            <path d="M12 6l-4 2.5v5L12 16l4-2.5v-5L12 6z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity="0.25"/>
                            <circle cx="12" cy="11" r="2" fill="white" fillOpacity="0.9"/>
                        </svg>
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-text-1 tracking-tight">Naboah Pulse</h2>
                        <p className="text-[10px] text-text-3/60 mt-1 tracking-widest uppercase">Omnichannel Command Center</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-7 shadow-2xl shadow-black/60">
                    <div className="mb-6">
                        <h1 className="text-base font-semibold text-text-1 tracking-tight">
                            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
                        </h1>
                        <p className="text-xs text-text-3 mt-1">
                            {mode === 'login'
                                ? 'Entra na tua conta para continuar'
                                : 'Junta-te ao Naboah Pulse'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-text-3 tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="nome@empresa.com"
                                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-text-3 tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-11 text-sm text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-critical/8 border border-critical/15 rounded-xl px-3.5 py-2.5 text-xs text-critical/90">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-success/8 border border-success/15 rounded-xl px-3.5 py-2.5 text-xs text-success/90">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 w-full py-2.5 jarvis-gradient disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold tracking-tight transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {mode === 'login' ? 'Entrar' : 'Criar conta'}
                        </button>
                    </form>

                    <div className="mt-5 pt-5 border-t border-white/[0.05] text-center">
                        <button
                            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                            className="text-xs text-text-3 hover:text-text-1 transition-colors"
                        >
                            {mode === 'login' ? 'Não tens conta? Criar agora →' : '← Já tens conta? Entrar'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-text-3/30 tracking-wider">
                    Powered by <span className="text-text-3/50">Naboah Tech</span>
                </p>
            </div>
        </div>
    );
}
