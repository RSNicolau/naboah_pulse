"use client";
import React, { useState } from 'react';
import { Search, Package, Plus, DollarSign, ExternalLink, Image as ImageIcon, Check } from 'lucide-react';

const mockProducts = [
    { id: '1', name: 'iPhone 15 Pro', price: 7999, stock: 12, sku: 'IPH-15P', img: 'https://placehold.co/80x80/0066FF/white?text=iPhone' },
    { id: '2', name: 'MacBook Air M3', price: 12499, stock: 5, sku: 'MAC-AIR-M3', img: 'https://placehold.co/80x80/0066FF/white?text=MacBook' },
    { id: '3', name: 'AirPods Pro 2', price: 2499, stock: 25, sku: 'APRD-P2', img: 'https://placehold.co/80x80/0066FF/white?text=AirPods' },
];

export default function ProductPicker({ onSelect }: { onSelect?: (product: any) => void }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="bg-bg-0 border border-stroke rounded-[2rem] p-6 w-[400px] shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} className="text-primary" /> Catálogo de Produtos
                </h3>
                <button className="text-text-3 hover:text-white transition-colors"><ExternalLink size={14} /></button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={14} />
                <input
                    placeholder="Buscar no estoque..."
                    className="w-full bg-bg-1 border border-stroke rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-all font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {mockProducts.map(p => (
                    <div
                        key={p.id}
                        onClick={() => toggleSelect(p.id)}
                        className={`p-3 bg-bg-1 border rounded-2xl flex items-center gap-4 transition-all cursor-pointer group ${selected.includes(p.id) ? 'border-primary shadow-lg shadow-primary/5 bg-primary/5' : 'border-stroke hover:border-text-3'}`}
                    >
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-stroke relative shrink-0">
                            <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                            {selected.includes(p.id) && (
                                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center text-white">
                                    <Check size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-white truncate">{p.name}</span>
                            <span className="text-[9px] text-text-3 font-black uppercase tracking-tighter shrink-0">{p.sku} • {p.stock} em estoque</span>
                            <span className="text-[11px] font-black text-primary mt-1">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-3.5 bg-primary hover:bg-ai-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50" disabled={selected.length === 0}>
                <Plus size={14} /> GERAR LINK DE PAGAMENTO ({selected.length})
            </button>
        </div>
    );
}
