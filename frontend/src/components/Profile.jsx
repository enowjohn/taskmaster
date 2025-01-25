import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Container,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.currentPassword && formData.newPassword) {
        data.append('currentPassword', formData.currentPassword);
        data.append('newPassword', formData.newPassword);
      }
      if (file) {
        data.append('profilePicture', file);
      }

      const response = await api.put('/api/auth/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setSuccess('Profile updated successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Profile Settings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={preview || user?.profilePicture}
                sx={{ width: 100, height: 100 }}
              />
              <IconButton
                color="primary"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  backgroundColor: 'background.paper',
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleFileChange}
                />
                <PhotoCamera />
              </IconButton>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Change Password (Optional)
          </Typography>

          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleInputChange}
            margin="normal"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
