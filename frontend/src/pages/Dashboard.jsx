import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  HomeIcon,
  CodeBracketIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import DailyTaskForm from '../components/DailyTaskForm';
import DailyTaskList from '../components/DailyTaskList';
import Tasks from '../components/Tasks';
import Messages from '../components/Messages';
import Profile from '../components/Profile';
import CodingProblems from '../components/CodingProblems';
import { toast } from 'react-hot-toast';
import axios from '../config/axios';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Daily Tasks', href: '/dashboard/daily-tasks', icon: CalendarIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Coding Problems', href: '/dashboard/problems', icon: CodeBracketIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

const Dashboard = () => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      await sendEmailNotification(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const sendEmailNotification = async (task) => {
    try {
      await axios.post('/api/send-email', {
        email: task.assignedTo,
        taskDetails: task,
      });
      toast.success('Email notification sent!');
    } catch (error) {
      toast.error('Failed to send email notification');
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await axios.patch(`/api/daily-tasks/${taskId}`, updates);
      setDailyTasks(dailyTasks.map(task =>
        task._id === taskId ? response.data : task
      ));
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleTaskApproval = async (taskId) => {
    try {
      const response = await axios.patch(`/api/daily-tasks/${taskId}`, { status: 'approved' });
      setDailyTasks(dailyTasks.map(task =>
        task._id === taskId ? response.data : task
      ));
      toast.success('Task approved successfully');
    } catch (error) {
      toast.error('Failed to approve task');
    }
  };

  const handleTaskRejection = async (taskId) => {
    try {
      const response = await axios.patch(`/api/daily-tasks/${taskId}`, { status: 'rejected' });
      setDailyTasks(dailyTasks.map(task =>
        task._id === taskId ? response.data : task
      ));
      toast.success('Task rejected successfully');
    } catch (error) {
      toast.error('Failed to reject task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Overview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.name}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700">Active Tasks</h3>
            <p className="text-2xl mt-2">{dailyTasks.filter(t => t.status === 'in_progress').length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700">Completed Tasks</h3>
            <p className="text-2xl mt-2">{dailyTasks.filter(t => t.status === 'completed').length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-700">Pending Reviews</h3>
            <p className="text-2xl mt-2">{dailyTasks.filter(t => t.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
        <DailyTaskList
          tasks={dailyTasks.slice(0, 5)}
          onUpdateTask={handleTaskUpdate}
          onApproveTask={handleTaskApproval}
          onRejectTask={handleTaskRejection}
        />
      </div>
    </div>
  );

  const DailyTasks = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <DailyTaskForm onSubmit={handleTaskSubmit} />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">All Tasks</h2>
        <DailyTaskList
          tasks={dailyTasks}
          onUpdateTask={handleTaskUpdate}
          onApproveTask={handleTaskApproval}
          onRejectTask={handleTaskRejection}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <span className="text-2xl font-bold text-white">Code-Master</span>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                        } mr-3 h-6 w-6`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* User profile and logout */}
            <div className="flex-shrink-0 bg-gray-700 p-4">
              <div className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-gray-300 hover:text-white flex items-center"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/daily-tasks" element={<DailyTasks />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/problems" element={<CodingProblems />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
