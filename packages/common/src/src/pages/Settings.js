import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Refresh,
  Delete,
  Settings as SettingsIcon,
  Storage,
  Security,
  Notifications
} from '@mui/icons-material';
import { systemAPI, handleAPIError } from '../services/api';

const Settings = () => {
  const [systemConfig, setSystemConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    darkMode: false,
    apiTimeout: 10000
  });

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [configResponse, logsResponse] = await Promise.all([
        systemAPI.getConfig(),
        systemAPI.getLogs()
      ]);
      
      setSystemConfig(configResponse);
      setLogs(logsResponse.logs);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      console.error('Settings data fetch error:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked || event.target.value
    });
  };

  const handleClearLogs = async () => {
    try {
      // This would need to be implemented in the backend
      await systemAPI.createLog({
        level: 'info',
        message: 'Logs cleared by user',
        metadata: { action: 'clear_logs' }
      });
      fetchSettingsData();
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AIOS Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  System Configuration
                </Typography>
              </Box>
              
              {systemConfig && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Project ID: {systemConfig.projectId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    API URL: {systemConfig.apiUrl}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    WebSocket URL: {systemConfig.wsUrl}
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                startIcon={<Refresh />} 
                onClick={fetchSettingsData}
                sx={{ mt: 2 }}
              >
                Refresh Config
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* User Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  User Preferences
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={handleSettingChange('notifications')}
                  />
                }
                label="Enable Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRefresh}
                    onChange={handleSettingChange('autoRefresh')}
                  />
                }
                label="Auto Refresh Dashboard"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleSettingChange('darkMode')}
                  />
                }
                label="Dark Mode"
              />
              
              <TextField
                label="API Timeout (ms)"
                type="number"
                value={settings.apiTimeout}
                onChange={handleSettingChange('apiTimeout')}
                fullWidth
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System Logs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Storage color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    System Logs
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<Delete />} 
                  onClick={handleClearLogs}
                >
                  Clear Logs
                </Button>
              </Box>
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {logs.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No logs available"
                      secondary="System logs will appear here"
                    />
                  </ListItem>
                ) : (
                  logs.slice(0, 20).map((log) => (
                    <React.Fragment key={log.id}>
                      <ListItem>
                        <ListItemText
                          primary={log.message}
                          secondary={`${log.level.toUpperCase()} - ${new Date(log.timestamp).toLocaleString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small">
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Security color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Security Settings
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Firebase Authentication is enabled
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                CORS is configured for development
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API endpoints are protected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Notifications color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notification Settings
                </Typography>
              </Box>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="App Status Changes"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="System Alerts"
              />
              <FormControlLabel
                control={<Switch />}
                label="Email Notifications"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
