import React from 'react';
import { BookOpen, TrendingUp, AlertCircle, Quote, Sparkles, ChevronRight } from 'lucide-react';

export default function ExecutiveReport() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <BookOpen size={24} className="text-primary" /> Narrativa Executiva
                    </h3>
                    <p className="text-xs text-text-3 font-medium uppercase tracking-widest">Fevereiro 2024 • Gerado por Jarvis v3</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-text-3">
                    <Sparkles size={20} />
                </div>
            </div>

            <div className="flex flex-col gap-8 relative z-10">
                <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-white font-medium italic leading-relaxed">
                        "Este mês, o Naboah Pulse alcançou um ponto de inflexão estratégica. O crescimento orgânico superou as projeções em <span className="text-success font-black">12.4%</span>, impulsionado principalmente pela adoção massiva das novas ferramentas de White-label."
                    </p>
                    <div className="h-px w-20 bg-primary/30 my-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm text-text-2 leading-relaxed font-medium">
                        <p>
                            A rentabilidade por lead (LTV/CAC) estabilizou em **4.2x**, um recorde histórico para a plataforma. No entanto, observamos uma saturação precoce no mercado do Reino Unido, sugerindo que devemos pausar a expansão regional planejada na Phase 35 até otimizarmos o Tax Engine local.
                        </p>
                        <p>
                            <span className="text-primary font-black uppercase tracking-tighter italic mr-2">AVISO DE RISCO:</span>
                            A latência média na região da Irlanda (EU-West-1) subiu para **240ms**. Se não houver intervenção (faiolover manual via Dashboard de DR), projetamos uma perda de churn de **2%** na próxima semana.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5 relative z-10">
                {[
                    { label: 'Sentimento Global', value: 'Altamente Otimista', icon: TrendingUp, color: 'success' },
                    { label: 'Gargalo Principal', value: 'Latência EU-West-1', icon: AlertCircle, color: 'primary' },
                    { label: 'Confiança IA', value: '98.4%', icon: Sparkles, color: 'secondary' },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 p-6 bg-bg-0 border border-white/5 rounded-[2rem]">
                        <div className="flex items-center gap-3">
                            <stat.icon size={16} className={`text-${stat.color}`} />
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <span className="text-sm font-black text-white italic">{stat.value}</span>
                    </div>
                ))}
            </div>

            <button className="w-full py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl relative z-10">
                EXPORTAR RELATÓRIO PDF <ChevronRight size={18} />
            </button>

        </div>
    );
}
