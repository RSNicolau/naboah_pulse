"use client";

import React from 'react';
import { Ticket, Smartphone, Mail, MessageSquare, Tag } from 'lucide-react';
import type { ConversationSummary } from './ConversationList';

interface Props {
    conversation: ConversationSummary | null;
}

export default function ContextPanel({ conversation }: Props) {
    if (!conversation) {
        return (
            <div className="w-80 h-full bg-bg-1 border-l border-stroke flex items-center justify-center flex-shrink-0">
                <p className="text-xs text-text-3">Seleciona uma conversa</p>
            </div>
        );
    }

    const initials = conversation.contact_name
        .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="w-80 h-full bg-bg-1 border-l border-stroke overflow-y-auto flex-shrink-0">
            <div className="p-6 flex flex-col items-center gap-4 border-b border-stroke">
                <div className="w-20 h-20 rounded-full bg-surface-2 border border-stroke flex items-center justify-center text-2xl font-bold text-text-1">
                    {initials}
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white">{conversation.contact_name}</h3>
                    <div className="flex items-center gap-1.5 justify-center mt-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold
                            ${conversation.status === 'open' ? 'bg-success/10 text-success' :
                            conversation.status === 'pending' ? 'bg-warning/10 text-warning' :
                            'bg-surface-2 text-text-3'}`}>
                            {conversation.status}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-2 text-text-3 uppercase font-bold">
                            {conversation.channel}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-8">
                <div>
                    <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-4">Contacto</h4>
                    <div className="flex flex-col gap-3">
                        {conversation.contact_phone && (
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-4 h-4 text-text-3 flex-shrink-0" />
                                <span className="text-xs text-text-1">{conversation.contact_phone}</span>
                            </div>
                        )}
                        {conversation.intent && (
                            <div className="flex items-center gap-3">
                                <Tag className="w-4 h-4 text-text-3 flex-shrink-0" />
                                <span className="text-xs text-text-1 capitalize">{conversation.intent}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-text-3 flex-shrink-0" />
                            <span className="text-xs text-text-3 capitalize">{conversation.channel}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button className="w-full py-2.5 bg-surface-2 hover:bg-surface-1 border border-stroke rounded-xl text-white text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <Ticket className="w-4 h-4 text-primary" /> Criar Ticket
                    </button>
                    <button className="w-full py-2.5 bg-surface-2 hover:bg-surface-1 border border-stroke rounded-xl text-white text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-ai" /> Mover para CRM
                    </button>
                </div>
            </div>
        </div>
    );
}
