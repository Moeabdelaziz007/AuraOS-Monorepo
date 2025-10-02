import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: user.accessToken || 'mock-token',
          userId: user.uid
        },
        transports: ['websocket', 'polling']
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join user-specific room
        newSocket.emit('join_user_room', user.uid);
        
        // Join system-wide room for general updates
        newSocket.emit('join_system_room', 'aios_system');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Real-time notifications
      newSocket.on('notification', (notification) => {
        console.log('New notification:', notification);
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      });

      // Online users updates
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_joined', (userData) => {
        console.log('User joined:', userData);
        setOnlineUsers(prev => [...prev.filter(u => u.id !== userData.id), userData]);
      });

      newSocket.on('user_left', (userId) => {
        console.log('User left:', userId);
        setOnlineUsers(prev => prev.filter(u => u.id !== userId));
      });

      // System alerts
      newSocket.on('system_alert', (alert) => {
        console.log('System alert:', alert);
        setSystemAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep last 20
      });

      // Real-time app updates
      newSocket.on('app_updated', (appData) => {
        console.log('App updated:', appData);
        // Emit custom event for components to listen to
        window.dispatchEvent(new CustomEvent('appUpdate', { detail: appData }));
      });

      // Real-time system status updates
      newSocket.on('system_status_update', (status) => {
        console.log('System status update:', status);
        window.dispatchEvent(new CustomEvent('systemStatusUpdate', { detail: status }));
      });

      // Data Agent updates
      newSocket.on('data_agent_update', (data) => {
        console.log('Data Agent update:', data);
        window.dispatchEvent(new CustomEvent('dataAgentUpdate', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Socket utility functions
  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const joinRoom = (roomName) => {
    emitEvent('join_room', roomName);
  };

  const leaveRoom = (roomName) => {
    emitEvent('leave_room', roomName);
  };

  const sendNotification = (toUserId, notification) => {
    emitEvent('send_notification', {
      to: toUserId,
      notification: {
        ...notification,
        from: user?.uid,
        timestamp: new Date().toISOString()
      }
    });
  };

  const broadcastSystemAlert = (alert) => {
    emitEvent('broadcast_system_alert', {
      ...alert,
      timestamp: new Date().toISOString()
    });
  };

  const updateAppStatus = (appId, status) => {
    emitEvent('update_app_status', { appId, status });
  };

  const requestSystemStatus = () => {
    emitEvent('request_system_status');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearSystemAlerts = () => {
    setSystemAlerts([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    onlineUsers,
    systemAlerts,
    emitEvent,
    joinRoom,
    leaveRoom,
    sendNotification,
    broadcastSystemAlert,
    updateAppStatus,
    requestSystemStatus,
    clearNotifications,
    clearSystemAlerts
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
