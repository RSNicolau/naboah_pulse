"use client";
import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, MessageCircle, Clock, CheckCircle2, Search, Filter, Plus } from 'lucide-react';

const feedRequests = [
    { id: '1', title: 'Integração Nativa com TikTok Ads', description: 'Gostaria de ver as campanhas direto no Content Studio.', votes: 156, status: 'planned', comments: 12 },
    { id: '2', title: 'Relatórios em PDF Customizados', description: 'Poder enviar relatórios com a minha logo para os clientes.', votes: 89, status: 'under_review', comments: 5 },
    { id: '3', title: 'Automação via Voz (PT-BR)', description: 'Bot que atende chamadas e transcreve com Jarvis.', votes: 245, status: 'in_progress', comments: 45 },
];

export default function FeedbackPortal() {
    return (
        <div className="bg-bg-1 border-2 border-ai-accent/20 rounded-[2.5rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-ai-accent/10 blur-[100px] pointer-events-none"></div>

            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-ai-accent/10 border border-ai-accent/20 flex items-center justify-center text-ai-accent shadow-xl shadow-ai-accent/20">
                        <Lightbulb size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider">Pulse Roadmap Participativo</h2>
                        <p className="text-text-3 text-sm font-medium">Suas ideias moldam o futuro do Naboah Pulse. Sugira e vote agora.</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-stroke pb-6">
                <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest">
                    {['Mais Votados', 'Recentes', 'Em Análise', 'Concluídos'].map((f, i) => (
                        <button key={i} className={`${i === 0 ? 'text-primary' : 'text-text-3 hover:text-white'} transition-colors relative`}>
                            {f}
                            {i === 0 && <div className="absolute -bottom-6 left-0 w-full h-1 bg-primary rounded-full"></div>}
                        </button>
                    ))}
                </div>
                <button className="bg-ai-accent hover:bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-black transition-all shadow-lg shadow-ai-accent/20 uppercase tracking-widest flex items-center gap-3">
                    <Plus size={16} /> SUGERIR RECURSO
                </button>
            </div>

            <div className="flex flex-col gap-6 relative z-10">
                {feedRequests.map((req) => (
                    <div key={req.id} className="bg-bg-0 border border-stroke rounded-[2rem] p-8 hover:border-ai-accent/50 transition-all flex gap-8 group">
                        {/* Vote Counter */}
                        <button className="flex flex-col items-center justify-center gap-2 min-w-[80px] h-[100px] border-2 border-stroke rounded-2xl bg-surface-1 group-hover:border-primary transition-all">
                            <ThumbsUp size={20} className="text-text-3 group-hover:text-primary transition-colors" />
                            <span className="text-xl font-black text-white leading-none">{req.votes}</span>
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-tighter">Votos</span>
                        </button>

                        <div className="flex-1 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${req.status === 'planned' ? 'bg-primary/10 border-primary text-primary' :
                                        req.status === 'in_progress' ? 'bg-warning/10 border-warning text-warning' :
                                            'bg-surface-2 border-stroke text-text-3'
                                    }`}>
                                    {req.status.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-2 text-text-3">
                                    <MessageCircle size={14} />
                                    <span className="text-[10px] font-black">{req.comments} comentários</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-ai-accent transition-colors cursor-pointer">{req.title}</h3>
                            <p className="text-sm text-text-3 leading-relaxed max-w-2xl">{req.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-surface-1/50 border border-stroke border-dashed rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-success" size={24} />
                    <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-white">Transparência Total</h4>
                        <p className="text-xs text-text-3">Atualizamos nosso roadmap semanalmente com base nos seus votos.</p>
                    </div>
                </div>
                <button className="text-xs font-bold text-white hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                    Ver Roadmap Completo <Clock size={14} />
                </button>
            </div>
        </div>
    );
}
