"use client";

import React from 'react';
import { User, Shield, Camera, Mic2, Settings, Plus, Star, Heart } from 'lucide-react';

export default function AvatarLab() {
    const avatars = [
        { id: '1', name: 'Pulse Prime', persona: 'Executive / Helpful', type: 'Brand Default', status: 'Ready' },
        { id: '2', name: 'Luna Fashion', persona: 'Trendy / Youthful', type: 'Campaign', status: 'In Use' },
        { id: '3', name: 'Marcus Tech', persona: 'Expert / Concise', type: 'Support', status: 'Ready' },
    ];

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Avatar Lab</h2>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Neural Character OS v1.1</p>
                </div>
                <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                    <Plus size={16} /> NEW CHARACTER
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {avatars.map((avatar) => (
                    <div key={avatar.id} className="bg-bg-1 border border-stroke rounded-[2.5rem] p-10 flex flex-col gap-8 hover:border-primary/40 transition-all group relative overflow-hidden shadow-2xl">

                        <div className="flex justify-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center relative group-hover:scale-110 transition-all duration-500">
                                <User size={48} className="text-white/40" />
                                <div className="absolute -bottom-2 -right-2 p-2 bg-success rounded-full border-4 border-bg-1">
                                    <Shield size={12} className="text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{avatar.name}</h4>
                            <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">{avatar.persona}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-bg-0 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                                <Mic2 size={14} className="text-primary" />
                                <span className="text-[8px] font-black text-white uppercase">Voice Pro</span>
                            </div>
                            <div className="p-4 bg-bg-0 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                                <Camera size={14} className="text-secondary" />
                                <span className="text-[8px] font-black text-white uppercase">Visual Lab</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-6 border-t border-white/5">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest italic">{avatar.type}</span>
                            <button className="text-text-3 hover:text-white transition-all">
                                <Settings size={16} />
                            </button>
                        </div>

                        {/* Selection Highlight */}
                        {avatar.type === 'Brand Default' && (
                            <div className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                                <Star size={10} className="text-primary fill-primary" />
                                <span className="text-[8px] font-black text-primary uppercase">DEFAULT</span>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
}
