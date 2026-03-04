"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/SupabaseProvider';
import {
    LogOut,
    LayoutDashboard,
    Inbox,
    PenTool,
    Calendar,
    ShieldAlert,
    BarChart3,
    Users,
    Share2,
    Settings,
    Palette,
    UserCircle,
    FileText,
    Shield,
    Code2,
    GitBranch,
    Bot,
    Kanban,
    LifeBuoy,
    Puzzle,
    Target,
    UserSquare2,
    Rocket,
    DollarSign,
    ShieldCheck,
    Brain,
    Sparkles,
    Zap,
    ShoppingBag,
    Building2,
    Terminal,
    Globe,
    Monitor,
    Search,
    BookUser,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/' },
    { icon: Target, label: 'Creative Strategy', href: '/strategy/creative' },
    { icon: Palette, label: 'Image Lab', href: '/creative/image-lab' },
    { icon: UserSquare2, label: 'Avatar Lab', href: '/creative/avatar-lab' },
    { icon: Rocket, label: 'Activations', href: '/creative/campaigns' },
    { icon: DollarSign, label: 'Paid Media', href: '/creative/paid-media' },
    { icon: ShieldCheck, label: 'Governance', href: '/creative/governance' },
    { icon: BarChart3, label: 'Strategy Insights', href: '/insights/v3/strategy' },
    { icon: Inbox, label: 'Unified Inbox', href: '/inbox' },
    { icon: BookUser, label: 'Contacts', href: '/contacts' },
    { icon: Bot, label: 'AI Squad', href: '/agents/team' },
    { icon: Kanban, label: 'Sales CRM', href: '/sales' },
    { icon: LifeBuoy, label: 'Helpdesk', href: '/support' },
    { icon: Brain, label: 'Neural Mind', href: '/neural/knowledge' },
    { icon: Users, label: 'Synergy Canvas', href: '/synergy/canvas' },
    { icon: Sparkles, label: 'Jarvis Lab', href: '/visionary/lab' },
    { icon: Zap, label: 'Quantum Health', href: '/quantum/status' },
    { icon: ShoppingBag, label: 'Pulse Commerce v2', href: '/commerce/v2/dashboard' },
    { icon: Building2, label: 'Pulse Enterprise', href: '/enterprise/admin' },
    { icon: Terminal, label: 'Developer Portal', href: '/developer/portal' },
    { icon: Globe, label: 'Pulse Global', href: '/global/settings' },
    { icon: Globe, label: 'Pulse Horizon', href: '/horizon/widgets' },
    { icon: Monitor, label: 'Pulse Desktop', href: '/desktop/landing' },
    { icon: Puzzle, label: 'Marketplace', href: '/marketplace' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: Shield, label: 'Enterprise', href: '/settings/enterprise' },
    { icon: ShieldAlert, label: 'Pulse Shield', href: '/settings/security' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: ShieldAlert, label: 'Moderation', href: '/moderation' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Target, label: 'Growth Plan', href: '/analytics/growth' },
    { icon: Search, label: 'Global Search', href: '/search' },
    { icon: FileText, label: 'Reports', href: '/analytics/reports' },
    { icon: Bot, label: 'Agents', href: '/agents' },
    { icon: GitBranch, label: 'Automation', href: '/automation' },
    { icon: GitBranch, label: 'Pulse Flow', href: '/automation/canvas' },
    { icon: Share2, label: 'Integrations', href: '/integrations' },
    { icon: Settings, label: 'Billing', href: '/billing' },
    { icon: UserCircle, label: 'Perfil & Conta', href: '/settings/profile' },
    { icon: Palette, label: 'White-label', href: '/settings/branding' },
    { icon: Shield, label: 'Security', href: '/settings/security' },
    { icon: Code2, label: 'API Hub', href: '/settings/apihub' },
    { icon: ShieldAlert, label: 'Privacy', href: '/settings/privacy' },
];

export default function Sidebar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';

    function isActive(href: string) {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }

    return (
        <aside className="w-64 h-screen bg-bg-1 border-r border-stroke flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg jarvis-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                    <div className="w-4 h-4 bg-white rounded-full opacity-20 blur-[2px]"></div>
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Pulse</span>
            </div>

            <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                active
                                    ? "bg-surface-2 text-white border border-stroke shadow-inner shadow-primary/5"
                                    : "text-text-3 hover:text-text-1 hover:bg-surface-1"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors flex-shrink-0",
                                active ? "text-primary" : "group-hover:text-text-1"
                            )} />
                            <span className="font-medium text-sm truncate">{item.label}</span>
                            {active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(123,97,255,0.8)] flex-shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-stroke">
                <div className="surface-glass p-3 rounded-xl flex items-center gap-3 border border-stroke/50">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-text-2">
                        {initials}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-text-1 truncate">{user?.email ?? ''}</span>
                        <span className="text-[10px] text-text-3 truncate">Naboah Pulse</span>
                    </div>
                    <button onClick={signOut} className="text-text-3 hover:text-text-1 transition-colors" title="Sign out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
