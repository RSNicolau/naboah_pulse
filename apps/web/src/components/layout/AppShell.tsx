"use client";

import React from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import LoginPage from '@/components/auth/LoginPage';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import JarvisRail from '@/components/layout/JarvisRail';
import MobileNav from '@/components/layout/MobileNav';
import CommandPalette from '@/components/layout/CommandPalette';
import Toaster from '@/components/ui/Toaster';
import { Loader2 } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#05060A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl jarvis-gradient flex items-center justify-center shadow-lg shadow-primary/30">
                        <div className="w-5 h-5 bg-white rounded-full opacity-30 blur-[2px]" />
                    </div>
                    <Loader2 size={16} className="animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <>
            {/* Sidebar: hidden on mobile */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1 h-screen">
                {/* Topbar: full-width on mobile, offset on desktop */}
                <div className="md:ml-64 md:mr-80">
                    <Topbar />
                </div>

                {/* Main content: full-width on mobile, offset on desktop */}
                <main className="flex-1 overflow-y-auto md:ml-64 md:mr-80 pb-16 md:pb-0">
                    {children}
                </main>
            </div>

            {/* JarvisRail: hidden on mobile */}
            <div className="hidden md:block">
                <JarvisRail />
            </div>

            {/* MobileNav: only on mobile */}
            <MobileNav />
            <CommandPalette />
            <Toaster />
        </>
    );
}
