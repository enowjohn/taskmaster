import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Flag as FlagIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

const priorityColors = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
};

const priorityIcons = {
  high: <FlagIcon style={{ color: priorityColors.high }} />,
  medium: <FlagIcon style={{ color: priorityColors.medium }} />,
  low: <FlagIcon style={{ color: priorityColors.low }} />,
};

const DailyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/daily-tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      try {
        const newStatus = destination.droppableId;
        
        // Optimistically update the UI
        const updatedTasks = tasks.map(task =>
          task._id === draggableId ? { ...task, status: newStatus } : task
        );
        setTasks(updatedTasks);

        // Update the server
        await axios.patch(`/api/daily-tasks/${draggableId}`, {
          status: newStatus
        });

        setSuccess(`Task moved to ${newStatus.replace('-', ' ')}`);
      } catch (error) {
        console.error('Error updating task status:', error);
        setError('Failed to update task status. Please try again.');
        fetchTasks(); // Revert to server state
      }
    }
  };

  const handleOpen = (task = null) => {
    if (task) {
      setEditTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
      });
    } else {
      setEditTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        const response = await axios.put(`/api/daily-tasks/${editTask._id}`, formData);
        setTasks(tasks.map(task => 
          task._id === editTask._id ? response.data : task
        ));
        setSuccess('Task updated successfully!');
      } else {
        const response = await axios.post('/api/daily-tasks', formData);
        setTasks([response.data, ...tasks]);
        setSuccess('Task created successfully!');
      }
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(error.response?.data?.message || 'Error saving task. Please try again.');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/daily-tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      setSuccess('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getColumnTitle = (status) => {
    switch (status) {
      case 'pending':
        return {
          text: 'To Do',
          icon: <ScheduleIcon />,
          count: getTasksByStatus(status).length,
        };
      case 'in-progress':
        return {
          text: 'In Progress',
          icon: <PlayArrowIcon />,
          count: getTasksByStatus(status).length,
        };
      case 'completed':
        return {
          text: 'Completed',
          icon: <CheckCircleIcon />,
          count: getTasksByStatus(status).length,
        };
      default:
        return { text: status, icon: null, count: 0 };
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Daily Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {['pending', 'in-progress', 'completed'].map((status) => {
            const { text, icon, count } = getColumnTitle(status);
            return (
              <Grid item xs={12} md={4} key={status}>
                <Paper
                  sx={{
                    p: 2,
                    height: '100%',
                    backgroundColor: theme =>
                      status === 'completed'
                        ? theme.palette.success.light
                        : theme.palette.background.default,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                      {text}
                    </Typography>
                    <Chip label={count} size="small" />
                  </Box>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ minHeight: 500 }}
                      >
                        {getTasksByStatus(status).map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{ mb: 2 }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                                      <DragIndicatorIcon color="action" />
                                    </Box>
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                      {task.title}
                                    </Typography>
                                    <Tooltip title={`Priority: ${task.priority}`}>
                                      {priorityIcons[task.priority]}
                                    </Tooltip>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                  >
                                    {task.description}
                                  </Typography>
                                </CardContent>
                                <CardActions>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpen(task)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDelete(task._id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </CardActions>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DragDropContext>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editTask ? 'Edit Task' : 'New Task'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DailyTasks;
