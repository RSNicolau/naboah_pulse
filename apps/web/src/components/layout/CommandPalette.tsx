"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Command, X, MessageSquare, Users, Ticket, Briefcase, Inbox, BarChart2, Zap, CreditCard, Palette, CornerDownLeft } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

type SearchResult = {
    id: string;
    type: 'contact' | 'conversation' | 'deal' | 'ticket';
    title: string;
    subtitle: string;
    meta: string;
    href: string;
};

type SearchResults = {
    contacts: SearchResult[];
    conversations: SearchResult[];
    deals: SearchResult[];
    tickets: SearchResult[];
};

type QuickAction = {
    label: string;
    shortcut: string;
    href: string;
    icon: string;
};

const TYPE_ICON: Record<string, React.ReactNode> = {
    contact:      <Users size={14} />,
    conversation: <MessageSquare size={14} />,
    deal:         <Briefcase size={14} />,
    ticket:       <Ticket size={14} />,
};

const TYPE_COLOR: Record<string, string> = {
    contact:      'bg-primary/10 text-primary',
    conversation: 'bg-ai/10 text-ai',
    deal:         'bg-success/10 text-success',
    ticket:       'bg-critical/10 text-critical',
};

const META_COLORS: Record<string, string> = {
    high:    'bg-critical/10 text-critical border-critical/20',
    medium:  'bg-warning/10 text-warning border-warning/20',
    low:     'bg-success/10 text-success border-success/20',
    open:    'bg-primary/10 text-primary border-primary/20',
    closed:  'bg-surface-2 text-text-3 border-stroke',
    won:     'bg-success/10 text-success border-success/20',
    lost:    'bg-critical/10 text-critical border-critical/20',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
    inbox:   <Inbox size={16} />,
    kanban:  <Briefcase size={16} />,
    ticket:  <Ticket size={16} />,
    users:   <Users size={16} />,
    chart:   <BarChart2 size={16} />,
    zap:     <Zap size={16} />,
    card:    <CreditCard size={16} />,
    palette: <Palette size={16} />,
};

function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [actions, setActions] = useState<QuickAction[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const debouncedQuery = useDebounce(query, 250);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const close = useCallback(() => { setIsOpen(false); setQuery(''); setResults(null); setSelected(0); }, []);

    // Load quick actions once
    useEffect(() => {
        apiGet<QuickAction[]>('/search/actions').then(setActions).catch(() => toast.error('Erro ao carregar ações'));
    }, []);

    // Global keyboard shortcut
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape') close();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle, close]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen]);

    // Search on debounced query change
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setResults(null);
            return;
        }
        setLoading(true);
        apiGet<SearchResults>(`/search/?q=${encodeURIComponent(debouncedQuery)}`)
            .then((data) => { setResults(data); setSelected(0); })
            .catch(() => toast.error('Erro ao pesquisar'))
            .finally(() => setLoading(false));
    }, [debouncedQuery]);

    // Flatten results for keyboard nav
    const flatItems: Array<{ href: string }> = results
        ? [
            ...results.contacts,
            ...results.conversations,
            ...results.deals,
            ...results.tickets,
          ]
        : actions.map((a) => ({ href: a.href }));

    // Keyboard nav within palette
    useEffect(() => {
        if (!isOpen) return;
        function handleNav(e: KeyboardEvent) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, flatItems.length - 1)); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
            if (e.key === 'Enter' && flatItems[selected]) {
                router.push(flatItems[selected].href);
                close();
            }
        }
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, flatItems, selected, router, close]);

    if (!isOpen) return null;

    // Group result sections
    const sections = results
        ? ([
            { key: 'contacts',      label: 'Contactos',   items: results.contacts },
            { key: 'conversations', label: 'Conversas',   items: results.conversations },
            { key: 'deals',         label: 'Deals',       items: results.deals },
            { key: 'tickets',       label: 'Tickets',     items: results.tickets },
          ] as const).filter((s) => s.items.length > 0)
        : [];

    let globalIdx = 0;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-bg-0/60"
            onClick={close}
        >
            <div
                className="w-full max-w-2xl bg-bg-1 border border-stroke rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="p-4 border-b border-stroke flex items-center gap-3">
                    <Search className="text-text-3 w-5 h-5 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-text-3 text-base"
                        placeholder="Pesquisar contactos, conversas, deals, tickets..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setResults(null); }} className="text-text-3 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    )}
                    <div className="px-1.5 py-0.5 rounded bg-surface-2 border border-stroke">
                        <span className="text-[10px] text-text-3 font-bold uppercase">Esc</span>
                    </div>
                </div>

                {/* Results / Actions */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {loading ? (
                        <div className="flex flex-col gap-1 p-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
                                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex-shrink-0" />
                                    <div className="flex-1 flex flex-col gap-2 justify-center">
                                        <div className="h-3 w-40 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-56 bg-surface-2 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query.trim().length >= 2 && results ? (
                        sections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <Search size={28} className="text-text-3" />
                                <p className="text-sm text-text-3">Sem resultados para "{query}"</p>
                            </div>
                        ) : (
                            sections.map((section) => (
                                <div key={section.key} className="mb-3">
                                    <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider px-3 mb-1 block">{section.label}</span>
                                    {section.items.map((item) => {
                                        const idx = globalIdx++;
                                        const isSelected = selected === idx;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => { router.push(item.href); close(); }}
                                                onMouseEnter={() => setSelected(idx)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${isSelected ? 'bg-surface-2' : 'hover:bg-surface-1'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[item.type] ?? 'bg-surface-2 text-text-3'}`}>
                                                    {TYPE_ICON[item.type]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-text-1 truncate font-medium">{item.title}</p>
                                                    <p className="text-xs text-text-3 truncate">{item.subtitle}</p>
                                                </div>
                                                {item.meta && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase flex-shrink-0 ${META_COLORS[item.meta] ?? 'bg-surface-2 text-text-3 border-stroke'}`}>
                                                        {item.meta}
                                                    </span>
                                                )}
                                                {isSelected && <CornerDownLeft size={12} className="text-text-3 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )
                    ) : (
                        <div className="p-2">
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider px-2 mb-2 block">Ações Rápidas</span>
                            {actions.map((action, idx) => {
                                const isSelected = selected === idx;
                                return (
                                    <button
                                        key={action.href}
                                        onClick={() => { router.push(action.href); close(); }}
                                        onMouseEnter={() => setSelected(idx)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${isSelected ? 'bg-surface-2' : 'hover:bg-surface-1'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-bg-0 border border-stroke flex items-center justify-center text-text-2">
                                                {ACTION_ICONS[action.icon] ?? <Command size={16} />}
                                            </div>
                                            <span className="text-sm text-text-2 font-medium">{action.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="px-1.5 py-0.5 rounded bg-surface-2 border border-stroke text-[9px] text-text-3 font-bold uppercase">{action.shortcut}</div>
                                            {isSelected && <CornerDownLeft size={12} className="text-text-3" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-surface-1/50 border-t border-stroke flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <div className="px-1 py-0.5 rounded bg-surface-2 border border-stroke text-[9px] text-text-3">↑↓</div>
                            <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">Navegar</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="px-1 py-0.5 rounded bg-surface-2 border border-stroke text-[9px] text-text-3">Enter</div>
                            <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">Selecionar</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">Powered by Jarvis</span>
                        <Command size={12} className="text-primary" />
                    </div>
                </div>
            </div>
        </div>
    );
}
