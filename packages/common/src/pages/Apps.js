import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Refresh,
  Apps as AppsIcon
} from '@mui/icons-material';
import { appsAPI, handleAPIError } from '../services/api';

const Apps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    config: {}
  });

  const categories = [
    'general',
    'ai',
    'automation',
    'analytics',
    'productivity',
    'entertainment'
  ];

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appsAPI.getAll();
      setApps(response.apps);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      logger.error('Apps fetch error:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenDialog = (app = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        name: app.name,
        description: app.description,
        category: app.category,
        config: app.config
      });
    } else {
      setEditingApp(null);
      setFormData({
        name: '',
        description: '',
        category: 'general',
        config: {}
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingApp(null);
    setFormData({
      name: '',
      description: '',
      category: 'general',
      config: {}
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingApp) {
        await appsAPI.update(editingApp.id, formData);
      } else {
        await appsAPI.create(formData);
      }
      handleCloseDialog();
      fetchApps();
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      logger.error('App save error:', errorInfo);
    }
  };

  const handleDelete = async (appId) => {
    if (window.confirm('Are you sure you want to delete this app?')) {
      try {
        await appsAPI.delete(appId);
        fetchApps();
      } catch (err) {
        const errorInfo = handleAPIError(err);
        setError(errorInfo.message);
        logger.error('App delete error:', errorInfo);
      }
    }
  };

  const handleToggleStatus = async (app) => {
    try {
      const newStatus = app.status === 'active' ? 'inactive' : 'active';
      await appsAPI.toggleStatus(app.id, newStatus);
      fetchApps();
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      logger.error('App status toggle error:', errorInfo);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading apps...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          AIOS Applications
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={fetchApps}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => handleOpenDialog()}
          >
            Add App
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {apps.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <AppsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Apps Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first AI-powered application to get started with AIOS.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => handleOpenDialog()}
            >
              Create First App
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {apps.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {app.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {app.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip 
                      label={app.status} 
                      size="small"
                      color={app.status === 'active' ? 'success' : 'default'}
                    />
                    <Chip 
                      label={app.category} 
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(app.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={app.status === 'active' ? <Stop /> : <PlayArrow />}
                    onClick={() => handleToggleStatus(app)}
                  >
                    {app.status === 'active' ? 'Stop' : 'Start'}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleOpenDialog(app)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(app.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit App Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingApp ? 'Edit App' : 'Create New App'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="App Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingApp ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Apps;
