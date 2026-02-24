const WebSocket = require('ws');
const { parse } = require('url');

const connectedClients = new Map();
let wss;

function init(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // Parse basic params
        const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const clientType = urlParams.get('type') || 'unknown'; // 'dashboard' or 'widget'
        const clientId = urlParams.get('userId') || urlParams.get('chatId') || `anon_${Date.now()}`;
        const projectId = urlParams.get('projectId');

        const clientInfo = { ws, type: clientType, id: clientId, projectId };

        // Use a unique connection ID in case a user has multiple tabs open
        const connectionId = `${clientId}_${Date.now()}_${Math.random()}`;
        connectedClients.set(connectionId, clientInfo);

        console.log(`[WS] Client connected: ${clientType} (${clientId}) - connectionId: ${connectionId}`);

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                // Handle ping/pong if needed
                if (data.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
            } catch (e) { }
        });

        ws.on('close', () => {
            console.log(`[WS] Client disconnected: ${clientType} (${clientId})`);
            connectedClients.delete(connectionId);
        });

        ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to ContextBot Realtime', connectionId }));
    });
}

// Broadcast to dashboard clients
function broadcastToDashboard(eventType, payload) {
    connectedClients.forEach((client, connectionId) => {
        if (client.type === 'dashboard' && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: eventType, payload }));
        }
    });
}

// Send to specific widget (chatId)
function sendToWidget(chatId, eventType, payload) {
    connectedClients.forEach((client, connectionId) => {
        if (client.type === 'widget' && client.id === chatId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: eventType, payload }));
        }
    });
}

module.exports = {
    init,
    broadcastToDashboard,
    sendToWidget
};
