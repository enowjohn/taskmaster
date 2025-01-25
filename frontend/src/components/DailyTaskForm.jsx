import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { FiPlus, FiCalendar, FiMail, FiClock, FiUser } from 'react-icons/fi';

const DailyTaskForm = ({ onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    supervisor: '',
    dueTime: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.assignedTo || !formData.supervisor || !formData.dueTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting task:', formData);
      const response = await axios.post('/api/daily-tasks', {
        ...formData,
        status: 'todo'
      });
      
      toast.success('Task created successfully');
      onTaskAdded(response.data);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        supervisor: '',
        dueTime: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      toast.error(errorMessage);
      
      if (error.response?.data?.required) {
        console.log('Missing fields:', error.response.data.required);
      }
    } finally {
      setLoading(false);
    }
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
            name="title"
            value={formData.title}
            onChange={handleChange}
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
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
            placeholder="Describe the task in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority *
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Assign To *
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Supervisor *
          </label>
          <select
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            className="w-full bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select supervisor</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Due Time Today *
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="time"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? 'Creating...' : <><FiPlus className="w-5 h-5" /> Create Task</>}
        </button>
      </form>
    </div>
  );
};

export default DailyTaskForm;
