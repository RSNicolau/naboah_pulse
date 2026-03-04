import React from 'react';
import { Package, Warehouse, ArrowDownUp, AlertCircle, ShoppingCart, Tag, Filter, Search } from 'lucide-react';

export default function InventoryManager() {
    const stock = [
        { sku: 'PULSE-TSHIRT-B', name: 'Pulse Edition T-Shirt (Black)', stock: 145, warehouse: 'Central SP', status: 'Optimal' },
        { sku: 'PULSE-MUG-W', name: 'Neural Mug (White)', stock: 12, warehouse: 'Central SP', status: 'Low Stock' },
        { sku: 'PULSE-KEY-ALU', name: 'Exclusive Keycap (Aluminum)', stock: 54, warehouse: 'Porto Hub', status: 'Optimal' },
        { sku: 'PULSE-PAD-RGB', name: 'Synergy Deskmat (RGB)', stock: 0, warehouse: 'Central SP', status: 'Out of Stock' },
    ];

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
                    <button className="p-4 bg-bg-0 border border-white/5 rounded-2xl text-text-3 hover:text-white transition-all">
                        <Filter size={20} />
                    </button>
                    <button className="px-8 py-4 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20">
                        STOCK RECONCILIATION
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total SKUs', value: '1,420' },
                    { label: 'Warehouses', value: '4 Ativos' },
                    { label: 'Low Stock Alarms', value: '12', alert: true },
                    { label: 'Pending Restocks', value: '8' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-bg-0 border border-white/5 rounded-3xl flex flex-col gap-1">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                        <span className={`text-2xl font-black italic tracking-tighter ${stat.alert ? 'text-primary' : 'text-white'}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                {stock.map((item, i) => (
                    <div key={i} className="group/item flex items-center justify-between p-6 bg-surface-2/30 border border-white/5 rounded-[2rem] hover:border-secondary/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.status === 'Optimal' ? 'bg-success/10 text-success' :
                                    item.status === 'Low Stock' ? 'bg-primary/10 text-primary animate-pulse' :
                                        'bg-error/10 text-error'
                                }`}>
                                <Tag size={20} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-black text-white tracking-widest uppercase italic">{item.name}</span>
                                <span className="text-[9px] font-bold text-text-3 uppercase tracking-tighter">{item.sku} • {item.warehouse}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-white">{item.stock}</span>
                                <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Available</span>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${item.status === 'Optimal' ? 'bg-success/10 text-success border-success/20' :
                                    item.status === 'Low Stock' ? 'bg-primary/10 text-primary border-primary/20' :
                                        'bg-error/10 text-error border-error/20'
                                }`}>
                                {item.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl flex items-center gap-4">
                <AlertCircle size={20} className="text-secondary" />
                <p className="text-[10px] text-text-2 leading-relaxed italic">
                    **Pulse Insight**: O consumo de `Neural Mug` subiu em Porto Hub. Sugiro mover 20 unidades do armazém Central SP amanha.
                </p>
            </div>

        </div>
    );
}
