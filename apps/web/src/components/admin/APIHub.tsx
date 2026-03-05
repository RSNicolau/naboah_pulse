"use client";

import React, { useState, useEffect } from 'react';
import {
    Code2, Key, Copy, Plus, Trash2, Check, Eye, EyeOff,
    Webhook, Zap, Shield, BookOpen, RefreshCw, Loader2,
} from 'lucide-react';
import { apiGet } from '@/lib/api';

type ApiKey = {
    id: string;
    name: string;
    key: string;
    created_at: string;
    last_used: string | null;
    scopes: string[];
};

type WebhookEntry = {
    event: string;
    url: string;
    active: boolean;
};

type ApiHubData = {
    keys: ApiKey[];
    webhooks: WebhookEntry[];
};

const ALL_SCOPES = [
    'inbox:read', 'inbox:write', 'contacts:read', 'contacts:write',
    'agents:read', 'agents:write', 'analytics:read',
];

function maskKey(key: string, visible: boolean): string {
    if (visible) return key;
    return key.slice(0, 12) + '•'.repeat(20) + key.slice(-4);
}

export default function APIHub() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showNewKey, setShowNewKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set(['inbox:read', 'contacts:read']));
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        apiGet<ApiHubData>('/apihub/keys')
            .then((data) => {
                setKeys(data.keys ?? []);
                setWebhooks(data.webhooks ?? []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function toggleVisible(id: string) {
        setVisibleKeys((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function copyKey(id: string, key: string) {
        await navigator.clipboard.writeText(key).catch(() => {});
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function deleteKey(id: string) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
    }

    function generateKey() {
        if (!newKeyName.trim()) return;
        setGenerating(true);
        setTimeout(() => {
            const rand = () => Math.random().toString(36).substring(2, 10);
            const newKey: ApiKey = {
                id: `key_${Date.now()}`,
                name: newKeyName.trim(),
                key: `npk_live_${rand()}${rand()}${rand()}${rand()}`,
                created_at: new Date().toISOString().split('T')[0],
                last_used: null,
                scopes: Array.from(selectedScopes),
            };
            setKeys((prev) => [...prev, newKey]);
            setNewKeyName('');
            setSelectedScopes(new Set(['inbox:read', 'contacts:read']));
            setShowNewKey(false);
            setGenerating(false);
        }, 800);
    }

    function toggleScope(scope: string) {
        setSelectedScopes((prev) => {
            const next = new Set(prev);
            if (next.has(scope)) next.delete(scope);
            else next.add(scope);
            return next;
        });
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Code2 className="text-primary w-6 h-6" />
                            </div>
                            API Hub
                        </h2>
                        <p className="text-text-3 text-sm">Gerencie chaves de API, webhooks e acesse a documentação.</p>
                    </div>
                    <a
                        href="#"
                        className="flex items-center gap-2 px-4 py-2 bg-bg-1 border border-stroke rounded-xl text-xs font-bold text-text-2 hover:text-white hover:border-primary/30 transition-all"
                    >
                        <BookOpen size={14} /> Documentação
                    </a>
                </div>

                {/* Base URL */}
                <div className="bg-bg-1 border border-ai/20 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Base URL</span>
                        <code className="text-sm font-mono text-ai">https://api.naboah.com/v1</code>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-black text-success uppercase tracking-widest">Operacional</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={28} className="text-primary animate-spin" />
                    </div>
                ) : (
                <>

                {/* API Keys */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Key size={14} className="text-primary" /> Chaves de API ({keys.length})
                        </h3>
                        <button
                            onClick={() => setShowNewKey(true)}
                            className="flex items-center gap-2 px-4 py-2 jarvis-gradient text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                        >
                            <Plus size={14} /> Nova Chave
                        </button>
                    </div>

                    {showNewKey && (
                        <div className="bg-bg-1 border border-primary/30 rounded-2xl p-6 flex flex-col gap-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Criar Nova Chave</h4>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Nome *</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Ex: Mobile App, Integração Zapier..."
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Permissões</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_SCOPES.map((scope) => (
                                        <button
                                            key={scope}
                                            onClick={() => toggleScope(scope)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                selectedScopes.has(scope)
                                                    ? 'bg-primary/10 text-primary border-primary/30'
                                                    : 'bg-surface-1 text-text-3 border-stroke hover:border-stroke/80'
                                            }`}
                                        >
                                            {scope}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNewKey(false)}
                                    className="flex-1 py-2.5 border border-stroke rounded-xl text-xs font-bold text-text-2 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={generateKey}
                                    disabled={generating || !newKeyName.trim()}
                                    className="flex-1 py-2.5 jarvis-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {generating && <RefreshCw size={12} className="animate-spin" />}
                                    Gerar Chave
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {keys.map((apiKey) => {
                            const isVisible = visibleKeys.has(apiKey.id);
                            const isCopied = copiedId === apiKey.id;
                            return (
                                <div key={apiKey.id} className="bg-bg-1 border border-stroke rounded-2xl p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-white">{apiKey.name}</span>
                                                <span className="text-[9px] font-bold px-2 py-0.5 bg-success/10 text-success border border-success/20 rounded-full uppercase">Ativo</span>
                                            </div>
                                            <span className="text-[10px] text-text-3">
                                                Criada em {apiKey.created_at} · Último uso: {apiKey.last_used ?? 'nunca'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteKey(apiKey.id)}
                                            className="p-2 text-text-3 hover:text-critical transition-colors rounded-lg hover:bg-critical/10"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 bg-bg-0 border border-stroke rounded-xl px-4 py-2.5 font-mono text-xs">
                                        <span className="flex-1 text-text-2 truncate">{maskKey(apiKey.key, isVisible)}</span>
                                        <button onClick={() => toggleVisible(apiKey.id)} className="text-text-3 hover:text-white transition-colors flex-shrink-0">
                                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button onClick={() => copyKey(apiKey.id, apiKey.key)} className="text-text-3 hover:text-white transition-colors flex-shrink-0">
                                            {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {apiKey.scopes.map((scope) => (
                                            <span key={scope} className="px-2 py-0.5 bg-surface-2 border border-stroke text-[9px] font-bold text-text-3 rounded-lg">
                                                {scope}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Webhooks */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Webhook size={14} className="text-ai-accent" /> Webhooks
                        </h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-bg-1 border border-stroke rounded-xl text-xs font-bold text-text-2 hover:text-white hover:border-ai-accent/30 transition-all">
                            <Plus size={14} /> Adicionar Endpoint
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {webhooks.map((wh: WebhookEntry, i: number) => (
                            <div key={i} className="bg-bg-1 border border-stroke rounded-2xl p-5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${wh.active ? 'bg-success animate-pulse' : 'bg-text-3'}`} />
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{wh.event}</span>
                                        <p className="text-xs text-text-2 font-mono truncate">{wh.url}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-1 rounded-lg border flex-shrink-0 ${
                                    wh.active
                                        ? 'bg-success/10 text-success border-success/20'
                                        : 'bg-surface-2 text-text-3 border-stroke'
                                }`}>
                                    {wh.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Reference */}
                <div className="bg-gradient-to-br from-bg-1 to-surface-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} className="text-primary" /> Quick Reference
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { method: 'GET',   path: '/v1/contacts',                    desc: 'Listar contactos' },
                            { method: 'POST',  path: '/v1/conversations',               desc: 'Criar conversa' },
                            { method: 'GET',   path: '/v1/agents/team/squad',           desc: 'Listar agentes' },
                            { method: 'PATCH', path: '/v1/support/tickets/:id/resolve', desc: 'Resolver ticket' },
                        ].map((ep) => (
                            <div key={ep.path} className="bg-bg-0 border border-stroke rounded-xl p-3 flex items-center gap-3">
                                <span className={`text-[9px] font-black px-2 py-1 rounded flex-shrink-0 ${
                                    ep.method === 'GET'   ? 'bg-success/10 text-success' :
                                    ep.method === 'POST'  ? 'bg-primary/10 text-primary' :
                                    'bg-warning/10 text-warning'
                                }`}>{ep.method}</span>
                                <code className="text-[11px] text-text-2 font-mono truncate flex-1">{ep.path}</code>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Shield size={12} className="text-text-3" />
                        <span className="text-[10px] text-text-3">
                            Todas as rotas requerem <code className="text-primary">Authorization: Bearer &lt;key&gt;</code>
                        </span>
                    </div>
                </div>

                </>
                )}

            </div>
        </div>
    );
}
