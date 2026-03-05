"use client";

import React from 'react';
import { Search, HelpCircle } from 'lucide-react';
import PresenceAvatars from '@/components/layout/PresenceAvatars';
import NotificationsPanel from '@/components/layout/NotificationsPanel';

export default function Topbar() {
    return (
        <header className="h-12 surface-glass border-b border-white/[0.05] sticky top-0 z-10 flex items-center justify-between px-4 gap-4">

            {/* Search */}
            <div className="relative flex-1 max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-3/60 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg py-1.5 pl-9 pr-3 text-sm text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] focus:shadow-glow-primary/30 transition-all"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[9px] text-text-3/50 font-mono">
                    ⌘K
                </kbd>
            </div>

            {/* Presence */}
            <div className="flex-1 flex justify-center">
                <PresenceAvatars />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-3/60 hover:text-text-2 hover:bg-white/[0.04] transition-all">
                    <HelpCircle size={15} />
                </button>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg text-text-3/60 hover:text-text-2 hover:bg-white/[0.04] transition-all">
                    <NotificationsPanel />
                </div>
            </div>
        </header>
    );
}
