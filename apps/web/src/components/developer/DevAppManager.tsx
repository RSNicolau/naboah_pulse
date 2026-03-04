import React from 'react';
import { Box, Code2, Key, Globe, Shield, Send, MoreHorizontal, CheckCircle2, Clock } from 'lucide-react';

export default function DevAppManager() {
    const apps = [
        { id: '1', name: 'Naboah Insights Bot', status: 'published', client_id: 'pub_8x92k1l...', created: '12 dias atrás' },
        { id: '2', name: 'Legacy CRM Sync', status: 'development', client_id: 'pub_2k1l8x9...', created: '2 dias atrás' },
        { id: '3', name: 'Custom AI Voice Hook', status: 'pending_review', client_id: 'pub_l8x92k1...', created: 'Hoje' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl overflow-hidden relative group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Box size={24} className="text-primary" /> My Applications
                    </h3>
                    <p className="text-xs text-text-3 font-medium">Crie e gerencie seus apps integrados ao Pulse.</p>
                </div>
                <button className="px-8 py-4 bg-primary text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    CREATE NEW APP
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {apps.map((app) => (
                    <div key={app.id} className="p-8 bg-bg-0 border border-stroke rounded-[2.5rem] flex items-center justify-between group/app hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${app.status === 'published' ? 'bg-success/10 text-success' : app.status === 'pending_review' ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-text-3'}`}>
                                <Code2 size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-black text-white tracking-widest uppercase italic">{app.name}</span>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-text-3 uppercase tracking-tighter">
                                    <span className="flex items-center gap-1"><Key size={12} /> {app.client_id}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {app.created}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${app.status === 'published' ? 'bg-success/10 text-success border-success/20' :
                                    app.status === 'pending_review' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                                        'bg-surface-2 text-text-3 border-white/5'
                                }`}>
                                {app.status.replace('_', ' ')}
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-3 hover:text-white transition-all">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Globe, label: 'OAuth Redirects', value: '4 Configurados' },
                    { icon: Shield, label: 'API Scopes', value: '12 Permissões' },
                    { icon: Send, label: 'Webhooks', value: '8 Endpoints' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-surface-2/30 border border-white/5 rounded-3xl flex flex-col gap-2">
                        <stat.icon size={18} className="text-secondary" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                            <span className="text-sm font-black text-white">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
