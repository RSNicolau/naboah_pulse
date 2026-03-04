import React from 'react';
import { Database, Globe, Trash2, Shield, AlertTriangle, Cloud } from 'lucide-react';

export default function DataGovernance() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Database className="text-primary w-6 h-6" /> Governança de Dados
                </h3>
                <p className="text-text-3 text-xs uppercase font-bold tracking-widest">Controle de Residência e Retenção de Dados</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Residency */}
                <div className="flex flex-col gap-6 p-6 bg-bg-0 rounded-2xl border border-stroke">
                    <div className="flex items-center gap-3 text-white">
                        <Globe className="text-ai-accent" size={20} />
                        <span className="font-bold text-sm">Residência de Dados</span>
                    </div>
                    <p className="text-xs text-text-3 leading-relaxed">Selecione onde os dados do seu tenant serão armazenados fisicamente. Esta configuração é permanente.</p>
                    <div className="flex flex-col gap-2">
                        {[
                            { id: 'br', label: 'Brasil (AWS sa-east-1)', active: true, tag: 'LGPD' },
                            { id: 'us', label: 'EUA (AWS us-east-1)', active: false, tag: 'Standard' },
                            { id: 'eu', label: 'Europa (GCP europe-west3)', active: false, tag: 'GDPR' },
                        ].map((region) => (
                            <button key={region.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${region.active ? 'bg-primary/10 border-primary text-white' : 'bg-surface-1 border-stroke text-text-3 hover:border-text-2'}`}>
                                <div className="flex items-center gap-3">
                                    <Cloud size={16} />
                                    <span className="text-xs font-bold">{region.label}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase bg-bg-1 px-1.5 py-0.5 rounded border border-stroke">{region.tag}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Retention */}
                <div className="flex flex-col gap-6 p-6 bg-bg-0 rounded-2xl border border-stroke">
                    <div className="flex items-center gap-3 text-white">
                        <Trash2 className="text-error" size={20} />
                        <span className="font-bold text-sm">Política de Retenção</span>
                    </div>
                    <p className="text-xs text-text-3 leading-relaxed">Determine o tempo máximo de vida dos dados históricos (mensagens, logs de auditoria e tickets).</p>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-3 uppercase tracking-tighter">Período de Retenção (Dias)</label>
                            <input type="number" defaultValue={365} className="bg-surface-1 border border-stroke rounded-xl p-3 text-sm text-white focus:border-primary outline-none" />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                            <AlertTriangle className="text-warning flex-shrink-0" size={16} />
                            <p className="text-[9px] text-warning leading-tight font-bold">Aviso: Dados serão permanentemente deletados após o período estipulado.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-stroke flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-3">
                    <Shield size={14} />
                    <span className="text-[10px] font-medium italic">Alterações nesta seção requerem aprovação de Global Admin</span>
                </div>
                <button className="bg-primary hover:bg-ai-accent text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20">SALVAR POLÍTICAS</button>
            </div>
        </div>
    );
}
