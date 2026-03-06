'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Plus,
  Megaphone,
  Play,
  Pause,
  Send,
  Eye,
  MousePointerClick,
  MessageSquare,
  X,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Campaign {
  id: string;
  name: string;
  type: string;
  channel: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, { label: string; class: string }> = {
  draft: {
    label: 'Draft',
    class: 'bg-text-3/15 text-text-3 border border-text-3/30',
  },
  active: {
    label: 'Active',
    class: 'bg-success/15 text-success border border-success/30',
  },
  paused: {
    label: 'Paused',
    class: 'bg-warning/15 text-warning border border-warning/30',
  },
  completed: {
    label: 'Completed',
    class: 'bg-primary/15 text-primary border border-primary/30',
  },
};

const CAMPAIGN_TYPES = ['promotional', 'transactional', 'nurture', 're-engagement', 'announcement'];
const CHANNELS = ['email', 'sms', 'whatsapp', 'push', 'in_app'];

/* ------------------------------------------------------------------ */
/*  Metric pill                                                        */
/* ------------------------------------------------------------------ */
function MetricPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={13} className={color} />
      <span className="text-text-3 text-[11px]">{label}</span>
      <span className="text-text-1 text-xs font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* create form */
  const [form, setForm] = useState({
    name: '',
    type: 'promotional',
    channel: 'email',
    segment_id: '',
  });
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await apiGet<Campaign[]>('/crm/campaigns');
      setCampaigns(data);
    } catch (e) {
      toast.error('Erro na operação de campanhas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiPost('/crm/campaigns', {
        name: form.name,
        type: form.type,
        channel: form.channel,
        segment_id: form.segment_id || undefined,
      });
      setShowCreate(false);
      setForm({ name: '', type: 'promotional', channel: 'email', segment_id: '' });
      fetchCampaigns();
    } catch (e) {
      toast.error('Erro na operação de campanhas');
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      await apiPost(`/crm/campaigns/${id}/activate`, {});
      fetchCampaigns();
    } catch (e) {
      toast.error('Erro na operação de campanhas');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      await apiPost(`/crm/campaigns/${id}/pause`, {});
      fetchCampaigns();
    } catch (e) {
      toast.error('Erro na operação de campanhas');
    } finally {
      setActionLoading(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6 bg-bg-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone size={24} className="text-primary" />
            Campaigns
          </h1>
          <p className="text-text-3 text-sm mt-1">
            Create, manage, and monitor multi-channel marketing campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="jarvis-gradient px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Campaign cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20">
          <Megaphone size={32} className="mx-auto text-text-3 mb-3" />
          <p className="text-text-3 text-sm">No campaigns yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const style = STATUS_STYLES[c.status] ?? STATUS_STYLES.draft;
            const isActionLoading = actionLoading === c.id;

            return (
              <div
                key={c.id}
                className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4 hover:shadow-card-hover transition-shadow flex flex-col"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate">{c.name}</p>
                    <p className="text-text-3 text-xs mt-0.5">
                      {c.type} &middot; {c.channel}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-3 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${style.class}`}
                  >
                    {style.label}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <MetricPill icon={Send} label="Sent" value={c.sent_count} color="text-text-2" />
                  <MetricPill icon={Eye} label="Opened" value={c.opened_count} color="text-primary" />
                  <MetricPill
                    icon={MousePointerClick}
                    label="Clicked"
                    value={c.clicked_count}
                    color="text-success"
                  />
                  <MetricPill
                    icon={MessageSquare}
                    label="Replied"
                    value={c.replied_count}
                    color="text-warning"
                  />
                </div>

                {/* Open / click rates */}
                {c.sent_count > 0 && (
                  <div className="flex gap-4 text-[11px] text-text-3">
                    <span>
                      Open rate:{' '}
                      <span className="text-text-1 font-semibold">
                        {((c.opened_count / c.sent_count) * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span>
                      CTR:{' '}
                      <span className="text-text-1 font-semibold">
                        {((c.clicked_count / c.sent_count) * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                )}

                {/* Date */}
                <p className="text-text-3 text-[11px]">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2">
                  {(c.status === 'draft' || c.status === 'paused') && (
                    <button
                      onClick={() => handleActivate(c.id)}
                      disabled={isActionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold hover:bg-success/20 transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Play size={13} />
                      )}
                      Activate
                    </button>
                  )}
                  {c.status === 'active' && (
                    <button
                      onClick={() => handlePause(c.id)}
                      disabled={isActionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs font-semibold hover:bg-warning/20 transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Pause size={13} />
                      )}
                      Pause
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      /*  Create campaign modal                                         */
      /* ------------------------------------------------------------ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-1 border border-stroke rounded-2xl w-full max-w-lg p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create Campaign</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-text-3 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-text-3 text-xs font-medium mb-1 block">
                  Campaign Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50"
                  placeholder="e.g. Summer Sale 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-3 text-xs font-medium mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white outline-none focus:border-primary/50 appearance-none"
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-3 text-xs font-medium mb-1 block">Channel</label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white outline-none focus:border-primary/50 appearance-none"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-3 text-xs font-medium mb-1 block">
                  Segment ID <span className="text-text-3/60">(optional)</span>
                </label>
                <input
                  value={form.segment_id}
                  onChange={(e) => setForm({ ...form, segment_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50"
                  placeholder="Paste a segment UUID"
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
                disabled={creating || !form.name}
                className="jarvis-gradient px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
