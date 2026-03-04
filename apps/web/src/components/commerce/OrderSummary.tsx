import React from 'react';
import { ShoppingCart, ShoppingBag, CreditCard, ChevronRight, Zap, ShieldCheck } from 'lucide-react';

export default function OrderSummary() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success shadow-xl shadow-success/10">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">Pedido Atual</h3>
                        <span className="text-[9px] text-text-3 font-black uppercase tracking-tighter">Shopping Cart Conversacional</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-bg-0 border border-stroke rounded-2xl group/item hover:border-primary transition-all">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">iPhone 15 Pro</span>
                        <span className="text-[9px] text-text-3 font-black uppercase">Qty: 1</span>
                    </div>
                    <span className="text-xs font-black text-white tracking-tight">R$ 7.999,00</span>
                </div>

                <div className="px-2 pt-4 border-t border-stroke space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-white">R$ 7.999,00</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        <span>Desconto (Boas-vindas)</span>
                        <span className="text-success">- R$ 100,00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-stroke/50 mt-4">
                        <span className="text-xs font-black text-white uppercase tracking-widest">TOTAL</span>
                        <span className="text-xl font-black text-primary tracking-tighter">R$ 7.899,00</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
                <button className="w-full py-4 bg-primary hover:bg-ai-accent text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                    <CreditCard size={16} /> ENVIAR LINK DE PAGAMENTO
                </button>

                <div className="flex items-center justify-center gap-2 py-2 bg-bg-0/50 rounded-xl border border-dashed border-stroke">
                    <ShieldCheck size={12} className="text-success" />
                    <span className="text-[8px] text-text-3 font-black uppercase tracking-widest">Integração Stripe Ativa & Segura</span>
                </div>
            </div>

            {/* Cross-sell Suggestion */}
            <div className="mt-4 p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl flex items-center gap-5 group cursor-pointer hover:border-primary transition-all">
                <div className="w-10 h-10 rounded-xl bg-bg-1 border border-stroke flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Zap size={20} className="fill-primary/20" />
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sugestão de Up-sell</span>
                    <p className="text-[11px] font-bold text-white">Apple Watch Series 9?</p>
                    <p className="text-[9px] text-text-3 font-medium">Clientes que compram iPhone amam este item.</p>
                </div>
                <ChevronRight size={16} className="text-text-3 group-hover:text-primary transition-colors" />
            </div>

        </div>
    );
}
