import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import DailyTaskForm from '../components/DailyTaskForm';
import DailyTaskList from '../components/DailyTaskList';

const Dashboard = () => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      const response = await axios.get('/api/daily-tasks');
      setDailyTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      const response = await axios.post('/api/daily-tasks', taskData);
      setDailyTasks([...dailyTasks, response.data]);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await axios.delete(`/api/daily-tasks/${taskId}`);
      setDailyTasks(dailyTasks.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await axios.put(`/api/daily-tasks/${taskId}`, updates);
      setDailyTasks(dailyTasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your tasks and activities.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{dailyTasks.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dailyTasks.filter(task => task.status === 'in-progress').length}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <CalendarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dailyTasks.filter(task => task.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <DailyTaskForm onSubmit={handleTaskSubmit} />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
            <DailyTaskList 
              tasks={dailyTasks} 
              onDelete={handleTaskDelete}
              onUpdate={handleTaskUpdate}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
