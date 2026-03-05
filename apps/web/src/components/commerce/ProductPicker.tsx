"use client";
import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, DollarSign, ExternalLink, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    sku: string;
    img: string;
};

export default function ProductPicker({ onSelect }: { onSelect?: (product: any) => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        apiGet<Product[]>('/commerce/products')
            .then(setProducts)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-bg-0 border border-stroke rounded-[2rem] p-6 w-[400px] shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} className="text-primary" /> Catalogo de Produtos
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
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="text-primary animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Package size={24} className="text-text-3" />
                        <p className="text-xs text-text-3">
                            {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
                        </p>
                    </div>
                ) : (
                    filtered.map(p => (
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
                                <span className="text-[9px] text-text-3 font-black uppercase tracking-tighter shrink-0">{p.sku} - {p.stock} em estoque</span>
                                <span className="text-[11px] font-black text-primary mt-1">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full py-3.5 bg-primary hover:bg-ai-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50" disabled={selected.length === 0}>
                <Plus size={14} /> GERAR LINK DE PAGAMENTO ({selected.length})
            </button>
        </div>
    );
}
