'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InventoryManager from '@/components/commerce/InventoryManager';
import ConversationalPOS from '@/components/commerce/ConversationalPOS';
import { ShoppingCart, Truck, TrendingUp, Boxes, Zap, ArrowRight } from 'lucide-react';
import { apiGet } from '@/lib/api';

type Warehouse = {
    id: string;
    name: string;
    efficiency: number;
    load: string;
};

type ShippingOrder = {
    id: string;
    status: string;
};

type TabId = 'dashboard' | 'logistics' | 'warehouses';

export default function CommerceV2Dashboard() {
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [shipping, setShipping] = useState<ShippingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    useEffect(() => {
        Promise.all([
            apiGet<Warehouse[]>('/commerce/v2/warehouses').catch(() => []),
            apiGet<ShippingOrder[]>('/commerce/v2/shipping').catch(() => []),
        ]).then(([wh, sh]) => {
            setWarehouses(wh);
            setShipping(sh);
        }).finally(() => setLoading(false));
    }, []);

    const inTransit = shipping.filter(s => s.status === 'in_transit' || s.status === 'pending').length;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Commerce Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-br from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl">
                        <ShoppingCart size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Pulse Commerce <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full not-italic tracking-normal">VERSION 2.0</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Supply chain moderna. Experiência de venda conversacional.</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-hidden">
                    {(['dashboard', 'logistics', 'warehouses'] as TabId[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                                activeTab === tab
                                    ? 'bg-white/10 text-white'
                                    : 'text-text-3 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                {activeTab === 'dashboard' && (
                    <div className="lg:col-span-12 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Smart Retail & POS Terminal</h2>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
                                <Zap size={14} className="text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">POS Engine: Real-time Sync</span>
                            </div>
                        </div>
                        <ConversationalPOS />
                    </div>
                )}

                {(activeTab === 'dashboard' || activeTab === 'logistics') && (
                    <div className={`${activeTab === 'logistics' ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-6`}>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Supply Chain & Global Inventory</h2>
                        </div>
                        <InventoryManager />
                    </div>
                )}

                {(activeTab === 'dashboard' || activeTab === 'logistics') && (
                    <div className={`${activeTab === 'logistics' ? 'lg:col-span-12' : 'lg:col-span-4'} flex flex-col gap-8`}>
                    <div className="p-10 bg-gradient-to-br from-indigo-900/40 to-bg-1 border border-indigo-500/20 rounded-[3rem] shadow-2xl flex flex-col gap-8 relative overflow-hidden">
                        <Truck size={140} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest italic">Live Operations</span>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[40px] font-black text-white tracking-tighter leading-none italic">
                                    {loading ? '---' : inTransit}
                                </span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">PEDIDOS EM TRÂNSITO</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[40px] font-black text-white tracking-tighter leading-none italic">
                                    {loading ? '---' : warehouses.length > 0
                                        ? `${(warehouses.reduce((a, w) => a + w.efficiency, 0) / warehouses.length).toFixed(1)}%`
                                        : '---'}
                                </span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">STOCK ACCURACY</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                            <button onClick={() => router.push('/commerce/v2/shipping')} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">SHIPMENT TRACKER</span>
                                <ArrowRight size={14} className="text-indigo-400" />
                            </button>
                            <button onClick={() => router.push('/integrations')} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">CARRIER WEBHOOKS</span>
                                <ArrowRight size={14} className="text-indigo-400" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-8 shadow-xl">
                        <div className="flex items-center gap-3">
                            <Boxes size={20} className="text-secondary" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Warehouse Performance</span>
                        </div>

                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-3 w-24 bg-surface-2 rounded mb-2" />
                                        <div className="h-1.5 w-full bg-surface-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : warehouses.length === 0 ? (
                            <p className="text-sm text-text-3 text-center py-6">Nenhum warehouse configurado.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {warehouses.map((wh) => (
                                    <div key={wh.id} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold text-white uppercase">{wh.name}</span>
                                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{wh.efficiency}% Eff.</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${wh.efficiency >= 95 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${wh.efficiency}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {activeTab === 'warehouses' && (
                    <div className="lg:col-span-12 flex flex-col gap-8">
                        <div className="flex items-center gap-3">
                            <Boxes size={20} className="text-secondary" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">All Warehouses</span>
                        </div>
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-3 w-24 bg-surface-2 rounded mb-2" />
                                        <div className="h-1.5 w-full bg-surface-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : warehouses.length === 0 ? (
                            <p className="text-sm text-text-3 text-center py-6">Nenhum warehouse configurado.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {warehouses.map((wh) => (
                                    <div key={wh.id} className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-4 shadow-xl">
                                        <span className="text-sm font-bold text-white uppercase">{wh.name}</span>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Efficiency</span>
                                            <span className="text-2xl font-black text-white italic tracking-tighter">{wh.efficiency}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${wh.efficiency >= 95 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${wh.efficiency}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Load: {wh.load}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

        </div>
    );
}
