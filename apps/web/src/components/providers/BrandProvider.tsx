"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type BrandConfig = {
    primaryColor: string;
    logoUrl?: string;
    aiName: string;
};

const BrandContext = createContext<BrandConfig | undefined>(undefined);

export function BrandProvider({ children, tenantConfig }: { children: React.ReactNode, tenantConfig: any }) {
    const [config, setConfig] = useState<BrandConfig>({
        primaryColor: tenantConfig?.primary_color || '#0066FF',
        logoUrl: tenantConfig?.logo_url,
        aiName: tenantConfig?.ai_persona_config?.name || 'Jarvis',
    });

    useEffect(() => {
        if (tenantConfig) {
            setConfig({
                primaryColor: tenantConfig.primary_color,
                logoUrl: tenantConfig.logo_url,
                aiName: tenantConfig.ai_persona_config?.name || 'Jarvis',
            });

            // Injeta a cor primária como uma variável CSS no root
            document.documentElement.style.setProperty('--primary-color', tenantConfig.primary_color);

            // Opcional: Gerar tons secundários/opacidade via JS se necessário
            // document.documentElement.style.setProperty('--primary-muted', `${tenantConfig.primary_color}20`);
        }
    }, [tenantConfig]);

    return (
        <BrandContext.Provider value={config}>
            {children}
        </BrandContext.Provider>
    );
}

export const useBrand = () => {
    const context = useContext(BrandContext);
    if (context === undefined) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return context;
};
