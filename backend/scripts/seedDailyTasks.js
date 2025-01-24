const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('../models/Task');

const sampleTasks = [
  {
    title: 'Review Code Changes',
    description: 'Review and provide feedback on pending pull requests from team members.',
    priority: 'high',
    status: 'pending',
    type: 'daily'
  },
  {
    title: 'Daily Stand-up Meeting',
    description: 'Participate in the daily team stand-up meeting to discuss progress and blockers.',
    priority: 'medium',
    status: 'pending',
    type: 'daily'
  },
  {
    title: 'Update Documentation',
    description: 'Keep project documentation up-to-date with recent changes and new features.',
    priority: 'medium',
    status: 'in-progress',
    type: 'daily'
  },
  {
    title: 'Code Testing',
    description: 'Run and maintain unit tests for the codebase.',
    priority: 'high',
    status: 'pending',
    type: 'daily'
  },
  {
    title: 'Learning Session',
    description: 'Spend time learning new technologies or improving existing skills.',
    priority: 'low',
    status: 'pending',
    type: 'daily'
  },
  {
    title: 'Code Optimization',
    description: 'Identify and optimize performance bottlenecks in the application.',
    priority: 'medium',
    status: 'completed',
    type: 'daily'
  },
  {
    title: 'Bug Fixes',
    description: 'Address and fix reported bugs in the issue tracker.',
    priority: 'high',
    status: 'in-progress',
    type: 'daily'
  },
  {
    title: 'Code Review',
    description: 'Review code changes and provide feedback to team members.',
    priority: 'medium',
    status: 'completed',
    type: 'daily'
  }
];

async function seedTasks(userId) {
  try {
    // Clear existing daily tasks for this user
    await Task.deleteMany({ user: userId, type: 'daily' });

    // Add new tasks
    const tasksWithUser = sampleTasks.map(task => ({
      ...task,
      user: userId
    }));

    await Task.insertMany(tasksWithUser);
    console.log('Sample daily tasks have been added successfully!');
  } catch (error) {
    console.error('Error seeding tasks:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Replace with the actual user ID when running the script
    const userId = process.argv[2];
    if (!userId) {
      console.error('Please provide a user ID as an argument');
      process.exit(1);
    }
    seedTasks(userId);
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
