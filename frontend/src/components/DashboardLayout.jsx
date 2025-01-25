import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiCalendar, FiCode, FiMessageSquare, FiUser, FiLogOut } from 'react-icons/fi';

const DashboardLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16">
            <h1 className="text-xl font-bold text-gray-800">TaskMaster</h1>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="p-4 space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center p-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${
                    isActive('/dashboard') ? 'bg-purple-50 text-purple-600' : ''
                  }`}
                >
                  <FiHome className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/tasks"
                  className={`flex items-center p-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${
                    isActive('/tasks') ? 'bg-purple-50 text-purple-600' : ''
                  }`}
                >
                  <FiCalendar className="w-5 h-5 mr-3" />
                  Daily Tasks
                </Link>
              </li>
              <li>
                <Link
                  to="/problems"
                  className={`flex items-center p-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${
                    isActive('/problems') ? 'bg-purple-50 text-purple-600' : ''
                  }`}
                >
                  <FiCode className="w-5 h-5 mr-3" />
                  Coding Problems
                </Link>
              </li>
              <li>
                <Link
                  to="/inbox"
                  className={`flex items-center p-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${
                    isActive('/inbox') ? 'bg-purple-50 text-purple-600' : ''
                  }`}
                >
                  <FiMessageSquare className="w-5 h-5 mr-3" />
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  className={`flex items-center p-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors ${
                    isActive('/account') ? 'bg-purple-50 text-purple-600' : ''
                  }`}
                >
                  <FiUser className="w-5 h-5 mr-3" />
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
          <div className="p-4">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
