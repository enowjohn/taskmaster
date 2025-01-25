const express = require('express');
const router = express.Router();
const DailyTask = require('../models/DailyTask');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all daily tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await DailyTask.find({
      $or: [
        { assignedTo: req.user._id },
        { supervisor: req.user._id }
      ]
    })
    .populate('assignedTo', 'name email profilePicture')
    .populate('supervisor', 'name email profilePicture')
    .populate('comments.author', 'name email profilePicture')
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create a new daily task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, assignedTo, supervisor } = req.body;

    // Validate required fields
    if (!title || !description || !assignedTo || !supervisor) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify assignedTo user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    // Verify supervisor exists
    const supervisorUser = await User.findById(supervisor);
    if (!supervisorUser) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    const task = new DailyTask({
      title,
      description,
      priority,
      assignedTo,
      supervisor,
      dueDate: new Date(new Date().setHours(23, 59, 59, 999)) // End of current day
    });

    await task.save();

    const populatedTask = await DailyTask.findById(task._id)
      .populate('assignedTo', 'name email profilePicture')
      .populate('supervisor', 'name email profilePicture');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update a daily task
router.patch('/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Find task and check permissions
    const task = await DailyTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow updates by assignee or supervisor
    if (task.assignedTo.toString() !== req.user._id.toString() && 
        task.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // If status is being updated to 'completed', verify it's the assignee
    if (updates.status === 'completed' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assignee can mark a task as completed' });
    }

    // If status is being updated to 'reviewed', verify it's the supervisor
    if (updates.status === 'reviewed' && task.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the supervisor can mark a task as reviewed' });
    }

    const updatedTask = await DailyTask.findByIdAndUpdate(
      taskId,
      { $set: updates },
      { new: true }
    )
    .populate('assignedTo', 'name email profilePicture')
    .populate('supervisor', 'name email profilePicture')
    .populate('comments.author', 'name email profilePicture');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Add a comment to a task
router.post('/:taskId/comments', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Find task and check permissions
    const task = await DailyTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow comments by assignee or supervisor
    if (task.assignedTo.toString() !== req.user._id.toString() && 
        task.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    const comment = {
      content,
      author: req.user._id
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await DailyTask.findById(taskId)
      .populate('assignedTo', 'name email profilePicture')
      .populate('supervisor', 'name email profilePicture')
      .populate('comments.author', 'name email profilePicture');

    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Delete a task
router.delete('/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find task and check permissions
    const task = await DailyTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow deletion by supervisor
    if (task.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the supervisor can delete tasks' });
    }

    await DailyTask.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
