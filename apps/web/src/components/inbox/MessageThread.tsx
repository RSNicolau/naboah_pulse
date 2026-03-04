"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
    Send, Plus, Smile, Loader2, CheckCircle2, RotateCcw, ChevronDown,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { toast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';

interface Message {
    id: string;
    content: string;
    direction: string;
    sender_type: string;
    created_at: string;
}

interface ConversationDetail {
    id: string;
    status: string;
    priority: string;
}

interface Props {
    conversationId: string | null;
    contactName: string;
    channel: string;
    onStatusChange?: (id: string, status: string) => void;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

const PRIORITY_ORDER = ['low', 'medium', 'high', 'urgent'] as const;
type Priority = typeof PRIORITY_ORDER[number];

const PRIORITY_STYLES: Record<string, string> = {
    urgent: 'bg-critical/10 text-critical border-critical/30',
    high:   'bg-warning/10 text-warning border-warning/30',
    medium: 'bg-ai/10 text-ai border-ai/30',
    low:    'bg-surface-2 text-text-3 border-stroke',
};

export default function MessageThread({ conversationId, contactName, channel, onStatusChange }: Props) {
    const [messages, setMessages]         = useState<Message[]>([]);
    const [reply, setReply]               = useState('');
    const [sending, setSending]           = useState(false);
    const [loading, setLoading]           = useState(false);
    const [detail, setDetail]             = useState<ConversationDetail | null>(null);
    const [resolving, setResolving]       = useState(false);
    const [updatingPrio, setUpdatingPrio] = useState(false);
    const [showPrioMenu, setShowPrioMenu] = useState(false);
    const bottomRef  = useRef<HTMLDivElement>(null);
    const prioRef    = useRef<HTMLDivElement>(null);

    // Load messages + conversation detail
    useEffect(() => {
        if (!conversationId) return;
        setLoading(true);
        setMessages([]);
        setDetail(null);

        Promise.all([
            apiGet<Message[]>(`/conversations/${conversationId}/messages`),
            apiGet<ConversationDetail>(`/conversations/${conversationId}`),
        ])
            .then(([msgs, conv]) => {
                setMessages(msgs);
                setDetail(conv);
            })
            .catch(() => toast.error('Erro ao carregar mensagens'))
            .finally(() => setLoading(false));
    }, [conversationId]);

    // Supabase Realtime
    useEffect(() => {
        if (!conversationId) return;
        const ch = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'message', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    const incoming = payload.new as Message;
                    setMessages((prev) => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]);
                },
            )
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close priority menu on outside click
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (prioRef.current && !prioRef.current.contains(e.target as Node)) setShowPrioMenu(false);
        }
        if (showPrioMenu) document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [showPrioMenu]);

    async function sendReply() {
        if (!reply.trim() || !conversationId || sending) return;
        setSending(true);
        try {
            const msg = await apiPost<Message>(`/conversations/${conversationId}/reply`, {
                content: reply.trim(),
                sender_type: 'user',
            });
            setMessages(prev => [...prev, msg]);
            setReply('');
        } catch (e) {
            toast.error('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    }

    async function handleResolve() {
        if (!conversationId || resolving) return;
        setResolving(true);
        const next = detail?.status === 'resolved' ? 'reopen' : 'resolve';
        const nextStatus = next === 'resolve' ? 'resolved' : 'open';
        setDetail(d => d ? { ...d, status: nextStatus } : d);
        try {
            await apiPatch(`/conversations/${conversationId}/${next}`, {});
            toast.success(next === 'resolve' ? 'Conversa resolvida' : 'Conversa reaberta');
            onStatusChange?.(conversationId, nextStatus);
        } catch {
            // revert
            setDetail(d => d ? { ...d, status: next === 'resolve' ? 'open' : 'resolved' } : d);
            toast.error('Erro ao atualizar conversa');
        } finally {
            setResolving(false);
        }
    }

    async function handlePriority(p: Priority) {
        if (!conversationId || updatingPrio) return;
        setShowPrioMenu(false);
        setUpdatingPrio(true);
        const prev = detail?.priority;
        setDetail(d => d ? { ...d, priority: p } : d);
        try {
            await apiPatch(`/conversations/${conversationId}/priority`, { priority: p });
            toast.success(`Prioridade: ${p}`);
        } catch {
            setDetail(d => d ? { ...d, priority: prev ?? 'medium' } : d);
            toast.error('Erro ao atualizar prioridade');
        } finally {
            setUpdatingPrio(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            sendReply();
        }
    };

    const initials = contactName
        ? contactName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '??';

    const isResolved = detail?.status === 'resolved';
    const priority = (detail?.priority ?? 'medium') as Priority;

    if (!conversationId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bg-0">
                <p className="text-xs text-text-3">Seleciona uma conversa</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-stroke flex items-center justify-between px-6 bg-bg-1/50 backdrop-blur-sm z-10 flex-shrink-0 gap-3">
                {/* Contact info */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center text-ai font-bold text-sm flex-shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{contactName}</h3>
                        <span className="text-[10px] text-text-3 flex items-center gap-1 capitalize">
                            <div className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-text-3' : 'bg-success'}`} />
                            {channel} {isResolved && '· resolvida'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Priority picker */}
                    <div className="relative" ref={prioRef}>
                        <button
                            onClick={() => setShowPrioMenu(v => !v)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${PRIORITY_STYLES[priority]}`}
                        >
                            {updatingPrio ? <Loader2 size={10} className="animate-spin" /> : null}
                            {priority}
                            <ChevronDown size={10} />
                        </button>
                        {showPrioMenu && (
                            <div className="absolute right-0 top-8 z-30 bg-surface-2 border border-stroke rounded-xl shadow-2xl py-1 min-w-[110px]">
                                {PRIORITY_ORDER.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handlePriority(p)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-1 transition-colors ${priority === p ? 'font-bold text-white' : 'text-text-2'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                            p === 'urgent' ? 'bg-critical' :
                                            p === 'high'   ? 'bg-warning'  :
                                            p === 'medium' ? 'bg-ai'       : 'bg-text-3'
                                        }`} />
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resolve / Reopen */}
                    <button
                        onClick={handleResolve}
                        disabled={resolving}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all disabled:opacity-50 ${
                            isResolved
                                ? 'bg-surface-2 border-stroke text-text-2 hover:border-primary/30 hover:text-white'
                                : 'bg-success/10 border-success/30 text-success hover:bg-success/20'
                        }`}
                    >
                        {resolving
                            ? <Loader2 size={11} className="animate-spin" />
                            : isResolved
                            ? <RotateCcw size={11} />
                            : <CheckCircle2 size={11} />}
                        {isResolved ? 'Reabrir' : 'Resolver'}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-bg-0 custom-scrollbar">
                {loading && (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 size={16} className="animate-spin text-primary" />
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex items-center justify-center h-20">
                        <p className="text-xs text-text-3">Sem mensagens ainda</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';
                    const isAgent = msg.sender_type === 'agent';
                    const senderLabel = isAgent ? 'Pulse AI (Agent)' : isOutbound ? 'Eu' : contactName;

                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col gap-1 max-w-[80%] ${isOutbound ? 'ml-auto items-end' : ''}`}
                        >
                            <div className={`text-[10px] text-text-3 mb-1 ${isOutbound ? 'mr-2' : 'ml-2'}`}>
                                {senderLabel} &bull; {formatTime(msg.created_at)}
                            </div>
                            {isAgent ? (
                                <div className="jarvis-gradient p-[1px] rounded-2xl rounded-tr-none shadow-lg shadow-primary/10">
                                    <div className="bg-bg-1 p-3 rounded-[15px] rounded-tr-none text-sm text-white">
                                        {msg.content}
                                    </div>
                                </div>
                            ) : isOutbound ? (
                                <div className="bg-primary/20 border border-primary/30 p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-sm">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="bg-surface-2 border border-stroke p-3 rounded-2xl rounded-tl-none text-sm text-text-1 shadow-sm">
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            <div className="p-4 bg-bg-1 border-t border-stroke flex-shrink-0">
                {isResolved ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-xs text-text-3 bg-surface-1/30 rounded-2xl border border-stroke/40">
                        <CheckCircle2 size={14} className="text-success" />
                        Conversa resolvida — clica em &quot;Reabrir&quot; para responder
                    </div>
                ) : (
                    <div className="surface-glass rounded-2xl border border-stroke/50 flex flex-col overflow-hidden">
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escreve uma mensagem (CMD + Enter para enviar)..."
                            className="w-full bg-transparent p-4 text-sm text-text-1 focus:outline-none resize-none min-h-[80px]"
                        />
                        <div className="px-4 py-3 flex items-center justify-between border-t border-stroke/30">
                            <div className="flex items-center gap-3 text-text-3">
                                <Plus className="w-5 h-5 cursor-pointer hover:text-text-1 transition-colors" />
                                <Smile className="w-5 h-5 cursor-pointer hover:text-text-1 transition-colors" />
                            </div>
                            <button
                                onClick={sendReply}
                                disabled={sending || !reply.trim()}
                                className="jarvis-gradient px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Enviar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
