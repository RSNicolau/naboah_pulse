import React from 'react';
import AgentGrid from '@/components/agents/AgentGrid';

export default function AgentsPage() {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <AgentGrid />
        </div>
    );
}
