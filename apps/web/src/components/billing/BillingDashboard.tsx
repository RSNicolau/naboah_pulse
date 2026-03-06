"use client";

import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Zap, AlertTriangle, ArrowUpRight, History, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

type Plan = {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
    features_json: { agents?: number; messages?: number; ai_credits?: number };
    max_agents: number;
    max_messages_monthly: number;
    is_active: boolean;
};

type Quota = {
    id: string;
    tenant_id: string;
    plan_id: string;
    current_period_start: string;
    current_period_end: string;
    messages_sent: number;
    ai_credits_remaining: number;
    status: string;
};

type Transaction = {
    id: string;
    amount: number;
    type: string;
    description: string;
    created_at: string;
};

type BillingStatus = {
    quota: Quota;
    plan: Plan;
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function planFeatures(plan: Plan): string[] {
    const feats: string[] = [];
    if (plan.max_agents === 999) feats.push('Agentes ilimitados');
    else feats.push(`${plan.max_agents} Agentes`);
    if (plan.max_messages_monthly === 999999) feats.push('Mensagens ilimitadas');
    else feats.push(`${plan.max_messages_monthly.toLocaleString('pt-BR')} Mensagens/mês`);
    const credits = plan.features_json?.ai_credits;
    if (credits === -1) feats.push('Créditos IA ilimitados');
    else if (credits) feats.push(`${credits} Créditos IA`);
    return feats;
}

export default function BillingDashboard() {
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGet<BillingStatus>('/billing/status'),
            apiGet<Plan[]>('/billing/plans'),
            apiGet<Transaction[]>('/billing/transactions'),
        ]).then(([s, p, t]) => {
            setStatus(s);
            setPlans(p);
            setTransactions(t);
        }).catch(() => toast.error('Erro ao carregar billing')).finally(() => setLoading(false));
    }, []);

    const quota = status?.quota;
    const currentPlan = status?.plan;
    const maxMessages = currentPlan?.max_messages_monthly ?? 50000;
    const messagesPct = quota ? Math.round((quota.messages_sent / maxMessages) * 100) : 0;
    const maxCredits = currentPlan?.features_json?.ai_credits ?? 1000;
    const creditsPct = maxCredits === -1 ? 0 : Math.round(((maxCredits - (quota?.ai_credits_remaining ?? 0)) / maxCredits) * 100);
    const lowCredits = (quota?.ai_credits_remaining ?? 999) < 200;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shadow-lg shadow-warning/10">
                            <CreditCard className="text-warning w-6 h-6" />
                        </div>
                        Billing & Subscription
                    </h2>
                    <p className="text-text-3 text-sm">Gerencie o seu plano, quotas e uso de créditos.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* Usage Quotas */}
                            <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Uso do Período Atual</h3>
                                    {quota && (
                                        <span className="text-[10px] text-text-3 font-bold uppercase">
                                            Renova em {formatDate(quota.current_period_end)}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-text-2 font-bold">Mensagens Enviadas</span>
                                            <span className="text-xs text-white font-bold">
                                                {quota?.messages_sent.toLocaleString('pt-BR')} / {maxMessages.toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${messagesPct > 80 ? 'bg-warning' : 'bg-primary'}`}
                                                style={{ width: `${messagesPct}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-text-3">{messagesPct}% utilizado</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-text-2 font-bold">Créditos IA Restantes</span>
                                            <span className="text-xs text-white font-bold">
                                                {quota?.ai_credits_remaining} / {maxCredits === -1 ? '∞' : maxCredits}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${lowCredits ? 'bg-warning' : 'bg-ai'}`}
                                                style={{ width: maxCredits === -1 ? '10%' : `${100 - creditsPct}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-text-3">
                                            {maxCredits === -1 ? 'Ilimitado' : `${100 - creditsPct}% restante`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Plans */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {plans.map((plan) => {
                                    const isCurrent = currentPlan?.id === plan.id;
                                    return (
                                        <div
                                            key={plan.id}
                                            className={`bg-bg-1 border rounded-2xl p-6 flex flex-col gap-5 relative transition-all ${
                                                isCurrent ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-stroke hover:border-text-3'
                                            }`}
                                        >
                                            {isCurrent && (
                                                <div className="absolute top-4 right-4 bg-primary text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                    Plano Atual
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                                                <div className="flex items-baseline gap-1">
                                                    {plan.price_monthly > 0 ? (
                                                        <>
                                                            <span className="text-2xl font-bold text-white">
                                                                {formatMoney(plan.price_monthly)}
                                                            </span>
                                                            <span className="text-xs text-text-3">/mês</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-white">Custom</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2.5">
                                                {planFeatures(plan).map((f) => (
                                                    <div key={f} className="flex items-center gap-2">
                                                        <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                                                        <span className="text-[11px] text-text-2">{f}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                disabled={isCurrent}
                                                onClick={() => !isCurrent && toast.info(`Para fazer upgrade para o plano ${plan.name}, entre em contato com o suporte.`)}
                                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-auto ${
                                                    isCurrent
                                                        ? 'bg-surface-2 text-text-3 cursor-not-allowed'
                                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                                }`}
                                            >
                                                {isCurrent ? 'Plano Atual' : 'Fazer Upgrade'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Credits card */}
                            <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-ai/10 border border-ai/20 flex items-center justify-center">
                                        <Zap className="text-ai w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white">Pulse AI Credits</h3>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-bold text-white">{quota?.ai_credits_remaining ?? '—'}</span>
                                    <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Créditos Restantes</span>
                                </div>
                                {lowCredits && (
                                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="text-warning shrink-0 mt-0.5" size={14} />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-warning uppercase">Créditos Baixos</span>
                                            <p className="text-[9px] text-warning/80">Os seus agentes IA podem pausar em breve. Recarregue os créditos.</p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => toast.info('Recarregamento de créditos disponível em breve. Entre em contato com o suporte.')}
                                    className="jarvis-gradient py-3 rounded-xl text-white font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    Recarregar Créditos <ArrowUpRight size={14} />
                                </button>
                            </div>

                            {/* Transactions */}
                            <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-2 border border-stroke flex items-center justify-center">
                                        <History className="text-text-2 w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white">Histórico</h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {transactions.slice(0, 5).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] text-white font-bold truncate">{tx.description}</span>
                                                <span className="text-[9px] text-text-3">{formatDate(tx.created_at)}</span>
                                            </div>
                                            <span className={`text-xs font-bold flex-shrink-0 ${tx.amount < 0 ? 'text-white' : 'text-success'}`}>
                                                {formatMoney(tx.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    {transactions.length === 0 && (
                                        <p className="text-xs text-text-3 text-center py-2">Sem transações</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
