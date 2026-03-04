import React from 'react';
import ModerationFeed from '@/components/moderation/ModerationFeed';

export default function ModerationPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <ModerationFeed />
        </div>
    );
}
