// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const Message = mongoose.model('Message', messageSchema);
const User = mongoose.model('User', userSchema);

// WebSocket connection handling
const clients = new Map();

wss.on('connection', (ws, req) => {
  const userId = new URL(req.url, 'http://localhost').searchParams.get('userId');
  if (userId) {
    clients.set(userId, ws);
  }

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type === 'message') {
      const recipientWs = clients.get(data.message.recipient);
      if (recipientWs) {
        recipientWs.send(JSON.stringify({
          type: 'message',
          message: data.message
        }));
      }
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
    }
  });
});

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversations
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(req.user._id) },
            { recipient: mongoose.Types.ObjectId(req.user._id) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', mongoose.Types.ObjectId(req.user._id)] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          '_id': 1,
          'user.name': 1,
          'user.email': 1,
          'lastMessage': 1
        }
      }
    ]);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages between two users
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const message = new Message({
      sender: req.user._id,
      recipient: req.body.recipientId,
      content: req.body.content
    });
    
    const savedMessage = await message.save();
    
    // Send message through WebSocket if recipient is connected
    const recipientWs = clients.get(req.body.recipientId);
    if (recipientWs) {
      recipientWs.send(JSON.stringify({
        type: 'message',
        message: savedMessage
      }));
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});