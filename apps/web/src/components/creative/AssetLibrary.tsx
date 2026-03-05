"use client";

import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Video, Download, Info, History, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type ContentAsset = {
    id: string;
    title: string;
    type: string;
    url: string;
    status: string;
    risk_score: number;
    created_at: string;
};

export default function AssetLibrary() {
    const [assets, setAssets] = useState<ContentAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<ContentAsset[]>('/content/assets')
            .then(setAssets)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function timeAgo(iso: string): string {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Media Asset Library</h2>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Multi-tenant Provenance Engine Active</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                        Bulk Rights Check
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-primary animate-spin" />
                </div>
            ) : assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-bg-1 border border-dashed border-stroke rounded-[2.5rem]">
                    <ImageIcon size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum asset disponível.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assets.map((asset) => (
                        <div key={asset.id} className="group relative bg-bg-1 border border-stroke rounded-[2.5rem] overflow-hidden hover:border-primary/40 transition-all shadow-2xl">

                            {/* Preview Aspect Ratio Box */}
                            <div className="aspect-[4/5] bg-bg-0 relative overflow-hidden">
                                {asset.type === 'image' && asset.url ? (
                                    <img src={asset.url} alt={asset.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                        <Video size={48} className="text-primary/20" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${asset.status === 'approved' || asset.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}></span>
                                    <span className="text-[8px] font-black text-white uppercase">{asset.status}</span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col gap-6">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-lg font-black text-white italic truncate uppercase tracking-tighter">{asset.title}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">{timeAgo(asset.created_at)}</span>
                                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Risk: {asset.risk_score?.toFixed(2) ?? '0.00'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-bg-0 border border-white/5 rounded-xl text-text-3 hover:text-white transition-all"><Download size={16} /></button>
                                        <button className="p-3 bg-bg-0 border border-white/5 rounded-xl text-text-3 hover:text-white transition-all"><History size={16} /></button>
                                    </div>
                                    <button className="px-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                        ACTIVATE
                                    </button>
                                </div>
                            </div>

                            {/* Hover Actions: Info / Provenance */}
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 duration-300">
                                <button className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl text-white pointer-events-auto hover:bg-white/10">
                                    <Info size={18} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
