"use client";

import React, { useState } from 'react';
import {
    Cpu, Package, Building2, Shield, Activity, Users,
} from 'lucide-react';
import AIEngineSkillsTab from '@/components/ai-engine/AIEngineSkillsTab';
import AIEngineDepartmentsTab from '@/components/ai-engine/AIEngineDepartmentsTab';
import AIEngineRolesTab from '@/components/ai-engine/AIEngineRolesTab';
import AIEnginePermissionsTab from '@/components/ai-engine/AIEnginePermissionsTab';
import AIEngineExecutionsTab from '@/components/ai-engine/AIEngineExecutionsTab';

const TABS = [
    { id: 'skills',      label: 'Skills',       icon: Package },
    { id: 'departments', label: 'Departments',   icon: Building2 },
    { id: 'roles',       label: 'Roles',         icon: Users },
    { id: 'permissions', label: 'Permissions',    icon: Shield },
    { id: 'executions',  label: 'Executions',     icon: Activity },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AIEnginePage() {
    const [tab, setTab] = useState<TabId>('skills');

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-ai/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                            <Cpu size={30} />
                        </div>
                        AI Engine
                    </h1>
                    <p className="text-text-3 text-sm font-medium">Enterprise cognitive architecture — skills, departments, roles, permissions & audit.</p>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-1 bg-bg-1 border border-stroke rounded-2xl p-1.5">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        const active = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    active
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-text-3 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <Icon size={14} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {tab === 'skills' && <AIEngineSkillsTab />}
                {tab === 'departments' && <AIEngineDepartmentsTab />}
                {tab === 'roles' && <AIEngineRolesTab />}
                {tab === 'permissions' && <AIEnginePermissionsTab />}
                {tab === 'executions' && <AIEngineExecutionsTab />}
            </div>
        </div>
    );
}
