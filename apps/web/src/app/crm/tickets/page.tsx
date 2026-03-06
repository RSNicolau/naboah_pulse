'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Plus,
  Ticket,
  Clock,
  AlertTriangle,
  ChevronDown,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface TicketItem {
  id: string;
  contact_id: string;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: string;
  summary: string;
  details: string;
  sla_due_at: string | null;
  created_at: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-error/15 text-error border border-error/30',
  high: 'bg-warning/15 text-warning border border-warning/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  low: 'bg-text-3/15 text-text-3 border border-text-3/30',
};

const STATUS_OPTIONS = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];

/* ------------------------------------------------------------------ */
/*  SLA countdown helper                                              */
/* ------------------------------------------------------------------ */
function useSlaCountdown(slaDueAt: string | null) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!slaDueAt) {
      setRemaining('--');
      return;
    }
    const tick = () => {
      const diff = new Date(slaDueAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Overdue');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [slaDueAt]);

  return remaining;
}

/* ------------------------------------------------------------------ */
/*  SLA cell component (needs its own hook call)                      */
/* ------------------------------------------------------------------ */
function SlaCell({ slaDueAt }: { slaDueAt: string | null }) {
  const remaining = useSlaCountdown(slaDueAt);
  const isOverdue = remaining === 'Overdue';
  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-mono ${
        isOverdue ? 'text-error' : 'text-text-2'
      }`}
    >
      <Clock size={13} />
      {remaining}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status dropdown                                                    */
/* ------------------------------------------------------------------ */
function StatusDropdown({
  ticketId,
  current,
  onChanged,
}: {
  ticketId: string;
  current: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = async (status: string) => {
    setLoading(true);
    try {
      await apiPost(`/crm/tickets/${ticketId}/status?status=${status}`, {});
      onChanged();
    } catch (e) {
      toast.error('Erro na operação de tickets');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-surface-1 border border-stroke text-text-2 hover:text-white transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : null}
        {current}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-bg-1 border border-stroke rounded-xl shadow-card overflow-hidden min-w-[140px]">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => change(s)}
              className={`block w-full text-left px-3 py-2 text-xs hover:bg-surface-1 transition-colors ${
                s === current ? 'text-primary font-semibold' : 'text-text-2'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  /* form */
  const [form, setForm] = useState({
    summary: '',
    category: 'general',
    priority: 'medium' as TicketItem['priority'],
    details: '',
  });
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await apiGet<TicketItem[]>('/crm/tickets');
      setTickets(data);
    } catch (e) {
      toast.error('Erro na operação de tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiPost('/crm/tickets', form);
      setShowCreate(false);
      setForm({ summary: '', category: 'general', priority: 'medium', details: '' });
      fetchTickets();
    } catch (e) {
      toast.error('Erro na operação de tickets');
    } finally {
      setCreating(false);
    }
  };

  /* filtering */
  const filtered = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search && !t.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6 bg-bg-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket size={24} className="text-primary" />
            Support Tickets
          </h1>
          <p className="text-text-3 text-sm mt-1">
            Manage customer tickets, track SLAs, and resolve issues.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="jarvis-gradient px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-text-3" />
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-surface-1 text-text-3 border border-stroke hover:text-text-2'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <AlertTriangle size={32} className="mx-auto text-text-3 mb-3" />
          <p className="text-text-3 text-sm">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-bg-1 border border-stroke rounded-2xl p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              {/* Priority badge */}
              <span
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${
                  PRIORITY_STYLES[t.priority] ?? PRIORITY_STYLES.low
                }`}
              >
                {t.priority}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{t.summary}</p>
                <p className="text-text-3 text-xs mt-0.5 truncate">
                  {t.category} &middot; #{t.id.slice(0, 8)}
                </p>
              </div>

              {/* SLA */}
              <SlaCell slaDueAt={t.sla_due_at} />

              {/* Status dropdown */}
              <StatusDropdown
                ticketId={t.id}
                current={t.status}
                onChanged={fetchTickets}
              />
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      /*  Create modal                                                  */
      /* ------------------------------------------------------------ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-1 border border-stroke rounded-2xl w-full max-w-lg p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create Ticket</h2>
              <button onClick={() => setShowCreate(false)} className="text-text-3 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-text-3 text-xs font-medium mb-1 block">Summary</label>
                <input
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-3 text-xs font-medium mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white outline-none focus:border-primary/50 appearance-none"
                  >
                    {['general', 'billing', 'technical', 'shipping', 'returns', 'other'].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-text-3 text-xs font-medium mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as TicketItem['priority'] })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white outline-none focus:border-primary/50 appearance-none"
                  >
                    {['urgent', 'high', 'medium', 'low'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-3 text-xs font-medium mb-1 block">Details</label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50 resize-none"
                  placeholder="Detailed description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl text-sm text-text-3 hover:text-white border border-stroke hover:border-text-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.summary}
                className="jarvis-gradient px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
