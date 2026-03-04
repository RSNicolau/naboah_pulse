import React from 'react';
import { Users } from 'lucide-react';

const mockPresence = [
    { id: 'u1', name: 'Rodrigo', color: 'bg-primary' },
    { id: 'u2', name: 'Jarvis', color: 'bg-ai' },
    { id: 'u3', name: 'Aegis', color: 'bg-secondary' },
];

export default function PresenceAvatars() {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2/50 border border-stroke rounded-full shadow-sm">
            <div className="flex -space-x-2 overflow-hidden">
                {mockPresence.map((user) => (
                    <div
                        key={user.id}
                        className={`w-6 h-6 rounded-full border border-bg-1 flex items-center justify-center text-[8px] font-bold text-white shadow-inner ${user.color}`}
                        title={user.name}
                    >
                        {user.name.charAt(0)}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-1 ml-1 border-l border-stroke pl-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">3 Live</span>
            </div>
        </div>
    );
}
