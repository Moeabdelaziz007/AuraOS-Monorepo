import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Send,
  People,
  Add,
  Close,
  Chat,
  Person,
  SmartToy,
  OnlinePrediction,
  OfflineBolt
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const LiveChat = () => {
  const { user, userProfile } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general_chat');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (user && userProfile) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Connected to AIOS Live Chat');
        setIsConnected(true);
        
        // Join user room with profile data
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
        
        // Join general chat room
        newSocket.emit('join_chat_room', {
          roomName: 'general_chat',
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
        console.log('Disconnected from AIOS Live Chat');
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      newSocket.on('chat_history', (history) => {
        setMessages(history);
        scrollToBottom();
      });

      newSocket.on('user_typing', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      });

      newSocket.on('user_joined_chat', (data) => {
        setMessages(prev => [...prev, {
          id: `system_${Date.now()}`,
          userId: 'system',
          userName: 'System',
          message: data.message,
          timestamp: new Date(),
          isSystem: true
        }]);
      });

      newSocket.on('user_left_chat', (data) => {
        setMessages(prev => [...prev, {
          id: `system_${Date.now()}`,
          userId: 'system',
          userName: 'System',
          message: data.message,
          timestamp: new Date(),
          isSystem: true
        }]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, userProfile]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = () => {
    if (messageInput.trim() && socket && user) {
      const messageData = {
        roomName: currentRoom,
        message: messageInput.trim(),
        userProfile: {
          uid: user.uid,
          email: user.email,
          displayName: userProfile.displayName || user.email?.split('@')[0] || 'User',
          photoURL: userProfile.photoURL || user.photoURL,
          role: userProfile.role || 'user'
        },
        messageType: 'text'
      };

      socket.emit('send_message', messageData);
      setMessageInput('');
      
      // Stop typing indicator
      socket.emit('typing_stop', {
        roomName: currentRoom,
        userProfile: {
          uid: user.uid,
          email: user.email,
          displayName: userProfile.displayName || user.email?.split('@')[0] || 'User'
        }
      });
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (socket && user) {
      // Start typing
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', {
          roomName: currentRoom,
          userProfile: {
            uid: user.uid,
            email: user.email,
            displayName: userProfile.displayName || user.email?.split('@')[0] || 'User'
          }
        });
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing_stop', {
          roomName: currentRoom,
          userProfile: {
            uid: user.uid,
            email: user.email,
            displayName: userProfile.displayName || user.email?.split('@')[0] || 'User'
          }
        });
      }, 1000);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create new chat room
  const handleCreateRoom = async () => {
    if (newRoomName.trim() && socket) {
      try {
        const response = await fetch('/api/chat/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: newRoomName.trim(),
            description: newRoomDescription.trim()
          })
        });

        if (response.ok) {
          // Join the new room
          socket.emit('join_chat_room', {
            roomName: newRoomName.trim(),
            userProfile: {
              uid: user.uid,
              email: user.email,
              displayName: userProfile.displayName || user.email?.split('@')[0] || 'User',
              photoURL: userProfile.photoURL || user.photoURL,
              role: userProfile.role || 'user'
            }
          });

          setCurrentRoom(newRoomName.trim());
          setMessages([]);
          setNewRoomName('');
          setNewRoomDescription('');
          setShowCreateRoom(false);
        }
      } catch (error) {
        console.error('Error creating room:', error);
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get user avatar
  const getUserAvatar = (message) => {
    if (message.isAI) {
      return '🤖';
    }
    if (message.isSystem) {
      return '🔔';
    }
    return message.userAvatar || message.userName?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Chat color="primary" />
            <Typography variant="h6">AIOS Live Chat</Typography>
            <Chip
              icon={isConnected ? <OnlinePrediction /> : <OfflineBolt />}
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Online Users">
              <Chip
                icon={<People />}
                label={`${onlineUsers.length} online`}
                variant="outlined"
                size="small"
              />
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => setShowCreateRoom(true)}
            >
              New Room
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Online Users Sidebar */}
        <Paper sx={{ width: 250, borderRadius: 0, overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Online Users ({onlineUsers.length})
            </Typography>
            <List dense>
              {onlineUsers.map((user) => (
                <ListItem key={user.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      src={user.userProfile?.photoURL}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user.userProfile?.displayName?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.userProfile?.displayName || user.userProfile?.email}
                    secondary={
                      <Chip
                        label="Online"
                        color="success"
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 16 }}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Chat sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Welcome to AIOS Live Chat!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start chatting with other users and the AI assistant
                </Typography>
              </Box>
            ) : (
              <List>
                {messages.map((message) => (
                  <ListItem key={message.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: message.isAI ? 'primary.main' : 'grey.300' }}>
                        {getUserAvatar(message)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">
                            {message.userName}
                          </Typography>
                          {message.isAI && (
                            <Chip label="AI" size="small" color="primary" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: message.isAI ? 'primary.50' : 'grey.50',
                            p: 1,
                            borderRadius: 1,
                            mt: 0.5
                          }}
                        >
                          {message.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {typingUsers.length > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'grey.300' }}>
                        <CircularProgress size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>

          {/* Message Input */}
          <Paper sx={{ p: 2, borderRadius: 0 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              value={messageInput}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || !isConnected}
                      color="primary"
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* Create Room Dialog */}
      <Dialog open={showCreateRoom} onClose={() => setShowCreateRoom(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Chat Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateRoom(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained" disabled={!newRoomName.trim()}>
            Create Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveChat;
