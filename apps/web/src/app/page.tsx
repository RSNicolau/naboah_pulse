import React from 'react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function OverviewPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <AnalyticsDashboard />
        </div>
    );
}
