import React from 'react';
import ImageLab from '@/components/creative/ImageLab';
import MemeSprint from '@/components/creative/MemeSprint';
import AssetLibrary from '@/components/creative/AssetLibrary';
import { Palette, Sparkles, Filter, LayoutGrid, List } from 'lucide-react';

export default function ImageLabPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-secondary text-white flex items-center justify-center shadow-2xl">
                        <Palette size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Image Lab & Trends <span className="text-[10px] bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full not-italic tracking-normal">VISUAL ENGINE</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Transforme produtos em arte e capture tendências virais.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-text-3 hover:text-white cursor-pointer">
                        <LayoutGrid size={18} />
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-text-3 hover:text-white cursor-pointer">
                        <Filter size={18} />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-8">
                    <ImageLab />
                </div>

                <div className="lg:col-span-4">
                    <MemeSprint />
                </div>

                <div className="lg:col-span-12 mt-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles size={20} className="text-primary" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Latest Generation Projects</h2>
                    </div>
                    <AssetLibrary />
                </div>

            </div>

        </div>
    );
}
