import React from 'react';
import { BookMarked, Search, Plus, ExternalLink, Database, Link as LinkIcon, FileCheck } from 'lucide-react';

export default function KnowledgePackManager() {
    const packs = [
        { id: '1', name: 'Brand Guidelines 2024', sources: 4, type: 'Internal', last_update: '2h ago' },
        { id: '2', name: 'Product Manuals (X-Series)', sources: 12, type: 'Technical', last_update: '1d ago' },
        { id: '3', name: 'Community FAQ & Wiki', sources: 28, type: 'Customer Support', last_update: '5m ago' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <BookMarked size={24} className="text-secondary" /> Knowledge Packs
                    </h3>
                    <p className="text-xs text-text-3 font-medium uppercase tracking-widest">Data Ingestion & Context</p>
                </div>
                <button className="px-6 py-3 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-secondary/20">
                    INGEST DATA
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {packs.map((p, i) => (
                    <div key={i} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-6 hover:border-secondary/30 transition-all cursor-pointer group/item">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                                    <Database size={20} />
                                </div>
                                <span className="text-lg font-black text-white uppercase tracking-tighter italic">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-text-3 uppercase">{p.type}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <FileCheck size={14} className="text-secondary" />
                                    <span className="text-[10px] font-bold text-white">{p.sources} Fontes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={14} className="text-text-3" />
                                    <span className="text-[10px] font-bold text-text-3">{p.last_update}</span>
                                </div>
                            </div>
                            <button className="text-[9px] font-black text-white/40 uppercase hover:text-white transition-all flex items-center gap-2">
                                VIEW SOURCES <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
