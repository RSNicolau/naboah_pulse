"use client";
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type Agent = {
    id: string;
    name: string;
};

const AVATAR_COLORS = ['bg-primary', 'bg-ai', 'bg-secondary', 'bg-success', 'bg-warning'];

export default function PresenceAvatars() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<Agent[]>('/agents/team/squad')
            .then(setAgents)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2/50 border border-stroke rounded-full shadow-sm">
            {loading ? (
                <Loader2 size={14} className="text-text-3 animate-spin mx-2" />
            ) : (
                <div className="flex -space-x-2 overflow-hidden">
                    {agents.map((agent, index) => (
                        <div
                            key={agent.id}
                            className={`w-6 h-6 rounded-full border border-bg-1 flex items-center justify-center text-[8px] font-bold text-white shadow-inner ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                            title={agent.name}
                        >
                            {agent.name.charAt(0)}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center gap-1 ml-1 border-l border-stroke pl-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                    {loading ? '...' : `${agents.length} Live`}
                </span>
            </div>
        </div>
    );
}
