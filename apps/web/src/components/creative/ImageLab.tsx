"use client";

import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Wand2, Layout, Sliders, Check, Loader2 } from 'lucide-react';

const scenePresets = [
    { id: 'studio', name: 'Pro Studio', desc: 'Clean, minimalist lighting', color: 'bg-primary' },
    { id: 'lifestyle', name: 'Lifestyle', desc: 'Natural home/office setting', color: 'bg-secondary' },
    { id: 'outdoor', name: 'Nature', desc: 'Cinematic outdoor lighting', color: 'bg-success' },
    { id: 'cyberpunk', name: 'Neon Night', desc: 'Futuristic urban aesthetic', color: 'bg-primary' },
];

export default function ImageLab() {
    const [selectedPreset, setSelectedPreset] = useState(scenePresets[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setResultImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30');
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <ImageIcon size={24} className="text-primary" /> Multi-Scene Image Lab
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Product-to-Scene Neural Engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Controls & Upload */}
                <div className="flex flex-col gap-8">
                    <div className="p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all cursor-pointer bg-bg-0/30">
                        <Upload size={32} className="text-text-3" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Drop Product Photo</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Choose Scene Style</span>
                        <div className="grid grid-cols-2 gap-4">
                            {scenePresets.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset)}
                                    className={`p-6 border rounded-[2rem] flex flex-col gap-2 transition-all text-left relative overflow-hidden ${selectedPreset.id === preset.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-bg-0 hover:border-white/20'}`}
                                >
                                    <span className="text-xs font-black text-white uppercase tracking-tighter italic truncate">{preset.name}</span>
                                    <span className="text-[9px] text-text-3 font-medium uppercase truncate">{preset.desc}</span>
                                    {selectedPreset.id === preset.id && <Check size={14} className="absolute top-4 right-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        {isGenerating ? 'GENERATING SCENE...' : 'GENERATE HD SCENE'}
                    </button>
                </div>

                {/* Right: Preview */}
                <div className="relative aspect-square bg-bg-0 rounded-[2.5rem] border border-white/5 overflow-hidden flex items-center justify-center">
                    {resultImage ? (
                        <img src={resultImage} alt="Result" className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-text-3">
                            <Sparkles size={48} className="opacity-10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest italic opacity-30">Preview Result</span>
                        </div>
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 size={32} className="text-white animate-spin" />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
