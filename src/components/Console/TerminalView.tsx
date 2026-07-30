import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';

interface TerminalViewProps {
    id: string;
    active: boolean;
    onClosed?: () => void;
}

const WS_URL = 'ws://localhost:3001/terminal';

const TerminalView: React.FC<TerminalViewProps> = ({ active, onClosed }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Create terminal instance only once
        if (!xtermRef.current) {
            const term = new Terminal({
                cursorBlink: true,
                fontSize: 14,
                fontFamily: 'Consolas, "Courier New", monospace',
                theme: {
                    background: '#020617', // bg-slate-950
                    foreground: '#e2e8f0', // slate-200
                    cursor: '#60a5fa', // blue-400
                    black: '#1e293b',
                    red: '#ef4444',
                    green: '#10b981',
                    yellow: '#f59e0b',
                    blue: '#3b82f6',
                    magenta: '#a855f7',
                    cyan: '#06b6d4',
                    white: '#f1f5f9',
                    brightBlack: '#475569',
                    brightRed: '#f87171',
                    brightGreen: '#34d399',
                    brightYellow: '#fbbf24',
                    brightBlue: '#60a5fa',
                    brightMagenta: '#c084fc',
                    brightCyan: '#22d3ee',
                    brightWhite: '#f8fafc'
                },
                cols: 80,
                rows: 30
            });

            term.open(terminalRef.current);
            xtermRef.current = term;

            // Connect to WebSocket
            connectWebSocket(term);

            // Handle terminal input
            term.onData((data) => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: 'input',
                        data
                    }));
                }
            });

            // Handle resize
            const resizeObserver = new ResizeObserver(() => {
                if (terminalRef.current && xtermRef.current) {
                    const { clientWidth, clientHeight } = terminalRef.current;
                    const cols = Math.floor(clientWidth / 9); // Approximate char width
                    const rows = Math.floor(clientHeight / 17); // Approximate line height

                    if (cols > 0 && rows > 0) {
                        try {
                            xtermRef.current.resize(cols, rows);

                            // Send resize to backend
                            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                wsRef.current.send(JSON.stringify({
                                    type: 'resize',
                                    cols,
                                    rows
                                }));
                            }
                        } catch (error) {
                            console.error('Error resizing terminal:', error);
                        }
                    }
                }
            });

            if (terminalRef.current) {
                resizeObserver.observe(terminalRef.current);
            }

            // Cleanup
            return () => {
                resizeObserver.disconnect();
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                if (wsRef.current) {
                    wsRef.current.close();
                }
                if (xtermRef.current) {
                    xtermRef.current.dispose();
                }
            };
        }
    }, []);

    const connectWebSocket = (term: Terminal) => {
        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                term.write('\r\n\x1b[1;32m● Connected to terminal server\x1b[0m\r\n');
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    switch (msg.type) {
                        case 'data':
                            term.write(msg.data);
                            break;
                        case 'exit':
                            term.write(`\r\n\x1b[1;33m[Process exited with code ${msg.exitCode}]\x1b[0m\r\n`);
                            break;
                    }
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
                term.write('\r\n\x1b[1;31m● Connection error\x1b[0m\r\n');
            };

            ws.onclose = () => {
                setIsConnected(false);
                term.write('\r\n\x1b[1;31m● Disconnected from terminal server\x1b[0m\r\n');

                // Attempt reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    term.write('\x1b[1;33m● Attempting to reconnect...\x1b[0m\r\n');
                    connectWebSocket(term);
                }, 3000);

                // Notify parent if needed
                if (onClosed) {
                    onClosed();
                }
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            term.write('\r\n\x1b[1;31m● Failed to connect to terminal server\x1b[0m\r\n');
            term.write('\x1b[0;90mMake sure the server is running on port 3001\x1b[0m\r\n');
        }
    };

    return (
        <div
            ref={terminalRef}
            className="h-full w-full bg-slate-950"
            style={{ display: active ? 'block' : 'none' }}
        />
    );
};

export default TerminalView;
