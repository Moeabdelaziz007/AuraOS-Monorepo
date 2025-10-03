import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Divider,
  Link,
  Fade,
  Zoom,
  Slide,
  IconButton,
  InputAdornment,
  LinearProgress,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Login,
  SmartToy,
  AutoAwesome,
  Visibility,
  VisibilityOff,
  Person,
  Psychology,
  TrendingUp,
  Star,
  FlashOn,
  DarkMode,
  LightMode,
  Fingerprint,
  Shield,
  Lock,
  Wifi,
  Battery6Bar,
  SignalCellular4Bar
} from '@mui/icons-material';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../services/FirebaseService';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // AI-powered password strength analyzer
  const analyzePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  // AI-powered email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enhanced AI-powered insights generator
  const generateAIInsights = () => {
    const insights = [
      { 
        icon: <Shield />, 
        text: "Military-grade encryption", 
        color: "success", 
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        badge: "99.9% Secure"
      },
      { 
        icon: <FlashOn />, 
        text: "Lightning-fast AI processing", 
        color: "info", 
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        badge: "0.1s Response"
      },
      { 
        icon: <Psychology />, 
        text: "Adaptive machine learning", 
        color: "primary", 
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        badge: "Smart AI"
      },
      { 
        icon: <TrendingUp />, 
        text: "Real-time optimization", 
        color: "secondary", 
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        badge: "Live Updates"
      },
      { 
        icon: <Fingerprint />, 
        text: "Biometric authentication", 
        color: "warning", 
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        badge: "Touch ID"
      },
      { 
        icon: <Lock />, 
        text: "Zero-knowledge architecture", 
        color: "error", 
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        badge: "Privacy First"
      }
    ];
    setAiInsights(insights);
  };

  useEffect(() => {
    generateAIInsights();
    if (formData.password) {
      setPasswordStrength(analyzePasswordStrength(formData.password));
    }
  }, [formData.password]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // AI-powered validation
      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (passwordStrength < 50) {
          throw new Error('Password is too weak. Please use a stronger password.');
        }
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode 
            ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
          zIndex: 0
        }
      }}
    >
      {/* Floating particles animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: darkMode 
              ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s infinite linear'
          }
        }}
      />

      {/* Status Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 24,
          background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2
        }}
      >
        <Typography variant="caption" sx={{ color: darkMode ? 'white' : 'rgba(255,255,255,0.8)' }}>
          AIOS v2.0
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Wifi sx={{ fontSize: 12, color: darkMode ? 'white' : 'rgba(255,255,255,0.8)' }} />
          <Battery6Bar sx={{ fontSize: 12, color: darkMode ? 'white' : 'rgba(255,255,255,0.8)' }} />
          <SignalCellular4Bar sx={{ fontSize: 12, color: darkMode ? 'white' : 'rgba(255,255,255,0.8)' }} />
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        {/* Theme Toggle */}
        <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              sx={{
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: darkMode ? 'white' : 'rgba(255,255,255,0.8)',
                '&:hover': {
                  background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Compact Hero Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Zoom in timeout={1200}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: darkMode 
                      ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)'
                      : 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 3s ease infinite',
                    mb: 2,
                    boxShadow: darkMode 
                      ? '0 15px 30px rgba(0,0,0,0.3)' 
                      : '0 15px 30px rgba(0,0,0,0.1)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 3,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)'
                    }
                  }}
                >
                  <SmartToy sx={{ fontSize: 40, color: 'white', zIndex: 1 }} />
                </Box>
                <Typography
                  variant="h2"
                  sx={{
                    background: darkMode 
                      ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
                      : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    mb: 1,
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  AIOS
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: darkMode ? 'white' : 'white',
                    fontWeight: 300,
                    mb: 1,
                    opacity: 0.9
                  }}
                >
                  AI Operating System
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)',
                    fontWeight: 300,
                    maxWidth: 500,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  Next-generation AI authentication
                </Typography>
              </Box>
            </Zoom>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {/* Compact AI Features Showcase */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={1400}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  background: darkMode 
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: darkMode 
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  boxShadow: darkMode 
                    ? '0 15px 30px rgba(0,0,0,0.3)'
                    : '0 15px 30px rgba(0,0,0,0.1)'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: darkMode ? 'white' : 'white',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 600
                  }}
                >
                  <FlashOn sx={{ color: '#ffd700', fontSize: 20 }} />
                  AI Features
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {aiInsights.slice(0, 4).map((insight, index) => (
                    <Slide in timeout={1600 + index * 150} direction="right" key={index}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: insight.gradient,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateX(4px) scale(1.01)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            transition: 'left 0.5s ease',
                          },
                          '&:hover::before': {
                            left: '100%'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            p: 0.5,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {React.cloneElement(insight.icon, { sx: { fontSize: 16 } })}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {insight.text}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                            {insight.badge}
                          </Typography>
                        </Box>
                      </Box>
                    </Slide>
                  ))}
                </Box>

                {/* Compact Stats */}
                <Box sx={{ mt: 2, p: 2, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: darkMode ? 'white' : 'white', mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star sx={{ color: '#ffd700', fontSize: 16 }} />
                    Trusted Platform
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="h6" sx={{ color: '#4ecdc4', fontWeight: 700, fontSize: '1.2rem' }}>
                        50K+
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }}>
                        Users
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 700, fontSize: '1.2rem' }}>
                        99.99%
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }}>
                        Uptime
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Fade>
          </Grid>

          {/* Compact Login Form */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={1800}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: darkMode 
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  boxShadow: darkMode 
                    ? '0 15px 30px rgba(0,0,0,0.3)'
                    : '0 15px 30px rgba(0,0,0,0.1)',
                  border: darkMode 
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      background: darkMode 
                        ? 'linear-gradient(45deg, #667eea, #764ba2)'
                        : 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      mb: 0.5
                    }}
                  >
                    {isLogin ? 'Welcome Back!' : 'Join AIOS'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isLogin 
                      ? 'Sign in to access AI-powered features' 
                      : 'Create account and start your journey'
                    }
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                      color: 'white',
                      '& .MuiAlert-icon': {
                        color: 'white'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Display Name"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      margin="dense"
                      size="small"
                      required={!isLogin}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#667eea', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                    />
                  )}
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="dense"
                    size="small"
                    required
                    error={formData.email && !validateEmail(formData.email)}
                    helperText={formData.email && !validateEmail(formData.email) ? 'Please enter a valid email' : ''}
                    sx={{
                      mb: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    margin="dense"
                    size="small"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  />

                  {/* Enhanced AI-Powered Password Strength Indicator */}
                  {!isLogin && formData.password && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={passwordStrength} 
                        color={passwordStrength < 50 ? 'error' : passwordStrength < 75 ? 'warning' : 'success'}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          background: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: passwordStrength < 50 
                              ? 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'
                              : passwordStrength < 75 
                              ? 'linear-gradient(45deg, #ffa726, #ffb74d)'
                              : 'linear-gradient(45deg, #4caf50, #8bc34a)'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Password Strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </Typography>
                    </Box>
                  )}

                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      margin="normal"
                      required={!isLogin}
                      error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                      helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                    />
                  )}

                  {/* Advanced Options */}
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-thumb': {
                              background: 'linear-gradient(45deg, #667eea, #764ba2)'
                            }
                          }}
                        />
                      }
                      label="Remember me"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-thumb': {
                              background: 'linear-gradient(45deg, #667eea, #764ba2)'
                            }
                          }}
                        />
                      }
                      label="Enable 2FA"
                    />
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="medium"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} /> : <Login sx={{ fontSize: 18 }} />}
                    sx={{ 
                      mt: 2, 
                      mb: 1.5,
                      py: 1.2,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Compact Login Buttons */}
                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={handleGuestLogin}
                    disabled={loading}
                    startIcon={<Person sx={{ fontSize: 18 }} />}
                    sx={{ 
                      py: 1,
                      borderRadius: 2,
                      borderColor: '#4ecdc4',
                      color: '#4ecdc4',
                      '&:hover': {
                        borderColor: '#45b7d1',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Continue as Guest
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
                    sx={{ 
                      py: 1,
                      borderRadius: 2,
                      borderColor: '#ff6b6b',
                      color: '#ff6b6b',
                      '&:hover': {
                        borderColor: '#ff5252',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Continue with Google
                  </Button>
                </Stack>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={toggleMode}
                      sx={{ 
                        textDecoration: 'none',
                        color: '#667eea',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </Link>
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)' }}>
            By joining AIOS, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Container>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-100px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
};

export default AuthPage;