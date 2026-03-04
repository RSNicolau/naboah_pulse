import React from 'react';
import CurrencySelector from '@/components/global/CurrencySelector';
import LocalizedCalendar from '@/components/global/LocalizedCalendar';
import { Globe, Languages, DollarSign, Calculator, Map, ShieldCheck, ChevronRight } from 'lucide-react';

export default function GlobalSettingsPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Global Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center shadow-xl">
                        <Globe size={32} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase tracking-widest italic">
                            Pulse Global
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Internacionalize sua operação em segundos.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-[2rem] border border-white/10">
                    <Languages size={18} className="text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Active Languages</span>
                        <span className="text-[10px] font-bold text-white uppercase">6 Idiomas Ativos</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Internationalization Engine</h2>
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-10">
                    <LocalizedCalendar />
                    <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                    <Calculator size={20} className="text-primary" /> Regional Tax Rules
                                </h3>
                                <p className="text-[10px] font-medium text-text-3">Configure VAT, GST e impostos locais.</p>
                            </div>
                            <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                ADD RULE
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {[
                                { country: 'Portugal', tax: 'VAT (IVA)', rate: '23%', status: 'Active' },
                                { country: 'Brasil', tax: 'ICMS', rate: '18%', status: 'Active' },
                                { country: 'USA (CA)', tax: 'Sales Tax', rate: '7.25%', status: 'Experimental' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-bg-0 border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Map size={16} className="text-text-3" />
                                        <span className="text-xs font-bold text-white">{rule.country}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{rule.tax}</span>
                                        <span className="text-sm font-black text-white">{rule.rate}</span>
                                        <ChevronRight size={14} className="text-text-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-10">
                    <CurrencySelector />

                    <div className="bg-gradient-to-br from-bg-1 to-bg-0 border border-white/10 rounded-[3rem] p-10 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
                        <ShieldCheck size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-success/20 text-success flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Compliance Guardian</span>
                        </div>
                        <h4 className="text-lg font-black text-white tracking-widest uppercase leading-tight italic">
                            Seus dados protegidos <br /> em escala global.
                        </h4>
                        <p className="text-[11px] text-text-2 leading-relaxed">
                            O Pulse Global garante que todas as transações e armazenamentos de dados respeitem a LGPD, GDPR e CCPA automaticamente.
                        </p>
                        <button className="mt-4 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                            VIEW COMPLIANCE LOGS
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
