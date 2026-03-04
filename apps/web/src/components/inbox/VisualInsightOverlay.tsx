import React from 'react';
import { Eye, FileText, Package, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface VisualInsightProps {
    labels: string[];
    ocrText?: string;
    summary?: string;
}

export default function VisualInsightOverlay({ labels, ocrText, summary }: VisualInsightProps) {
    return (
        <div className="absolute inset-0 bg-bg-0/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col p-4 pointer-events-none group/overlay">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Eye size={16} />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Pulse Perception AI</span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {/* Labels */}
                <div className="flex flex-wrap gap-1.5">
                    {labels.map((label, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-[9px] font-bold text-white uppercase">
                            {label}
                        </span>
                    ))}
                </div>

                {/* OCR Section */}
                {ocrText && (
                    <div className="mt-auto bg-primary/10 border border-primary/30 rounded-xl p-3 flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-primary">
                            <FileText size={12} />
                            <span className="text-[9px] font-black uppercase">Texto Extraído (OCR)</span>
                        </div>
                        <p className="text-[10px] text-text-2 line-clamp-2 italic">"{ocrText}"</p>
                    </div>
                )}

                {/* Summary */}
                {summary && (
                    <div className="bg-ai-accent/10 border border-ai-accent/30 rounded-xl p-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-ai-accent">
                            <Sparkles size={12} />
                            <span className="text-[9px] font-black uppercase">Resumo Visual</span>
                        </div>
                        <p className="text-[10px] text-text-2 line-clamp-2 leading-tight">{summary}</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <CheckCircle size={10} className="text-success" />
                <span className="text-[8px] text-text-3 font-bold uppercase">Validado pelo Pulse AI Vision v4</span>
            </div>
        </div>
    );
}
