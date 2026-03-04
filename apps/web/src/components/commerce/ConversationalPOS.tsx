"use client";
import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Mic, Send, Trash2, Plus, Minus, Receipt, User } from 'lucide-react';

export default function ConversationalPOS() {
    const [items, setItems] = useState([
        { id: 1, name: 'Pulse T-Shirt', price: 129.90, qty: 1 },
        { id: 2, name: 'Neural Mug', price: 45.00, qty: 1 },
    ]);

    const total = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

    return (
        <div className="bg-bg-0 border border-stroke rounded-[3rem] overflow-hidden flex flex-col h-[700px] shadow-2xl">

            {/* Header */}
            <div className="px-8 py-8 border-b border-stroke flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                        <ShoppingBag size={28} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Conversational POS</h3>
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Register #01 • Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Customer</span>
                        <span className="text-xs font-bold text-white italic">Guest Walk-in</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-3">
                        <User size={18} />
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">

                {/* Cart List */}
                <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    {items.map((item) => (
                        <div key={item.id} className="p-6 bg-bg-1 border border-stroke rounded-[2rem] flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-black text-white tracking-widest uppercase italic">{item.name}</span>
                                <span className="text-[10px] font-bold text-text-3 uppercase tracking-tighter">SKU: {item.name.slice(0, 3).toUpperCase()}-102</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-4 px-3 py-1.5 bg-bg-0 border border-white/5 rounded-xl">
                                    <button className="text-text-3 hover:text-white"><Minus size={14} /></button>
                                    <span className="text-xs font-black text-white">{item.qty}</span>
                                    <button className="text-text-3 hover:text-white"><Plus size={14} /></button>
                                </div>
                                <span className="w-20 text-right text-sm font-black text-white tracking-tighter">R$ {(item.price * item.qty).toFixed(2)}</span>
                                <button className="text-text-3 hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Receipt/Payment Sidebar */}
                <div className="w-[380px] border-l border-stroke bg-bg-1 p-8 flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Receipt size={16} className="text-text-3" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Order Summary</span>
                        </div>
                        <div className="flex flex-col gap-3 py-6 border-y border-white/5 font-medium">
                            <div className="flex justify-between text-[11px] text-text-2">
                                <span>Subtotal</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-2">
                                <span>Tax (18% ICMS)</span>
                                <span>R$ {(total * 0.18).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-white mt-2 italic">
                                <span className="tracking-widest uppercase">TOTAL</span>
                                <span className="text-primary">R$ {(total * 1.18).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-white/10">
                            <CreditCard size={18} /> COMPLETE SHIPMENT
                        </button>
                        <button className="w-full py-4 bg-primary/10 border border-primary/20 text-primary rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-primary/20 transition-all">
                            SAVE AS QUOTE
                        </button>
                    </div>
                </div>

            </div>

            {/* Jarvis POS Input */}
            <div className="p-8 border-t border-stroke bg-bg-1 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Mic size={12} className="animate-pulse" /> Jarvis Listening...
                </div>
                <div className="flex items-center gap-4 bg-bg-0 border border-white/5 p-4 rounded-[2.5rem] focus-within:border-primary/50 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <ShoppingBag size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Fale ou digite para adicionar itens: '2 Camisetas Pretas e apply 10% discount'..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-text-3 tracking-tight"
                    />
                    <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-text-3 hover:text-white hover:bg-white/10 transition-all">
                        <Send size={20} />
                    </button>
                </div>
            </div>

        </div>
    );
}
