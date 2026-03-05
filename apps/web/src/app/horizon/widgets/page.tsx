'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WidgetStudio from '@/components/horizon/WidgetStudio';
import { Globe, Plus, Settings2, BarChart, ExternalLink, Zap, X } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function HorizonWidgetsPage() {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [widgetName, setWidgetName] = useState('');
    const [widgetType, setWidgetType] = useState('chat');
    const [creating, setCreating] = useState(false);

    const handleCreateWidget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!widgetName.trim()) return;
        setCreating(true);
        try {
            await apiPost('/widgets/configs', { name: widgetName, type: widgetType });
            toast.success('Widget criado com sucesso!');
            setShowCreateModal(false);
            setWidgetName('');
            setWidgetType('chat');
        } catch {
            toast.error('Erro ao criar widget.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Create Widget Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <form onSubmit={handleCreateWidget} className="bg-bg-1 border border-stroke rounded-3xl p-10 w-full max-w-md flex flex-col gap-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">New Widget</h3>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="text-text-3 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-3 uppercase tracking-widest">Widget Name</label>
                            <input type="text" value={widgetName} onChange={(e) => setWidgetName(e.target.value)} placeholder="Meu Widget" className="w-full px-4 py-3 bg-bg-0 border border-stroke rounded-xl text-white text-sm focus:outline-none focus:border-secondary" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-3 uppercase tracking-widest">Type</label>
                            <select value={widgetType} onChange={(e) => setWidgetType(e.target.value)} className="w-full px-4 py-3 bg-bg-0 border border-stroke rounded-xl text-white text-sm focus:outline-none focus:border-secondary">
                                <option value="chat">Chat</option>
                                <option value="form">Form</option>
                                <option value="banner">Banner</option>
                            </select>
                        </div>
                        <button type="submit" disabled={creating} className="w-full py-4 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                            {creating ? 'CRIANDO...' : 'CRIAR WIDGET'}
                        </button>
                    </form>
                </div>
            )}

            {/* Page Header */}
            <div className="px-10 py-8 border-b border-stroke flex items-center justify-between bg-bg-1/50 backdrop-blur-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-2xl shadow-secondary/20">
                        <Globe size={28} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase tracking-widest flex items-center gap-3">
                            Pulse Horizon <span className="text-[10px] px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-md italic">Public SDK v1.0</span>
                        </h1>
                        <p className="text-text-3 font-medium text-sm">Gerencie seus pontos de contato externos e integre o Pulse AI em qualquer lugar.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/analytics')} className="flex items-center gap-2 px-6 py-3 bg-surface-2 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-bg-0 transition-all">
                        <BarChart size={16} /> ANALYTICS
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20">
                        <Plus size={16} /> NEW WIDGET
                    </button>
                </div>
            </div>

            <WidgetStudio />

            {/* Horizon Status Footer */}
            <div className="h-10 px-10 border-t border-stroke bg-bg-1 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-secondary" />
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Horizon Event Stream: Connected</span>
                    </div>
                    <span className="text-[9px] font-bold text-text-2">Active Touchpoints: 12</span>
                </div>
                <div className="text-[9px] font-black text-text-3 uppercase tracking-widest flex items-center gap-2">
                    <ExternalLink size={12} /> Documentation Portal
                </div>
            </div>

        </div>
    );
}
