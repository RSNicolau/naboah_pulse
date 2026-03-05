'use client';
import React, { useEffect, useState } from 'react';
import { Package, AlertCircle, Tag, Filter, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type SKU = {
    id: string;
    sku: string;
    name: string;
    stock: number;
    warehouse: string;
    status: string;
};

export default function InventoryManager() {
    const [skus, setSkus] = useState<SKU[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        apiGet<SKU[]>('/commerce/v2/skus')
            .then(setSkus)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const warehouses = Array.from(new Set(skus.map(s => s.warehouse)));

    const filteredSkus = skus.filter(s => {
        if (filterWarehouse !== 'all' && s.warehouse !== filterWarehouse) return false;
        if (filterStatus === 'low' && s.stock >= 15) return false;
        if (filterStatus === 'out' && s.stock > 0) return false;
        if (filterStatus === 'optimal' && s.stock < 15) return false;
        return true;
    });

    const lowStockCount = skus.filter(s => s.status === 'Low Stock' || s.stock < 15).length;
    const outOfStockCount = skus.filter(s => s.status === 'Out of Stock' || s.stock === 0).length;

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl overflow-hidden relative group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Package size={24} className="text-secondary" /> Global Inventory
                    </h3>
                    <p className="text-xs text-text-3 font-medium">Orquestração unificada de digital & físico.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`p-4 bg-bg-0 border rounded-2xl transition-all ${showFilter ? 'border-primary text-primary' : 'border-white/5 text-text-3 hover:text-white'}`}
                    >
                        <Filter size={20} />
                    </button>
                    <button className="px-8 py-4 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20">
                        STOCK RECONCILIATION
                    </button>
                </div>
            </div>

            {showFilter && (
                <div className="flex flex-wrap gap-4 p-6 bg-bg-0 border border-stroke rounded-2xl animate-in fade-in">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-text-3 uppercase tracking-widest">Warehouse</label>
                        <select
                            value={filterWarehouse}
                            onChange={(e) => setFilterWarehouse(e.target.value)}
                            className="bg-surface-1 border border-stroke rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-primary"
                        >
                            <option value="all">Todos</option>
                            {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-text-3 uppercase tracking-widest">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-surface-1 border border-stroke rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-primary"
                        >
                            <option value="all">Todos</option>
                            <option value="optimal">Optimal</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total SKUs', value: loading ? '---' : skus.length.toLocaleString() },
                    { label: 'Warehouses', value: loading ? '---' : `${new Set(skus.map(s => s.warehouse)).size} Ativos` },
                    { label: 'Low Stock Alarms', value: loading ? '---' : String(lowStockCount), alert: lowStockCount > 0 },
                    { label: 'Out of Stock', value: loading ? '---' : String(outOfStockCount) },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-bg-0 border border-white/5 rounded-3xl flex flex-col gap-1">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                        <span className={`text-2xl font-black italic tracking-tighter ${stat.alert ? 'text-primary' : 'text-white'}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-secondary animate-spin" />
                </div>
            ) : filteredSkus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Package size={28} className="text-text-3" />
                    <p className="text-sm text-text-3">
                        {skus.length === 0 ? 'Nenhum SKU cadastrado.' : 'Nenhum SKU corresponde aos filtros.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredSkus.map((item) => (
                        <div key={item.id} className="group/item flex items-center justify-between p-6 bg-surface-2/30 border border-white/5 rounded-[2rem] hover:border-secondary/30 transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    item.stock > 15 ? 'bg-success/10 text-success' :
                                    item.stock > 0 ? 'bg-primary/10 text-primary animate-pulse' :
                                    'bg-error/10 text-error'
                                }`}>
                                    <Tag size={20} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-black text-white tracking-widest uppercase italic">{item.name}</span>
                                    <span className="text-[9px] font-bold text-text-3 uppercase tracking-tighter">{item.sku} - {item.warehouse}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-black text-white">{item.stock}</span>
                                    <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Available</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                    item.stock > 15 ? 'bg-success/10 text-success border-success/20' :
                                    item.stock > 0 ? 'bg-primary/10 text-primary border-primary/20' :
                                    'bg-error/10 text-error border-error/20'
                                }`}>
                                    {item.stock > 15 ? 'Optimal' : item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl flex items-center gap-4">
                <AlertCircle size={20} className="text-secondary" />
                <p className="text-[10px] text-text-2 leading-relaxed italic">
                    <span className="font-bold text-white">Pulse Insight:</span> {lowStockCount > 0
                        ? `${lowStockCount} SKU(s) com estoque baixo detectado(s). Sugiro reconciliação de estoque.`
                        : 'Todos os SKUs estão com estoque otimizado.'}
                </p>
            </div>

        </div>
    );
}
