'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Plus,
  Users,
  RefreshCw,
  Crown,
  Heart,
  AlertTriangle,
  X,
  UserX,
  BarChart3,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Segment {
  id: string;
  name: string;
  rules_json: Record<string, unknown>;
  is_dynamic: boolean;
  contact_count: number;
  last_computed_at: string | null;
}

interface RfmSegmentData {
  count: number;
  avg_monetary: number;
}

interface RfmSummary {
  total_contacts: number;
  segments: {
    champion: RfmSegmentData;
    loyal: RfmSegmentData;
    at_risk: RfmSegmentData;
    lost: RfmSegmentData;
  };
}

interface RecomputeResult {
  segment_id: string;
  contact_count: number;
  sample: { id: string; name: string; email: string }[];
}

const RFM_CONFIG: {
  key: keyof RfmSummary['segments'];
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    key: 'champion',
    label: 'Champions',
    icon: Crown,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/25',
  },
  {
    key: 'loyal',
    label: 'Loyal',
    icon: Heart,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/25',
  },
  {
    key: 'at_risk',
    label: 'At Risk',
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/25',
  },
  {
    key: 'lost',
    label: 'Lost',
    icon: UserX,
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/25',
  },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rfm, setRfm] = useState<RfmSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [rfmLoading, setRfmLoading] = useState(true);

  /* create form */
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', rules_json: '{}', is_dynamic: true });
  const [creating, setCreating] = useState(false);

  /* recompute */
  const [recomputing, setRecomputing] = useState<string | null>(null);
  const [sampleResult, setSampleResult] = useState<RecomputeResult | null>(null);

  const fetchSegments = useCallback(async () => {
    try {
      const data = await apiGet<Segment[]>('/crm/segments');
      setSegments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRfm = useCallback(async () => {
    try {
      const data = await apiGet<RfmSummary>('/crm/rfm/summary');
      setRfm(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRfmLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
    fetchRfm();
  }, [fetchSegments, fetchRfm]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(form.rules_json);
      } catch {
        /* keep empty */
      }
      await apiPost('/crm/segments', {
        name: form.name,
        rules_json: parsed,
        is_dynamic: form.is_dynamic,
      });
      setShowCreate(false);
      setForm({ name: '', rules_json: '{}', is_dynamic: true });
      fetchSegments();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleRecompute = async (segmentId: string) => {
    setRecomputing(segmentId);
    try {
      const result = await apiPost<RecomputeResult>(
        `/crm/segments/${segmentId}/recompute`,
        {}
      );
      setSampleResult(result);
      fetchSegments();
    } catch (e) {
      console.error(e);
    } finally {
      setRecomputing(null);
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
            <Users size={24} className="text-primary" />
            Segments &amp; RFM
          </h1>
          <p className="text-text-3 text-sm mt-1">
            Audience segments and RFM analysis for targeted engagement.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="jarvis-gradient px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Segment
        </button>
      </div>

      {/* ------------------------------------------------------------ */}
      /*  RFM Summary                                                   */
      /* ------------------------------------------------------------ */}
      <div>
        <h2 className="text-sm font-semibold text-text-2 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 size={15} className="text-primary" />
          RFM Analysis
        </h2>

        {rfmLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-primary" />
          </div>
        ) : rfm ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RFM_CONFIG.map(({ key, label, icon: Icon, color, bg, border }) => {
              const seg = rfm.segments[key];
              return (
                <div
                  key={key}
                  className={`${bg} border ${border} rounded-2xl p-5 space-y-3`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={color} />
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{seg.count}</p>
                    <p className="text-text-3 text-xs">contacts</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-1">
                      ${seg.avg_monetary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-text-3 text-xs">avg monetary value</p>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="sm:col-span-2 lg:col-span-4 bg-bg-1 border border-stroke rounded-2xl p-4 flex items-center justify-between">
              <span className="text-text-3 text-sm">Total contacts analysed</span>
              <span className="text-white text-lg font-bold">
                {rfm.total_contacts.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-text-3 text-sm">No RFM data available yet.</p>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Segments list                                                 */
      /* ------------------------------------------------------------ */}
      <div>
        <h2 className="text-sm font-semibold text-text-2 uppercase tracking-wider mb-3">
          Segments
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : segments.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="mx-auto text-text-3 mb-3" />
            <p className="text-text-3 text-sm">No segments created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {segments.map((seg) => (
              <div
                key={seg.id}
                className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold">{seg.name}</p>
                    <p className="text-text-3 text-xs mt-0.5">
                      {seg.is_dynamic ? 'Dynamic' : 'Static'} &middot; #{seg.id.slice(0, 8)}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {seg.contact_count.toLocaleString()}
                  </span>
                </div>

                {seg.last_computed_at && (
                  <p className="text-text-3 text-[11px]">
                    Last computed:{' '}
                    {new Date(seg.last_computed_at).toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => handleRecompute(seg.id)}
                  disabled={recomputing === seg.id}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-text-2 hover:text-white hover:border-primary/40 transition-colors disabled:opacity-50"
                >
                  {recomputing === seg.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Recompute
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Sample contacts result                                        */
      /* ------------------------------------------------------------ */}
      {sampleResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-1 border border-stroke rounded-2xl w-full max-w-md p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recompute Result</h2>
              <button
                onClick={() => setSampleResult(null)}
                className="text-text-3 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-text-2 text-sm">
              <span className="text-white font-semibold">
                {sampleResult.contact_count}
              </span>{' '}
              contacts matched.
            </p>

            {sampleResult.sample.length > 0 && (
              <div className="space-y-2">
                <p className="text-text-3 text-xs font-medium uppercase tracking-wider">
                  Sample contacts
                </p>
                {sampleResult.sample.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 bg-surface-1 rounded-xl px-3 py-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                      {c.name?.charAt(0) ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.name}</p>
                      <p className="text-text-3 text-xs truncate">{c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSampleResult(null)}
                className="px-4 py-2 rounded-xl text-sm text-text-3 hover:text-white border border-stroke hover:border-text-3 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      /*  Create segment modal                                          */
      /* ------------------------------------------------------------ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-1 border border-stroke rounded-2xl w-full max-w-lg p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create Segment</h2>
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
                  Segment Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50"
                  placeholder="e.g. High-value customers"
                />
              </div>

              <div>
                <label className="text-text-3 text-xs font-medium mb-1 block">
                  Rules (JSON)
                </label>
                <textarea
                  value={form.rules_json}
                  onChange={(e) => setForm({ ...form, rules_json: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white font-mono placeholder:text-text-3 outline-none focus:border-primary/50 resize-none"
                  placeholder='{"min_orders": 5}'
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_dynamic}
                  onChange={(e) => setForm({ ...form, is_dynamic: e.target.checked })}
                  className="w-4 h-4 rounded border-stroke bg-surface-1 accent-primary"
                />
                <span className="text-text-2 text-sm">Dynamic segment (auto-update)</span>
              </label>
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
                Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
