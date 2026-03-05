"use client";
import React, { useEffect, useState } from 'react';
import { Users, Pin, Award, TrendingUp, Search, Plus, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type Topic = {
    id: string;
    title: string;
    author: string;
    category: string;
    replies: number;
    views: number;
    pinned: boolean;
    content: string;
};

export default function CommunityHub() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<Topic[]>('/community/topics')
            .then(setTopics)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-10">

                {/* Main Content: Topics Feed */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Comunidade Pulse</h2>
                            <p className="text-text-3 text-sm">Espaço para discussões, aprendizado e colaboração entre usuários.</p>
                        </div>
                        <button className="bg-primary hover:bg-ai-accent text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-3 group">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> NOVO TÓPICO
                        </button>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={16} />
                            <input type="text" placeholder="Pesquisar tópicos, perguntas ou anúncios..." className="w-full bg-bg-1 border border-stroke rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary outline-none transition-all" />
                        </div>
                    </div>

                    {/* Topics List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="text-primary animate-spin" />
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-bg-1 border border-dashed border-stroke rounded-[1.5rem]">
                            <Users size={32} className="text-text-3" />
                            <p className="text-sm text-text-3">Nenhum tópico na comunidade ainda.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {topics.map((topic) => (
                                <div key={topic.id} className="bg-bg-1 border border-stroke rounded-[1.5rem] p-6 hover:border-primary/50 transition-all group flex gap-6">
                                    <div className="flex flex-col items-center gap-1 justify-center min-w-[60px] border-r border-stroke pr-6">
                                        <span className="text-xl font-bold text-white leading-none">{topic.replies}</span>
                                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-tighter">Respostas</span>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            {topic.pinned && <Pin size={14} className="text-primary fill-primary" />}
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${topic.category === 'Announcements' ? 'bg-success/10 border-success/20 text-success' : 'bg-surface-2 border-stroke text-text-3'}`}>
                                                {topic.category}
                                            </span>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors cursor-pointer">{topic.title}</h3>
                                        </div>
                                        <p className="text-xs text-text-3 line-clamp-1">{topic.content}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                                                    {topic.author?.[0] ?? '?'}
                                                </div>
                                                <span className="text-[10px] text-text-3">Postado por <span className="text-white font-bold">{topic.author}</span></span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-stroke"></div>
                                            <span className="text-[10px] text-text-3">{topic.views} visualizações</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Trends & Gamification */}
                <div className="flex flex-col gap-8">
                    <div className="bg-bg-1 border border-stroke rounded-[2rem] p-6 flex flex-col gap-6">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Award size={16} className="text-warning" /> Top Contribuidores
                        </h4>
                        <div className="flex flex-col gap-4">
                            {[
                                { name: 'Ana Silva', points: '12.4k', badge: 'MVP' },
                                { name: 'Carla Dias', points: '8.9k', badge: 'Guru' },
                                { name: 'Dr. Paulo', points: '5.2k', badge: 'Auxiliar' },
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center text-xs font-bold text-white">
                                            {user.name[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white">{user.name}</span>
                                            <span className="text-[9px] text-success font-black">{user.badge}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-text-3">{user.points} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-bg-1 border border-stroke rounded-[2rem] p-6 flex flex-col gap-6">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-ai-accent" /> Assuntos do Momento
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {['#API_Voice', '#WebhookSetup', '#IA_Moderação', '#Vendas2026', '#MarketingFlows'].map((tag) => (
                                <span key={tag} className="text-[10px] font-bold bg-surface-2 border border-stroke px-3 py-1.5 rounded-xl text-text-3 hover:text-white hover:border-text-3 cursor-pointer transition-all">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
