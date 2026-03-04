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
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
            } else {
                setSuccess('Conta criada! Verifica o teu email para confirmar.');
            }
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#05060A] flex items-center justify-center z-50 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7B61FF]/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#7B61FF]/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative w-full max-w-sm mx-4">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#5B41DF] flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
                        <div className="w-5 h-5 bg-white rounded-full opacity-30 blur-[2px]" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-white">Naboah Pulse</span>
                </div>

                {/* Card */}
                <div className="bg-[#0C0D12] border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-xl font-black text-white uppercase tracking-widest mb-1">
                        {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </h1>
                    <p className="text-xs text-[#6B7280] mb-8">
                        {mode === 'login' ? 'Bem-vindo de volta ao Jarvis ChannelHub' : 'Junta-te ao Jarvis ChannelHub'}
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="nome@empresa.com"
                                className="bg-[#0F1018] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#374151] focus:outline-none focus:border-[#7B61FF]/50 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#0F1018] border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-[#374151] focus:outline-none focus:border-[#7B61FF]/50 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-xs text-green-400">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3.5 bg-[#7B61FF] hover:bg-[#6A51EE] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#7B61FF]/20"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                            className="text-[10px] text-[#6B7280] hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {mode === 'login' ? 'Não tens conta? Criar agora' : 'Já tens conta? Entrar'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-[#374151] mt-6 uppercase tracking-widest">
                    Jarvis ChannelHub · Omnichannel Command Center
                </p>
            </div>
        </div>
    );
}
