import React from 'react';
import MarketplaceDirectory from '@/components/marketplace/MarketplaceDirectory';

export default function MarketplacePage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <MarketplaceDirectory />
        </div>
    );
}
