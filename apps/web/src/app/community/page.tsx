'use client';
import React, { useState } from 'react';
import CommunityHub from '@/components/community/CommunityHub';
import FeedbackPortal from '@/components/community/FeedbackPortal';
import { Users, Lightbulb, MessageSquare } from 'lucide-react';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'hub' | 'feedback'>('hub');

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            {/* Navigation Tabs */}
            <div className="sticky top-0 z-50 bg-bg-0/80 backdrop-blur-xl border-b border-stroke px-8 py-2">
                <div className="max-w-7xl mx-auto flex items-center gap-10">
                    <button
                        onClick={() => setActiveTab('hub')}
                        className={`flex items-center gap-3 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'hub' ? 'text-white' : 'text-text-3 hover:text-white'}`}
                    >
                        <Users size={16} /> Fórum da Comunidade
                        {activeTab === 'hub' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-lg shadow-primary/50"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`flex items-center gap-3 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'feedback' ? 'text-white' : 'text-text-3 hover:text-white'}`}
                    >
                        <Lightbulb size={16} /> Portal de Sugestões
                        {activeTab === 'feedback' && <div className="absolute bottom-0 left-0 w-full h-1 bg-ai-accent rounded-full shadow-lg shadow-ai-accent/50"></div>}
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto w-full pb-20">
                {activeTab === 'hub' ? <CommunityHub /> : <FeedbackPortal />}
            </div>
        </div>
    );
}
