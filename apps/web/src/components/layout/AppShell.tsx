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
            <div className="fixed inset-0 bg-bg-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl jarvis-gradient flex items-center justify-center shadow-glow-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity="0.1"/>
                            <path d="M12 6l-4 2.5v5L12 16l4-2.5v-5L12 6z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity="0.25"/>
                            <circle cx="12" cy="11" r="2" fill="white" fillOpacity="0.9"/>
                        </svg>
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
                <div className="md:ml-56 md:mr-80">
                    <Topbar />
                </div>

                {/* Main content: full-width on mobile, offset on desktop */}
                <main className="flex-1 overflow-y-auto md:ml-56 md:mr-80 pb-16 md:pb-0">
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
