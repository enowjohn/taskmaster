import React from 'react';
import { FiCheck, FiX, FiMessageSquare, FiClock, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DailyTaskList = ({ tasks, onUpdateTask, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-gray-400">Loading daily tasks...</p>
      </motion.div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-gray-400">No daily tasks found. Create a new task to get started!</p>
      </motion.div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-400';
      case 'Needs Review':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{task.title}</h3>
              <p className="text-gray-400 mt-1">{task.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <FiClock />
              <span>Due: {task.dueTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <FiMail />
              <span>Supervisor: {task.supervisorEmail}</span>
            </div>
          </div>

          {task.feedback && task.feedback.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-gray-300">Feedback History</h4>
              {task.feedback.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <p className="text-sm">{item.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => onUpdateTask(task.id, { status: 'Completed' })}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <FiCheck />
              <span>Mark Complete</span>
            </button>
            <button
              onClick={() => onUpdateTask(task.id, { status: 'Needs Review' })}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <FiMessageSquare />
              <span>Request Review</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DailyTaskList;
