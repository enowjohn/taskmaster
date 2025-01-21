import React, { useState } from 'react';
import { FiPlus, FiCalendar, FiMail, FiClock, FiUser } from 'react-icons/fi';

const DailyTaskForm = ({ onSubmit }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [dueTime, setDueTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const task = {
      title: taskTitle,
      description,
      supervisorEmail,
      dueTime,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      feedback: [],
    };
    onSubmit(task);
    // Reset form
    setTaskTitle('');
    setDescription('');
    setSupervisorEmail('');
    setDueTime('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FiPlus className="mr-2" /> New Daily Task
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
            placeholder="Describe the task in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Supervisor's Email *
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
              className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="supervisor@example.com"
              required
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Your supervisor will receive an email notification
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Due Time Today *
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create Task</span>
        </button>
      </form>
    </div>
  );
};

export default DailyTaskForm;
