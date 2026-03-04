"use client";

import React from 'react';
import { LayoutDashboard, Inbox, PenTool, Bot, BarChart3 } from 'lucide-react';

const mobileNavItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/' },
    { icon: Inbox, label: 'Inbox', href: '/inbox' },
    { icon: Bot, label: 'Pulse AI', href: '#' }, // Trigger pulse AI rail
    { icon: PenTool, label: 'Post', href: '/content' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics/reports' },
];

export default function MobileNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-1/90 backdrop-blur-xl border-t border-stroke z-[40] flex items-center justify-around px-2 pb-safe">
            {mobileNavItems.map((item) => (
                <a
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center gap-1 p-2 text-text-3 hover:text-primary transition-colors active:scale-90"
                >
                    <item.icon size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                </a>
            ))}
        </nav>
    );
}
