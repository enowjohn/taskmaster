const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const auth = require('./middleware/auth');
const path = require('path');
const { createServer } = require('http');
const { initializeSocket } = require('./services/socket');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);


// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // console.log({ origin, url:  process.env.FRONT_END_URL, });


    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:5173',
      'https://taskmaster-app.onrender.com',
      'https://coding-tasks-api.onrender.com',
        'https://taskmaster-22yfc6qsg-enow-john-enowbis-projects.vercel.app',
      // process.env.FRONT_END_URL,
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
require('./config/passport');
app.use(passport.initialize());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    // Test the connection
    try {
      await mongoose.connection.db.admin().ping();
      console.log('MongoDB connection is healthy');
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Models
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const CodingProblem = require('./models/CodingProblem');
const Message = require('./models/Message');

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/tasks', auth, require('./routes/tasks'));
app.use('/api/problems', auth, require('./routes/problems'));
app.use('/api/comments', auth, require('./routes/comments'));
app.use('/api/daily-tasks', auth, require('./routes/daily-tasks'));
app.use('/api/users', auth, require('./routes/users'));
app.use('/api/messages', auth, require('./routes/messages'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error' });
    }
  }

  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
