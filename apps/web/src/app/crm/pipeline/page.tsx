"use client";

import React, { useState, useEffect, useCallback, useRef, DragEvent } from "react";
import { apiGet, apiPost } from "@/lib/api";
import {
  Loader2,
  Plus,
  X,
  GripVertical,
  User,
  DollarSign,
  TrendingUp,
  Layers,
  ChevronDown,
  Trophy,
  XCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Stage {
  id: string;
  name: string;
  order_index: number;
  sla_hours: number | null;
  probability: number | null;
  is_won: boolean;
  is_lost: boolean;
  color: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

interface Deal {
  id: string;
  title: string;
  value_cents: number;
  currency: string;
  status: string;
  stage_id: string;
  stage_name: string;
  stage_color: string;
  contact_name: string | null;
  contact_email: string | null;
  lead_score: number | null;
  source: string | null;
  created_at: string;
}

interface CreateDealPayload {
  pipeline_id: string;
  stage_id: string;
  title: string;
  value_cents: number;
  source: string;
  contact_id: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function leadScoreColor(score: number): string {
  if (score >= 80) return "bg-success/20 text-success";
  if (score >= 50) return "bg-warning/20 text-warning";
  return "bg-critical/20 text-critical";
}

const SOURCE_OPTIONS = [
  "Website",
  "WhatsApp",
  "Referral",
  "Cold Outreach",
  "Social Media",
  "Event",
  "Ads",
  "Other",
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CRMPipelinePage() {
  /* ---- state ---- */
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // drag state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dropTargetStageId, setDropTargetStageId] = useState<string | null>(null);

  // modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // expanded deal
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);

  // pipeline selector
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---- fetch ---- */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pipelinesData, dealsData] = await Promise.all([
        apiGet<Pipeline[]>("/crm/pipelines"),
        apiGet<Deal[]>("/crm/deals"),
      ]);
      setPipelines(pipelinesData);
      if (pipelinesData.length > 0 && !selectedPipeline) {
        setSelectedPipeline(pipelinesData[0]);
      } else if (selectedPipeline) {
        const updated = pipelinesData.find((p) => p.id === selectedPipeline.id);
        if (updated) setSelectedPipeline(updated);
      }
      setDeals(dealsData);
    } catch (err: any) {
      setError(err.message || "Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // close pipeline dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPipelineDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---- derived ---- */

  const stages = selectedPipeline?.stages
    ? [...selectedPipeline.stages].sort((a, b) => a.order_index - b.order_index)
    : [];

  const stageIds = new Set(stages.map((s) => s.id));
  const pipelineDeals = deals.filter((d) => stageIds.has(d.stage_id));

  function dealsForStage(stageId: string) {
    return pipelineDeals.filter((d) => d.stage_id === stageId);
  }

  const totalDeals = pipelineDeals.length;
  const totalValue = pipelineDeals.reduce((sum, d) => sum + d.value_cents, 0);
  const wonStageIds = new Set(stages.filter((s) => s.is_won).map((s) => s.id));
  const wonDeals = pipelineDeals.filter((d) => wonStageIds.has(d.stage_id));
  const conversionRate =
    totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(1) : "0.0";

  /* ---- drag & drop ---- */

  function handleDragStart(e: DragEvent<HTMLDivElement>, dealId: string) {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
    // make ghost semi-transparent
    if (e.currentTarget) {
      requestAnimationFrame(() => {
        (e.target as HTMLElement).style.opacity = "0.5";
      });
    }
  }

  function handleDragEnd(e: DragEvent<HTMLDivElement>) {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggedDealId(null);
    setDropTargetStageId(null);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetStageId(stageId);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    // only reset if we're leaving the column itself
    const relatedTarget = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDropTargetStageId(null);
    }
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>, stageId: string) {
    e.preventDefault();
    setDropTargetStageId(null);
    const dealId = e.dataTransfer.getData("text/plain");
    if (!dealId) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage_id === stageId) return;

    // optimistic update
    const targetStage = stages.find((s) => s.id === stageId);
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage_id: stageId,
              stage_name: targetStage?.name ?? d.stage_name,
              stage_color: targetStage?.color ?? d.stage_color,
            }
          : d
      )
    );

    try {
      await apiPost(`/crm/deals/${dealId}/move-stage?stage_id=${stageId}`, {});
    } catch {
      // revert on error
      fetchData();
    }
  }

  /* ---- create deal ---- */

  async function handleCreateDeal(payload: CreateDealPayload) {
    try {
      setCreating(true);
      await apiPost("/crm/deals", payload);
      setShowCreateModal(false);
      await fetchData();
    } catch (err: any) {
      alert("Failed to create deal: " + (err.message || "Unknown error"));
    } finally {
      setCreating(false);
    }
  }

  /* ---- render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-3 font-medium">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-0">
        <div className="bg-bg-1 border border-stroke rounded-2xl p-8 max-w-md text-center flex flex-col items-center gap-4">
          <XCircle className="w-10 h-10 text-critical" />
          <p className="text-sm text-critical font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-0">
      {/* ------------------------------------------------------------------ */}
      {/*  Stats bar                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-6 pt-6 pb-0">
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Deals",
              value: totalDeals.toString(),
              icon: Layers,
              color: "text-primary",
            },
            {
              label: "Pipeline Value",
              value: formatBRL(totalValue),
              icon: DollarSign,
              color: "text-ai",
            },
            {
              label: "Conversion Rate",
              value: `${conversionRate}%`,
              icon: TrendingUp,
              color: "text-success",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-1 border border-stroke rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-1 flex items-center justify-center shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-white tracking-tight truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Header                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-6 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            Pipeline
          </h1>

          {/* pipeline selector */}
          {pipelines.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPipelineDropdown(!showPipelineDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-stroke rounded-xl text-sm font-bold text-text-2 hover:border-primary/40 transition-colors"
              >
                {selectedPipeline?.name ?? "Select Pipeline"}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showPipelineDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-bg-1 border border-stroke rounded-xl shadow-card overflow-hidden z-50">
                  {pipelines.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPipeline(p);
                        setShowPipelineDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        selectedPipeline?.id === p.id
                          ? "bg-primary/10 text-primary"
                          : "text-text-2 hover:bg-surface-1"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-jarvis-gradient text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-glow-primary"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Kanban board                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
        <div className="flex gap-4 h-full" style={{ minWidth: "max-content" }}>
          {stages.map((stage) => {
            const stageDeals = dealsForStage(stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + d.value_cents, 0);
            const isDropTarget = dropTargetStageId === stage.id;

            // special won/lost classes
            let columnBorderClass = "border-stroke";
            let columnBgClass = "bg-bg-1";
            let headerAccentClass = "";

            if (stage.is_won) {
              columnBorderClass = isDropTarget
                ? "border-success"
                : "border-success/30";
              columnBgClass = isDropTarget
                ? "bg-success/10"
                : "bg-success/[0.04]";
              headerAccentClass = "text-success";
            } else if (stage.is_lost) {
              columnBorderClass = isDropTarget
                ? "border-critical"
                : "border-critical/30";
              columnBgClass = isDropTarget
                ? "bg-critical/10"
                : "bg-critical/[0.04]";
              headerAccentClass = "text-critical";
            } else if (isDropTarget) {
              columnBorderClass = "border-primary";
              columnBgClass = "bg-primary/[0.06]";
            }

            return (
              <div
                key={stage.id}
                className={`flex flex-col w-[300px] shrink-0 rounded-2xl border transition-all duration-200 ${columnBorderClass} ${columnBgClass}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* column header */}
                <div className="px-4 py-3.5 border-b border-stroke/50 shrink-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {stage.is_won ? (
                      <Trophy className="w-3.5 h-3.5 text-success" />
                    ) : stage.is_lost ? (
                      <XCircle className="w-3.5 h-3.5 text-critical" />
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color || "#7B61FF" }}
                      />
                    )}
                    <h3
                      className={`text-sm font-black uppercase tracking-wider truncate ${
                        headerAccentClass || "text-white"
                      }`}
                    >
                      {stage.name}
                    </h3>
                    <span className="ml-auto text-[10px] font-bold text-text-3 bg-surface-1 px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-text-3 tabular-nums">
                    {formatBRL(stageValue)}
                    {stage.probability != null && (
                      <span className="ml-2 text-text-3/60">
                        {stage.probability}% prob.
                      </span>
                    )}
                  </p>
                </div>

                {/* deal cards */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">
                  {stageDeals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-text-3/40">
                      <Layers className="w-6 h-6 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        No deals
                      </p>
                    </div>
                  )}

                  {stageDeals.map((deal) => {
                    const isExpanded = expandedDealId === deal.id;
                    const isDragging = draggedDealId === deal.id;

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() =>
                          setExpandedDealId(isExpanded ? null : deal.id)
                        }
                        className={`group bg-bg-0 border rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all duration-150 select-none ${
                          isDragging
                            ? "opacity-50 border-primary/40 shadow-glow-primary scale-95"
                            : "border-stroke hover:border-white/10 hover:shadow-card-hover"
                        }`}
                      >
                        {/* drag handle + title row */}
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-text-3/30 mt-0.5 shrink-0 group-hover:text-text-3/60 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate leading-tight">
                              {deal.title}
                            </p>
                            {deal.contact_name && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <User className="w-3 h-3 text-text-3" />
                                <p className="text-[11px] text-text-3 font-medium truncate">
                                  {deal.contact_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* value + badges */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="text-xs font-black text-ai tabular-nums">
                            {formatBRL(deal.value_cents)}
                          </span>
                          {deal.lead_score != null && (
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${leadScoreColor(
                                deal.lead_score
                              )}`}
                            >
                              Score {deal.lead_score}
                            </span>
                          )}
                          {deal.source && (
                            <span className="text-[9px] font-bold text-text-3 bg-surface-1 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              {deal.source}
                            </span>
                          )}
                        </div>

                        {/* expanded details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-stroke/40 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <DetailRow
                              label="Email"
                              value={deal.contact_email || "--"}
                            />
                            <DetailRow label="Status" value={deal.status} />
                            <DetailRow label="Currency" value={deal.currency} />
                            <DetailRow
                              label="Created"
                              value={new Date(deal.created_at).toLocaleDateString(
                                "pt-BR"
                              )}
                            />
                            <DetailRow
                              label="Stage"
                              value={deal.stage_name}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* empty state when no stages */}
          {stages.length === 0 && (
            <div className="flex items-center justify-center w-full">
              <div className="bg-bg-1 border border-stroke rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <Sparkles className="w-10 h-10 text-primary/40" />
                <p className="text-sm font-bold text-text-3">
                  No stages configured for this pipeline.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Create Deal Modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      {showCreateModal && selectedPipeline && (
        <CreateDealModal
          pipeline={selectedPipeline}
          stages={stages}
          creating={creating}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDeal}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail row sub-component                                                  */
/* -------------------------------------------------------------------------- */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-text-2">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Create Deal Modal                                                         */
/* -------------------------------------------------------------------------- */

function CreateDealModal({
  pipeline,
  stages,
  creating,
  onClose,
  onCreate,
}: {
  pipeline: Pipeline;
  stages: Stage[];
  creating: boolean;
  onClose: () => void;
  onCreate: (payload: CreateDealPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [valueBRL, setValueBRL] = useState("");
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [contactId, setContactId] = useState("");
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const cents = Math.round(parseFloat(valueBRL.replace(",", ".") || "0") * 100);
    onCreate({
      pipeline_id: pipeline.id,
      stage_id: stageId,
      title: title.trim(),
      value_cents: cents,
      source,
      contact_id: contactId.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-bg-1 border border-stroke rounded-2xl shadow-2xl p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-jarvis-gradient flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-black text-white uppercase tracking-wide">
              New Deal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-1 text-text-3 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* fields */}
        <div className="space-y-4">
          <FieldWrapper label="Deal Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise License Q2"
              required
              className="w-full bg-bg-0 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder-text-3/40 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </FieldWrapper>

          <FieldWrapper label="Value (R$)">
            <input
              type="text"
              inputMode="decimal"
              value={valueBRL}
              onChange={(e) => setValueBRL(e.target.value)}
              placeholder="0.00"
              className="w-full bg-bg-0 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder-text-3/40 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </FieldWrapper>

          <FieldWrapper label="Stage">
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full bg-bg-0 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors appearance-none"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FieldWrapper>

          <FieldWrapper label="Source">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-bg-0 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors appearance-none"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FieldWrapper>

          <FieldWrapper label="Contact ID">
            <input
              type="text"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="Contact UUID"
              className="w-full bg-bg-0 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder-text-3/40 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </FieldWrapper>
        </div>

        {/* actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stroke text-sm font-bold text-text-3 hover:bg-surface-1 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-jarvis-gradient text-sm font-black text-white uppercase tracking-wider hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Field wrapper                                                             */
/* -------------------------------------------------------------------------- */

function FieldWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}
