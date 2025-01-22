import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

const CodingProblems = () => {
  const [problems, setProblems] = useState([]);
  const [platform, setPlatform] = useState('all');
  const [newProblem, setNewProblem] = useState({
    title: '',
    platform: 'leetcode',
    difficulty: 'medium',
    link: '',
    description: '',
  });

  useEffect(() => {
    fetchProblems();
  }, [platform]);

  const fetchProblems = async () => {
    try {
      const response = await axios.get(`/api/problems${platform !== 'all' ? `?platform=${platform}` : ''}`);
      setProblems(response.data);
    } catch (error) {
      toast.error('Failed to fetch coding problems');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/problems', newProblem);
      setProblems([...problems, response.data]);
      setNewProblem({
        title: '',
        platform: 'leetcode',
        difficulty: 'medium',
        link: '',
        description: '',
      });
      toast.success('Problem added successfully');
    } catch (error) {
      toast.error('Failed to add problem');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Coding Problems</h2>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="hackerrank">HackerRank</option>
            <option value="codewars">CodeWars</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link</label>
              <input
                type="url"
                value={newProblem.link}
                onChange={(e) => setNewProblem({ ...newProblem, link: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Platform</label>
              <select
                value={newProblem.platform}
                onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="leetcode">LeetCode</option>
                <option value="hackerrank">HackerRank</option>
                <option value="codewars">CodeWars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={newProblem.difficulty}
                onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newProblem.description}
              onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Problem
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {problems.map((problem) => (
            <div key={problem._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    <a href={problem.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                      {problem.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{problem.platform}</p>
                  <p className="mt-2">{problem.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
            </div>
          ))}

          {problems.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No coding problems found. Add a new problem to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingProblems;
