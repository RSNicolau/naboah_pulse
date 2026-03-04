"use client";

import React from 'react';
import { Calendar, Clock, Share2, MoreHorizontal, CheckCircle2, AlertCircle, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function CampaignOrchestrator() {
    const schedule = [
        { id: '1', asset: 'Luxury Watch - Neon', platform: 'instagram', time: 'Today, 6:00 PM', status: 'Scheduled' },
        { id: '2', asset: 'Cyberpunk Drone Promo', platform: 'tiktok', time: 'Tomorrow, 10:00 AM', status: 'Pending Approval' },
        { id: '3', asset: 'Minimalist Office Teaser', platform: 'linkedin', time: 'Oct 25, 9:00 AM', status: 'Draft' },
    ];

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'instagram': return <Instagram size={14} />;
            case 'twitter': return <Twitter size={14} />;
            case 'linkedin': return <Linkedin size={14} />;
            default: return <Share2 size={14} />;
        }
    }

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Calendar size={24} className="text-primary" /> Campaign Orchestrator
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Automated Publication Pipeline</p>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                    Open Full Calendar
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {schedule.map((item) => (
                    <div key={item.id} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex items-center justify-between hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                {getPlatformIcon(item.platform)}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-lg font-black text-white uppercase tracking-tighter italic truncate max-w-[200px]">{item.asset}</h4>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-3 uppercase tracking-widest">
                                        <Clock size={10} /> {item.time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'Scheduled' ? 'text-success' : 'text-warning'}`}>
                                    {item.status}
                                </span>
                                <div className="flex gap-1">
                                    <div className={`w-1 h-1 rounded-full ${item.status === 'Scheduled' ? 'bg-success' : 'bg-warning'}`}></div>
                                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                </div>
                            </div>
                            <button className="p-3 bg-white/5 rounded-xl text-text-3 hover:text-white transition-all">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest italic">All Assets QA Verified for Today's Batch</span>
                </div>
                <span className="text-[9px] font-bold text-primary uppercase">8 Posts Scheduled</span>
            </div>

        </div>
    );
}
