const express = require('express');
const router = express.Router();
const DailyTask = require('../models/DailyTask');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Get all daily tasks for the current user (either as creator or assignee)
router.get('/', async (req, res) => {
  try {
    const tasks = await DailyTask.find({
      $or: [
        { createdBy: req.user._id },
        { assignee: req.user._id },
        { supervisor: req.user._id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('assignee', 'name email')
    .populate('supervisor', 'name email')
    .sort({ date: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new daily task
router.post('/', async (req, res) => {
  try {
    const { title, description, assigneeEmail, date } = req.body;
    
    // Check if assignee exists in the system
    let assignee = await User.findOne({ email: assigneeEmail });
    
    const task = new DailyTask({
      title,
      description,
      createdBy: req.user._id,
      assigneeEmail,
      assignee: assignee ? assignee._id : null,
      date: new Date(date)
    });

    await task.save();

    // Send email notification
    const emailText = assignee
      ? `You have been assigned a new task: ${title}`
      : `You have been invited to review a task: ${title}. Please create an account at our platform to manage this task.`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: assigneeEmail,
      subject: 'New Task Assignment',
      text: emailText,
      html: `
        <h2>New Task Assignment</h2>
        <p>${emailText}</p>
        <h3>Task Details:</h3>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Due Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        ${!assignee ? '<p><a href="http://localhost:3000/register">Click here to create your account</a></p>' : ''}
      `
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await DailyTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    // Notify creator if task is marked for review
    if (status === 'needs-review') {
      const creator = await User.findById(task.createdBy);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: creator.email,
        subject: 'Task Ready for Review',
        text: `The task "${task.title}" is ready for your review.`,
        html: `
          <h2>Task Ready for Review</h2>
          <p>The task "${task.title}" has been marked as ready for review.</p>
          <p><a href="http://localhost:3000/dashboard/daily-tasks">Click here to review the task</a></p>
        `
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add supervisor comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { comment } = req.body;
    const task = await DailyTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.supervisorComment = comment;
    await task.save();

    // Notify assignee about the comment
    if (task.assignee) {
      const assignee = await User.findById(task.assignee);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: assignee.email,
        subject: 'New Comment on Your Task',
        text: `You have received a new comment on your task "${task.title}": ${comment}`,
        html: `
          <h2>New Task Comment</h2>
          <p>You have received a new comment on your task "${task.title}":</p>
          <p><strong>Comment:</strong> ${comment}</p>
          <p><a href="http://localhost:3000/dashboard/daily-tasks">Click here to view the task</a></p>
        `
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
