"use client";

import React, { useState, useEffect } from 'react';
import SynergyCanvas from '@/components/synergy/SynergyCanvas';
import { Share2, Settings2, Download, Maximize2, Users, MessageSquare, Loader2, X, Mail } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

type ChatMessage = { user: string; msg: string; time: string };

export default function SynergyPage() {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [roomName, setRoomName] = useState('QG Digital: Brainstorm Q1-2026');
    const [roomTag, setRoomTag] = useState('#strategy-04');
    const [activeUsers, setActiveUsers] = useState(0);
    const [chatLoading, setChatLoading] = useState(true);
    const [chatInput, setChatInput] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleChatSend = () => {
        if (!chatInput.trim()) return;
        const newMsg: ChatMessage = { user: 'Você', msg: chatInput.trim(), time: 'agora' };
        setChatMessages(prev => [...prev, newMsg]);
        setChatInput('');
    };

    const handleDownloadCanvas = () => {
        try {
            const canvasData = {
                room: roomName,
                tag: roomTag,
                activeUsers,
                messages: chatMessages,
                exportedAt: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'synergy-canvas-export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Canvas exportado');
        } catch {
            toast.error('Erro ao exportar canvas');
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviting(true);
        try {
            await apiPost('/synergy/rooms/invite', { email: inviteEmail.trim() });
            toast.success(`Convite enviado para ${inviteEmail}`);
            setInviteEmail('');
            setShowInviteModal(false);
        } catch {
            toast.error('Erro ao enviar convite');
        } finally {
            setInviting(false);
        }
    };

    useEffect(() => {
        apiGet('/synergy/rooms')
            .then((data: any) => {
                const rooms = Array.isArray(data) ? data : data?.items ?? [];
                if (rooms.length > 0) {
                    const room = rooms[0];
                    setRoomName(room.name ?? room.title ?? roomName);
                    setRoomTag(room.tag ?? room.slug ?? roomTag);
                    setActiveUsers(room.active_users ?? room.members?.length ?? 0);
                    const msgs = (room.messages ?? room.chat ?? []).map((m: any) => ({
                        user: m.user ?? m.author ?? m.sender ?? 'Unknown',
                        msg: m.msg ?? m.message ?? m.content ?? m.text ?? '',
                        time: m.time ?? m.timestamp ?? '',
                    }));
                    setChatMessages(msgs);
                }
            })
            .catch(() => toast.error('Erro ao carregar salas de sinergia'))
            .finally(() => setChatLoading(false));
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505]">

            {/* Synergy Top Bar */}
            <div className="h-20 px-10 border-b border-white/5 flex items-center justify-between bg-bg-1/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Multiplayer Mode</span>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                            {roomName} <span className="text-xs text-text-3 font-medium not-italic">{roomTag}</span>
                        </h1>
                    </div>
                    <div className="h-8 w-px bg-white/5"></div>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <Users size={14} className="text-text-3" />
                        <span className="text-[10px] font-bold text-white uppercase">{activeUsers} Ativos</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadCanvas}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-3 hover:text-white transition-all"
                    >
                        <Download size={20} />
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${showSettings ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/5 text-text-3 hover:text-white'}`}
                    >
                        <Settings2 size={20} />
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Share2 size={16} /> CONVIDAR TIME
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
                <SynergyCanvas />

                {/* Settings Panel */}
                {showSettings && (
                    <div className="absolute right-10 top-10 w-80 bg-bg-1/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl z-20">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Canvas Settings</span>
                            <button onClick={() => setShowSettings(false)} className="text-text-3 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-text-2">Grid Snapping</span>
                                <div className="w-8 h-4 bg-primary rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-text-2">Auto-save</span>
                                <div className="w-8 h-4 bg-primary rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-text-2">Show Cursors</span>
                                <div className="w-8 h-4 bg-success rounded-full"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Synergy Floating Chat Preview */}
                <div className="absolute left-10 bottom-10 w-96 bg-bg-1/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <MessageSquare size={18} className="text-primary" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Synergy Chat</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {chatLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 size={20} className="text-primary animate-spin" />
                            </div>
                        ) : chatMessages.length > 0 ? (
                            chatMessages.map((c, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-text-3 uppercase">{c.user}</span>
                                        <span className="text-[8px] text-text-3 font-medium">{c.time}</span>
                                    </div>
                                    <p className="text-[11px] text-text-2 leading-relaxed">{c.msg}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-text-3 italic text-center py-4">Nenhuma mensagem ainda.</p>
                        )}
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleChatSend(); } }}
                            placeholder="Digite sua ideia aqui..."
                            className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-[10px] font-medium text-white placeholder:text-text-3 outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 w-full max-w-md shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Mail size={16} className="text-primary" /> Convidar para o Time
                            </h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-text-3 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-text-3 uppercase tracking-widest">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colega@empresa.com"
                                    className="w-full bg-bg-0 border border-stroke rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-text-3 outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={inviting}
                                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                            >
                                {inviting ? 'ENVIANDO...' : 'ENVIAR CONVITE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
