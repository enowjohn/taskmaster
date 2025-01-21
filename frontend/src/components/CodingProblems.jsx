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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from 'axios';

const CodingProblems = () => {
  const [problems, setProblems] = useState([]);
  const [platform, setPlatform] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProblem, setNewProblem] = useState({
    title: '',
    platform: 'leetcode',
    difficulty: 'medium',
    link: '',
    assignedTo: '',
  });

  useEffect(() => {
    fetchProblems();
  }, [platform]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = platform === 'all'
        ? 'http://localhost:9000/api/problems'
        : `http://localhost:9000/api/problems/platform/${platform}`;
      
      const response = await axios.get(url, { withCredentials: true });
      if (response.data) {
        setProblems(response.data);
      } else {
        setError('No coding problems found');
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError(error.response?.data?.message || 'Failed to fetch coding problems');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:9000/api/problems', newProblem);
      setNewProblem({
        title: '',
        platform: 'leetcode',
        difficulty: 'medium',
        link: '',
        assignedTo: '',
      });
      fetchProblems();
    } catch (error) {
      console.error('Error adding problem:', error);
    }
  };

  const handleStatusChange = async (problemId, newStatus) => {
    try {
      await axios.patch(`http://localhost:9000/api/problems/${problemId}`, {
        status: newStatus,
      });
      fetchProblems();
    } catch (error) {
      console.error('Error updating problem status:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'error',
    };
    return colors[difficulty] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Coding Problems
        </Typography>
        <FormControl sx={{ minWidth: 200, mb: 3 }}>
          <InputLabel>Platform</InputLabel>
          <Select
            value={platform}
            label="Platform"
            onChange={(e) => setPlatform(e.target.value)}
          >
            <MenuItem value="all">All Platforms</MenuItem>
            <MenuItem value="leetcode">LeetCode</MenuItem>
            <MenuItem value="hackerrank">HackerRank</MenuItem>
            <MenuItem value="codewars">CodeWars</MenuItem>
          </Select>
        </FormControl>
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add New Problem
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={newProblem.title}
                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Link"
                    value={newProblem.link}
                    onChange={(e) => setNewProblem({ ...newProblem, link: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      value={newProblem.platform}
                      label="Platform"
                      onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                    >
                      <MenuItem value="leetcode">LeetCode</MenuItem>
                      <MenuItem value="hackerrank">HackerRank</MenuItem>
                      <MenuItem value="codewars">CodeWars</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={newProblem.difficulty}
                      label="Difficulty"
                      onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Assigned To"
                    value={newProblem.assignedTo}
                    onChange={(e) => setNewProblem({ ...newProblem, assignedTo: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Add Problem
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading coding problems...</Typography>
        </Box>
      )}
      
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!loading && !error && problems.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>No coding problems found. Add a new problem to get started!</Typography>
        </Box>
      )}

      {!loading && !error && problems.length > 0 && (
        <Grid container spacing={3}>
          {problems.map((problem) => (
            <Grid item xs={12} sm={6} md={4} key={problem._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {problem.title}
                  </Typography>
                  <Box sx={{ my: 1 }}>
                    <Chip
                      label={problem.platform}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={problem.difficulty}
                      color={getDifficultyColor(problem.difficulty)}
                      size="small"
                    />
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Assigned to: {problem.assignedTo}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href={problem.link}
                    target="_blank"
                    sx={{ mb: 2 }}
                  >
                    View Problem
                  </Button>
                  <Box>
                    <Button
                      variant="contained"
                      size="small"
                      color={problem.status === 'completed' ? 'success' : 'primary'}
                      onClick={() => handleStatusChange(
                        problem._id,
                        problem.status === 'completed' ? 'pending' : 'completed'
                      )}
                      fullWidth
                    >
                      {problem.status === 'completed' ? 'Completed' : 'Mark as Complete'}
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

export default CodingProblems;
