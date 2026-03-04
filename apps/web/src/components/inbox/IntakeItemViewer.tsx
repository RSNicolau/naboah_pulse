import React from 'react';
import { FileText, Mic, Play, MoreHorizontal, CheckCircle2, AlertCircle, FileSpreadsheet, LayoutGrid } from 'lucide-react';

interface IntakeItem {
    id: string;
    source: string;
    type: string;
    title: string;
    timestamp: string;
    intent: string;
}

export default function IntakeItemViewer({ item }: { item: IntakeItem }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'audio': return <Mic size={24} className="text-primary" />;
            case 'pdf': return <FileText size={24} className="text-secondary" />;
            case 'xlsx': return <FileSpreadsheet size={24} className="text-success" />;
            case 'video': return <Play size={24} className="text-primary" />;
            default: return <LayoutGrid size={24} className="text-text-3" />;
        }
    };

    return (
        <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-8 group hover:border-primary/30 transition-all cursor-pointer shadow-xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-bg-0 border border-white/5 flex items-center justify-center">
                        {getIcon(item.type)}
                    </div>
                    <div className="flex flex-col gap-1">
                        <h4 className="text-lg font-black text-white italic truncate max-w-[200px] uppercase tracking-tighter">{item.title}</h4>
                        <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">{item.source} • {item.timestamp}</span>
                    </div>
                </div>
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <span className="text-[8px] font-black text-primary uppercase">{item.intent}</span>
                </div>
            </div>

            <div className="bg-bg-0/50 p-6 rounded-3xl border border-white/5">
                <p className="text-xs text-text-2 font-medium italic leading-relaxed">
                    {item.type === 'audio' ? 'Mensagem de voz de 45 segundos detectada. "Precisamos de um anúncio de Black Friday..." ' : `Documento ${item.type.toUpperCase()} pronto para parsing estratégico.`}
                </p>
            </div>

            <div className="flex gap-4">
                <button className="flex-1 py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                    PROCESS JOB
                </button>
                <button className="p-4 bg-bg-0 border border-white/10 rounded-2xl text-text-3 hover:text-white">
                    <MoreHorizontal size={18} />
                </button>
            </div>

        </div>
    );
}
