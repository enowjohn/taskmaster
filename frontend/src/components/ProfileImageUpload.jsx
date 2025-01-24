import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

const ProfileImageUpload = () => {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        toast.error('Only image files (JPEG, PNG, GIF) are allowed');
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setOpen(true);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError('');

    try {
      // Create FormData and append file
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log('FormData:', key, value);
      }

      const response = await axios.post('/api/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setOpen(false);
      setSelectedFile(null);
      setPreview(null);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setError('');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        <Avatar
          src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&size=200`}
          alt={user?.name}
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="profile-image-upload"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="profile-image-upload">
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' } }}
          >
            <PhotoCamera />
          </IconButton>
        </label>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="upload-dialog-title"
      >
        <DialogTitle id="upload-dialog-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Update Profile Picture</Typography>
            <IconButton 
              onClick={handleClose}
              size="small"
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {preview && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Avatar
                src={preview}
                alt="Preview"
                sx={{ width: 200, height: 200 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            aria-label="cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || loading}
            startIcon={loading && <CircularProgress size={20} />}
            aria-label="upload"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileImageUpload;
