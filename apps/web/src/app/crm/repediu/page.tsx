'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  ArrowDownUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface RecentEvent {
  id: string;
  type: string;
  status: string;
  received_at: string;
}

interface HealthData {
  status: string;
  last_health_at: string | null;
  events_received: number;
  events_failed: number;
  recent_events: RecentEvent[];
}

interface ReconcileResult {
  orders_count: number;
  events_processed: number;
  divergence: number;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function RepediuPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<ReconcileResult | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await apiGet<HealthData>('/crm/integrations/repediu/health');
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleReconcile = async () => {
    setReconciling(true);
    setReconcileResult(null);
    try {
      const result = await apiPost<ReconcileResult>(
        '/crm/integrations/repediu/reconcile',
        {}
      );
      setReconcileResult(result);
      fetchHealth();
    } catch (e) {
      console.error(e);
    } finally {
      setReconciling(false);
    }
  };

  const isConnected = health?.status === 'connected' || health?.status === 'healthy';

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-0">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6 bg-bg-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity size={24} className="text-primary" />
          Repediu Integration
        </h1>
        <p className="text-text-3 text-sm mt-1">
          Monitor the health of your Repediu connection and reconcile event data.
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Connection status + metrics                                   */
      /* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection status card */}
        <div
          className={`rounded-2xl p-5 border ${
            isConnected
              ? 'bg-success/5 border-success/25'
              : 'bg-error/5 border-error/25'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {isConnected ? (
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <Wifi size={20} className="text-success" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center">
                <WifiOff size={20} className="text-error" />
              </div>
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  isConnected ? 'text-success' : 'text-error'
                }`}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-text-3 text-xs">Connection Status</p>
            </div>
          </div>
          {health?.last_health_at && (
            <p className="text-text-3 text-[11px] flex items-center gap-1">
              <Clock size={11} />
              Last check: {new Date(health.last_health_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Events received */}
        <div className="bg-bg-1 border border-stroke rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {health?.events_received.toLocaleString() ?? 0}
              </p>
              <p className="text-text-3 text-xs">Events Received</p>
            </div>
          </div>
        </div>

        {/* Events failed */}
        <div className="bg-bg-1 border border-stroke rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center">
              <XCircle size={20} className="text-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {health?.events_failed.toLocaleString() ?? 0}
              </p>
              <p className="text-text-3 text-xs">Events Failed</p>
            </div>
          </div>
          {health && health.events_received > 0 && (
            <p className="text-text-3 text-[11px]">
              Failure rate:{' '}
              <span
                className={`font-semibold ${
                  (health.events_failed / health.events_received) * 100 > 5
                    ? 'text-error'
                    : 'text-success'
                }`}
              >
                {((health.events_failed / health.events_received) * 100).toFixed(1)}%
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Reconcile section                                             */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownUp size={16} className="text-primary" />
            <h2 className="text-white font-semibold">Data Reconciliation</h2>
          </div>
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="jarvis-gradient px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {reconciling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Reconcile Now
          </button>
        </div>

        {reconcileResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-surface-1 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">
                {reconcileResult.orders_count.toLocaleString()}
              </p>
              <p className="text-text-3 text-[11px]">Orders</p>
            </div>
            <div className="bg-surface-1 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">
                {reconcileResult.events_processed.toLocaleString()}
              </p>
              <p className="text-text-3 text-[11px]">Events Processed</p>
            </div>
            <div className="bg-surface-1 rounded-xl p-3 text-center">
              <p
                className={`text-lg font-bold ${
                  reconcileResult.divergence > 0 ? 'text-warning' : 'text-success'
                }`}
              >
                {reconcileResult.divergence}
              </p>
              <p className="text-text-3 text-[11px]">Divergence</p>
            </div>
            <div className="bg-surface-1 rounded-xl p-3 text-center">
              <p
                className={`text-lg font-bold ${
                  reconcileResult.status === 'ok' ? 'text-success' : 'text-warning'
                }`}
              >
                {reconcileResult.status}
              </p>
              <p className="text-text-3 text-[11px]">Status</p>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Recent events table                                           */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stroke">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Recent Events
          </h2>
        </div>

        {!health || health.recent_events.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={28} className="mx-auto text-text-3 mb-2" />
            <p className="text-text-3 text-sm">No recent events recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="px-5 py-3 text-text-3 text-xs font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-5 py-3 text-text-3 text-xs font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-3 text-text-3 text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-text-3 text-xs font-medium uppercase tracking-wider">
                    Received At
                  </th>
                </tr>
              </thead>
              <tbody>
                {health.recent_events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b border-stroke/50 hover:bg-surface-1/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-text-2 font-mono text-xs">
                      {ev.id.slice(0, 12)}...
                    </td>
                    <td className="px-5 py-3 text-white text-xs">{ev.type}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          ev.status === 'processed' || ev.status === 'ok'
                            ? 'bg-success/15 text-success'
                            : ev.status === 'failed'
                            ? 'bg-error/15 text-error'
                            : 'bg-warning/15 text-warning'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-3 text-xs">
                      {new Date(ev.received_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
