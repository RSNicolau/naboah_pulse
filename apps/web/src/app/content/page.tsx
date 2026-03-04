import React from 'react';
import ContentGenerator from '@/components/content/ContentGenerator';

export default function ContentStudioPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <ContentGenerator />
        </div>
    );
}
