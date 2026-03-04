import { useEffect, useRef, useState } from 'react';

type PulseEvent = {
    type: string;
    [key: string]: any;
};

export function usePulseLive(tenantId: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<PulseEvent | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!tenantId) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Assuming the API is on port 8000
        const wsUrl = `${protocol}//${window.location.hostname}:8000/live/ws/${tenantId}`;

        const connect = () => {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                setIsConnected(true);
                console.log('Pulse Live: Connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastEvent(data);
                } catch (e) {
                    console.error('Pulse Live: Error parsing message', e);
                }
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                console.log('Pulse Live: Disconnected, retrying...');
                setTimeout(connect, 3000);
            };

            ws.current.onerror = (error) => {
                console.error('Pulse Live: WebSocket error', error);
                ws.current?.close();
            };
        };

        connect();

        return () => {
            ws.current?.close();
        };
    }, [tenantId]);

    const sendPulse = (type: string, payload: any = {}) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type, ...payload }));
        }
    };

    return { isConnected, lastEvent, sendPulse };
}
