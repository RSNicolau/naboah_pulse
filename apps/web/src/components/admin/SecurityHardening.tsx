import React from 'react';
import { Lock, Fingerprint, ShieldAlert, Cpu, Laptop, Smartphone, Key } from 'lucide-react';

export default function SecurityHardening() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl">
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="text-error w-6 h-6" /> Enterprise Hardening
                </h3>
                <p className="text-text-3 text-xs uppercase font-bold tracking-widest">Controles de Acesso e Segurança de Infraestrutura</p>
            </div>

            <div className="flex flex-col gap-8">
                {/* IP Whitelisting */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <Laptop className="text-primary" size={20} />
                            <span className="font-bold text-sm">Whitelist de IPs Corporativos</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Serviço Ativo</span>
                            <div className="w-10 h-5 bg-primary/20 rounded-full p-1 border border-primary/30 relative cursor-pointer">
                                <div className="w-3 h-3 bg-primary rounded-full absolute right-1"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <textarea
                            placeholder="Ex: 192.168.1.0/24, 201.55.12.333"
                            className="bg-bg-0 border border-stroke rounded-2xl p-4 text-xs text-white focus:border-primary outline-none h-24 placeholder:text-text-3"
                        ></textarea>
                        <p className="text-[10px] text-text-3">Insira um CIDR por linha. Acesso será negado para IPs fora desta lista.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* MFA Enforcement */}
                    <div className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-white">
                            <Fingerprint className="text-ai-accent" size={18} />
                            <span className="font-bold text-xs uppercase tracking-tighter">Obrigatoriedade de MFA</span>
                        </div>
                        <p className="text-[10px] text-text-3 leading-relaxed">Exigir autenticação de dois fatores para TODOS os usuários do tenant.</p>
                        <button className="w-full py-2 bg-surface-1 border border-stroke rounded-xl text-[9px] font-black text-white hover:bg-surface-2 transition-all uppercase tracking-widest">ATIVAR PARA TODOS</button>
                    </div>

                    {/* Session Timeout */}
                    <div className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-white">
                            <Lock className="text-warning" size={18} />
                            <span className="font-bold text-xs uppercase tracking-tighter">Timeout de Sessão</span>
                        </div>
                        <select className="bg-surface-1 border border-stroke rounded-xl p-2 text-[10px] text-white outline-none focus:border-primary">
                            <option>Expira em 30 minutos (Inativo)</option>
                            <option selected>Expira em 1 hora (Inativo)</option>
                            <option>Expira em 8 horas (Obrigatório)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-error/5 border border-error/20 rounded-2xl flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center text-error">
                    <Key size={24} />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Panic Button: Reset de Tokens</h4>
                    <p className="text-[10px] text-text-3">Em caso de suspeita de invasão, deslogue IMEDIATAMENTE todos os usuários e invalide os tokens.</p>
                </div>
                <button className="ml-auto px-6 py-2 bg-error text-white text-[10px] font-black rounded-xl hover:bg-error-dark transition-all shadow-lg shadow-error/20 uppercase tracking-widest">EXECUTAR RESET</button>
            </div>
        </div>
    );
}
