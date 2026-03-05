'use client';
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Trash2, EyeOff, Undo2, Siren, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type ModerationEvent = {
    id: string;
    type: string;
    platform: string;
    content: string;
    classification: string;
    action: string;
    time: string;
    reversible: boolean;
};

type ModerationPolicy = {
    id: string;
    name: string;
    status: string;
};

export default function ModerationFeed() {
    const [events, setEvents] = useState<ModerationEvent[]>([]);
    const [policies, setPolicies] = useState<ModerationPolicy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiGet<ModerationEvent[]>('/moderation/events').catch(() => []),
            apiGet<ModerationPolicy[]>('/moderation/policies').catch(() => []),
        ]).then(([ev, pol]) => {
            setEvents(ev);
            setPolicies(pol);
        }).finally(() => setLoading(false));
    }, []);

    const threatsBlocked = events.filter(e => e.classification !== 'Safe').length;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-critical/10 border border-critical/20 flex items-center justify-center shadow-lg shadow-critical/10">
                                <ShieldAlert className="text-critical w-6 h-6" />
                            </div>
                            Moderation Center
                        </h2>
                        <p className="text-text-3 text-sm">Automated protection and reputation management.</p>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-3 bg-critical/20 border border-critical/30 rounded-xl text-critical font-bold text-sm hover:bg-critical/30 transition-all shadow-lg shadow-critical/10 animate-pulse">
                        <Siren size={18} /> CRISIS MODE: OFF
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="surface-glass p-6 rounded-2xl border border-stroke/50 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Active Policies</span>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            {loading ? '---' : policies.length}
                        </span>
                        <div className="flex items-center gap-1 text-success text-[10px] font-bold">
                            <span>{policies.filter(p => p.status === 'active').length} active</span>
                        </div>
                    </div>
                    <div className="surface-glass p-6 rounded-2xl border border-stroke/50 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Threats Blocked</span>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            {loading ? '---' : threatsBlocked}
                        </span>
                        <div className="flex items-center gap-1 text-critical text-[10px] font-bold">
                            <span>from {events.length} events</span>
                        </div>
                    </div>
                    <div className="surface-glass p-6 rounded-2xl border border-stroke/50 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Safe Rate</span>
                        <span className="text-2xl font-bold text-success tracking-tight">
                            {loading || events.length === 0 ? '---' : `${((events.filter(e => e.classification === 'Safe').length / events.length) * 100).toFixed(0)}%`}
                        </span>
                        <div className="flex items-center gap-1 text-success text-[10px] font-bold">
                            <span>{events.length === 0 ? 'No data' : events.filter(e => e.classification === 'Safe').length > threatsBlocked ? 'Low Risk' : 'Moderate Risk'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Recent Events</h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={28} className="text-critical animate-spin" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-bg-1 border border-dashed border-stroke rounded-2xl p-10 flex flex-col items-center gap-3">
                            <ShieldAlert size={28} className="text-text-3" />
                            <p className="text-sm text-text-3">Nenhum evento de moderação registrado.</p>
                        </div>
                    ) : (
                        <div className="bg-bg-1 border border-stroke rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-stroke bg-surface-1/30">
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Type / Platform</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Content Preview</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Pulse AI Classification</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Action</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-3 uppercase tracking-widest text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event.id} className="border-b border-stroke/50 hover:bg-surface-1/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white">{event.type}</span>
                                                    <span className="text-[10px] text-text-3">{event.platform} &bull; {event.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-text-2 truncate max-w-[200px]">{event.content}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${event.classification === 'Safe' ? 'bg-success/10 text-success' : 'bg-critical/10 text-critical'}`}>
                                                    {event.classification}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] text-text-1 font-medium">{event.action}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {event.reversible && (
                                                        <button className="p-2 hover:bg-surface-2 rounded-lg text-text-3 hover:text-white transition-colors" title="Undo Action">
                                                            <Undo2 size={16} />
                                                        </button>
                                                    )}
                                                    <button className="p-2 hover:bg-surface-2 rounded-lg text-text-3 hover:text-white transition-colors">
                                                        <EyeOff size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-critical/10 rounded-lg text-text-3 hover:text-critical transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
