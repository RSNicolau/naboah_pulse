'use client';
import React, { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, AlertCircle, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type ExecutiveReportData = {
    period: string;
    narrative_html: string;
    key_metrics_json: string;
};

export default function ExecutiveReport() {
    const [report, setReport] = useState<ExecutiveReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<ExecutiveReportData>('/insights/v3/reports/executive/monthly')
            .then(setReport)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    let metrics: { label: string; value: string }[] = [];
    try {
        if (report?.key_metrics_json) {
            metrics = JSON.parse(report.key_metrics_json);
        }
    } catch {}

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <BookOpen size={24} className="text-primary" /> Narrativa Executiva
                    </h3>
                    <p className="text-xs text-text-3 font-medium uppercase tracking-widest">
                        {report ? `${report.period} • Gerado por Pulse AI` : 'Carregando...'}
                    </p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-text-3">
                    <Sparkles size={20} />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-primary animate-spin" />
                </div>
            ) : !report ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <BookOpen size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum relatório executivo disponível.</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-8 relative z-10">
                        <div className="prose prose-invert max-w-none">
                            {report.narrative_html ? (
                                <div
                                    className="text-xl text-white font-medium italic leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: report.narrative_html }}
                                />
                            ) : (
                                <p className="text-xl text-white font-medium italic leading-relaxed">
                                    Relatório do período: {report.period}. Dados gerados pelo Pulse AI.
                                </p>
                            )}
                        </div>
                    </div>

                    {metrics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5 relative z-10">
                            {metrics.slice(0, 3).map((stat, i) => (
                                <div key={i} className="flex flex-col gap-2 p-6 bg-bg-0 border border-white/5 rounded-[2rem]">
                                    <div className="flex items-center gap-3">
                                        {i === 0 ? <TrendingUp size={16} className="text-success" /> :
                                         i === 1 ? <AlertCircle size={16} className="text-primary" /> :
                                         <Sparkles size={16} className="text-secondary" />}
                                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-white italic">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <button className="w-full py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl relative z-10">
                EXPORTAR RELATÓRIO PDF <ChevronRight size={18} />
            </button>

        </div>
    );
}
