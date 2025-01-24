const { Server } = require('socket.io');
let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log('User joined room:', userId);
    });

    socket.on('send_message', (data) => {
      io.to(data.recipientId).emit('receive_message', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('typing', (data) => {
      socket.to(data.recipientId).emit('user_typing', {
        senderId: data.senderId,
        typing: true
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.recipientId).emit('user_typing', {
        senderId: data.senderId,
        typing: false
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
