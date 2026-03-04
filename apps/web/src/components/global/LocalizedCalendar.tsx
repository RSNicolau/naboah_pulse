import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Coffee, AlertCircle } from 'lucide-react';

export default function LocalizedCalendar() {
    const regions = [
        { timezone: 'America/Sao_Paulo', city: 'São Paulo', time: '18:45', offset: 'GMT-3', status: 'Working' },
        { timezone: 'Europe/Lisbon', city: 'Lisboa', time: '21:45', offset: 'GMT+1', status: 'Off-hours' },
        { timezone: 'America/New_York', city: 'New York', time: '16:45', offset: 'GMT-4', status: 'Working' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Clock size={24} className="text-secondary" /> Global Timezones
                    </h3>
                    <p className="text-xs text-text-3 font-medium">Sincronização cross-border automática.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest">Manage Holidays</button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {regions.map((r, i) => (
                    <div key={i} className="p-6 bg-bg-0 border border-stroke rounded-3xl flex items-center justify-between group hover:border-secondary/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.status === 'Working' ? 'bg-success/10 text-success' : 'bg-surface-2 text-text-3'}`}>
                                {r.status === 'Working' ? <CalendarIcon size={20} /> : <Coffee size={20} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white tracking-widest uppercase italic">{r.city}</span>
                                <span className="text-[10px] font-bold text-text-3 uppercase tracking-tighter">{r.timezone} ({r.offset})</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="text-2xl font-black text-white tracking-tighter">{r.time}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${r.status === 'Working' ? 'bg-success/20 text-success' : 'bg-white/5 text-text-3'}`}>
                                {r.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-secondary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">IA Awareness Active</span>
                </div>
                <p className="text-[10px] font-medium text-text-2 leading-relaxed">
                    O Jarvis detectou que AMANHÃ é feriado em **Lisboa (Corpo de Deus)**.
                    Agendamentos para clientes nesta região serão movidos para o próximo dia útil automaticamente.
                </p>
            </div>

        </div>
    );
}
