import React from 'react';
import AvatarLab from '@/components/creative/AvatarLab';
import VideoLab from '@/components/creative/VideoLab';
import AssetLibrary from '@/components/creative/AssetLibrary';
import { UserSquare2, Sparkles, Filter, LayoutGrid, Zap } from 'lucide-react';

export default function AvatarLabPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0 relative">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl rotate-3">
                        <UserSquare2 size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Avatar Lab & Cinema <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full not-italic tracking-normal">CHARACTER ENGINE</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Crie personas sintetizadas e renderize vídeos multimodais.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <Zap size={16} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural GPU: 94% Active</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12">
                    <AvatarLab />
                </div>

                <div className="lg:col-span-12 mt-4">
                    <VideoLab />
                </div>

                <div className="lg:col-span-12 mt-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles size={20} className="text-primary" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Cinematic Project Exports</h2>
                    </div>
                    <AssetLibrary />
                </div>

            </div>

        </div>
    );
}
