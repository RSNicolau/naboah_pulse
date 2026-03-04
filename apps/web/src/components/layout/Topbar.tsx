"use client";

import React from 'react';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';
import PresenceAvatars from '@/components/layout/PresenceAvatars';
import NotificationsPanel from '@/components/layout/NotificationsPanel';

export default function Topbar() {
    return (
        <header className="h-16 bg-bg-1/80 backdrop-blur-md border-b border-stroke sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                    <input
                        type="text"
                        placeholder="Search everything..."
                        className="w-full bg-surface-1 border border-stroke rounded-full py-2 pl-10 pr-4 text-sm text-text-1 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 flex justify-center">
                <PresenceAvatars />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 surface-glass rounded-lg border border-stroke/50 hover:bg-surface-2 cursor-pointer transition-colors">
                    <span className="text-xs font-semibold text-text-2">Workspace:</span>
                    <span className="text-xs font-bold text-text-1">Default</span>
                    <ChevronDown className="w-3 h-3 text-text-3" />
                </div>

                <div className="flex items-center gap-4 text-text-3 border-l border-stroke pl-6 ml-2">
                    <HelpCircle className="w-5 h-5 hover:text-text-1 cursor-pointer transition-colors" />
                    <NotificationsPanel />
                </div>
            </div>
        </header>
    );
}
