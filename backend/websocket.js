const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    if (!token) {
      ws.close();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      clients.set(userId, ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'message' && data.recipient) {
            const recipientWs = clients.get(data.recipient);
            if (recipientWs) {
              recipientWs.send(JSON.stringify({
                type: 'message',
                sender: userId,
                content: data.content,
                timestamp: new Date()
              }));
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        clients.delete(userId);
      });

    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close();
    }
  });

  return wss;
}

module.exports = setupWebSocket;
