import React from 'react';
import { Inbox, FileInput, Plus, Filter } from 'lucide-react';

interface IntakeTabsProps {
    activeTab: 'inbox' | 'intake';
    onTabChange: (tab: 'inbox' | 'intake') => void;
}

export default function IntakeTabs({ activeTab, onTabChange }: IntakeTabsProps) {
    return (
        <div className="flex items-center justify-between px-10 py-6 border-b border-stroke bg-bg-1/50 backdrop-blur-md">
            <div className="flex gap-4">
                <button
                    onClick={() => onTabChange('inbox')}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inbox' ? 'bg-white text-black shadow-2xl' : 'text-text-3 hover:text-white'}`}
                >
                    <Inbox size={16} /> Omnichannel Inbox
                </button>
                <button
                    onClick={() => onTabChange('intake')}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'intake' ? 'bg-primary text-white shadow-2xl' : 'text-text-3 hover:text-white'}`}
                >
                    <FileInput size={16} /> Multimodal Intake
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-[8px]">12</span>
                </button>
            </div>

            <div className="flex gap-4">
                <button className="p-3 bg-bg-0 border border-white/5 rounded-2xl text-text-3 hover:text-white transition-all">
                    <Filter size={18} />
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                    <Plus size={16} /> New Job
                </button>
            </div>
        </div>
    );
}
