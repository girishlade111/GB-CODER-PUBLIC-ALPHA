require('dotenv').config();
try {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
} catch (_) {}

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const cors = require('cors');
const os = require('os');
const aiHandler = require('../api/ai');
const healthHandler = require('../api/health');

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:3000'
];

// Enable CORS for allowed origins
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
}));

// Parse JSON bodies (up to 10MB to accommodate multi-file project contexts)
app.use(express.json({ limit: '10mb' }));

// Health check and AI endpoints
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'GB Coder Server' });
});
app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/ai', (req, res) => aiHandler(req, res));

// WebSocket server for terminal connections (unattached to server until origin check)
const wss = new WebSocket.Server({ noServer: true });

// Handle HTTP upgrade with origin & path authorization
server.on('upgrade', (request, socket, head) => {
    const origin = request.headers.origin;
    let pathname = '';
    try {
        pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
    } catch (_) {
        pathname = request.url;
    }

    if (pathname !== '/terminal') {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
    }

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Determine default shell based on OS
function getDefaultShell() {
    const platform = os.platform();

    if (platform === 'win32') {
        // Windows: prefer PowerShell, fallback to cmd
        return process.env.COMSPEC || 'powershell.exe';
    } else {
        // Unix-like systems: use user's default shell or bash
        return process.env.SHELL || '/bin/bash';
    }
}

// Allowlist of environment variables passed to PTY shell to avoid leaking secrets
const ENV_ALLOWLIST = [
    'PATH', 'TERM', 'HOME', 'SHELL', 'LANG', 'LC_ALL', 'LC_CTYPE',
    'USER', 'LOGNAME', 'TMPDIR', 'TMP', 'TEMP',
    'APPDATA', 'LOCALAPPDATA', 'SystemRoot', 'SystemDrive', 'WINDIR',
    'COMSPEC', 'PATHEXT', 'PSModulePath'
];

function getSanitizedEnv() {
    const env = {};
    for (const key of ENV_ALLOWLIST) {
        if (process.env[key] !== undefined) {
            env[key] = process.env[key];
        }
    }
    env.TERM = env.TERM || 'xterm-256color';
    return env;
}

// Track active PTY sessions with monotonic ID counter
let nextSessionId = 0;
const sessions = new Map();

wss.on('connection', (ws) => {
    const sessionId = String(++nextSessionId);
    const shell = getDefaultShell();

    let ptyProcess;
    try {
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: getSanitizedEnv()
        });
    } catch (err) {
        console.error('Error spawning PTY process:', err);
        try {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'error',
                    data: 'Failed to launch shell process.'
                }));
                ws.close();
            }
        } catch (_) {}
        return;
    }

    sessions.set(sessionId, { pty: ptyProcess, ws });

    // Send PTY output to WebSocket client
    ptyProcess.onData((data) => {
        try {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'data',
                    data: data
                }));
            }
        } catch (error) {
            console.error('Error sending data to client:', error);
        }
    });

    // Handle PTY exit
    ptyProcess.onExit(({ exitCode, signal }) => {
        try {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'exit',
                    exitCode,
                    signal
                }));
                ws.close();
            }
        } catch (error) {
            console.error('Error sending exit message:', error);
        }
        if (sessions.get(sessionId)?.pty === ptyProcess) {
            sessions.delete(sessionId);
        }
    });

    // Handle WebSocket messages from client
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);

            switch (msg.type) {
                case 'input':
                    if (msg.data && ptyProcess) {
                        ptyProcess.write(msg.data);
                    }
                    break;

                case 'resize':
                    if (msg.cols && msg.rows && ptyProcess) {
                        ptyProcess.resize(msg.cols, msg.rows);
                    }
                    break;

                default:
                    console.warn('Unknown message type:', msg.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    // Clean up on disconnect
    ws.on('close', () => {
        const session = sessions.get(sessionId);
        if (session && session.pty === ptyProcess) {
            try {
                ptyProcess.kill();
            } catch (error) {
                console.error('Error killing PTY process:', error);
            }
            setTimeout(() => {
                if (sessions.get(sessionId)?.pty === ptyProcess) {
                    sessions.delete(sessionId);
                }
            }, 2000);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        const session = sessions.get(sessionId);
        if (session && session.pty === ptyProcess) {
            try {
                ptyProcess.kill();
            } catch (err) {
                console.error('Error killing PTY process:', err);
            }
            setTimeout(() => {
                if (sessions.get(sessionId)?.pty === ptyProcess) {
                    sessions.delete(sessionId);
                }
            }, 2000);
        }
    });
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Shutting down terminal server gracefully...`);

    for (const [sessionId, { pty: ptyProc, ws }] of sessions.entries()) {
        try {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(1001, 'Server shutting down');
            }
        } catch (_) {}
        try {
            if (ptyProc) {
                ptyProc.kill();
            }
        } catch (_) {}
    }
    sessions.clear();

    wss.close(() => {
        server.close(() => {
            console.log('Server closed successfully.');
            process.exit(0);
        });
    });

    setTimeout(() => {
        console.error('Forced shutdown due to timeout.');
        process.exit(1);
    }, 5000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server listening strictly on 127.0.0.1 for local host security
const PORT = process.env.PORT || 3001;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`GB Coder terminal server listening on http://127.0.0.1:${PORT}`);
});
