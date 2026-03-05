"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Loader2,
  X,
  Phone,
  Mail,
  Heart,
  TrendingDown,
  DollarSign,
  Tag,
  Clock,
  ShoppingBag,
  Handshake,
  TicketCheck,
  MessageSquare,
  ChevronRight,
  Users,
  Shield,
  Globe,
  UserPlus,
  Activity,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/lib/toast";

/* ─── Types ────────────────────────────────────────────────── */

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  phone_e164: string | null;
  email: string | null;
  lifecycle_stage: string;
  lead_score: number | null;
  health_score: number | null;
  predicted_ltv: number | null;
  churn_risk_level: string | null;
  tags_json: string[] | null;
  last_activity_at: string | null;
  last_purchase_at: string | null;
};

type TimelineEvent = {
  id: string;
  type: string;
  subtype: string | null;
  subject: string;
  body: string | null;
  date: string;
  status: string | null;
};

/* ─── Config ───────────────────────────────────────────────── */

const LIFECYCLE_BADGE: Record<string, { label: string; cls: string }> = {
  lead: { label: "Lead", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  prospect: { label: "Prospect", cls: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  customer: { label: "Customer", cls: "text-success bg-success/10 border-success/20" },
  churn_risk: { label: "Churn Risk", cls: "text-critical bg-critical/10 border-critical/20" },
  churned: { label: "Churned", cls: "text-text-3 bg-text-3/10 border-text-3/20" },
};

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  activity: Activity,
  order: ShoppingBag,
  deal: Handshake,
  ticket: TicketCheck,
  message: MessageSquare,
  note: Clock,
};

const TIMELINE_COLORS: Record<string, string> = {
  activity: "text-primary",
  order: "text-success",
  deal: "text-ai",
  ticket: "text-warning",
  message: "text-blue-400",
  note: "text-text-3",
};

/* ─── Helpers ──────────────────────────────────────────────── */

function fullName(c: Contact): string {
  return `${c.first_name} ${c.last_name}`.trim();
}

function initials(c: Contact): string {
  return (
    (c.first_name?.[0] ?? "") + (c.last_name?.[0] ?? "")
  ).toUpperCase() || "?";
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "--";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatBRL(v: number | null | undefined): string {
  if (v == null) return "R$ 0";
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function healthColor(score: number | null): string {
  if (score == null) return "bg-text-3";
  if (score >= 80) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-critical";
}

function healthTextColor(score: number | null): string {
  if (score == null) return "text-text-3";
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-critical";
}

function riskColor(level: string | null): string {
  if (!level) return "text-text-3";
  if (level === "high") return "text-critical";
  if (level === "medium") return "text-warning";
  return "text-success";
}

/* ─── Sub-components ───────────────────────────────────────── */

function LeadScoreBar({ score }: { score: number | null }) {
  const val = score ?? 0;
  const color =
    val >= 80 ? "bg-success" : val >= 50 ? "bg-warning" : val >= 25 ? "bg-primary" : "bg-text-3";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-bg-0 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${val}%` }}
        />
      </div>
      <span className="text-[9px] text-text-3 font-bold flex-shrink-0 w-6 text-right">
        {val}
      </span>
    </div>
  );
}

function HealthGauge({ score }: { score: number | null }) {
  const val = score ?? 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (val / 100) * circumference;
  const color =
    val >= 80 ? "#22C55E" : val >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke="#1A2336"
          strokeWidth="6"
        />
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white leading-none">{val}</span>
        <span className="text-[8px] text-text-3 font-bold uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

/* ─── Create Contact Modal ─────────────────────────────────── */

function CreateContactModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (c: Contact) => void;
}) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_e164: "",
    lifecycle_stage: "lead",
  });
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) {
      toast.error("First name is required.");
      return;
    }
    setSaving(true);
    try {
      const created = await apiPost<Contact>("/crm/contacts", {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone_e164: form.phone_e164.trim() || null,
        lifecycle_stage: form.lifecycle_stage,
        tags_json: [],
      });
      toast.success("Contact created successfully.");
      onCreated(created);
      onClose();
      setForm({ first_name: "", last_name: "", email: "", phone_e164: "", lifecycle_stage: "lead" });
    } catch {
      toast.error("Failed to create contact.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const inputCls =
    "w-full bg-bg-0 border border-stroke rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-1 border border-stroke rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-stroke">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <UserPlus className="text-primary" size={18} />
            </div>
            <h2 className="text-lg font-black text-white">New Contact</h2>
          </div>
          <button onClick={onClose} className="text-text-3 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                First Name *
              </label>
              <input
                className={inputCls}
                placeholder="John"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                Last Name
              </label>
              <input
                className={inputCls}
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
              Email
            </label>
            <input
              className={inputCls}
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
              Phone (E.164)
            </label>
            <input
              className={inputCls}
              placeholder="+5511999999999"
              value={form.phone_e164}
              onChange={(e) => update("phone_e164", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
              Lifecycle Stage
            </label>
            <select
              className={`${inputCls} appearance-none cursor-pointer`}
              value={form.lifecycle_stage}
              onChange={(e) => update("lifecycle_stage", e.target.value)}
            >
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
              <option value="churn_risk">Churn Risk</option>
              <option value="churned">Churned</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full py-3.5 jarvis-gradient text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {saving ? "Creating..." : "Create Contact"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Contact Detail Panel ─────────────────────────────────── */

function ContactDetail({
  contact,
  onClose,
}: {
  contact: Contact;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"timeline" | "details">("timeline");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tlLoading, setTlLoading] = useState(true);

  useEffect(() => {
    setTlLoading(true);
    setTab("timeline");
    apiGet<TimelineEvent[]>(`/crm/contacts/${contact.id}/timeline`)
      .then(setTimeline)
      .catch(() => {
        setTimeline([]);
      })
      .finally(() => setTlLoading(false));
  }, [contact.id]);

  const lifecycle = LIFECYCLE_BADGE[contact.lifecycle_stage] ?? LIFECYCLE_BADGE.lead;
  const tags: string[] = contact.tags_json ?? [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Detail Header */}
      <div className="flex-shrink-0 p-6 border-b border-stroke">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black flex-shrink-0">
              {initials(contact)}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {fullName(contact)}
                </h2>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${lifecycle.cls}`}
                >
                  {lifecycle.label}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {contact.email && (
                  <span className="text-xs text-text-3 flex items-center gap-1.5">
                    <Mail size={11} className="text-text-3" /> {contact.email}
                  </span>
                )}
                {contact.phone_e164 && (
                  <span className="text-xs text-text-3 flex items-center gap-1.5">
                    <Phone size={11} className="text-text-3" /> {contact.phone_e164}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <HealthGauge score={contact.health_score} />
            <button
              onClick={onClose}
              className="text-text-3 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex-shrink-0 p-6 border-b border-stroke">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg-1 border border-stroke rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={10} className="text-primary" /> Lead Score
            </span>
            <div className="flex items-end gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">
                {contact.lead_score ?? 0}
              </span>
              <span className="text-text-3 text-xs mb-0.5">/ 100</span>
            </div>
            <LeadScoreBar score={contact.lead_score} />
          </div>

          <div className="bg-bg-1 border border-stroke rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign size={10} className="text-success" /> Predicted LTV
            </span>
            <span className="text-2xl font-black text-success mt-1">
              {formatBRL(contact.predicted_ltv)}
            </span>
            <span className="text-[9px] text-text-3 font-medium">
              Last purchase {timeAgo(contact.last_purchase_at)}
            </span>
          </div>

          <div className="bg-bg-1 border border-stroke rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingDown size={10} className="text-warning" /> Churn Risk
            </span>
            <span
              className={`text-2xl font-black capitalize mt-1 ${riskColor(
                contact.churn_risk_level
              )}`}
            >
              {contact.churn_risk_level ?? "N/A"}
            </span>
            <span className="text-[9px] text-text-3 font-medium">
              Last active {timeAgo(contact.last_activity_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6 pt-4 flex items-center gap-1 border-b border-stroke">
        {(["timeline", "details"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors relative ${
              tab === t
                ? "text-white"
                : "text-text-3 hover:text-white"
            }`}
          >
            {t === "timeline" ? "Timeline" : "Details"}
            {tab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 jarvis-gradient rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {tab === "timeline" ? (
          <TimelineTab events={timeline} loading={tlLoading} />
        ) : (
          <DetailsTab contact={contact} tags={tags} />
        )}
      </div>
    </div>
  );
}

/* ─── Timeline Tab ─────────────────────────────────────────── */

function TimelineTab({
  events,
  loading,
}: {
  events: TimelineEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={20} className="animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <Clock size={24} className="text-text-3" />
        <p className="text-xs text-text-3">No timeline events yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-stroke" />

      <div className="flex flex-col gap-1">
        {events.map((ev) => {
          const Icon = TIMELINE_ICONS[ev.type] ?? Clock;
          const iconColor = TIMELINE_COLORS[ev.type] ?? "text-text-3";

          return (
            <div key={ev.id} className="relative pl-10 py-3 group">
              {/* Node */}
              <div
                className={`absolute left-2 top-4 w-5 h-5 rounded-full bg-bg-1 border border-stroke flex items-center justify-center ${iconColor} group-hover:border-primary/30 transition-colors`}
              >
                <Icon size={10} />
              </div>

              <div className="bg-bg-1 border border-stroke rounded-xl p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${iconColor}`}>
                      {ev.type}
                    </span>
                    {ev.subtype && (
                      <span className="text-[9px] text-text-3 font-medium">
                        / {ev.subtype}
                      </span>
                    )}
                    {ev.status && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-2 text-text-2">
                        {ev.status}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-text-3 font-medium flex-shrink-0">
                    {timeAgo(ev.date)}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">{ev.subject}</p>
                {ev.body && (
                  <p className="text-xs text-text-3 mt-1 line-clamp-2">{ev.body}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Details Tab ──────────────────────────────────────────── */

function DetailsTab({
  contact,
  tags,
}: {
  contact: Contact;
  tags: string[];
}) {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Tags */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5">
        <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Tag size={12} className="text-primary" /> Tags
        </h4>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-3">No tags assigned.</p>
        )}
      </div>

      {/* Consent & Preferences */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5">
        <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Shield size={12} className="text-success" /> Consent & Preferences
        </h4>
        <div className="flex flex-col gap-3">
          {[
            { label: "Marketing emails", value: "Opted-in" },
            { label: "WhatsApp promotions", value: "Opted-in" },
            { label: "SMS notifications", value: "Not set" },
            { label: "Data processing (LGPD)", value: "Consented" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-stroke/50 last:border-0"
            >
              <span className="text-xs text-text-2 font-medium">{item.label}</span>
              <span
                className={`text-[10px] font-bold ${
                  item.value === "Not set" ? "text-text-3" : "text-success"
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* External IDs */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5">
        <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Globe size={12} className="text-ai" /> External IDs
        </h4>
        <div className="flex flex-col gap-3">
          {[
            { label: "Supabase UID", value: contact.id },
            { label: "Phone (E.164)", value: contact.phone_e164 ?? "--" },
            { label: "Email", value: contact.email ?? "--" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-stroke/50 last:border-0"
            >
              <span className="text-xs text-text-3 font-medium">{item.label}</span>
              <span className="text-[10px] font-mono text-text-2 truncate max-w-[200px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5">
        <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Clock size={12} className="text-warning" /> Activity
        </h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b border-stroke/50">
            <span className="text-xs text-text-3 font-medium">Last activity</span>
            <span className="text-[10px] font-bold text-text-2">
              {timeAgo(contact.last_activity_at)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-text-3 font-medium">Last purchase</span>
            <span className="text-[10px] font-bold text-text-2">
              {timeAgo(contact.last_purchase_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */

export default function CRMContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const query = debouncedSearch
        ? `/crm/contacts?search=${encodeURIComponent(debouncedSearch)}`
        : "/crm/contacts";
      const data = await apiGet<Contact[]>(query);
      setContacts(data);
    } catch {
      toast.error("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId]
  );

  function handleCreated(newContact: Contact) {
    setContacts((prev) => [newContact, ...prev]);
    setSelectedId(newContact.id);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-stroke flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">CRM Contacts</h1>
            <p className="text-text-3 text-xs">
              360-degree view of every contact and their journey.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
              size={14}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-64 bg-bg-1 border border-stroke rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* New Contact */}
          <button
            onClick={() => setShowCreate(true)}
            className="jarvis-gradient text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Contact
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Contact List (left panel) ── */}
        <div
          className={`flex flex-col border-r border-stroke overflow-hidden transition-all ${
            selectedContact ? "w-[40%] flex-shrink-0" : "flex-1"
          }`}
        >
          {/* Count */}
          {!loading && (
            <div className="flex-shrink-0 px-5 py-3 border-b border-stroke/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
              </span>
              {debouncedSearch && (
                <span className="text-[9px] font-medium text-primary">
                  Filtered by &quot;{debouncedSearch}&quot;
                </span>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col gap-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border-b border-stroke/50 animate-pulse flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-2 flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-3.5 w-32 bg-surface-2 rounded" />
                      <div className="h-2.5 w-48 bg-surface-2 rounded" />
                      <div className="h-1.5 w-full bg-surface-2 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Users size={24} className="text-text-3" />
                <p className="text-xs text-text-3">No contacts found.</p>
              </div>
            ) : (
              contacts.map((contact) => {
                const lifecycle =
                  LIFECYCLE_BADGE[contact.lifecycle_stage] ?? LIFECYCLE_BADGE.lead;
                const isSelected = selectedId === contact.id;
                const tags: string[] = contact.tags_json ?? [];

                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedId(contact.id)}
                    className={`p-4 border-b border-stroke/50 cursor-pointer transition-colors group relative ${
                      isSelected ? "bg-surface-2/50" : "hover:bg-surface-1"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 jarvis-gradient" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black flex-shrink-0">
                        {initials(contact)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                            {fullName(contact)}
                          </span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 ${lifecycle.cls}`}
                          >
                            {lifecycle.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-text-3 truncate mt-0.5">
                          {contact.email ?? contact.phone_e164 ?? "--"}
                        </p>

                        {/* Lead Score Bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[8px] font-bold text-text-3 uppercase tracking-widest">
                              Lead Score
                            </span>
                          </div>
                          <LeadScoreBar score={contact.lead_score} />
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[8px] font-bold text-primary/80 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-[8px] text-text-3 font-medium">
                                +{tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Activity timestamp */}
                        <div className="flex items-center gap-3 mt-2 text-[9px] text-text-3">
                          <span className="flex items-center gap-1">
                            <Clock size={9} /> {timeAgo(contact.last_activity_at)}
                          </span>
                          {contact.predicted_ltv != null && contact.predicted_ltv > 0 && (
                            <span className="flex items-center gap-1 text-success/70">
                              <DollarSign size={9} /> {formatBRL(contact.predicted_ltv)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={14}
                        className={`text-text-3 flex-shrink-0 mt-3 transition-colors ${
                          isSelected ? "text-primary" : "opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Contact Detail (right panel) ── */}
        {selectedContact ? (
          <ContactDetail
            contact={selectedContact}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          !loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-bg-1 border border-stroke flex items-center justify-center">
                <Users size={32} className="text-text-3" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-text-2">Select a contact</p>
                <p className="text-xs text-text-3 mt-1">
                  Choose a contact from the list to view their 360 profile.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Create Modal */}
      <CreateContactModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
