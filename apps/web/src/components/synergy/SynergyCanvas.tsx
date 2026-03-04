"use client";
import React, { useState, useEffect } from 'react';
import { MousePointer2, StickyNote as NoteIcon, Square, Circle, Type, ArrowUpRight, Plus, Share2, Video, Mic } from 'lucide-react';

interface Cursor {
    id: string;
    x: number;
    y: number;
    name: string;
    color: string;
}

export default function SynergyCanvas() {
    const [elements, setElements] = useState<any[]>([]);
    const [cursors, setCursors] = useState<Cursor[]>([
        { id: 'u2', x: 250, y: 300, name: 'Alice', color: '#10B981' },
        { id: 'u3', x: 600, y: 150, name: 'Bob', color: '#F59E0B' },
    ]);

    const addSticky = () => {
        const newSticky = {
            id: Math.random().toString(),
            type: 'sticky',
            x: 100 + Math.random() * 400,
            y: 100 + Math.random() * 400,
            text: 'Nova Ideia',
            color: 'bg-[#FFEB3B]'
        };
        setElements([...elements, newSticky]);
    };

    return (
        <div className="relative w-full h-full bg-[#0F0F0F] overflow-hidden cursor-crosshair group">

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, #7C3AED 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }}></div>

            {/* Toolbox */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-bg-1/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl z-50">
                {[
                    { icon: MousePointer2, label: 'Select' },
                    { icon: NoteIcon, label: 'Sticky', action: addSticky },
                    { icon: Square, label: 'Rect' },
                    { icon: Circle, label: 'Circle' },
                    { icon: Type, label: 'Text' },
                    { icon: ArrowUpRight, label: 'Connect' },
                ].map((tool, i) => (
                    <button
                        key={i}
                        onClick={tool.action}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl text-text-3 hover:bg-white/5 hover:text-white transition-all group/tool relative"
                    >
                        <tool.icon size={20} />
                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[8px] font-black uppercase rounded opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {tool.label}
                        </span>
                    </button>
                ))}
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                    SHARE CANVAS
                </button>
            </div>

            {/* Render Elements */}
            {elements.map((el) => (
                <div
                    key={el.id}
                    className={`absolute p-6 rounded-lg shadow-2xl cursor-move active:scale-105 transition-transform ${el.color} text-black font-bold text-xs w-48 h-48 flex items-center justify-center text-center`}
                    style={{ left: el.x, top: el.y }}
                >
                    {el.text}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Plus size={12} />
                    </div>
                </div>
            ))}

            {/* Cursors Presence */}
            {cursors.map((c) => (
                <div
                    key={c.id}
                    className="absolute z-50 pointer-events-none transition-all duration-75"
                    style={{ left: c.x, top: c.y }}
                >
                    <MousePointer2 size={24} color={c.color} fill={c.color} />
                    <div
                        className="px-2 py-1 rounded-md text-[10px] font-black text-white ml-4 flex items-center gap-2"
                        style={{ backgroundColor: c.color }}
                    >
                        {c.name}
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    </div>
                </div>
            ))}

            {/* Synergy Huddle (Floating Panel) */}
            <div className="absolute bottom-10 right-10 flex flex-col gap-4">
                <div className="p-4 bg-bg-1/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {['#7C3AED', '#10B981', '#F59E0B'].map((color, i) => (
                            <div key={i} className="w-10 h-10 rounded-2xl border-2 border-bg-1 flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: color }}>
                                {i === 0 ? 'AN' : i === 1 ? 'JD' : 'MK'}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-2xl bg-bg-0 border border-stroke flex items-center justify-center text-[10px] font-black text-text-3">
                            +4
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-12 h-12 rounded-2xl bg-success/20 text-success border border-success/30 flex items-center justify-center hover:bg-success hover:text-white transition-all">
                            <Mic size={20} />
                        </button>
                        <button className="w-12 h-12 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-white">
                            <Video size={20} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
