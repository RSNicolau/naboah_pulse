'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import {
  Loader2,
  Users,
  UserPlus,
  DollarSign,
  Ticket,
  AlertTriangle,
  CheckSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Activity,
  Clock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PipelineStage {
  pipeline: string;
  stage: string;
  color: string;
  count: number;
  value_cents: number;
  order: number;
}

interface DashboardData {
  contacts_total: number;
  new_leads: number;
  customers: number;
  churn_risk: number;
  open_deals: number;
  won_deals: number;
  lost_deals: number;
  pipeline_value_cents: number;
  open_tickets: number;
  sla_at_risk: number;
  pending_tasks: number;
  stages: PipelineStage[];
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  actor_name?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CrmDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [dash, acts] = await Promise.all([
          apiGet<DashboardData>('/crm/dashboard'),
          apiGet<RecentActivity[]>('/crm/activities?limit=5').catch(() => [] as RecentActivity[]),
        ]);
        setData(dash);
        setActivities(acts);
      } catch (err: any) {
        setError(err.message ?? 'Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ----- Loading state ------------------------------------------------ */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-bg-0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-xs font-bold text-text-3 uppercase tracking-widest">
            Carregando CRM...
          </span>
        </div>
      </div>
    );
  }

  /* ----- Error state -------------------------------------------------- */
  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-bg-0">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertTriangle size={32} className="text-error" />
          <p className="text-sm text-white font-bold">{error ?? 'Erro desconhecido'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2 rounded-xl bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/30 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  /* ----- KPI cards ---------------------------------------------------- */
  const kpis = [
    {
      label: 'Total de Contatos',
      value: data.contacts_total.toLocaleString('pt-BR'),
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Novos Leads',
      value: data.new_leads.toLocaleString('pt-BR'),
      icon: UserPlus,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Valor do Pipeline',
      value: formatCurrency(data.pipeline_value_cents),
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Tickets Abertos',
      value: data.open_tickets.toLocaleString('pt-BR'),
      icon: Ticket,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'SLA em Risco',
      value: data.sla_at_risk.toLocaleString('pt-BR'),
      icon: AlertTriangle,
      color: 'text-error',
      bg: 'bg-error/10',
    },
    {
      label: 'Tarefas Pendentes',
      value: data.pending_tasks.toLocaleString('pt-BR'),
      icon: CheckSquare,
      color: 'text-text-3',
      bg: 'bg-white/5',
    },
  ];

  /* ----- Pipeline stages for funnel ---------------------------------- */
  const sortedStages = [...data.stages].sort((a, b) => a.order - b.order);
  const maxCount = Math.max(...sortedStages.map((s) => s.count), 1);

  /* ----- Quick actions ------------------------------------------------ */
  const quickActions = [
    { label: 'Novo Contato', href: '/crm/contacts', icon: UserPlus },
    { label: 'Novo Negócio', href: '/crm/pipeline', icon: TrendingUp },
    { label: 'Novo Ticket', href: '/crm/tickets', icon: Ticket },
  ];

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="px-8 pt-10 pb-6 border-b border-stroke bg-gradient-to-br from-bg-1 to-bg-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">CRM Dashboard</h1>
              <p className="text-sm text-text-3 mt-0.5">
                Visão geral de contatos, pipeline e suporte
              </p>
            </div>
          </div>

          {/* Quick actions in header */}
          <div className="hidden md:flex items-center gap-2">
            {quickActions.map((qa) => (
              <Link
                key={qa.href}
                href={qa.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl jarvis-gradient text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg"
              >
                <qa.icon size={14} />
                {qa.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-24">
        {/* ── KPI Cards Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-bg-1 border border-stroke rounded-2xl p-5 flex flex-col gap-3 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon size={16} />
                </div>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* ── Churn Risk Alert ── */}
        {data.churn_risk > 0 && (
          <div className="bg-error/5 border border-error/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                {data.churn_risk} {data.churn_risk === 1 ? 'contato em' : 'contatos em'} risco de
                churn
              </p>
              <p className="text-xs text-text-3 mt-0.5">
                Esses contatos apresentam sinais de desengajamento. Aja antes que seja tarde.
              </p>
            </div>
            <Link
              href="/crm/contacts"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 text-error text-[10px] font-black uppercase tracking-widest hover:bg-error/20 transition-colors"
            >
              Ver contatos <ArrowRight size={12} />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Pipeline Funnel ── */}
          <div className="lg:col-span-2 bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                  Pipeline de Vendas
                </h2>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">
                <span>
                  <span className="text-success">{data.won_deals}</span> ganhos
                </span>
                <span>
                  <span className="text-error">{data.lost_deals}</span> perdidos
                </span>
                <span>
                  <span className="text-primary">{data.open_deals}</span> abertos
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {sortedStages.map((stage) => {
                const pct = Math.max((stage.count / maxCount) * 100, 6);
                return (
                  <div key={`${stage.pipeline}-${stage.stage}`} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{stage.stage}</span>
                      <span className="text-[10px] font-bold text-text-3">
                        {stage.count} {stage.count === 1 ? 'negócio' : 'negócios'} &middot;{' '}
                        {formatCurrency(stage.value_cents)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedStages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-text-3">
                <TrendingUp size={28} className="mb-2 opacity-30" />
                <span className="text-xs font-bold">Nenhum estágio encontrado</span>
              </div>
            )}
          </div>

          {/* ── Right column: Recent Activity + Mobile Quick Actions ── */}
          <div className="flex flex-col gap-6">
            {/* Recent Activities */}
            <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-secondary rounded-full" />
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                  Atividade Recente
                </h2>
              </div>

              {activities.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Activity size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white leading-relaxed truncate">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={10} className="text-text-3" />
                          <span className="text-[10px] text-text-3">
                            {relativeTime(act.created_at)}
                          </span>
                          {act.actor_name && (
                            <>
                              <span className="text-text-3">&middot;</span>
                              <span className="text-[10px] text-text-3">{act.actor_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-text-3">
                  <Activity size={24} className="mb-2 opacity-30" />
                  <span className="text-xs font-bold">Sem atividades recentes</span>
                </div>
              )}
            </div>

            {/* Mobile Quick Actions (visible on small screens) */}
            <div className="md:hidden bg-bg-1 border border-stroke rounded-2xl p-5 flex flex-col gap-3">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">
                Ações Rápidas
              </h2>
              {quickActions.map((qa) => (
                <Link
                  key={qa.href}
                  href={qa.href}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <qa.icon size={16} className="text-primary" />
                    <span className="text-xs font-bold text-white">{qa.label}</span>
                  </div>
                  <ArrowRight size={14} className="text-text-3" />
                </Link>
              ))}
            </div>

            {/* Deal Stats Mini Card */}
            <div className="bg-gradient-to-br from-primary/10 to-bg-1 border border-primary/20 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <DollarSign size={18} className="text-primary" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">
                  Resumo de Negócios
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl">
                  <span className="text-xl font-black text-primary">{data.open_deals}</span>
                  <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">
                    Abertos
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl">
                  <span className="text-xl font-black text-success">{data.won_deals}</span>
                  <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">
                    Ganhos
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl">
                  <span className="text-xl font-black text-error">{data.lost_deals}</span>
                  <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">
                    Perdidos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
