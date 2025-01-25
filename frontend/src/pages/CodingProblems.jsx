import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';

const difficultyColors = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#f44336',
};

const CodingProblems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProblem, setEditProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    category: 'algorithms',
    solution: '',
    testCases: '',
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await axios.get('/api/problems');
      setProblems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching problems:', error);
      setLoading(false);
    }
  };

  const handleOpen = (problem = null) => {
    if (problem) {
      setEditProblem(problem);
      setFormData({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
        solution: problem.solution,
        testCases: problem.testCases,
      });
    } else {
      setEditProblem(null);
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        category: 'algorithms',
        solution: '',
        testCases: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProblem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProblem) {
        await axios.put(`/api/problems/${editProblem._id}`, formData);
      } else {
        await axios.post('/api/problems', formData);
      }
      fetchProblems();
      handleClose();
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  };

  const handleDelete = async (problemId) => {
    try {
      await axios.delete(`/api/problems/${problemId}`);
      fetchProblems();
    } catch (error) {
      console.error('Error deleting problem:', error);
    }
  };

  const filteredProblems = problems
    .filter((problem) => {
      if (filter === 'all') return true;
      return problem.difficulty === filter;
    })
    .filter((problem) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Coding Problems</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Problem
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search Problems"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={filter}
              label="Difficulty"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredProblems.map((problem) => (
          <Grid item xs={12} key={problem._id}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <CodeIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {problem.title}
                  </Typography>
                  <Chip
                    label={problem.difficulty}
                    size="small"
                    sx={{
                      backgroundColor: difficultyColors[problem.difficulty],
                      color: 'white',
                      mr: 1,
                    }}
                  />
                  <Chip label={problem.category} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {problem.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Test Cases:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <pre>{problem.testCases}</pre>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Solution:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <pre>{problem.solution}</pre>
                  </Paper>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleOpen(problem)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(problem._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editProblem ? 'Edit Problem' : 'New Problem'}
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
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={formData.difficulty}
                    label="Difficulty"
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <MenuItem value="algorithms">Algorithms</MenuItem>
                    <MenuItem value="data-structures">Data Structures</MenuItem>
                    <MenuItem value="strings">Strings</MenuItem>
                    <MenuItem value="arrays">Arrays</MenuItem>
                    <MenuItem value="dynamic-programming">
                      Dynamic Programming
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Test Cases"
              value={formData.testCases}
              onChange={(e) =>
                setFormData({ ...formData, testCases: e.target.value })
              }
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Solution"
              value={formData.solution}
              onChange={(e) =>
                setFormData({ ...formData, solution: e.target.value })
              }
              multiline
              rows={6}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editProblem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodingProblems;
