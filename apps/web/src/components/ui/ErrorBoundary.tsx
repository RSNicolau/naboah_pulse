"use client";

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, message: '' };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message || 'Erro inesperado' };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    reset = () => this.setState({ hasError: false, message: '' });

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="flex flex-col items-center justify-center gap-6 py-24 px-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-critical/10 border border-critical/20 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-critical" />
                    </div>
                    <div className="flex flex-col gap-2 max-w-xs">
                        <p className="text-white font-bold text-lg">Algo correu mal</p>
                        <p className="text-text-3 text-sm">{this.state.message}</p>
                    </div>
                    <button
                        onClick={this.reset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-bg-1 border border-stroke rounded-xl text-sm text-text-1 hover:border-primary/40 hover:text-white transition-all"
                    >
                        <RefreshCw size={14} /> Tentar novamente
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
