"use client";
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Instagram, MessageSquare, Mail, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { apiGet } from '@/lib/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

type CalendarEvent = {
    id: string;
    title: string;
    type: string;
    channel: string;
    scheduled_at: string;
    status: string;
};

export default function CalendarView() {
    const [items, setItems] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset * 7);

    useEffect(() => {
        apiGet<CalendarEvent[]>('/content/calendar')
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const monthLabel = weekDates[0].toLocaleDateString('pt-BR', { month: 'long' });
    const dateRange = `${monthLabel} ${weekDates[0].getDate()} - ${weekDates[6].getDate()}, ${weekDates[0].getFullYear()}`;

    function getItemsForSlot(dayIndex: number, hour: string) {
        const date = weekDates[dayIndex];
        return items.filter(item => {
            const d = new Date(item.scheduled_at);
            return (
                d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate() &&
                `${String(d.getHours()).padStart(2, '0')}:00` === hour
            );
        });
    }

    const isToday = (d: Date) =>
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-bg-0">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-6 border-b border-stroke flex items-center justify-between bg-bg-1/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold text-white">Calendário</h2>
                    <div className="flex items-center gap-2 bg-surface-2 border border-stroke rounded-lg p-1">
                        <button onClick={() => setViewMode('week')} className={`p-1 px-3 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'text-white bg-bg-1 shadow-sm' : 'text-text-3 hover:text-text-1'}`}>Semana</button>
                        <button onClick={() => setViewMode('month')} className={`p-1 px-3 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'text-white bg-bg-1 shadow-sm' : 'text-text-3 hover:text-text-1'}`}>Mês</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-4">
                        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 hover:bg-surface-2 rounded-lg text-text-3 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-bold text-white">{dateRange}</span>
                        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 hover:bg-surface-2 rounded-lg text-text-3 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button onClick={() => window.location.href = '/creative/campaigns'} className="jarvis-gradient px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus size={16} /> Novo Post
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="min-w-[1000px] h-full flex flex-col">
                    <div className="grid grid-cols-8 border-b border-stroke sticky top-0 bg-bg-1/80 backdrop-blur-md z-10">
                        <div className="p-4 border-r border-stroke"></div>
                        {weekDates.map((date, i) => (
                            <div key={i} className="p-4 border-r border-stroke text-center">
                                <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest block mb-1">{days[date.getDay()]}</span>
                                <span className={cn(
                                    "text-lg font-bold",
                                    isToday(date) ? "text-primary" : "text-white"
                                )}>{date.getDate()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col">
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 border-b border-stroke/30 min-h-[120px]">
                                <div className="p-4 border-r border-stroke flex justify-center">
                                    <span className="text-[10px] font-bold text-text-3">{hour}</span>
                                </div>
                                {Array.from({ length: 7 }).map((_, i) => {
                                    const slotItems = getItemsForSlot(i, hour);
                                    return (
                                        <div key={i} className="p-2 border-r border-stroke/30 relative hover:bg-surface-1/30 transition-colors group">
                                            {slotItems.map(item => (
                                                <div key={item.id} className={cn(
                                                    "mb-2 p-3 rounded-xl border flex flex-col gap-2 shadow-lg cursor-pointer transition-all hover:scale-[1.02]",
                                                    item.status === 'scheduled' ? "bg-bg-1 border-stroke" : "bg-warning/5 border-warning/20 shadow-warning/5"
                                                )}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            {item.channel === 'instagram' && <Instagram size={12} className="text-primary" />}
                                                            {item.channel === 'whatsapp' && <MessageSquare size={12} className="text-secondary" />}
                                                            {item.channel === 'email' && <Mail size={12} className="text-ai" />}
                                                            <span className="text-[9px] font-bold text-text-3 uppercase">{item.type}</span>
                                                        </div>
                                                        {item.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>}
                                                    </div>
                                                    <h4 className="text-[11px] font-bold text-text-1 leading-tight line-clamp-2">{item.title}</h4>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
