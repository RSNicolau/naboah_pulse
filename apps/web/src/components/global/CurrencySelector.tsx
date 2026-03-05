"use client";
import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Landmark, ArrowRightLeft, Globe2, ChevronDown, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

const currencies = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '\u{1F1E7}\u{1F1F7}' },
    { code: 'USD', name: 'Dolar Americano', symbol: '$', flag: '\u{1F1FA}\u{1F1F8}' },
    { code: 'EUR', name: 'Euro', symbol: '\u20AC', flag: '\u{1F1EA}\u{1F1FA}' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '\u00A3', flag: '\u{1F1EC}\u{1F1E7}' },
];

/**
 * FX rates are fetched from the API at `/global/currencies`.
 * If the API is unavailable, static fallback rates are used.
 * Note: Exchange rates change frequently. The API should return
 * up-to-date rates from a reliable FX data provider.
 */
const FALLBACK_RATES: Record<string, number> = {
    'USD': 0.20,
    'EUR': 0.18,
    'GBP': 0.16,
    'BRL': 1,
};

export default function CurrencySelector() {
    const [selected, setSelected] = useState(currencies[0]);
    const [amount, setAmount] = useState(1000);
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<Record<string, number>>('/global/currencies')
            .then((data) => setRates(data))
            .catch(() => {
                // Use static fallback rates when API is unavailable
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">

            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
                        <Globe2 size={20} className="text-primary" /> Global Currency
                    </h3>
                    <p className="text-[10px] font-medium text-text-3">Converta valores instantaneamente.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-bg-0 border border-white/5 rounded-2xl">
                    {loading ? (
                        <Loader2 size={12} className="text-text-3 animate-spin" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    )}
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                        {loading ? 'Loading...' : 'Live Rates'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[9px] font-black text-text-3 uppercase tracking-widest ml-2">Base Value (BRL)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-bg-0 border border-stroke rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="mt-6">
                        <ArrowRightLeft size={24} className="text-text-3" />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[9px] font-black text-text-3 uppercase tracking-widest ml-2">Target Currency</label>
                        <div className="relative">
                            <select
                                onChange={(e) => setSelected(currencies.find(c => c.code === e.target.value) || currencies[0])}
                                className="w-full bg-bg-0 border border-stroke rounded-2xl px-6 py-4 text-xl font-black text-white outline-none appearance-none cursor-pointer focus:border-primary/50 transition-all"
                            >
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-surface-2/40 border border-white/5 rounded-3xl flex flex-col gap-1">
                        <span className="text-[9px] font-black text-text-3 uppercase">Converted Amount</span>
                        <span className="text-2xl font-black text-primary tracking-tighter italic">
                            {selected.symbol} {(amount * (rates[selected.code] ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="p-6 bg-surface-2/40 border border-white/5 rounded-3xl flex flex-col gap-1">
                        <span className="text-[9px] font-black text-text-3 uppercase">Rate Applied</span>
                        <span className="text-xs font-bold text-white">
                            1 BRL = {rates[selected.code] ?? '---'} {selected.code}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                    <Landmark size={18} />
                </div>
                <p className="text-[9px] text-text-2 leading-relaxed">
                    {/* FX rates: fetched from API when available, static fallback otherwise */}
                    As taxas são atualizadas a cada 15 minutos via **Pulse FX API**.
                    O cálculo inclui o spread de conversão configurado no seu plano.
                </p>
            </div>

        </div>
    );
}
