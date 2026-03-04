"use client";

import React, { useState } from 'react';
import ConversationList, { type ConversationSummary } from '@/components/inbox/ConversationList';
import MessageThread from '@/components/inbox/MessageThread';
import ContextPanel from '@/components/inbox/ContextPanel';
import IntakeTabs from '@/components/inbox/IntakeTabs';
import IntakeItemViewer from '@/components/inbox/IntakeItemViewer';
import { Sparkles, FileStack } from 'lucide-react';

export default function InboxPage() {
    const [activeTab, setActiveTab] = useState<'inbox' | 'intake'>('inbox');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedConv, setSelectedConv] = useState<ConversationSummary | null>(null);

    const handleSelect = (id: string, conv: ConversationSummary) => {
        setSelectedId(id);
        setSelectedConv(conv);
    };

    const mockIntakeItems = [
        { id: '1', source: 'WhatsApp', type: 'audio', title: 'Brainstorm Campanha Black Friday', timestamp: '14:20', intent: 'content' },
        { id: '2', source: 'Telegram', type: 'pdf', title: 'Briefing Produto: Pulse X1', timestamp: 'Ontem', intent: 'ads' },
        { id: '3', source: 'Manual Upload', type: 'xlsx', title: 'Tabela de Preços Q4', timestamp: '10:05', intent: 'ops' },
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden bg-bg-0">
            <IntakeTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex flex-1 overflow-hidden">
                {activeTab === 'inbox' ? (
                    <>
                        <ConversationList
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />
                        <MessageThread
                            conversationId={selectedId}
                            contactName={selectedConv?.contact_name ?? ''}
                            channel={selectedConv?.channel ?? ''}
                        />
                        <ContextPanel conversation={selectedConv} />
                    </>
                ) : (
                    <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar">
                        <div className="lg:col-span-8 flex flex-col gap-10">
                            <div className="flex items-center gap-3">
                                <FileStack size={20} className="text-primary" />
                                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Pending Intake Items</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {mockIntakeItems.map(item => (
                                    <IntakeItemViewer key={item.id} item={item} />
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-10">
                            <div className="p-10 bg-gradient-to-br from-primary/20 to-bg-1 border border-primary/20 rounded-[3rem] shadow-2xl flex flex-col gap-8 relative overflow-hidden">
                                <Sparkles size={140} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Pulse Intelligence</span>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Automated Job Builder</h3>
                                </div>
                                <p className="text-[11px] text-text-3 font-medium leading-relaxed italic">
                                    "Identifiquei que 40% das mensagens de áudio deste mês sugerem campanhas de vídeo UGC. Deseja iniciar um pipeline para o 'Avatar Ultra-Realista' amanhã?"
                                </p>
                                <button className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                    CONFIGURE NEW JOB
                                </button>
                            </div>

                            <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-6">
                                <h4 className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em]">Quick Persona Switcher</h4>
                                <div className="flex flex-col gap-4">
                                    {['Brand Default', 'Luxury Persona', 'Street Style'].map(p => (
                                        <div key={p} className="px-6 py-4 bg-bg-0 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                                            <span className="text-xs font-black text-white uppercase tracking-tighter">{p}</span>
                                            <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
