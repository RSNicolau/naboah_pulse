import React from 'react';
import BillingDashboard from '@/components/billing/BillingDashboard';

export default function BillingPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <BillingDashboard />
        </div>
    );
}
