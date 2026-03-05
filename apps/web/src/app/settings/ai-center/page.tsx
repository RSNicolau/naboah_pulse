'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Bot,
  Save,
  Zap,
  ShieldCheck,
  Hand,
  Wrench,
  UserCircle,
  Mic,
  BookOpen,
  Check,
} from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Persona {
  id: string;
  name: string;
  description?: string;
}

interface Voice {
  id: string;
  name: string;
  language?: string;
}

interface KnowledgePack {
  id: string;
  name: string;
  description?: string;
}

interface AiCenterData {
  id: string;
  name: string;
  autonomy_default: 'auto' | 'semi' | 'manual';
  allowed_tools_json: string[];
  settings_json: Record<string, unknown>;
  personas: Persona[];
  voices: Voice[];
  knowledge_packs: KnowledgePack[];
}

const AUTONOMY_MODES: {
  value: AiCenterData['autonomy_default'];
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: 'auto',
    label: 'Autonomous',
    icon: Zap,
    description: 'AI acts independently and executes tasks without approval.',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
  },
  {
    value: 'semi',
    label: 'Semi-Autonomous',
    icon: ShieldCheck,
    description: 'AI suggests actions and waits for approval before executing.',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  },
  {
    value: 'manual',
    label: 'Manual',
    icon: Hand,
    description: 'AI provides recommendations only. Humans execute all actions.',
    color: 'text-text-2',
    bg: 'bg-surface-1',
    border: 'border-stroke',
  },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function AiCenterPage() {
  const [data, setData] = useState<AiCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* editable fields */
  const [name, setName] = useState('');
  const [autonomy, setAutonomy] = useState<AiCenterData['autonomy_default']>('semi');
  const [tools, setTools] = useState<string[]>([]);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const result = await apiGet<AiCenterData>('/crm/settings/ai-center');
      setData(result);
      setName(result.name);
      setAutonomy(result.autonomy_default);
      setTools(result.allowed_tools_json);
      setEnabledTools(new Set(result.allowed_tools_json));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTool = (tool: string) => {
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) {
        next.delete(tool);
      } else {
        next.add(tool);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiPut('/crm/settings/ai-center', {
        name,
        autonomy_default: autonomy,
        allowed_tools_json: Array.from(enabledTools),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-8 bg-bg-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot size={24} className="text-primary" />
            AI Command Center
          </h1>
          <p className="text-text-3 text-sm mt-1">
            Configure your AI assistant identity, autonomy level, tools, and knowledge.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="jarvis-gradient px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {/* ------------------------------------------------------------ */}
      /*  AI Name                                                       */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          AI Identity
        </h2>
        <div>
          <label className="text-text-3 text-xs font-medium mb-1 block">Assistant Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-sm px-3 py-2 rounded-xl bg-surface-1 border border-stroke text-sm text-white placeholder:text-text-3 outline-none focus:border-primary/50 transition-colors"
            placeholder="e.g. Jarvis"
          />
          <p className="text-text-3 text-[11px] mt-1.5">
            This name will be used across all customer-facing interactions.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Autonomy mode                                                 */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          Autonomy Mode
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AUTONOMY_MODES.map((mode) => {
            const isActive = autonomy === mode.value;
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => setAutonomy(mode.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? `${mode.bg} ${mode.border} shadow-card`
                    : 'bg-surface-1 border-stroke hover:border-text-3/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    size={16}
                    className={isActive ? mode.color : 'text-text-3'}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? mode.color : 'text-text-2'
                    }`}
                  >
                    {mode.label}
                  </span>
                </div>
                <p className="text-text-3 text-xs leading-relaxed">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Tools checklist                                               */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Wrench size={16} className="text-primary" />
          Allowed Tools
        </h2>

        {tools.length === 0 ? (
          <p className="text-text-3 text-sm">No tools configured in the system.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tools.map((tool) => {
              const isEnabled = enabledTools.has(tool);
              return (
                <label
                  key={tool}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isEnabled
                      ? 'bg-primary/5 border-primary/25'
                      : 'bg-surface-1 border-stroke hover:border-text-3/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleTool(tool)}
                    className="w-4 h-4 rounded border-stroke bg-surface-1 accent-primary shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      isEnabled ? 'text-white font-medium' : 'text-text-3'
                    }`}
                  >
                    {tool}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Personas                                                      */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <UserCircle size={16} className="text-primary" />
          Personas
        </h2>

        {!data?.personas || data.personas.length === 0 ? (
          <p className="text-text-3 text-sm">No personas configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.personas.map((p) => (
              <div
                key={p.id}
                className="bg-surface-1 border border-stroke rounded-xl p-4 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                    {p.name.charAt(0)}
                  </div>
                  <p className="text-white text-sm font-semibold">{p.name}</p>
                </div>
                {p.description && (
                  <p className="text-text-3 text-xs leading-relaxed pl-10">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Knowledge Packs                                               */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          Knowledge Packs
        </h2>

        {!data?.knowledge_packs || data.knowledge_packs.length === 0 ? (
          <p className="text-text-3 text-sm">No knowledge packs available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.knowledge_packs.map((kp) => (
              <div
                key={kp.id}
                className="bg-surface-1 border border-stroke rounded-xl p-4 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-primary shrink-0" />
                  <p className="text-white text-sm font-semibold truncate">{kp.name}</p>
                </div>
                {kp.description && (
                  <p className="text-text-3 text-xs leading-relaxed pl-6">
                    {kp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      /*  Voices                                                        */
      /* ------------------------------------------------------------ */}
      <div className="bg-bg-1 border border-stroke rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Mic size={16} className="text-primary" />
          Voices
        </h2>

        {!data?.voices || data.voices.length === 0 ? (
          <p className="text-text-3 text-sm">No voices configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.voices.map((v) => (
              <div
                key={v.id}
                className="bg-surface-1 border border-stroke rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Mic size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{v.name}</p>
                  {v.language && (
                    <p className="text-text-3 text-xs">{v.language}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom save bar (sticky) */}
      <div className="sticky bottom-0 bg-bg-0/80 backdrop-blur-md border-t border-stroke -mx-6 px-6 py-4 flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="jarvis-gradient px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
