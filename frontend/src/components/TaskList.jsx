import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/comments`);
      setComments(prev => ({ ...prev, [taskId]: response.data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;
    
    try {
      const response = await axios.post(`/api/tasks/${taskId}/comments`, {
        content: newComment,
        author: user._id
      });
      
      setComments(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), response.data]
      }));
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleTaskClick = (taskId) => {
    if (selectedTask === taskId) {
      setSelectedTask(null);
    } else {
      setSelectedTask(taskId);
      fetchComments(taskId);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {tasks.map(task => (
          <Grid item xs={12} key={task._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {task.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Assigned to: {task.assignedTo}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={task.status}
                    color={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'info' : 'warning'}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Due: {format(new Date(task.dueDate), 'PPP')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task._id, 'in-progress');
                    }}
                    sx={{ mr: 1 }}
                  >
                    Start
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task._id, 'completed');
                    }}
                  >
                    Complete
                  </Button>
                </Box>
                {selectedTask === task._id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold mb-2">Comments</h4>
                    <div className="space-y-2 mb-4">
                      {comments[task._id]?.map(comment => (
                        <div key={comment._id} className="bg-gray-50 p-2 rounded">
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-gray-500">
                            By {comment.author.name} on {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <TextField
                        fullWidth
                        size="small"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddComment(task._id)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TaskList;
