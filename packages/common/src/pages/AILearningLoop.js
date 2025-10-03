import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon,
  IconButton, Badge, Tooltip, Paper, Divider, Switch, FormControlLabel,
  Select, MenuItem, InputLabel, FormControl, Slider, Tabs, Tab
} from '@mui/material';
import {
  SmartToy, Psychology, AutoAwesome, DataUsage, CloudSync, 
  Memory, Speed, Analytics, BugReport, CheckCircle, Error,
  Warning, Info, Refresh, PlayArrow, Pause, Stop, Settings,
  TrendingUp, Insights, School, Lightbulb, Code, Database,
  Security, Performance, NetworkCheck, Storage, Cached
} from '@mui/icons-material';
import { osPlatformAPI } from '../services/osPlatformAPI';
import { getDataAgent } from '../services/api';

// ===========================================
// AI Learning Loop Component
// ===========================================
function AILearningLoop() {
  const [aiState, setAiState] = useState({
    isRunning: false,
    currentPhase: 'idle',
    learningCycles: 0,
    performance: {
      accuracy: 0,
      speed: 0,
      efficiency: 0
    },
    insights: [],
    recommendations: [],
    errors: [],
    dataProcessed: 0
  });

  const [aiTools, setAiTools] = useState({
    gemini: { enabled: true, status: 'ready', lastUsed: null },
    openai: { enabled: false, status: 'disabled', lastUsed: null },
    claude: { enabled: false, status: 'disabled', lastUsed: null },
    localLLM: { enabled: false, status: 'disabled', lastUsed: null }
  });

  const [dataAgent, setDataAgent] = useState(null);
  const [firebaseConnection, setFirebaseConnection] = useState({
    connected: false,
    collections: [],
    realTimeUpdates: true
  });

  const learningIntervalRef = useRef(null);

  useEffect(() => {
    initializeAISystem();
    return () => {
      if (learningIntervalRef.current) {
        clearInterval(learningIntervalRef.current);
      }
    };
  }, []);

  const initializeAISystem = async () => {
    try {
      // Initialize Data Agent
      const agent = await getDataAgent();
      setDataAgent(agent);

      // Check Firebase connection
      const firebaseStatus = await checkFirebaseConnection();
      setFirebaseConnection(firebaseStatus);

      // Initialize AI tools
      await initializeAITools();
    } catch (error) {
      logger.error('Failed to initialize AI system:', error);
    }
  };

  const checkFirebaseConnection = async () => {
    try {
      // Test Firebase connection through Data Agent
      const collections = await osPlatformAPI.getCollections();
      return {
        connected: true,
        collections: collections,
        realTimeUpdates: true
      };
    } catch (error) {
      return {
        connected: false,
        collections: [],
        realTimeUpdates: false
      };
    }
  };

  const initializeAITools = async () => {
    // Initialize available AI tools
    const tools = { ...aiTools };
    
    // Check Gemini availability
    if (process.env.VITE_GEMINI_API_KEY) {
      tools.gemini.status = 'ready';
    }

    // Check OpenAI availability
    if (process.env.VITE_OPENAI_API_KEY) {
      tools.openai.status = 'ready';
      tools.openai.enabled = true;
    }

    setAiTools(tools);
  };

  const startLearningLoop = async () => {
    setAiState(prev => ({ ...prev, isRunning: true, currentPhase: 'initializing' }));
    
    try {
      // Start the learning cycle
      learningIntervalRef.current = setInterval(async () => {
        await executeLearningCycle();
      }, 5000); // Run every 5 seconds

      setAiState(prev => ({ ...prev, currentPhase: 'learning' }));
    } catch (error) {
      logger.error('Failed to start learning loop:', error);
      setAiState(prev => ({ 
        ...prev, 
        isRunning: false, 
        currentPhase: 'error',
        errors: [...prev.errors, { message: error.message, timestamp: new Date() }]
      }));
    }
  };

  const stopLearningLoop = () => {
    if (learningIntervalRef.current) {
      clearInterval(learningIntervalRef.current);
      learningIntervalRef.current = null;
    }
    setAiState(prev => ({ ...prev, isRunning: false, currentPhase: 'idle' }));
  };

  const executeLearningCycle = async () => {
    try {
      setAiState(prev => ({ ...prev, currentPhase: 'analyzing' }));

      // Phase 1: Data Collection
      const data = await collectData();
      
      // Phase 2: AI Analysis
      const analysis = await performAIAnalysis(data);
      
      // Phase 3: Learning & Insights
      const insights = await generateInsights(analysis);
      
      // Phase 4: Recommendations
      const recommendations = await generateRecommendations(insights);
      
      // Phase 5: Update Performance Metrics
      updatePerformanceMetrics(analysis, insights);

      setAiState(prev => ({
        ...prev,
        learningCycles: prev.learningCycles + 1,
        insights: [...prev.insights, ...insights].slice(-10), // Keep last 10
        recommendations: [...prev.recommendations, ...recommendations].slice(-10),
        dataProcessed: prev.dataProcessed + data.length,
        currentPhase: 'learning'
      }));

    } catch (error) {
      logger.error('Learning cycle error:', error);
      setAiState(prev => ({
        ...prev,
        errors: [...prev.errors, { message: error.message, timestamp: new Date() }].slice(-5)
      }));
    }
  };

  const collectData = async () => {
    const data = [];
    
    // Collect from Firebase through Data Agent
    if (dataAgent && firebaseConnection.connected) {
      try {
        const osData = await osPlatformAPI.getOperatingSystems();
        const reviewsData = await osPlatformAPI.getReviews();
        const featuresData = await osPlatformAPI.getFeatures();
        
        data.push(...osData, ...reviewsData, ...featuresData);
      } catch (error) {
        logger.error('Data collection error:', error);
      }
    }
    
    return data;
  };

  const performAIAnalysis = async (data) => {
    const analysis = {
      patterns: [],
      trends: [],
      anomalies: [],
      correlations: []
    };

    // Use available AI tools for analysis
    if (aiTools.gemini.enabled && aiTools.gemini.status === 'ready') {
      try {
        const geminiAnalysis = await analyzeWithGemini(data);
        analysis.patterns.push(...geminiAnalysis.patterns);
        analysis.trends.push(...geminiAnalysis.trends);
      } catch (error) {
        logger.error('Gemini analysis error:', error);
      }
    }

    if (aiTools.openai.enabled && aiTools.openai.status === 'ready') {
      try {
        const openaiAnalysis = await analyzeWithOpenAI(data);
        analysis.anomalies.push(...openaiAnalysis.anomalies);
        analysis.correlations.push(...openaiAnalysis.correlations);
      } catch (error) {
        logger.error('OpenAI analysis error:', error);
      }
    }

    return analysis;
  };

  const analyzeWithGemini = async (data) => {
    // Simulate Gemini analysis
    return {
      patterns: [
        { type: 'user_preference', confidence: 0.85, description: 'Users prefer mobile OS with high security ratings' },
        { type: 'feature_correlation', confidence: 0.92, description: 'Gaming features correlate with high user ratings' }
      ],
      trends: [
        { direction: 'increasing', metric: 'security_features', change: '+15%' },
        { direction: 'decreasing', metric: 'battery_life_complaints', change: '-8%' }
      ]
    };
  };

  const analyzeWithOpenAI = async (data) => {
    // Simulate OpenAI analysis
    return {
      anomalies: [
        { type: 'unusual_rating', description: 'OS with low features but high ratings detected' },
        { type: 'review_pattern', description: 'Suspicious review clustering detected' }
      ],
      correlations: [
        { factor1: 'developer_reputation', factor2: 'user_trust', strength: 0.78 },
        { factor1: 'update_frequency', factor2: 'user_satisfaction', strength: 0.65 }
      ]
    };
  };

  const generateInsights = async (analysis) => {
    const insights = [];

    // Generate insights from patterns
    analysis.patterns.forEach(pattern => {
      insights.push({
        type: 'pattern',
        title: `Pattern Detected: ${pattern.type}`,
        description: pattern.description,
        confidence: pattern.confidence,
        timestamp: new Date()
      });
    });

    // Generate insights from trends
    analysis.trends.forEach(trend => {
      insights.push({
        type: 'trend',
        title: `${trend.direction === 'increasing' ? 'Rising' : 'Declining'} Trend`,
        description: `${trend.metric} is ${trend.direction} by ${trend.change}`,
        confidence: 0.8,
        timestamp: new Date()
      });
    });

    return insights;
  };

  const generateRecommendations = async (insights) => {
    const recommendations = [];

    insights.forEach(insight => {
      if (insight.type === 'pattern' && insight.confidence > 0.8) {
        recommendations.push({
          type: 'optimization',
          title: 'Optimize Based on Pattern',
          description: `Consider implementing features that align with: ${insight.description}`,
          priority: 'high',
          timestamp: new Date()
        });
      }

      if (insight.type === 'trend') {
        recommendations.push({
          type: 'strategy',
          title: 'Strategic Adjustment',
          description: `Adjust strategy to capitalize on trend: ${insight.description}`,
          priority: 'medium',
          timestamp: new Date()
        });
      }
    });

    return recommendations;
  };

  const updatePerformanceMetrics = (analysis, insights) => {
    const accuracy = Math.min(95, 70 + (insights.length * 2));
    const speed = Math.min(100, 60 + (analysis.patterns.length * 5));
    const efficiency = Math.min(90, 50 + (insights.filter(i => i.confidence > 0.8).length * 8));

    setAiState(prev => ({
      ...prev,
      performance: { accuracy, speed, efficiency }
    }));
  };

  const toggleAITool = (toolName) => {
    setAiTools(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        enabled: !prev[toolName].enabled
      }
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🤖 AI Learning Loop
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Intelligent data processing and learning system
        </Typography>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmartToy sx={{ mr: 1, color: aiState.isRunning ? 'success.main' : 'text.secondary' }} />
                <Typography variant="h6">AI Status</Typography>
              </Box>
              <Typography variant="h4" color={aiState.isRunning ? 'success.main' : 'text.secondary'}>
                {aiState.isRunning ? 'ACTIVE' : 'IDLE'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phase: {aiState.currentPhase}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={aiState.isRunning ? <Stop /> : <PlayArrow />}
                onClick={aiState.isRunning ? stopLearningLoop : startLearningLoop}
                color={aiState.isRunning ? 'error' : 'primary'}
              >
                {aiState.isRunning ? 'Stop' : 'Start'} Learning
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataUsage sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Data Processed</Typography>
              </Box>
              <Typography variant="h4">{aiState.dataProcessed}</Typography>
              <Typography variant="body2" color="text.secondary">
                Learning Cycles: {aiState.learningCycles}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudSync sx={{ mr: 1, color: firebaseConnection.connected ? 'success.main' : 'error.main' }} />
                <Typography variant="h6">Firebase</Typography>
              </Box>
              <Typography variant="h4" color={firebaseConnection.connected ? 'success.main' : 'error.main'}>
                {firebaseConnection.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collections: {firebaseConnection.collections.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Analytics sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Performance</Typography>
              </Box>
              <Typography variant="h4">{aiState.performance.accuracy}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Accuracy Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Tools Configuration */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🛠️ AI Tools Configuration
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(aiTools).map(([toolName, tool]) => (
              <Grid item xs={12} sm={6} md={3} key={toolName}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                      {toolName}
                    </Typography>
                    <Chip 
                      label={tool.status} 
                      size="small" 
                      color={tool.status === 'ready' ? 'success' : 'default'}
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={tool.enabled}
                        onChange={() => toggleAITool(toolName)}
                        disabled={tool.status !== 'ready'}
                      />
                    }
                    label=""
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Performance Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Accuracy</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={aiState.performance.accuracy} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">{aiState.performance.accuracy}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Speed</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={aiState.performance.speed} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">{aiState.performance.speed}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Efficiency</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={aiState.performance.efficiency} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">{aiState.performance.efficiency}%</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Recent Insights
              </Typography>
              <List>
                {aiState.insights.slice(-5).map((insight, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={insight.title}
                      secondary={insight.description}
                    />
                    <Chip 
                      label={`${(insight.confidence * 100).toFixed(0)}%`} 
                      size="small" 
                      color="primary"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Recommendations
              </Typography>
              <List>
                {aiState.recommendations.slice(-5).map((rec, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.title}
                      secondary={rec.description}
                    />
                    <Chip 
                      label={rec.priority} 
                      size="small" 
                      color={rec.priority === 'high' ? 'error' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Errors */}
      {aiState.errors.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              ⚠️ Recent Errors
            </Typography>
            <List>
              {aiState.errors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={error.message}
                    secondary={error.timestamp.toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default AILearningLoop;
