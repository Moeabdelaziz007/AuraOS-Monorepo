import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DataUsage,
  Speed,
  Memory,
  Analytics,
  Refresh,
  Clear,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useFirebase } from '../services/FirebaseService';
import { dataAgentAPI, appsAPI, systemAPI } from '../services/api';

const DataAgentDashboard = () => {
  const { dataAgent, loading: firebaseLoading } = useFirebase();
  const [agentStatus, setAgentStatus] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebaseLoading && dataAgent) {
      fetchDataAgentInfo();
    }
  }, [firebaseLoading, dataAgent]);

  const fetchDataAgentInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const [status, stats, appAnalytics, systemAnalytics] = await Promise.all([
        dataAgentAPI.getStatus(),
        dataAgentAPI.getCacheStats(),
        appsAPI.getAnalytics(),
        systemAPI.getAnalytics()
      ]);

      setAgentStatus(status);
      setCacheStats(stats);
      setAnalytics({ apps: appAnalytics, system: systemAnalytics });

      // Set up real-time monitoring
      if (status.enabled) {
        const unsubscribe = systemAPI.subscribeToSystemUpdates((data) => {
          setRealTimeData(data);
        });

        return () => {
          if (unsubscribe) unsubscribe();
        };
      }
    } catch (err) {
      setError(err.message);
      console.error('Data Agent info fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const result = dataAgentAPI.clearCache();
      if (result.success) {
        await fetchDataAgentInfo();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefresh = () => {
    fetchDataAgentInfo();
  };

  if (firebaseLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Data Agent Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Data Agent Dashboard
        </Typography>
        <Box>
          <Tooltip title="Clear Cache">
            <IconButton onClick={handleClearCache} color="warning">
              <Clear />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Data Agent Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DataUsage color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Data Agent Status
                </Typography>
              </Box>
              <Chip 
                label={agentStatus?.enabled ? 'Active' : 'Inactive'} 
                color={agentStatus?.enabled ? 'success' : 'default'}
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Processors: {agentStatus?.processors?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subscriptions: {agentStatus?.subscriptions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Memory color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Cache Statistics
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {cacheStats?.totalEntries || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Entries
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {(cacheStats?.totalSize / 1024).toFixed(2)} KB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Speed color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Performance
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                99.9%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cache Hit Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={99.9} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Analytics color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Data Processing
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {analytics?.apps?.totalApps || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Apps Processed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active: {analytics?.apps?.activeApps || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Processors */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Processors
              </Typography>
              <List dense>
                {agentStatus?.processors?.map((processor, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={processor.charAt(0).toUpperCase() + processor.slice(1)}
                      secondary={`Processing ${processor} data`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cache Details
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Oldest Entry: {cacheStats?.oldestEntry ? 
                    new Date(cacheStats.oldestEntry).toLocaleString() : 
                    'N/A'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Newest Entry: {cacheStats?.newestEntry ? 
                    new Date(cacheStats.newestEntry).toLocaleString() : 
                    'N/A'
                  }
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="warning" 
                startIcon={<Clear />}
                onClick={handleClearCache}
                fullWidth
              >
                Clear Cache
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Data */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time System Updates
              </Typography>
              {realTimeData.length > 0 ? (
                <List dense>
                  {realTimeData.slice(0, 5).map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          {item.status === 'online' ? 
                            <CheckCircle color="success" /> : 
                            <Error color="error" />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary={`System Status: ${item.status}`}
                          secondary={`Updated: ${new Date().toLocaleTimeString()}`}
                        />
                        <Chip 
                          label={item.totalApps || 0} 
                          size="small"
                          color="primary"
                        />
                      </ListItem>
                      {index < realTimeData.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No real-time updates available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {analytics?.apps?.totalApps || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Apps
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {analytics?.apps?.activeApps || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Apps
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {analytics?.system?.summary?.totalLogs || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Logs
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {analytics?.system?.summary?.errorLogs || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Error Logs
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataAgentDashboard;
