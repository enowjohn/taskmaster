import React, { useState } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { FiMessageCircle, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { FiClock, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';

const TaskComments = ({ task, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`/api/daily-tasks/${task._id}/comments`, {
        content: comment
      });
      onCommentAdded(response.data);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        {task?.comments?.map((comment, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <img
                src={comment.author?.profilePicture || '/default-avatar.png'}
                alt={comment.author?.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-sm">{comment.author?.name}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add a comment..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

const DailyTaskList = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const [expandedTask, setExpandedTask] = useState(null);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(`/api/daily-tasks/${taskId}`, {
        status: newStatus
      });
      onTaskUpdated(response.data);
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`/api/daily-tasks/${taskId}`);
      onTaskDeleted(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'reviewed':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-600">{task.description}</p>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <img
                    src={task.assignedTo.profilePicture || '/default-avatar.png'}
                    alt={task.assignedTo.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>Assigned to: {task.assignedTo.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <img
                    src={task.supervisor.profilePicture || '/default-avatar.png'}
                    alt={task.supervisor.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>Supervisor: {task.supervisor.name}</span>
                </div>
              </div>
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => handleStatusUpdate(task._id, 'completed')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusUpdate(task._id, 'reviewed')}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiMessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {expandedTask === task._id && (
              <TaskComments
                task={task}
                onCommentAdded={onTaskUpdated}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DailyTaskList;
