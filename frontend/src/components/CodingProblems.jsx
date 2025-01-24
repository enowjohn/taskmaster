import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

const CodingProblems = () => {
  const [problems, setProblems] = useState([]);
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    category: 'algorithms'
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await axios.get('/api/problems');
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
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
        description: '',
        difficulty: 'medium',
        category: 'algorithms'
      });
      toast.success('Problem added successfully!');
    } catch (error) {
      console.error('Error adding problem:', error);
      toast.error('Failed to add problem');
    }
  };

  const handleStatusChange = async (problemId, newStatus) => {
    try {
      await axios.patch(`/api/problems/${problemId}`, { status: newStatus });
      setProblems(problems.map(problem =>
        problem._id === problemId ? { ...problem, status: newStatus } : problem
      ));
      toast.success('Problem status updated');
    } catch (error) {
      console.error('Error updating problem status:', error);
      toast.error('Failed to update problem status');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProblem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Add New Coding Problem</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={newProblem.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={newProblem.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                name="difficulty"
                value={newProblem.difficulty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={newProblem.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="algorithms">Algorithms</option>
                <option value="data-structures">Data Structures</option>
                <option value="strings">Strings</option>
                <option value="arrays">Arrays</option>
                <option value="dynamic-programming">Dynamic Programming</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Problem
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {problems.map(problem => (
          <div key={problem._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-gray-600 mt-2">{problem.description}</p>
                <div className="mt-4 space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-800">
                    {problem.category}
                  </span>
                </div>
              </div>
              
              <div className="space-x-2">
                <button
                  onClick={() => handleStatusChange(problem._id, 'in-progress')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Start
                </button>
                <button
                  onClick={() => handleStatusChange(problem._id, 'completed')}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodingProblems;
