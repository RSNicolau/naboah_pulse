"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/SupabaseProvider';
import {
    LogOut, LayoutDashboard, Inbox, Calendar, ShieldAlert,
    BarChart3, Users, Share2, Settings, Palette, UserCircle, FileText,
    Shield, Code2, GitBranch, Bot, Kanban, LifeBuoy, Puzzle, Target,
    UserSquare2, Rocket, DollarSign, ShieldCheck, Brain, Sparkles,
    ShoppingBag, Building2, Terminal, Globe, Monitor, BookUser, Activity,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type NavItem = { icon: React.ElementType; label: string; href: string };
type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
    {
        title: 'Workspace',
        items: [
            { icon: LayoutDashboard, label: 'Overview',     href: '/' },
            { icon: Inbox,          label: 'Inbox',         href: '/inbox' },
            { icon: BookUser,       label: 'Contacts',      href: '/contacts' },
            { icon: Calendar,       label: 'Calendar',      href: '/calendar' },
        ],
    },
    {
        title: 'Creative',
        items: [
            { icon: Target,       label: 'Strategy',    href: '/strategy/creative' },
            { icon: Palette,      label: 'Image Lab',   href: '/creative/image-lab' },
            { icon: UserSquare2,  label: 'Avatar Lab',  href: '/creative/avatar-lab' },
            { icon: Rocket,       label: 'Campaigns',   href: '/creative/campaigns' },
            { icon: DollarSign,   label: 'Paid Media',  href: '/creative/paid-media' },
            { icon: ShieldCheck,  label: 'Governance',  href: '/creative/governance' },
        ],
    },
    {
        title: 'Revenue',
        items: [
            { icon: Kanban,      label: 'Sales CRM',   href: '/sales' },
            { icon: ShoppingBag, label: 'Commerce',    href: '/commerce/v2/dashboard' },
            { icon: LifeBuoy,    label: 'Helpdesk',    href: '/support' },
            { icon: Puzzle,      label: 'Marketplace', href: '/marketplace' },
        ],
    },
    {
        title: 'Intelligence',
        items: [
            { icon: BarChart3, label: 'Analytics',  href: '/analytics' },
            { icon: FileText,  label: 'Reports',    href: '/analytics/reports' },
            { icon: Target,    label: 'Growth',     href: '/analytics/growth' },
            { icon: BarChart3, label: 'Insights',   href: '/insights/v3/strategy' },
        ],
    },
    {
        title: 'AI & Automation',
        items: [
            { icon: Bot,       label: 'AI Squad',    href: '/agents/team' },
            { icon: Brain,     label: 'Neural Mind', href: '/neural/knowledge' },
            { icon: GitBranch, label: 'Automations', href: '/automation' },
            { icon: GitBranch, label: 'Pulse Flow',  href: '/automation/canvas' },
            { icon: Sparkles,  label: 'Pulse Lab',   href: '/visionary/lab' },
            { icon: Users,     label: 'Synergy',     href: '/synergy/canvas' },
        ],
    },
    {
        title: 'Enterprise',
        items: [
            { icon: Building2,  label: 'Enterprise',   href: '/enterprise/admin' },
            { icon: Globe,      label: 'Global',       href: '/global/settings' },
            { icon: Users,      label: 'Community',    href: '/community' },
            { icon: Shield,     label: 'Security',     href: '/settings/security' },
            { icon: ShieldAlert,label: 'Moderation',   href: '/moderation' },
            { icon: Monitor,    label: 'Desktop',      href: '/desktop/landing' },
            { icon: Terminal,   label: 'Developer',    href: '/developer/portal' },
            { icon: Share2,     label: 'Integrations', href: '/integrations' },
            { icon: Activity,   label: 'Quantum',      href: '/quantum/status' },
        ],
    },
    {
        title: 'Settings',
        items: [
            { icon: UserCircle, label: 'Profile',    href: '/settings/profile' },
            { icon: Palette,    label: 'White-label',href: '/settings/branding' },
            { icon: Code2,      label: 'API Hub',    href: '/settings/apihub' },
            { icon: ShieldAlert,label: 'Privacy',    href: '/settings/privacy' },
            { icon: Settings,   label: 'Billing',    href: '/billing' },
        ],
    },
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
        <aside className="w-56 h-screen bg-bg-1 border-r border-white/[0.05] flex flex-col fixed left-0 top-0 z-20">

            {/* Logo */}
            <div className="h-12 px-4 flex items-center gap-2.5 border-b border-white/[0.05] flex-shrink-0">
                <div className="w-7 h-7 rounded-lg jarvis-gradient flex items-center justify-center flex-shrink-0 shadow-glow-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity="0.1"/>
                        <path d="M12 6l-4 2.5v5L12 16l4-2.5v-5L12 6z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity="0.25"/>
                        <circle cx="12" cy="11" r="2" fill="white" fillOpacity="0.9"/>
                    </svg>
                </div>
                <span className="font-semibold text-sm tracking-tight text-text-1">Naboah <span className="text-text-3">Pulse</span></span>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
                {navSections.map((section) => (
                    <div key={section.title} className="mb-1">
                        <div className="px-4 py-1.5">
                            <span className="text-[9px] font-semibold text-text-3/50 uppercase tracking-[0.1em]">
                                {section.title}
                            </span>
                        </div>
                        {section.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "relative flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-150 group",
                                        active
                                            ? "bg-white/[0.06] text-text-1"
                                            : "text-text-3 hover:text-text-2 hover:bg-white/[0.03]"
                                    )}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary" />
                                    )}
                                    <item.icon
                                        size={14}
                                        className={cn(
                                            "flex-shrink-0 transition-colors",
                                            active ? "text-primary" : "text-text-3 group-hover:text-text-2"
                                        )}
                                    />
                                    <span className={cn("truncate font-medium", active ? "text-text-1" : "")}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div className="border-t border-white/[0.05] px-3 py-2.5 flex-shrink-0">
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[11px] font-medium text-text-2 truncate leading-tight">
                            {user?.email ?? ''}
                        </span>
                        <span className="text-[9px] text-text-3/60 truncate leading-tight">Naboah Pulse</span>
                    </div>
                    <button
                        onClick={signOut}
                        className="text-text-3/40 hover:text-text-3 transition-colors opacity-0 group-hover:opacity-100"
                        title="Sign out"
                    >
                        <LogOut size={13} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
