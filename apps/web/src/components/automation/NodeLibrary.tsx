import React from 'react';
import { Zap, Cpu, GitBranch, MessageSquare, Mail, Phone, ShoppingCart, Eye, FileText, Sparkles, Send, Bell } from 'lucide-react';

const nodeCategories = [
    {
        title: 'Gatilhos (Triggers)',
        items: [
            { id: 'webhook', label: 'Webhook Inbound', icon: Zap, color: 'text-warning' },
            { id: 'msg', label: 'Nova Mensagem', icon: MessageSquare, color: 'text-success' },
            { id: 'time', label: 'Agendamento', icon: MessageSquare, color: 'text-primary' },
        ]
    },
    {
        title: 'Cérebro Jarvis (AI)',
        items: [
            { id: 'sentiment', label: 'Análise de Sentimento', icon: Cpu, color: 'text-primary' },
            { id: 'ocr', label: 'Visão OCR', icon: Eye, color: 'text-ai-accent' },
            { id: 'voice', label: 'Transcrição de Voz', icon: Phone, color: 'text-warning' },
            { id: 'intent', label: 'Classificar Intenção', icon: Sparkles, color: 'text-secondary' },
        ]
    },
    {
        title: 'Ações de Venda (Commerce)',
        items: [
            { id: 'payment', label: 'Gerar Link Pagamento', icon: ShoppingCart, color: 'text-success' },
            { id: 'catalog', label: 'Enviar Catálogo', icon: Send, color: 'text-primary' },
        ]
    },
    {
        title: 'Notificações',
        items: [
            { id: 'internal', label: 'Alerta Interno', icon: Bell, color: 'text-warning' },
            { id: 'external', label: 'Email Externo', icon: Mail, color: 'text-text-3' },
        ]
    }
];

export default function NodeLibrary() {
    return (
        <div className="w-[320px] bg-bg-1 border-l border-stroke flex flex-col h-full shadow-2xl z-30 overflow-y-auto custom-scrollbar">
            <div className="p-8 border-b border-stroke flex flex-col gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Biblioteca de Nós</h3>
                <p className="text-[10px] text-text-3 font-medium">Arraste os componentes para o Canvas para montar sua automação.</p>
            </div>

            <div className="p-6 flex flex-col gap-10">
                {nodeCategories.map((cat, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-text-3 uppercase tracking-tighter opacity-60 px-2">{cat.title}</span>
                        <div className="grid grid-cols-1 gap-3">
                            {cat.items.map((node) => (
                                <div
                                    key={node.id}
                                    draggable
                                    className="p-4 bg-bg-0 border border-stroke rounded-2xl flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-bg-1 border border-stroke flex items-center justify-center ${node.color} group-hover:scale-110 transition-transform`}>
                                        <node.icon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-white tracking-tight">{node.label}</span>
                                        <span className="text-[8px] font-black text-text-3 uppercase">PULSE v2</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 mt-auto bg-surface-1 border-t border-stroke">
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} fill="currentColor" /> Jarvis Pro-Tip
                    </span>
                    <p className="text-[10px] text-text-2 italic font-medium">Use gatilhos de Commerce para criar réguas de cobrança automatizadas via WhatsApp.</p>
                </div>
            </div>
        </div>
    );
}
