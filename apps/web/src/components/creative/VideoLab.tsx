"use client";

import React, { useState } from 'react';
import { Film, Play, Layout, Type, Image as ImageIcon, Sparkles, Wand2, Loader2, Music } from 'lucide-react';

export default function VideoLab() {
    const [isRendering, setIsRendering] = useState(false);
    const [shots, setShots] = useState([
        { id: '1', title: 'Establishing Shot', desc: 'Avatar enters a luxury store, looking around with a smile.', duration: '3s' },
        { id: '2', title: 'Product Showcase', desc: 'Close-up of the New Season Watch on a table.', duration: '5s' },
        { id: '3', title: 'Call to Action', desc: 'Avatar speaks directly to the camera: "Join the elite."', duration: '4s' },
    ]);

    const handleRender = () => {
        setIsRendering(true);
        setTimeout(() => setIsRendering(false), 3000);
    };

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Film size={24} className="text-secondary" /> Cinematic Video Lab
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Neural Rendering Engine active</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-4 bg-bg-0 border border-white/5 rounded-2xl text-text-3 hover:text-white transition-all">
                        <Music size={18} />
                    </button>
                </div>
            </div>

            {/* Storyboard Tracks */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                        <Layout size={14} className="text-secondary" /> Storyboard Board
                    </span>
                    <span className="text-[9px] font-bold text-text-3 uppercase">Total Duration: 12.0s</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {shots.map((shot, idx) => (
                        <div key={shot.id} className="group relative bg-bg-0 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 hover:border-secondary/30 transition-all cursor-move">
                            <div className="flex items-center justify-between">
                                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-white">{idx + 1}</span>
                                <span className="text-[8px] font-bold text-text-3 uppercase">{shot.duration}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h5 className="text-xs font-black text-white uppercase tracking-tighter italic">{shot.title}</h5>
                                <p className="text-[10px] text-text-3 font-medium leading-relaxed">{shot.desc}</p>
                            </div>
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                                <Type size={14} className="text-text-3 hover:text-white" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                <div className="p-10 bg-bg-0 border border-white/5 rounded-[3rem] flex flex-col gap-6 relative overflow-hidden group">
                    <div className="aspect-video bg-black/40 rounded-[2rem] border border-white/5 flex items-center justify-center relative">
                        <Play size={48} className="text-white/20 group-hover:scale-110 transition-all" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                                <Film size={14} />
                            </div>
                            <span className="text-[10px] font-black text-white uppercase italic">Draft Preview</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col justify-center gap-4">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">FPS Settings</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white uppercase italic">60</span>
                                <span className="text-[10px] font-bold text-text-3 uppercase italic">Cinema</span>
                            </div>
                        </div>
                        <div className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col justify-center gap-4">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Resolution</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white uppercase italic">4K</span>
                                <span className="text-[10px] font-bold text-text-3 uppercase italic">Ultra</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRender}
                        disabled={isRendering}
                        className="py-6 bg-secondary text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-secondary/20 disabled:opacity-50"
                    >
                        {isRendering ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {isRendering ? 'RENDERING ENGINE ACTIVE...' : 'START NEURAL RENDER'}
                    </button>
                </div>
            </div>

        </div>
    );
}
