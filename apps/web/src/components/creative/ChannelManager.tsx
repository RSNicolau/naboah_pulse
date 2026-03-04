"use client";

import React from 'react';
import { MessageSquare, Slack, Github, Command, Zap, Settings, ShieldCheck, ToggleLeft as Toggle } from 'lucide-react';

export default function ChannelManager() {
    const channels = [
        { id: '1', name: 'Slack Workplace', active: true, commands: ['/create', '/meme'], status: 'Connected' },
        { id: '2', name: 'Discord (Creative Team)', active: true, commands: ['/ads', '/video'], status: 'Connected' },
        { id: '3', name: 'WhatsApp Business', active: false, commands: [], status: 'Pending' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Zap size={24} className="text-warning" /> Channel Activation
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">External Command Handlers</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {channels.map((ch) => (
                    <div key={ch.id} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-6 hover:border-warning/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${ch.active ? 'bg-warning/10 text-warning' : 'bg-bg-1 text-text-3'}`}>
                                    <Slack size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest italic">{ch.name}</h4>
                                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${ch.active ? 'text-success' : 'text-text-3'}`}>{ch.status}</span>
                                </div>
                            </div>
                            <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-text-3 hover:text-white">
                                Configure
                            </button>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {ch.commands.map(cmd => (
                                <div key={cmd} className="px-4 py-1.5 bg-bg-1 border border-white/5 rounded-full flex items-center gap-2">
                                    <Command size={10} className="text-text-3" />
                                    <span className="text-[9px] font-bold text-white uppercase">{cmd}</span>
                                </div>
                            ))}
                            {ch.active && (
                                <div className="px-4 py-1.5 bg-success/10 border border-success/20 rounded-full flex items-center gap-2 ml-auto">
                                    <ShieldCheck size={10} className="text-success" />
                                    <span className="text-[8px] font-black text-success uppercase">Active Handler</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-5 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-3 hover:border-warning/40 hover:text-white transition-all">
                + Add New Channel
            </button>

        </div>
    );
}
