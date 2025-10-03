/**
 * Socket.io Integration Tests
 * Tests for real-time WebSocket events
 */

const io = require('socket.io-client');

describe('Socket.io Events', () => {
  let clientSocket;
  const SERVER_URL = 'http://localhost:5000';
  
  beforeEach((done) => {
    // Create socket.io client for testing
    clientSocket = io(SERVER_URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    
    clientSocket.on('connect', done);
  });
  
  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });
  
  describe('Connection', () => {
    test('should connect to socket server', () => {
      expect(clientSocket.connected).toBe(true);
    });
    
    test('should have a socket ID', () => {
      expect(clientSocket.id).toBeDefined();
      expect(typeof clientSocket.id).toBe('string');
    });
  });
  
  describe('User Presence', () => {
    test('should join user room', (done) => {
      const userData = {
        userId: 'test_user_123',
        userProfile: {
          uid: 'test_user_123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
        },
      };
      
      clientSocket.emit('join_user_room', userData);
      
      clientSocket.on('user_joined', (data) => {
        expect(data.id).toBe('test_user_123');
        expect(data.socketId).toBeDefined();
        done();
      });
    });
    
    test('should receive online users list after joining', (done) => {
      const userData = {
        userId: 'test_user_456',
        userProfile: {
          uid: 'test_user_456',
          email: 'test2@example.com',
          displayName: 'Test User 2',
        },
      };
      
      clientSocket.emit('join_user_room', userData);
      
      clientSocket.on('online_users', (users) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        
        const currentUser = users.find(u => u.id === 'test_user_456');
        expect(currentUser).toBeDefined();
        expect(currentUser.status).toBe('online');
        done();
      });
    });
    
    test('should broadcast user left on disconnect', (done) => {
      const userData = {
        userId: 'test_user_disconnect',
        userProfile: {
          uid: 'test_user_disconnect',
          email: 'disconnect@example.com',
          displayName: 'Disconnect Test',
        },
      };
      
      // Create second client to listen for disconnect event
      const listenerSocket = io(SERVER_URL, {
        transports: ['websocket'],
        forceNew: true,
      });
      
      listenerSocket.on('connect', () => {
        clientSocket.emit('join_user_room', userData);
        
        listenerSocket.on('user_left', (userId) => {
          if (userId === 'test_user_disconnect') {
            expect(userId).toBe('test_user_disconnect');
            listenerSocket.disconnect();
            done();
          }
        });
        
        // Disconnect after joining
        setTimeout(() => {
          clientSocket.disconnect();
        }, 100);
      });
    });
  });
  
  describe('Chat System', () => {
    test('should join chat room', (done) => {
      const roomData = {
        roomName: 'test_room',
        userProfile: {
          uid: 'test_user_chat',
          email: 'chat@example.com',
          displayName: 'Chat User',
        },
      };
      
      clientSocket.emit('join_chat_room', roomData);
      
      clientSocket.on('joined_chat', (data) => {
        expect(data.room).toBe('test_room');
        expect(data.message).toContain('Welcome');
        done();
      });
    });
    
    test('should receive chat history when joining room', (done) => {
      const roomData = {
        roomName: 'general_chat',
        userProfile: {
          uid: 'test_history',
          email: 'history@example.com',
          displayName: 'History User',
        },
      };
      
      clientSocket.emit('join_chat_room', roomData);
      
      clientSocket.on('chat_history', (messages) => {
        expect(Array.isArray(messages)).toBe(true);
        done();
      });
    });
    
    test('should send and receive messages', (done) => {
      const messageData = {
        roomName: 'general_chat',
        message: 'Test message from socket test',
        userProfile: {
          uid: 'test_sender',
          email: 'sender@example.com',
          displayName: 'Message Sender',
        },
        messageType: 'text',
      };
      
      // First join the room
      clientSocket.emit('join_chat_room', {
        roomName: 'general_chat',
        userProfile: messageData.userProfile,
      });
      
      // Wait for join confirmation
      clientSocket.on('joined_chat', () => {
        // Then send message
        clientSocket.emit('send_message', messageData);
      });
      
      // Listen for new message
      clientSocket.on('new_message', (msg) => {
        if (msg.userId === 'test_sender' && !msg.isAI) {
          expect(msg.message).toBe('Test message from socket test');
          expect(msg.messageType).toBe('text');
          expect(msg.userName).toBe('Message Sender');
          done();
        }
      });
    });
    
    test('should receive AI response after user message', (done) => {
      const messageData = {
        roomName: 'general_chat',
        message: 'Hello AI',
        userProfile: {
          uid: 'test_ai_trigger',
          email: 'ai@example.com',
          displayName: 'AI Tester',
        },
        messageType: 'text',
      };
      
      let userMessageReceived = false;
      
      clientSocket.emit('join_chat_room', {
        roomName: 'general_chat',
        userProfile: messageData.userProfile,
      });
      
      clientSocket.on('joined_chat', () => {
        clientSocket.emit('send_message', messageData);
      });
      
      clientSocket.on('new_message', (msg) => {
        if (msg.userId === 'test_ai_trigger') {
          userMessageReceived = true;
        } else if (msg.isAI && userMessageReceived) {
          expect(msg.userId).toBe('ai_assistant');
          expect(msg.userName).toBe('AI Assistant');
          expect(msg.messageType).toBe('ai_response');
          done();
        }
      });
    }, 10000); // Increase timeout for AI response
    
    test('should handle typing indicators', (done) => {
      const typingData = {
        roomName: 'general_chat',
        userProfile: {
          uid: 'test_typer',
          email: 'typer@example.com',
          displayName: 'Test Typer',
        },
      };
      
      // Create second client to receive typing indicator
      const listenerSocket = io(SERVER_URL, {
        transports: ['websocket'],
        forceNew: true,
      });
      
      listenerSocket.on('connect', () => {
        // Both join the same room
        clientSocket.emit('join_chat_room', {
          roomName: 'general_chat',
          userProfile: typingData.userProfile,
        });
        
        listenerSocket.emit('join_chat_room', {
          roomName: 'general_chat',
          userProfile: {
            uid: 'listener',
            email: 'listener@example.com',
            displayName: 'Listener',
          },
        });
        
        // Listener waits for typing indicator
        listenerSocket.on('user_typing', (data) => {
          if (data.userId === 'test_typer') {
            expect(data.isTyping).toBe(true);
            expect(data.userName).toBe('Test Typer');
            listenerSocket.disconnect();
            done();
          }
        });
        
        // Send typing indicator after both joined
        setTimeout(() => {
          clientSocket.emit('typing_start', typingData);
        }, 200);
      });
    });
    
    test('should handle typing stop', (done) => {
      const typingData = {
        roomName: 'general_chat',
        userProfile: {
          uid: 'test_stop_typer',
          email: 'stoptyper@example.com',
          displayName: 'Stop Typer',
        },
      };
      
      const listenerSocket = io(SERVER_URL, {
        transports: ['websocket'],
        forceNew: true,
      });
      
      listenerSocket.on('connect', () => {
        clientSocket.emit('join_chat_room', {
          roomName: 'general_chat',
          userProfile: typingData.userProfile,
        });
        
        listenerSocket.emit('join_chat_room', {
          roomName: 'general_chat',
          userProfile: {
            uid: 'stop_listener',
            email: 'stoplistener@example.com',
            displayName: 'Stop Listener',
          },
        });
        
        listenerSocket.on('user_typing', (data) => {
          if (data.userId === 'test_stop_typer' && !data.isTyping) {
            expect(data.isTyping).toBe(false);
            listenerSocket.disconnect();
            done();
          }
        });
        
        setTimeout(() => {
          clientSocket.emit('typing_stop', typingData);
        }, 200);
      });
    });
  });
  
  describe('System Events', () => {
    test('should request and receive system status', (done) => {
      clientSocket.emit('request_system_status');
      
      clientSocket.on('system_status_update', (status) => {
        expect(status).toHaveProperty('totalApps');
        expect(status).toHaveProperty('activeApps');
        expect(status).toHaveProperty('inactiveApps');
        expect(status).toHaveProperty('timestamp');
        expect(typeof status.totalApps).toBe('number');
        done();
      });
    });
    
    test('should receive periodic system status updates', (done) => {
      let updateCount = 0;
      
      clientSocket.on('system_status_update', (status) => {
        updateCount++;
        expect(status).toHaveProperty('totalApps');
        
        if (updateCount >= 2) {
          done();
        }
      });
    }, 35000); // Wait for at least one periodic update (30s interval)
    
    test('should broadcast system alerts', (done) => {
      const alert = {
        title: 'Test Alert',
        message: 'This is a test system alert',
        severity: 'info',
      };
      
      clientSocket.on('system_alert', (receivedAlert) => {
        expect(receivedAlert.title).toBe('Test Alert');
        expect(receivedAlert.message).toBe('This is a test system alert');
        expect(receivedAlert.severity).toBe('info');
        done();
      });
      
      // Emit alert (in real app, this would be admin-only)
      clientSocket.emit('broadcast_system_alert', alert);
    });
  });
  
  describe('Room Management', () => {
    test('should join system room', (done) => {
      clientSocket.emit('join_system_room', 'admin_notifications');
      
      // No direct confirmation, but should not error
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });
    
    test('should join and leave generic room', (done) => {
      clientSocket.emit('join_room', 'project_123');
      
      setTimeout(() => {
        clientSocket.emit('leave_room', 'project_123');
        
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      }, 100);
    });
  });
  
  describe('Notifications', () => {
    test('should send notification to specific user', (done) => {
      // Create target user socket
      const targetSocket = io(SERVER_URL, {
        transports: ['websocket'],
        forceNew: true,
      });
      
      targetSocket.on('connect', () => {
        // Target user joins their room
        targetSocket.emit('join_user_room', {
          userId: 'target_user',
          userProfile: {
            uid: 'target_user',
            email: 'target@example.com',
            displayName: 'Target User',
          },
        });
        
        // Listen for notification
        targetSocket.on('notification', (notification) => {
          expect(notification.title).toBe('Test Notification');
          expect(notification.message).toBe('You have a new notification');
          expect(notification.type).toBe('info');
          targetSocket.disconnect();
          done();
        });
        
        // Send notification from client socket
        setTimeout(() => {
          clientSocket.emit('send_notification', {
            to: 'target_user',
            notification: {
              title: 'Test Notification',
              message: 'You have a new notification',
              type: 'info',
            },
          });
        }, 200);
      });
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid event data gracefully', (done) => {
      // Send invalid data
      clientSocket.emit('join_user_room', null);
      
      // Should not crash, socket should remain connected
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });
    
    test('should handle missing required fields', (done) => {
      // Send message without required fields
      clientSocket.emit('send_message', {
        roomName: 'test_room',
        // Missing message and userProfile
      });
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });
  });
});
