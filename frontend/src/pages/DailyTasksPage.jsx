import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import DailyTaskForm from '../components/DailyTaskForm';
import DailyTaskList from '../components/DailyTaskList';

const DailyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/daily-tasks');
      console.log('Fetched tasks:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask) => {
    console.log('New task added:', newTask);
    setTasks([newTask, ...tasks]);
  };

  const handleTaskUpdated = (updatedTask) => {
    console.log('Task updated:', updatedTask);
    setTasks(tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId) => {
    console.log('Task deleted:', taskId);
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Tasks</h1>
        <p className="mt-2 text-gray-600">Create and manage your daily tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
          <DailyTaskForm onTaskAdded={handleTaskAdded} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tasks</h2>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
            </div>
          ) : (
            <DailyTaskList
              tasks={tasks}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTasksPage;
