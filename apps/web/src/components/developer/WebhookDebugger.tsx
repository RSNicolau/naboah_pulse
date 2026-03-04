import React from 'react';
import { Terminal, RefreshCcw, Wifi, Server, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function WebhookDebugger() {
    const logs = [
        { id: '1', event: 'lead.created', timestamp: '14:20:05', status: 200, latency: '145ms', app: 'Insights Bot' },
        { id: '2', event: 'message.received', timestamp: '14:18:12', status: 500, latency: '2.4s', app: 'Custom Hook' },
        { id: '3', event: 'deal.updated', timestamp: '14:15:30', status: 200, latency: '89ms', app: 'Insights Bot' },
    ];

    return (
        <div className="bg-bg-0 border border-stroke rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">

            {/* Search & Utility Bar */}
            <div className="px-8 py-6 border-b border-stroke flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4 flex-1">
                    <Search size={18} className="text-text-3" />
                    <input
                        type="text"
                        placeholder="Pesquisar por Event ID ou App..."
                        className="bg-transparent border-none outline-none text-xs font-medium text-white placeholder:text-text-3 w-64"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-bg-1 border border-stroke rounded-xl text-[9px] font-black text-white uppercase tracking-widest">
                        <RefreshCcw size={12} className="animate-spin-slow" /> REFRESH
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-xl text-[9px] font-black text-success uppercase tracking-widest">
                        <Wifi size={12} /> LISTENING
                    </div>
                </div>
            </div>

            {/* Log Table */}
            <div className="p-2">
                <div className="flex flex-col">
                    {logs.map((log) => (
                        <div key={log.id} className="grid grid-cols-12 gap-4 p-5 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                            <div className="col-span-1 flex items-center justify-center">
                                {log.status === 200 ? <CheckCircle2 size={18} className="text-success" /> : <XCircle size={18} className="text-error" />}
                            </div>
                            <div className="col-span-3 flex flex-col justify-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{log.event}</span>
                                <span className="text-[9px] font-bold text-text-3 uppercase">{log.app}</span>
                            </div>
                            <div className="col-span-5 flex items-center gap-4">
                                <div className="h-1 w-24 bg-surface-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${log.status === 200 ? 'bg-success' : 'bg-error'}`} style={{ width: log.status === 200 ? '100%' : '40%' }}></div>
                                </div>
                                <span className="text-[10px] font-mono text-text-3">{log.latency}</span>
                            </div>
                            <div className="col-span-2 flex flex-col justify-center items-end">
                                <span className="text-xs font-black text-white">{log.status}</span>
                                <span className="text-[9px] font-bold text-text-3">{log.timestamp}</span>
                            </div>
                            <div className="col-span-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Terminal size={14} className="text-primary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Code Preview (Static Placeholder) */}
            <div className="p-8 bg-bg-1/50 border-t border-stroke">
                <div className="flex items-center gap-3 mb-6">
                    <Server size={14} className="text-secondary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Payload Preview (Most Recent)</span>
                </div>
                <pre className="p-6 bg-bg-0 border border-white/5 rounded-2xl text-[10px] font-mono text-success leading-relaxed overflow-x-auto whitespace-pre">
                    {`{
  "event": "lead.created",
  "data": {
    "id": "ld_92k1l8",
    "email": "rodrigo@naboah.com",
    "source": "webhook_test",
    "timestamp": "2026-03-03T22:37:00Z"
  },
  "signature": "sha256=8x92k1l8x92k1l8x92k..."
}`}
                </pre>
            </div>

        </div>
    );
}
