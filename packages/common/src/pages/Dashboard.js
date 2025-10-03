import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Alert,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Divider
} from '@mui/material';
import { 
  Refresh, 
  Apps, 
  CheckCircle, 
  Error, 
  People, 
  Chat,
  OnlinePrediction,
  SmartToy,
  TrendingUp,
  NotificationsActive
} from '@mui/icons-material';
import { useFirebase } from '../services/FirebaseService';
import { systemAPI, appsAPI, handleAPIError } from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { loading: firebaseLoading } = useFirebase();
  const { user, userProfile } = useAuth();
  const [systemStatus, setSystemStatus] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [aiActivity, setAiActivity] = useState({
    responses: 0,
    lastActivity: null,
    status: 'active'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch system status and apps in parallel
      const [statusResponse, appsResponse] = await Promise.all([
        systemAPI.getStatus(),
        appsAPI.getAll()
      ]);
      
      setSystemStatus(statusResponse);
      setApps(appsResponse.apps);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      logger.error('Dashboard data fetch error:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket connection for live features
  useEffect(() => {
    if (user && userProfile && !firebaseLoading) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        logger.info('Connected to AIOS Live Dashboard');
        setIsConnected(true);
        
        // Join user room
        newSocket.emit('join_user_room', {
          userId: user.uid,
          userProfile: {
            uid: user.uid,
            email: user.email,
            displayName: userProfile.displayName || user.email?.split('@')[0] || 'User',
            photoURL: userProfile.photoURL || user.photoURL,
            role: userProfile.role || 'user'
          }
        });
      });

      newSocket.on('disconnect', () => {
        logger.info('Disconnected from AIOS Live Dashboard');
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('system_status_update', (status) => {
        setSystemStatus(status);
      });

      newSocket.on('app_updated', (data) => {
        setLiveNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'app_update',
          message: `App ${data.appId} status changed to ${data.status}`,
          timestamp: new Date()
        }]);
        fetchDashboardData(); // Refresh apps
      });

      newSocket.on('data_agent_update', (data) => {
        setAiActivity(prev => ({
          ...prev,
          responses: prev.responses + 1,
          lastActivity: new Date(),
          status: 'active'
        }));
      });

      newSocket.on('notification', (notification) => {
        setLiveNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'notification',
          message: notification.message,
          timestamp: new Date()
        }]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, userProfile, firebaseLoading]);

  useEffect(() => {
    if (!firebaseLoading) {
      fetchDashboardData();
    }
  }, [firebaseLoading]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (firebaseLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading AIOS Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<Refresh />} 
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" gutterBottom>
            AIOS Live Dashboard
          </Typography>
          <Chip
            icon={isConnected ? <OnlinePrediction /> : <Error />}
            label={isConnected ? 'Live' : 'Offline'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
        </Box>
        <Box display="flex" gap={1}>
          <Chip
            icon={<People />}
            label={`${onlineUsers.length} online`}
            variant="outlined"
            size="small"
          />
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Total Apps Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Apps color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Total Apps
              </Typography>
              </Box>
              <Typography variant="h2" color="primary">
                {systemStatus?.totalApps || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {apps.length} apps available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Active Apps Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Active Apps
                </Typography>
              </Box>
              <Typography variant="h2" color="success.main">
                {systemStatus?.activeApps || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently running
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Status Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  System Status
                </Typography>
              </Box>
              <Chip 
                label={systemStatus?.status || 'Unknown'} 
                color="success" 
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Last updated: {systemStatus?.timestamp ? 
                  new Date(systemStatus.timestamp).toLocaleTimeString() : 
                  'Never'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Connection Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <OnlinePrediction color={isConnected ? "success" : "error"} sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Live Connection
                </Typography>
              </Box>
              <Chip 
                label={isConnected ? "✓ Connected" : "✗ Disconnected"} 
                color={isConnected ? "success" : "error"} 
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Real-time features {isConnected ? 'active' : 'inactive'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Activity Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SmartToy color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  AI Activity
                </Typography>
              </Box>
              <Typography variant="h2" color="primary">
                {aiActivity.responses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI responses today
              </Typography>
              {aiActivity.lastActivity && (
                <Typography variant="caption" color="text.secondary">
                  Last: {new Date(aiActivity.lastActivity).toLocaleTimeString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Live Notifications Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsActive color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Live Notifications
                </Typography>
              </Box>
              <Typography variant="h2" color="warning.main">
                {liveNotifications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent notifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Online Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Online Users ({onlineUsers.length})
              </Typography>
              {onlineUsers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No users online
                </Typography>
              ) : (
                <List dense>
                  {onlineUsers.slice(0, 5).map((user) => (
                    <ListItem key={user.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                border: '2px solid white'
                              }}
                            />
                          }
                        >
                          <Avatar
                            src={user.userProfile?.photoURL}
                            sx={{ width: 32, height: 32 }}
                          >
                            {user.userProfile?.displayName?.charAt(0) || 'U'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.userProfile?.displayName || user.userProfile?.email}
                        secondary={`Connected ${new Date(user.connectedAt).toLocaleTimeString()}`}
                      />
                    </ListItem>
                  ))}
                  {onlineUsers.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      And {onlineUsers.length - 5} more...
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Live Notifications Feed */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Live Notifications
              </Typography>
              {liveNotifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent notifications
                </Typography>
              ) : (
                <List dense>
                  {liveNotifications.slice(-5).reverse().map((notification) => (
                    <ListItem key={notification.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                          <NotificationsActive fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.timestamp).toLocaleTimeString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Apps */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Apps
              </Typography>
              {apps.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No apps available. Create your first app to get started.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {apps.slice(0, 6).map((app) => (
                    <Grid item xs={12} sm={6} md={4} key={app.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" noWrap>
                            {app.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {app.description}
                          </Typography>
                          <Box mt={1}>
                            <Chip 
                              label={app.status} 
                              size="small"
                              color={app.status === 'active' ? 'success' : 'default'}
                            />
                            <Chip 
                              label={app.category} 
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
