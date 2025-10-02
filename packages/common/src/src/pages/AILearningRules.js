import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Chip, LinearProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon,
  IconButton, Badge, Tooltip, Paper, Divider, Switch, FormControlLabel,
  Select, MenuItem, InputLabel, FormControl, Slider, Tabs, Tab,
  Accordion, AccordionSummary, AccordionDetails, Stepper, Step, StepLabel
} from '@mui/material';
import {
  SmartToy, Psychology, AutoAwesome, DataUsage, CloudSync, 
  Memory, Speed, Analytics, BugReport, CheckCircle, Error,
  Warning, Info, Refresh, PlayArrow, Pause, Stop, Settings,
  TrendingUp, Insights, School, Lightbulb, Code, Database,
  Security, Performance, NetworkCheck, Storage, Cached,
  ExpandMore, Rule, Loop, SelfImprovement, TrendingDown
} from '@mui/icons-material';
import { osPlatformAPI } from '../services/osPlatformAPI';
import { getDataAgent } from '../services/api';

// ===========================================
// AI Learning Rules & Meta-Learning System
// ===========================================
function AILearningRules() {
  const [learningRules, setLearningRules] = useState({
    zeroShotRules: [
      {
        id: 'zs_001',
        name: 'Pattern Recognition Rule',
        description: 'Identify patterns in data without prior training',
        condition: 'data.length > 10 && data.variance < threshold',
        action: 'extract_patterns(data)',
        confidence: 0.85,
        successRate: 0.92,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'zs_002',
        name: 'Anomaly Detection Rule',
        description: 'Detect outliers using statistical methods',
        condition: 'data.point > (mean + 3*std) || data.point < (mean - 3*std)',
        action: 'flag_anomaly(data.point)',
        confidence: 0.78,
        successRate: 0.88,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'zs_003',
        name: 'Correlation Discovery Rule',
        description: 'Find relationships between variables',
        condition: 'correlation(data.x, data.y) > 0.7',
        action: 'establish_correlation(data.x, data.y)',
        confidence: 0.82,
        successRate: 0.85,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'zs_004',
        name: 'Trend Analysis Rule',
        description: 'Identify directional changes in data',
        condition: 'slope(data.timeline) > threshold',
        action: 'classify_trend(data.timeline)',
        confidence: 0.75,
        successRate: 0.80,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'zs_005',
        name: 'Clustering Rule',
        description: 'Group similar data points automatically',
        condition: 'distance(point1, point2) < cluster_threshold',
        action: 'create_cluster([point1, point2])',
        confidence: 0.88,
        successRate: 0.90,
        lastUsed: null,
        enabled: true
      }
    ],
    metaLearningRules: [
      {
        id: 'ml_001',
        name: 'Rule Performance Monitor',
        description: 'Track and evaluate rule effectiveness',
        condition: 'rule.successRate < 0.7',
        action: 'trigger_rule_optimization(rule)',
        confidence: 0.95,
        successRate: 0.98,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ml_002',
        name: 'Adaptive Threshold Adjustment',
        description: 'Automatically adjust thresholds based on performance',
        condition: 'false_positive_rate > 0.1',
        action: 'adjust_threshold(rule, new_value)',
        confidence: 0.90,
        successRate: 0.92,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ml_003',
        name: 'Rule Combination Discovery',
        description: 'Find optimal combinations of rules',
        condition: 'rule1.confidence > 0.8 && rule2.confidence > 0.8',
        action: 'create_combined_rule(rule1, rule2)',
        confidence: 0.85,
        successRate: 0.87,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ml_004',
        name: 'Context-Aware Learning',
        description: 'Adapt rules based on data context',
        condition: 'context.domain !== previous_context.domain',
        action: 'adapt_rules_to_context(context)',
        confidence: 0.88,
        successRate: 0.91,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ml_005',
        name: 'Self-Improvement Loop',
        description: 'Continuously improve rule performance',
        condition: 'learning_cycle % 100 === 0',
        action: 'run_self_improvement_cycle()',
        confidence: 0.92,
        successRate: 0.94,
        lastUsed: null,
        enabled: true
      }
    ],
    improvementRules: [
      {
        id: 'ir_001',
        name: 'Error Pattern Learning',
        description: 'Learn from previous errors to prevent recurrence',
        condition: 'error.frequency > 3',
        action: 'create_error_prevention_rule(error)',
        confidence: 0.89,
        successRate: 0.93,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ir_002',
        name: 'Success Pattern Amplification',
        description: 'Reinforce successful patterns',
        condition: 'pattern.success_rate > 0.9',
        action: 'amplify_pattern(pattern)',
        confidence: 0.91,
        successRate: 0.95,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ir_003',
        name: 'Resource Optimization',
        description: 'Optimize computational resources',
        condition: 'resource_usage > 80%',
        action: 'optimize_resource_allocation()',
        confidence: 0.87,
        successRate: 0.89,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ir_004',
        name: 'Knowledge Graph Expansion',
        description: 'Expand knowledge base with new insights',
        condition: 'new_insight.confidence > 0.8',
        action: 'add_to_knowledge_graph(insight)',
        confidence: 0.86,
        successRate: 0.88,
        lastUsed: null,
        enabled: true
      },
      {
        id: 'ir_005',
        name: 'Feedback Integration',
        description: 'Integrate user feedback into learning',
        condition: 'user_feedback.rating < 3',
        action: 'adjust_based_on_feedback(feedback)',
        confidence: 0.84,
        successRate: 0.86,
        lastUsed: null,
        enabled: true
      }
    ]
  });

  const [metaLearningState, setMetaLearningState] = useState({
    isActive: false,
    currentCycle: 0,
    totalCycles: 0,
    performanceMetrics: {
      overallAccuracy: 0,
      ruleEffectiveness: 0,
      adaptationSpeed: 0,
      errorReduction: 0
    },
    learningHistory: [],
    activeRules: [],
    pendingOptimizations: []
  });

  const [learningMetrics, setLearningMetrics] = useState({
    rulesExecuted: 0,
    successfulPredictions: 0,
    failedPredictions: 0,
    newRulesGenerated: 0,
    rulesOptimized: 0,
    knowledgeExpansion: 0
  });

  const metaLearningIntervalRef = useRef(null);

  useEffect(() => {
    initializeLearningSystem();
    return () => {
      if (metaLearningIntervalRef.current) {
        clearInterval(metaLearningIntervalRef.current);
      }
    };
  }, []);

  const initializeLearningSystem = async () => {
    try {
      // Load existing rules from Data Agent
      const dataAgent = await getDataAgent();
      if (dataAgent && dataAgent.learningRules) {
        setLearningRules(dataAgent.learningRules);
      }

      // Initialize meta-learning metrics
      setMetaLearningState(prev => ({
        ...prev,
        performanceMetrics: {
          overallAccuracy: calculateOverallAccuracy(),
          ruleEffectiveness: calculateRuleEffectiveness(),
          adaptationSpeed: calculateAdaptationSpeed(),
          errorReduction: calculateErrorReduction()
        }
      }));
    } catch (error) {
      console.error('Failed to initialize learning system:', error);
    }
  };

  const startMetaLearning = () => {
    setMetaLearningState(prev => ({ ...prev, isActive: true }));
    
    metaLearningIntervalRef.current = setInterval(async () => {
      await executeMetaLearningCycle();
    }, 10000); // Run every 10 seconds
  };

  const stopMetaLearning = () => {
    setMetaLearningState(prev => ({ ...prev, isActive: false }));
    
    if (metaLearningIntervalRef.current) {
      clearInterval(metaLearningIntervalRef.current);
      metaLearningIntervalRef.current = null;
    }
  };

  const executeMetaLearningCycle = async () => {
    try {
      setMetaLearningState(prev => ({
        ...prev,
        currentCycle: prev.currentCycle + 1,
        totalCycles: prev.totalCycles + 1
      }));

      // Phase 1: Rule Performance Analysis
      const performanceAnalysis = await analyzeRulePerformance();
      
      // Phase 2: Rule Optimization
      const optimizations = await optimizeRules(performanceAnalysis);
      
      // Phase 3: New Rule Generation
      const newRules = await generateNewRules();
      
      // Phase 4: Meta-Learning Updates
      await updateMetaLearningRules();
      
      // Phase 5: Performance Metrics Update
      updatePerformanceMetrics();

      // Update learning history
      setMetaLearningState(prev => ({
        ...prev,
        learningHistory: [...prev.learningHistory, {
          cycle: prev.currentCycle,
          timestamp: new Date(),
          performanceAnalysis,
          optimizations,
          newRules
        }].slice(-50) // Keep last 50 cycles
      }));

    } catch (error) {
      console.error('Meta-learning cycle error:', error);
    }
  };

  const analyzeRulePerformance = async () => {
    const analysis = {
      zeroShotPerformance: {},
      metaLearningPerformance: {},
      improvementPerformance: {},
      overallTrends: []
    };

    // Analyze zero-shot rules
    learningRules.zeroShotRules.forEach(rule => {
      analysis.zeroShotPerformance[rule.id] = {
        successRate: rule.successRate,
        confidence: rule.confidence,
        usage: rule.lastUsed ? Date.now() - rule.lastUsed : null,
        effectiveness: calculateRuleEffectiveness(rule)
      };
    });

    // Analyze meta-learning rules
    learningRules.metaLearningRules.forEach(rule => {
      analysis.metaLearningPerformance[rule.id] = {
        successRate: rule.successRate,
        confidence: rule.confidence,
        adaptationSpeed: calculateAdaptationSpeed(rule),
        optimizationImpact: calculateOptimizationImpact(rule)
      };
    });

    // Analyze improvement rules
    learningRules.improvementRules.forEach(rule => {
      analysis.improvementPerformance[rule.id] = {
        successRate: rule.successRate,
        confidence: rule.confidence,
        improvementRate: calculateImprovementRate(rule),
        errorReduction: calculateErrorReduction(rule)
      };
    });

    return analysis;
  };

  const optimizeRules = async (performanceAnalysis) => {
    const optimizations = [];

    // Optimize underperforming rules
    Object.entries(performanceAnalysis.zeroShotPerformance).forEach(([ruleId, performance]) => {
      if (performance.successRate < 0.7) {
        optimizations.push({
          type: 'rule_optimization',
          ruleId,
          action: 'adjust_thresholds',
          expectedImprovement: 0.15
        });
      }
    });

    // Create rule combinations for high-performing rules
    const highPerformingRules = Object.entries(performanceAnalysis.zeroShotPerformance)
      .filter(([_, performance]) => performance.successRate > 0.85)
      .slice(0, 2);

    if (highPerformingRules.length === 2) {
      optimizations.push({
        type: 'rule_combination',
        rules: highPerformingRules.map(([id, _]) => id),
        action: 'create_combined_rule',
        expectedImprovement: 0.10
      });
    }

    return optimizations;
  };

  const generateNewRules = async () => {
    const newRules = [];

    // Generate new zero-shot rules based on data patterns
    const dataPatterns = await analyzeDataPatterns();
    
    dataPatterns.forEach(pattern => {
      if (pattern.confidence > 0.8) {
        newRules.push({
          id: `zs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: `Auto-Generated Pattern Rule: ${pattern.type}`,
          description: `Automatically generated rule for ${pattern.type} pattern`,
          condition: pattern.condition,
          action: pattern.action,
          confidence: pattern.confidence,
          successRate: 0.75, // Initial estimate
          lastUsed: null,
          enabled: true,
          generatedBy: 'meta_learning'
        });
      }
    });

    return newRules;
  };

  const updateMetaLearningRules = async () => {
    // Update rule success rates based on recent performance
    const updatedRules = { ...learningRules };

    updatedRules.zeroShotRules = updatedRules.zeroShotRules.map(rule => {
      const recentPerformance = getRecentPerformance(rule.id);
      return {
        ...rule,
        successRate: recentPerformance ? 
          (rule.successRate * 0.9 + recentPerformance * 0.1) : 
          rule.successRate
      };
    });

    setLearningRules(updatedRules);
  };

  const analyzeDataPatterns = async () => {
    // Simulate data pattern analysis
    return [
      {
        type: 'temporal_pattern',
        condition: 'data.timestamp % 24 === 0',
        action: 'detect_daily_patterns(data)',
        confidence: 0.85
      },
      {
        type: 'frequency_pattern',
        condition: 'data.frequency > threshold',
        action: 'analyze_frequency_distribution(data)',
        confidence: 0.82
      },
      {
        type: 'seasonal_pattern',
        condition: 'data.season === current_season',
        action: 'apply_seasonal_adjustment(data)',
        confidence: 0.78
      }
    ];
  };

  const calculateOverallAccuracy = () => {
    const allRules = [
      ...learningRules.zeroShotRules,
      ...learningRules.metaLearningRules,
      ...learningRules.improvementRules
    ];
    
    const totalSuccessRate = allRules.reduce((sum, rule) => sum + rule.successRate, 0);
    return totalSuccessRate / allRules.length;
  };

  const calculateRuleEffectiveness = (rule = null) => {
    if (rule) {
      return rule.successRate * rule.confidence;
    }
    
    const allRules = [
      ...learningRules.zeroShotRules,
      ...learningRules.metaLearningRules,
      ...learningRules.improvementRules
    ];
    
    const totalEffectiveness = allRules.reduce((sum, rule) => 
      sum + (rule.successRate * rule.confidence), 0);
    return totalEffectiveness / allRules.length;
  };

  const calculateAdaptationSpeed = (rule = null) => {
    // Simulate adaptation speed calculation
    return Math.random() * 0.3 + 0.7; // 0.7 to 1.0
  };

  const calculateErrorReduction = (rule = null) => {
    // Simulate error reduction calculation
    return Math.random() * 0.2 + 0.8; // 0.8 to 1.0
  };

  const calculateOptimizationImpact = (rule) => {
    // Simulate optimization impact calculation
    return Math.random() * 0.25 + 0.75; // 0.75 to 1.0
  };

  const calculateImprovementRate = (rule) => {
    // Simulate improvement rate calculation
    return Math.random() * 0.3 + 0.7; // 0.7 to 1.0
  };

  const getRecentPerformance = (ruleId) => {
    // Simulate recent performance lookup
    return Math.random() * 0.4 + 0.6; // 0.6 to 1.0
  };

  const updatePerformanceMetrics = () => {
    setLearningMetrics(prev => ({
      ...prev,
      rulesExecuted: prev.rulesExecuted + 1,
      successfulPredictions: prev.successfulPredictions + Math.floor(Math.random() * 3),
      failedPredictions: prev.failedPredictions + Math.floor(Math.random() * 1),
      newRulesGenerated: prev.newRulesGenerated + Math.floor(Math.random() * 2),
      rulesOptimized: prev.rulesOptimized + Math.floor(Math.random() * 1),
      knowledgeExpansion: prev.knowledgeExpansion + Math.random() * 0.1
    }));
  };

  const toggleRule = (ruleType, ruleId) => {
    setLearningRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    }));
  };

  const getRuleTypeIcon = (ruleType) => {
    switch (ruleType) {
      case 'zeroShotRules': return <AutoAwesome />;
      case 'metaLearningRules': return <Loop />;
      case 'improvementRules': return <SelfImprovement />;
      default: return <Rule />;
    }
  };

  const getRuleTypeColor = (ruleType) => {
    switch (ruleType) {
      case 'zeroShotRules': return 'primary';
      case 'metaLearningRules': return 'secondary';
      case 'improvementRules': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🧠 AI Learning Rules & Meta-Learning System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Zero-shot learning rules and self-improvement mechanisms
        </Typography>
      </Box>

      {/* Meta-Learning Control Panel */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              🔄 Meta-Learning Control Panel
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={metaLearningState.isActive ? <Stop /> : <PlayArrow />}
                onClick={metaLearningState.isActive ? stopMetaLearning : startMetaLearning}
                color={metaLearningState.isActive ? 'error' : 'primary'}
              >
                {metaLearningState.isActive ? 'Stop' : 'Start'} Meta-Learning
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={executeMetaLearningCycle}
              >
                Run Cycle
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {metaLearningState.currentCycle}
                </Typography>
                <Typography variant="body2">Current Cycle</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {(metaLearningState.performanceMetrics.overallAccuracy * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2">Overall Accuracy</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {(metaLearningState.performanceMetrics.ruleEffectiveness * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2">Rule Effectiveness</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {(metaLearningState.performanceMetrics.errorReduction * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2">Error Reduction</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Learning Rules Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={0} aria-label="learning rules tabs">
          <Tab 
            label={`Zero-Shot Rules (${learningRules.zeroShotRules.length})`} 
            icon={<AutoAwesome />}
          />
          <Tab 
            label={`Meta-Learning Rules (${learningRules.metaLearningRules.length})`} 
            icon={<Loop />}
          />
          <Tab 
            label={`Improvement Rules (${learningRules.improvementRules.length})`} 
            icon={<SelfImprovement />}
          />
        </Tabs>
      </Box>

      {/* Zero-Shot Learning Rules */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Zero-Shot Learning Rules
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Rules that can make predictions without prior training on specific data
          </Typography>
          
          <Grid container spacing={2}>
            {learningRules.zeroShotRules.map((rule) => (
              <Grid item xs={12} md={6} key={rule.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {rule.name}
                      </Typography>
                      <Chip 
                        label={`${(rule.successRate * 100).toFixed(0)}%`} 
                        size="small" 
                        color={rule.successRate > 0.8 ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                      />
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRule('zeroShotRules', rule.id)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {rule.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Condition:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {rule.condition}
                      </Typography>
                    </Paper>
                    <Typography variant="subtitle2" gutterBottom>
                      Action:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {rule.action}
                      </Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip 
                        label={`Confidence: ${(rule.confidence * 100).toFixed(0)}%`} 
                        size="small" 
                        color="info"
                      />
                      <Chip 
                        label={`Success Rate: ${(rule.successRate * 100).toFixed(0)}%`} 
                        size="small" 
                        color="success"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Meta-Learning Rules */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔄 Meta-Learning Rules
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Rules that learn how to learn and improve other rules
          </Typography>
          
          <Grid container spacing={2}>
            {learningRules.metaLearningRules.map((rule) => (
              <Grid item xs={12} md={6} key={rule.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Loop sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {rule.name}
                      </Typography>
                      <Chip 
                        label={`${(rule.successRate * 100).toFixed(0)}%`} 
                        size="small" 
                        color={rule.successRate > 0.8 ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                      />
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRule('metaLearningRules', rule.id)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {rule.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Condition:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {rule.condition}
                      </Typography>
                    </Paper>
                    <Typography variant="subtitle2" gutterBottom>
                      Action:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {rule.action}
                      </Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip 
                        label={`Confidence: ${(rule.confidence * 100).toFixed(0)}%`} 
                        size="small" 
                        color="info"
                      />
                      <Chip 
                        label={`Success Rate: ${(rule.successRate * 100).toFixed(0)}%`} 
                        size="small" 
                        color="success"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Improvement Rules */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Self-Improvement Rules
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Rules that continuously improve system performance and capabilities
          </Typography>
          
          <Grid container spacing={2}>
            {learningRules.improvementRules.map((rule) => (
              <Grid item xs={12} md={6} key={rule.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <SelfImprovement sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {rule.name}
                      </Typography>
                      <Chip 
                        label={`${(rule.successRate * 100).toFixed(0)}%`} 
                        size="small" 
                        color={rule.successRate > 0.8 ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                      />
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRule('improvementRules', rule.id)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {rule.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Condition:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {rule.condition}
                      </Typography>
                    </Paper>
                    <Typography variant="subtitle2" gutterBottom>
                      Action:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {rule.action}
                      </Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip 
                        label={`Confidence: ${(rule.confidence * 100).toFixed(0)}%`} 
                        size="small" 
                        color="info"
                      />
                      <Chip 
                        label={`Success Rate: ${(rule.successRate * 100).toFixed(0)}%`} 
                        size="small" 
                        color="success"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Learning Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Learning Metrics & Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {learningMetrics.rulesExecuted}
                </Typography>
                <Typography variant="body2">Rules Executed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {learningMetrics.successfulPredictions}
                </Typography>
                <Typography variant="body2">Successful Predictions</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {learningMetrics.newRulesGenerated}
                </Typography>
                <Typography variant="body2">New Rules Generated</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}

export default AILearningRules;
