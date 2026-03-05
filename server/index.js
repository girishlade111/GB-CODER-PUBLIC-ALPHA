require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const cors = require('cors');
const os = require('os');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
    credentials: true,
}));

// Parse JSON bodies
app.use(express.json({ limit: '100kb' }));

// Health check endpoints
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'GB Coder Server' });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// WebSocket server for terminal connections
const wss = new WebSocket.Server({
    server,
    path: '/terminal'
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

// Track active PTY sessions
const sessions = new Map();

wss.on('connection', (ws) => {
    console.log('New terminal connection established');

    const sessionId = Date.now().toString();
    const shell = getDefaultShell();

    console.log(`Spawning shell: ${shell}`);

    // Spawn PTY process
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    sessions.set(sessionId, ptyProcess);

    // Send PTY output to WebSocket client
    ptyProcess.onData((data) => {
        try {
            ws.send(JSON.stringify({
                type: 'data',
                data: data
            }));
        } catch (error) {
            console.error('Error sending data to client:', error);
        }
    });

    // Handle PTY exit
    ptyProcess.onExit(({ exitCode, signal }) => {
        console.log(`PTY process exited with code ${exitCode}, signal ${signal}`);
        try {
            ws.send(JSON.stringify({
                type: 'exit',
                exitCode,
                signal
            }));
            ws.close();
        } catch (error) {
            console.error('Error sending exit message:', error);
        }
        sessions.delete(sessionId);
    });

    // Handle WebSocket messages from client
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);

            switch (msg.type) {
                case 'input':
                    // Write user input to PTY
                    if (msg.data) {
                        ptyProcess.write(msg.data);
                    }
                    break;

                case 'resize':
                    // Resize PTY to match terminal dimensions
                    if (msg.cols && msg.rows) {
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
        console.log('Terminal connection closed');
        if (sessions.has(sessionId)) {
            const pty = sessions.get(sessionId);
            try {
                pty.kill();
            } catch (error) {
                console.error('Error killing PTY process:', error);
            }
            sessions.delete(sessionId);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (sessions.has(sessionId)) {
            const pty = sessions.get(sessionId);
            try {
                pty.kill();
            } catch (err) {
                console.error('Error killing PTY process:', err);
            }
            sessions.delete(sessionId);
        }
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, closing all sessions...');
    sessions.forEach((pty, sessionId) => {
        try {
            pty.kill();
        } catch (error) {
            console.error(`Error killing session ${sessionId}:`, error);
        }
    });
    sessions.clear();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, closing all sessions...');
    sessions.forEach((pty, sessionId) => {
        try {
            pty.kill();
        } catch (error) {
            console.error(`Error killing session ${sessionId}:`, error);
        }
    });
    sessions.clear();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Terminal server running on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/terminal`);
});
