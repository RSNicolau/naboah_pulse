import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Instagram, MessageSquare, Mail } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

const mockItems = [
    { id: '1', title: 'Product Launch Update', channel: 'instagram', time: '10:00', day: 2, status: 'scheduled', type: 'Reel' },
    { id: '2', title: 'Customer Success Story', channel: 'whatsapp', time: '14:00', day: 2, status: 'pending', type: 'Story' },
    { id: '3', title: 'Weekly Newsletter', channel: 'email', time: '08:00', day: 4, status: 'scheduled', type: 'Email' },
];

export default function CalendarView() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-6 border-b border-stroke flex items-center justify-between bg-bg-1/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold text-white">Calendar</h2>
                    <div className="flex items-center gap-2 bg-surface-2 border border-stroke rounded-lg p-1">
                        <button className="p-1 px-3 text-xs font-bold text-white bg-bg-1 rounded-md shadow-sm">Week</button>
                        <button className="p-1 px-3 text-xs font-bold text-text-3 hover:text-text-1">Month</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-4">
                        <button className="p-1.5 hover:bg-surface-2 rounded-lg text-text-3 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-bold text-white">March 3 - 9, 2024</span>
                        <button className="p-1.5 hover:bg-surface-2 rounded-lg text-text-3 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button className="jarvis-gradient px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus size={16} /> New Post
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="min-w-[1000px] h-full flex flex-col">
                    <div className="grid grid-cols-8 border-b border-stroke sticky top-0 bg-bg-1/80 backdrop-blur-md z-10">
                        <div className="p-4 border-r border-stroke"></div>
                        {days.map((day, i) => (
                            <div key={day} className="p-4 border-r border-stroke text-center">
                                <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest block mb-1">{day}</span>
                                <span className={cn(
                                    "text-lg font-bold",
                                    i === 2 ? "text-primary" : "text-white"
                                )}>{3 + i}</span>
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
                                    const items = mockItems.filter(item => item.time === hour && item.day === i);
                                    return (
                                        <div key={i} className="p-2 border-r border-stroke/30 relative hover:bg-surface-1/30 transition-colors group">
                                            {items.map(item => (
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
