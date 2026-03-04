"use client";
import React, { useState } from 'react';
import { MousePointer2, GitBranch, Zap, MessageSquare, Plus, Save, Play, Settings2, Trash2, Cpu, Eye, Phone } from 'lucide-react';

export default function FlowCanvas() {
    const [nodes, setNodes] = useState([
        { id: '1', type: 'trigger', label: 'Instagram Message', pos: { x: 50, y: 150 } },
        { id: '2', type: 'ai', label: 'Pulse AI Sentiment', pos: { x: 300, y: 150 } },
        { id: '3', type: 'logic', label: 'Positive?', pos: { x: 550, y: 150 } },
        { id: '4', type: 'action', label: 'Send Coupon', pos: { x: 800, y: 50 } },
        { id: '5', type: 'action', label: 'Alert Agent', pos: { x: 800, y: 250 } },
    ]);

    return (
        <div className="flex-1 bg-bg-0 border border-stroke rounded-[2.5rem] relative overflow-hidden group shadow-2xl">

            {/* Canvas Dot Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            {/* Toolbar */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-bg-1/80 backdrop-blur-md border border-stroke px-6 py-3 rounded-2xl flex items-center gap-6 shadow-2xl z-20">
                <div className="flex items-center gap-2 border-r border-stroke pr-6">
                    <button className="p-2 bg-primary text-white rounded-lg"><MousePointer2 size={16} /></button>
                    <button className="p-2 text-text-3 hover:text-white transition-colors"><Plus size={16} /></button>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-[10px] font-black text-text-3 hover:text-white transition-all uppercase tracking-widest">
                        <Save size={14} /> SALVAR FLUXO
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-success/20 animate-pulse-slow">
                        <Play size={14} fill="white" /> PUBLICAR AGORA
                    </button>
                </div>
            </div>

            {/* Nodes Render (Mockup Visual) */}
            <div className="absolute inset-0 p-20 flex items-center justify-start gap-12 pointer-events-none">
                {nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                        <div
                            className="w-56 bg-bg-1 border-2 border-stroke rounded-2xl p-5 flex flex-col gap-4 pointer-events-auto relative shadow-xl hover:border-primary transition-all cursor-move group/node"
                            style={{ marginLeft: i === 0 ? 0 : 40 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {node.type === 'trigger' && <Zap size={14} className="text-warning" />}
                                    {node.type === 'ai' && <Cpu size={14} className="text-primary" />}
                                    {node.type === 'logic' && <GitBranch size={14} className="text-ai-accent" />}
                                    {node.type === 'action' && <Plus size={14} className="text-success" />}
                                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{node.type}</span>
                                </div>
                                <button className="opacity-0 group-hover/node:opacity-100 transition-opacity text-text-3 hover:text-error"><Trash2 size={12} /></button>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-white">{node.label}</span>
                                <p className="text-[9px] text-text-3 leading-tight">Configurado via Pulse Engine v4</p>
                            </div>

                            {/* Connection Points */}
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-bg-1 cursor-crosshair"></div>
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stroke border-2 border-bg-1"></div>
                        </div>

                        {/* Line Connector (Pseudo) */}
                        {i < nodes.length - 1 && (
                            <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-stroke opacity-20 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-l-4 border-y-transparent border-l-primary/40"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* MiniMap / Controls */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-4">
                <div className="bg-bg-1/80 border border-stroke p-3 rounded-2xl flex flex-col gap-2">
                    <button className="p-2 text-text-3 hover:text-white"><Plus size={16} /></button>
                    <button className="p-2 text-text-3 hover:text-white border-y border-stroke/50"><Trash2 size={16} /></button>
                    <button className="p-2 text-text-3 hover:text-white"><Settings2 size={16} /></button>
                </div>
                <div className="w-32 h-20 bg-bg-1/50 border border-stroke rounded-2xl overflow-hidden relative">
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary/20 rounded border border-primary/40"></div>
                </div>
            </div>

        </div>
    );
}
