import { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  Card,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';

export default function DailyTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    assigneeEmail: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newComment, setNewComment] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/daily-tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/daily-tasks', newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ 
        title: '', 
        description: '', 
        assigneeEmail: '',
        date: new Date().toISOString().split('T')[0]
      });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const response = await axios.patch(`/api/daily-tasks/${taskId}/status`, { status });
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? response.data : task
      );
      setTasks(updatedTasks);
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post(`/api/daily-tasks/${taskId}/comments`, {
        content: newComment
      });
      
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? response.data : task
      );
      setTasks(updatedTasks);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Typography variant="h5" className="mb-4">Create New Task</Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Assignee Email"
            type="email"
            value={newTask.assigneeEmail}
            onChange={(e) => setNewTask({ ...newTask, assigneeEmail: e.target.value })}
            required
          />
          <TextField
            fullWidth
            type="date"
            label="Due Date"
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Create Task
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Typography variant="h6">{task.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created by: {task.createdBy?.name} | 
                    Assigned to: {task.assignee?.name} |
                    Due: {formatDate(task.date)}
                  </Typography>
                </div>
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Status"
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="reviewed">Reviewed</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <Typography variant="body1">{task.description}</Typography>

              <Divider />

              <div>
                <Typography variant="h6" className="mb-2">Comments</Typography>
                <List>
                  {task.comments?.map((comment, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{comment.createdBy?.name?.[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.createdBy?.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {comment.content}
                            </Typography>
                            {' — '}{formatDate(comment.createdAt)}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Box className="mt-2 flex gap-2">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add a comment..."
                    value={task._id === selectedTask ? newComment : ''}
                    onChange={(e) => {
                      setSelectedTask(task._id);
                      setNewComment(e.target.value);
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddComment(task._id)}
                    disabled={task._id !== selectedTask || !newComment.trim()}
                  >
                    Comment
                  </Button>
                </Box>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
