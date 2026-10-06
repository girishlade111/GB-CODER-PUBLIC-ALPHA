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
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

/**
 * Shared secret required to open the terminal WebSocket.
 *
 * Read once at startup; the upgrade handler refuses every connection when it is
 * unset, so forgetting to configure it fails closed.
 */
const TERMINAL_TOKEN = process.env.TERMINAL_TOKEN || '';

/** Loopback check, tolerant of IPv4-mapped IPv6 (`::ffff:127.0.0.1`). */
function isLoopbackAddress(address) {
    return address === '::1' || address === '127.0.0.1' || /^127\./.test(address);
}

/**
 * Length-safe constant-time string comparison.
 *
 * `crypto.timingSafeEqual` throws on a length mismatch, which would itself leak
 * the token's length, so the lengths are folded into the result first.
 */
function timingSafeEqualStr(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    // Compare against a fixed-width digest so a length difference cannot short-circuit.
    const ha = crypto.createHash('sha256').update(bufA).digest();
    const hb = crypto.createHash('sha256').update(bufB).digest();
    return crypto.timingSafeEqual(ha, hb);
}

function isOriginAllowed(origin) {
    // A missing Origin is NOT allowed. Browsers always send it on a WebSocket
    // handshake; clients that omit it are curl, websocat, wscat and similar — and
    // those are exactly the ones that should not receive a shell.
    if (!origin) return false;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    try {
        const url = new URL(origin);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return true;
        }
        if (url.hostname === 'code.ladestack.in') {
            return true;
        }
    } catch (_) {}
    return false;
}

// Enable CORS for allowed origins
app.use(cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Parse JSON bodies (up to 10MB to accommodate multi-file project contexts)
app.use(express.json({ limit: '10mb' }));

// Health check root
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'GB Coder Server' });
});

// Dynamic API handler routing to all endpoints in api/ (including ai, health, preview, share, sandbox)
//
// The route allowlist is a security boundary, not validation for its own sake. The
// route is joined onto the api/ directory and then require()d and invoked as a
// handler, so a route containing `..` resolves outside that directory and makes the
// server load and run any .js file it can name. Express does not normalise the path
// before a handler sees it, so `GET /api/../server/index` arrives here verbatim.
// Dots are excluded from the character class, which is what makes traversal
// impossible rather than merely unlikely.
const SAFE_API_ROUTE = /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/;

app.all('/api/*', async (req, res) => {
    const route = decodeURIComponent(req.path.replace(/^\/api\//, ''));

    const apiDir = path.resolve(__dirname, '../api');
    if (!SAFE_API_ROUTE.test(route)) {
        return res.status(404).json({ error: 'API route not found.' });
    }

    const candidateFile = path.resolve(apiDir, `${route}.js`);
    // Second gate, independent of the regex above.
    if (!candidateFile.startsWith(apiDir + path.sep)) {
        return res.status(404).json({ error: 'API route not found.' });
    }

    if (fs.existsSync(candidateFile)) {
        try {
            const handler = require(candidateFile);
            const fn = typeof handler === 'function' ? handler : handler.default || handler;
            await fn(req, res);
        } catch (err) {
            console.error(`Error in /api/${route}:`, err);
            if (!res.headersSent) {
                // Constant message: a failed require() embeds the absolute path of
                // the file it could not find, which would make this dispatcher a
                // filesystem oracle. The detail is in the log above.
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    } else {
        res.status(404).json({ error: 'API route not found.' });
    }
});

// WebSocket server for terminal connections (unattached to server until origin check)
const wss = new WebSocket.Server({ noServer: true });

// Handle HTTP upgrade with path, loopback, token & origin authorization
server.on('upgrade', (request, socket, head) => {
    const origin = request.headers.origin;
    let pathname = '';
    let requestUrl;
    try {
        requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
        pathname = requestUrl.pathname;
    } catch (_) {
        pathname = request.url;
        return;
    }

    if (pathname !== '/terminal') {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
    }

    /*
     * This endpoint hands out a real PTY. Two gates, both required.
     *
     * 1. A shared secret. `TERMINAL_TOKEN` must be set in server/.env; without one
     *    the upgrade is refused outright, so the shell is closed by default rather
     *    than open by default. A WebSocket cannot carry an Authorization header, so
     *    the secret necessarily travels as a query parameter — which is only
     *    acceptable because of gate 2.
     *
     * 2. The peer must be loopback. `server.listen(PORT, '127.0.0.1')` already
     *    guarantees that today, but the check is kept so the shell cannot be
     *    widened by a future bind change. Note the Vite `/terminal` proxy that used
     *    to sit in front of this on a LAN-bound dev server has been removed.
     */
    const peer = request.socket.remoteAddress || '';
    const peerHost = peer.startsWith('::ffff:') ? peer.slice(7) : peer;
    if (!isLoopbackAddress(peerHost)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }

    if (!TERMINAL_TOKEN) {
        console.error('[terminal] refusing upgrade: TERMINAL_TOKEN is not set.');
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }

    // Compared in constant time so a wrong guess leaks no timing signal.
    if (!timingSafeEqualStr(requestUrl.searchParams.get('token') || '', TERMINAL_TOKEN)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }

    if (!origin || !isOriginAllowed(origin)) {
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
