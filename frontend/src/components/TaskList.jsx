import { useState, useEffect } from 'react';
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
import axios from 'axios';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:9000/api/tasks', { withCredentials: true });
      if (response.data) {
        setTasks(response.data);
      } else {
        setError('No tasks found');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:9000/api/tasks/${taskId}`, {
        status: newStatus,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAddComment = async (taskId) => {
    try {
      await axios.post('http://localhost:9000/api/comments', {
        taskId,
        content: newComment,
        author: 'User', // Replace with actual user
      });
      setNewComment('');
      fetchComments(taskId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const response = await axios.get(`http://localhost:9000/api/comments/task/${taskId}`);
      setComments(prev => ({ ...prev, [taskId]: response.data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      'in-progress': 'info',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading tasks...</Typography>
        </Box>
      )}
      
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!loading && !error && tasks.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>No tasks found. Create a new task to get started!</Typography>
        </Box>
      )}

      {!loading && !error && tasks.length > 0 && (
        <Grid container spacing={3}>
          {tasks.map((task) => (
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
                      color={getStatusColor(task.status)}
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
                      onClick={() => handleStatusChange(task._id, 'in-progress')}
                      sx={{ mr: 1 }}
                    >
                      Start
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleStatusChange(task._id, 'completed')}
                    >
                      Complete
                    </Button>
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddComment(task._id)}
                    >
                      Add Comment
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TaskList;
