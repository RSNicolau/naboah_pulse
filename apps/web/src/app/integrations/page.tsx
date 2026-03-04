import React from 'react';
import IntegrationsGrid from '@/components/integrations/IntegrationsGrid';

export default function IntegrationsPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <IntegrationsGrid />
        </div>
    );
}
