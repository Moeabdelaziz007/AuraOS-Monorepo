const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client/dist'));

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Socket.io connection handling
const connectedUsers = new Map();
const systemRooms = new Set();
const chatRooms = new Map();
const userProfiles = new Map();

io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  // Handle user authentication and room joining
  socket.on('join_user_room', (userData) => {
    const { userId, userProfile } = userData;
    socket.join(`user_${userId}`);
    
    // Store user data
    connectedUsers.set(socket.id, { 
      userId, 
      socketId: socket.id, 
      connectedAt: new Date(),
      userProfile,
      status: 'online',
      lastSeen: new Date()
    });
    
    userProfiles.set(userId, userProfile);
    
    // Broadcast updated online users list
    const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
      id: user.userId,
      socketId: user.socketId,
      connectedAt: user.connectedAt,
      userProfile: user.userProfile,
      status: user.status,
      lastSeen: user.lastSeen
    }));
    
    io.emit('online_users', onlineUsers);
    socket.emit('user_joined', { id: userId, socketId: socket.id });
    
    // Join general chat room
    socket.join('general_chat');
    socket.emit('joined_chat', { room: 'general_chat', message: 'Welcome to AIOS Live Chat!' });
  });

  socket.on('join_system_room', (roomName) => {
    socket.join(roomName);
    systemRooms.add(roomName);
    logger.info(`User ${socket.id} joined system room: ${roomName}`);
  });

  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    logger.info(`User ${socket.id} joined room: ${roomName}`);
  });

  socket.on('leave_room', (roomName) => {
    socket.leave(roomName);
    logger.info(`User ${socket.id} left room: ${roomName}`);
  });

  // Chat system handlers
  socket.on('join_chat_room', (roomData) => {
    const { roomName, userProfile } = roomData;
    socket.join(roomName);
    
    // Initialize chat room if it doesn't exist
    if (!chatRooms.has(roomName)) {
      chatRooms.set(roomName, {
        name: roomName,
        users: new Set(),
        messages: [],
        createdAt: new Date()
      });
    }
    
    const room = chatRooms.get(roomName);
    room.users.add(socket.id);
    
    // Notify room about new user
    socket.to(roomName).emit('user_joined_chat', {
      user: userProfile,
      message: `${userProfile.displayName || userProfile.email} joined the chat`
    });
    
    // Send chat history to new user
    socket.emit('chat_history', room.messages.slice(-50)); // Last 50 messages
    socket.emit('joined_chat', { room: roomName, message: `Welcome to ${roomName}!` });
  });

  socket.on('send_message', async (messageData) => {
    const { roomName, message, userProfile, messageType = 'text' } = messageData;
    
    const messageObj = {
      id: Date.now().toString(),
      roomName,
      userId: userProfile.uid,
      userName: userProfile.displayName || userProfile.email,
      userAvatar: userProfile.photoURL || null,
      message,
      messageType,
      timestamp: new Date(),
      isAI: false
    };
    
    // Store message in room
    if (chatRooms.has(roomName)) {
      const room = chatRooms.get(roomName);
      room.messages.push(messageObj);
      
      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }
    }
    
    // Broadcast message to room
    io.to(roomName).emit('new_message', messageObj);
    
    // AI Response for general chat
    if (roomName === 'general_chat' && messageType === 'text') {
      setTimeout(() => {
        const aiResponse = generateAIResponse(message, userProfile);
        const aiMessage = {
          id: Date.now().toString() + '_ai',
          roomName,
          userId: 'ai_assistant',
          userName: 'AI Assistant',
          userAvatar: '🤖',
          message: aiResponse,
          messageType: 'ai_response',
          timestamp: new Date(),
          isAI: true
        };
        
        if (chatRooms.has(roomName)) {
          chatRooms.get(roomName).messages.push(aiMessage);
        }
        
        io.to(roomName).emit('new_message', aiMessage);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    }
  });

  socket.on('typing_start', (data) => {
    const { roomName, userProfile } = data;
    socket.to(roomName).emit('user_typing', {
      userId: userProfile.uid,
      userName: userProfile.displayName || userProfile.email,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { roomName, userProfile } = data;
    socket.to(roomName).emit('user_typing', {
      userId: userProfile.uid,
      userName: userProfile.displayName || userProfile.email,
      isTyping: false
    });
  });

  // Handle notifications
  socket.on('send_notification', (data) => {
    const { to, notification } = data;
    socket.to(`user_${to}`).emit('notification', notification);
  });

  // Handle system alerts
  socket.on('broadcast_system_alert', (alert) => {
    io.emit('system_alert', alert);
    logger.info('System alert broadcasted:', alert);
  });

  // Handle app status updates
  socket.on('update_app_status', async (data) => {
    const { appId, status } = data;
    
    try {
      // Update app status in Firestore
      const appRef = doc(db, 'apps', appId);
      await updateDoc(appRef, { 
        status, 
        updatedAt: new Date().toISOString() 
      });
      
      // Broadcast update to all connected clients
      io.emit('app_updated', { appId, status, updatedAt: new Date().toISOString() });
      
      logger.info(`App ${appId} status updated to ${status}`);
    } catch (error) {
      logger.error('Error updating app status:', error);
      socket.emit('error', { message: 'Failed to update app status' });
    }
  });

  // Handle system status requests
  socket.on('request_system_status', async () => {
    try {
      const appsSnapshot = await getDocs(collection(db, 'apps'));
      const totalApps = appsSnapshot.size;
      const activeApps = appsSnapshot.docs.filter(doc => doc.data().status === 'active').length;
      
      const systemStatus = {
        totalApps,
        activeApps,
        inactiveApps: totalApps - activeApps,
        uptime: '99.9%',
        timestamp: new Date().toISOString()
      };
      
      socket.emit('system_status_update', systemStatus);
    } catch (error) {
      logger.error('Error fetching system status:', error);
      socket.emit('error', { message: 'Failed to fetch system status' });
    }
  });

  // Handle data agent updates
  socket.on('data_agent_update', (data) => {
    io.emit('data_agent_update', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
    
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      
      // Remove user from all chat rooms
      chatRooms.forEach((room, roomName) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          socket.to(roomName).emit('user_left_chat', {
            user: user.userProfile,
            message: `${user.userProfile.displayName || user.userProfile.email} left the chat`
          });
        }
      });
      
      // Broadcast updated online users list
      const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
        id: user.userId,
        socketId: user.socketId,
        connectedAt: user.connectedAt,
        userProfile: user.userProfile,
        status: user.status,
        lastSeen: user.lastSeen
      }));
      
      io.emit('online_users', onlineUsers);
      io.emit('user_left', user.userId);
    }
  });
});

// Periodic system status updates
setInterval(async () => {
  try {
    const appsSnapshot = await getDocs(collection(db, 'apps'));
    const totalApps = appsSnapshot.size;
    const activeApps = appsSnapshot.docs.filter(doc => doc.data().status === 'active').length;
    
    const systemStatus = {
      totalApps,
      activeApps,
      inactiveApps: totalApps - activeApps,
      uptime: '99.9%',
      timestamp: new Date().toISOString()
    };
    
    io.emit('system_status_update', systemStatus);
  } catch (error) {
    logger.error('Error in periodic system status update:', error);
  }
}, 30000); // Update every 30 seconds

// AI Response Generation Function
function generateAIResponse(message, userProfile) {
  const responses = [
    `Hello ${userProfile.displayName || 'there'}! I'm the AIOS AI Assistant. How can I help you today?`,
    `That's interesting! As an AI, I'm here to assist with your AIOS tasks. What would you like to explore?`,
    `Great question! I can help you with app management, system monitoring, or general AIOS features. What's on your mind?`,
    `I'm processing your message... As part of the AIOS live system, I'm here to make your experience better!`,
    `Fascinating! I love interacting with users like you. What AIOS feature would you like to learn about?`,
    `I'm always learning from conversations like this. How can I help improve your AIOS experience today?`,
    `That's a great point! As the AIOS AI, I'm designed to be helpful and engaging. What can I assist you with?`,
    `I appreciate your message! I'm here to help make AIOS more powerful and user-friendly. What's your next move?`
  ];
  
  // Simple keyword-based responses
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return `Hello ${userProfile.displayName || 'there'}! Welcome to AIOS Live Chat! 🤖`;
  }
  
  if (message.toLowerCase().includes('help')) {
    return `I'm here to help! I can assist with AIOS features, app management, or just chat. What do you need?`;
  }
  
  if (message.toLowerCase().includes('aios')) {
    return `AIOS is your AI Operating System! I'm part of the live system that makes everything work together seamlessly.`;
  }
  
  if (message.toLowerCase().includes('apps')) {
    return `Apps are the heart of AIOS! You can create, manage, and collaborate on AI-powered applications here.`;
  }
  
  // Random response for other messages
  return responses[Math.floor(Math.random() * responses.length)];
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AIOS Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    projectId: process.env.FIREBASE_PROJECT_ID,
    apiUrl: process.env.AIOS_API_URL,
    wsUrl: process.env.AIOS_WS_URL
  });
});

// AIOS Core API Routes

// Get all apps
app.get('/api/apps', async (req, res) => {
  try {
    const appsRef = collection(db, 'apps');
    const q = query(appsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const apps = [];
    snapshot.forEach((doc) => {
      apps.push({ id: doc.id, ...doc.data() });
    });
    res.json({ apps });
  } catch (error) {
    logger.error('Error fetching apps:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single app by ID
app.get('/api/apps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appRef = doc(db, 'apps', id);
    const appSnap = await getDoc(appRef);
    
    if (!appSnap.exists()) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    res.json({ id: appSnap.id, ...appSnap.data() });
  } catch (error) {
    logger.error('Error fetching app:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new app
app.post('/api/apps', async (req, res) => {
  try {
    const { name, description, category, config } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const appData = {
      name,
      description,
      category: category || 'general',
      config: config || {},
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'apps'), appData);
    res.status(201).json({ id: docRef.id, ...appData });
  } catch (error) {
    logger.error('Error creating app:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update app
app.put('/api/apps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const appRef = doc(db, 'apps', id);
    await updateDoc(appRef, updateData);
    
    res.json({ id, ...updateData });
  } catch (error) {
    logger.error('Error updating app:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete app
app.delete('/api/apps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, 'apps', id));
    res.json({ message: 'App deleted successfully' });
  } catch (error) {
    logger.error('Error deleting app:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get system status
app.get('/api/system/status', async (req, res) => {
  try {
    const appsRef = collection(db, 'apps');
    const snapshot = await getDocs(appsRef);
    const totalApps = snapshot.size;
    
    const activeApps = snapshot.docs.filter(doc => doc.data().status === 'active').length;
    
    res.json({
      status: 'online',
      totalApps,
      activeApps,
      inactiveApps: totalApps - activeApps,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get system logs
app.get('/api/system/logs', async (req, res) => {
  try {
    const logsRef = collection(db, 'system_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    res.json({ logs });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create system log
app.post('/api/system/logs', async (req, res) => {
  try {
    const { level, message, metadata } = req.body;
    
    if (!level || !message) {
      return res.status(400).json({ error: 'Level and message are required' });
    }
    
    const logData = {
      level,
      message,
      metadata: metadata || {},
      timestamp: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'system_logs'), logData);
    res.status(201).json({ id: docRef.id, ...logData });
  } catch (error) {
    logger.error('Error creating log:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat API Routes

// Get chat rooms
app.get('/api/chat/rooms', (req, res) => {
  try {
    const rooms = Array.from(chatRooms.entries()).map(([name, room]) => ({
      name,
      userCount: room.users.size,
      messageCount: room.messages.length,
      createdAt: room.createdAt,
      lastActivity: room.messages.length > 0 ? room.messages[room.messages.length - 1].timestamp : room.createdAt
    }));
    
    res.json({ rooms });
  } catch (error) {
    logger.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a room
app.get('/api/chat/rooms/:roomName/history', (req, res) => {
  try {
    const { roomName } = req.params;
    
    if (!chatRooms.has(roomName)) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    const room = chatRooms.get(roomName);
    res.json({ messages: room.messages });
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new chat room
app.post('/api/chat/rooms', (req, res) => {
  try {
    const { roomName, description } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    if (chatRooms.has(roomName)) {
      return res.status(409).json({ error: 'Chat room already exists' });
    }
    
    const newRoom = {
      name: roomName,
      description: description || '',
      users: new Set(),
      messages: [],
      createdAt: new Date()
    };
    
    chatRooms.set(roomName, newRoom);
    
    res.status(201).json({
      name: roomName,
      description: newRoom.description,
      userCount: 0,
      messageCount: 0,
      createdAt: newRoom.createdAt
    });
  } catch (error) {
    logger.error('Error creating chat room:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Management API Routes

// Get online users
app.get('/api/users/online', (req, res) => {
  try {
    const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
      id: user.userId,
      socketId: user.socketId,
      connectedAt: user.connectedAt,
      userProfile: user.userProfile,
      status: user.status,
      lastSeen: user.lastSeen
    }));
    
    res.json({ users: onlineUsers });
  } catch (error) {
    logger.error('Error fetching online users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/users/:userId/profile', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userProfiles.has(userId)) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({ profile: userProfiles.get(userId) });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/:userId/profile', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (!userProfiles.has(userId)) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const currentProfile = userProfiles.get(userId);
    const updatedProfile = { ...currentProfile, ...updates, updatedAt: new Date() };
    
    userProfiles.set(userId, updatedProfile);
    
    // Update in connected users if user is online
    connectedUsers.forEach((user, socketId) => {
      if (user.userId === userId) {
        user.userProfile = updatedProfile;
        connectedUsers.set(socketId, user);
      }
    });
    
    res.json({ profile: updatedProfile });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 AIOS Server running on port ${PORT}`);
  logger.info(`📡 Socket.io server ready for connections`);
  logger.info(`🔥 Firebase connected: ${process.env.FIREBASE_PROJECT_ID}`);
});
