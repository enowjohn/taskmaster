const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all daily tasks for the current user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId })
      .populate('assignedTo', 'name email profilePicture')
      .populate('supervisor', 'name email profilePicture')
      .populate('comments.author', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({ message: 'Error fetching daily tasks' });
  }
});

// Create a new daily task
router.post('/', async (req, res) => {
  try {
    console.log('Creating task with data:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user?.userId);
    
    const { title, description, priority, assignedTo, supervisor, dueTime } = req.body;

    // Validate required fields
    if (!title || !description || !assignedTo || !supervisor || !dueTime) {
      console.log('Missing required fields:', {
        title: !!title,
        description: !!description,
        assignedTo: !!assignedTo,
        supervisor: !!supervisor,
        dueTime: !!dueTime
      });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: { title, description, assignedTo, supervisor, dueTime }
      });
    }

    // Validate MongoDB ObjectIds
    if (!assignedTo.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid assignedTo ID format' });
    }
    if (!supervisor.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid supervisor ID format' });
    }

    const taskData = {
      title,
      description,
      priority,
      assignedTo,
      supervisor,
      dueTime,
      user: req.user.userId,
      status: 'todo'
    };

    console.log('Creating task with data:', taskData);

    const task = new Task(taskData);
    await task.save();
    
    // Populate the user references before sending response
    await task.populate('assignedTo', 'name email');
    await task.populate('supervisor', 'name email');

    console.log('Task created successfully:', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating daily task. Full error:', error);
    console.error('Error message:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors
      });
    }
    res.status(500).json({ 
      message: 'Error creating daily task',
      error: error.message,
      stack: error.stack
    });
  }
});

// Update a daily task
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updates,
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('supervisor', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating daily task:', error);
    res.status(500).json({ message: 'Error updating daily task' });
  }
});

// Delete a daily task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily task:', error);
    res.status(500).json({ message: 'Error deleting daily task' });
  }
});

// Add a comment to a task
router.post('/:taskId/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user.userId
    };

    task.comments.push(comment);
    await task.save();

    // Populate the author details for the new comment
    const populatedTask = await Task.findById(task._id)
      .populate('comments.author', 'name email profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .populate('supervisor', 'name email profilePicture');

    res.json(populatedTask);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Get all tasks for the current user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId })
      .populate('assignedTo', 'name email')
      .populate('supervisor', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({ message: 'Error fetching daily tasks' });
  }
});

module.exports = router;
