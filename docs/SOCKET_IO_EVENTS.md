# Socket.io Events Documentation

Complete real-time event documentation for AuraOS WebSocket communication.

## 📋 Table of Contents

- [Connection](#connection)
- [User Presence](#user-presence)
- [Room Management](#room-management)
- [Chat System](#chat-system)
- [Notifications](#notifications)
- [System Events](#system-events)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 🔌 Connection

### Client Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### Connection States

| State | Description |
|-------|-------------|
| `connect` | Successfully connected to server |
| `disconnect` | Disconnected from server |
| `connect_error` | Connection failed |
| `reconnect` | Reconnected after disconnect |
| `reconnect_attempt` | Attempting to reconnect |
| `reconnect_error` | Reconnection failed |
| `reconnect_failed` | All reconnection attempts failed |

---

## 👥 User Presence

### join_user_room

Join a user-specific room and register presence.

**Direction:** Client → Server

**Payload:**

```typescript
{
  userId: string;
  userProfile: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
}
```

**Example:**

```javascript
socket.emit('join_user_room', {
  userId: 'user_123',
  userProfile: {
    uid: 'user_123',
    email: 'user@example.com',
    displayName: 'John Doe',
    photoURL: 'https://example.com/avatar.jpg'
  }
});
```

**Server Response Events:**
- `user_joined` - Confirmation of join
- `online_users` - Updated list of online users

---

### user_joined

Confirmation that user successfully joined their room.

**Direction:** Server → Client

**Payload:**

```typescript
{
  id: string;        // User ID
  socketId: string;  // Socket connection ID
}
```

**Example:**

```javascript
socket.on('user_joined', (data) => {
  console.log(`Joined as ${data.id} with socket ${data.socketId}`);
});
```

---

### online_users

Broadcast of all currently online users.

**Direction:** Server → All Clients

**Payload:**

```typescript
Array<{
  id: string;
  socketId: string;
  connectedAt: Date;
  userProfile: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
}>
```

**Example:**

```javascript
socket.on('online_users', (users) => {
  console.log(`${users.length} users online`);
  users.forEach(user => {
    console.log(`- ${user.userProfile.displayName || user.userProfile.email}`);
  });
});
```

---

### user_left

Notification when a user disconnects.

**Direction:** Server → All Clients

**Payload:**

```typescript
string  // User ID
```

**Example:**

```javascript
socket.on('user_left', (userId) => {
  console.log(`User ${userId} left`);
});
```

---

## 🚪 Room Management

### join_system_room

Join a system-level room for broadcasts.

**Direction:** Client → Server

**Payload:**

```typescript
string  // Room name
```

**Example:**

```javascript
socket.emit('join_system_room', 'admin_notifications');
```

**Common System Rooms:**
- `admin_notifications` - Admin alerts
- `system_updates` - System status updates
- `app_updates` - Application updates

---

### join_room

Join a generic room.

**Direction:** Client → Server

**Payload:**

```typescript
string  // Room name
```

**Example:**

```javascript
socket.emit('join_room', 'project_123');
```

---

### leave_room

Leave a room.

**Direction:** Client → Server

**Payload:**

```typescript
string  // Room name
```

**Example:**

```javascript
socket.emit('leave_room', 'project_123');
```

---

## 💬 Chat System

### join_chat_room

Join a chat room and receive chat history.

**Direction:** Client → Server

**Payload:**

```typescript
{
  roomName: string;
  userProfile: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
}
```

**Example:**

```javascript
socket.emit('join_chat_room', {
  roomName: 'general_chat',
  userProfile: {
    uid: 'user_123',
    email: 'user@example.com',
    displayName: 'John Doe'
  }
});
```

**Server Response Events:**
- `joined_chat` - Confirmation
- `chat_history` - Last 50 messages
- `user_joined_chat` - Broadcast to other users

---

### joined_chat

Confirmation of joining a chat room.

**Direction:** Server → Client

**Payload:**

```typescript
{
  room: string;
  message: string;
}
```

**Example:**

```javascript
socket.on('joined_chat', (data) => {
  console.log(`${data.message} in room ${data.room}`);
});
```

---

### chat_history

Chat history sent when joining a room.

**Direction:** Server → Client

**Payload:**

```typescript
Array<{
  id: string;
  roomName: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  message: string;
  messageType: 'text' | 'ai_response' | 'system';
  timestamp: Date;
  isAI: boolean;
}>
```

**Example:**

```javascript
socket.on('chat_history', (messages) => {
  console.log(`Received ${messages.length} messages`);
  messages.forEach(msg => {
    console.log(`${msg.userName}: ${msg.message}`);
  });
});
```

---

### send_message

Send a message to a chat room.

**Direction:** Client → Server

**Payload:**

```typescript
{
  roomName: string;
  message: string;
  userProfile: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  messageType?: 'text' | 'system';
}
```

**Example:**

```javascript
socket.emit('send_message', {
  roomName: 'general_chat',
  message: 'Hello everyone!',
  userProfile: {
    uid: 'user_123',
    email: 'user@example.com',
    displayName: 'John Doe'
  },
  messageType: 'text'
});
```

**Server Response Events:**
- `new_message` - Broadcast to all room members

---

### new_message

New message broadcast to chat room.

**Direction:** Server → Room Members

**Payload:**

```typescript
{
  id: string;
  roomName: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  message: string;
  messageType: 'text' | 'ai_response' | 'system';
  timestamp: Date;
  isAI: boolean;
}
```

**Example:**

```javascript
socket.on('new_message', (message) => {
  if (message.isAI) {
    console.log(`🤖 ${message.userName}: ${message.message}`);
  } else {
    console.log(`${message.userName}: ${message.message}`);
  }
});
```

---

### user_joined_chat

Notification when user joins chat room.

**Direction:** Server → Room Members (except joiner)

**Payload:**

```typescript
{
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  message: string;
}
```

**Example:**

```javascript
socket.on('user_joined_chat', (data) => {
  console.log(data.message); // "John Doe joined the chat"
});
```

---

### user_left_chat

Notification when user leaves chat room.

**Direction:** Server → Room Members

**Payload:**

```typescript
{
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  message: string;
}
```

**Example:**

```javascript
socket.on('user_left_chat', (data) => {
  console.log(data.message); // "John Doe left the chat"
});
```

---

### typing_start

Notify room that user started typing.

**Direction:** Client → Server

**Payload:**

```typescript
{
  roomName: string;
  userProfile: {
    uid: string;
    email: string;
    displayName?: string;
  };
}
```

**Example:**

```javascript
socket.emit('typing_start', {
  roomName: 'general_chat',
  userProfile: {
    uid: 'user_123',
    email: 'user@example.com',
    displayName: 'John Doe'
  }
});
```

**Server Response Events:**
- `user_typing` - Broadcast to other room members

---

### typing_stop

Notify room that user stopped typing.

**Direction:** Client → Server

**Payload:**

```typescript
{
  roomName: string;
  userProfile: {
    uid: string;
    email: string;
    displayName?: string;
  };
}
```

**Example:**

```javascript
socket.emit('typing_stop', {
  roomName: 'general_chat',
  userProfile: {
    uid: 'user_123',
    email: 'user@example.com',
    displayName: 'John Doe'
  }
});
```

---

### user_typing

Typing indicator broadcast.

**Direction:** Server → Room Members (except typer)

**Payload:**

```typescript
{
  userId: string;
  userName: string;
  isTyping: boolean;
}
```

**Example:**

```javascript
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.userName} is typing...`);
  } else {
    console.log(`${data.userName} stopped typing`);
  }
});
```

---

## 🔔 Notifications

### send_notification

Send a notification to a specific user.

**Direction:** Client → Server

**Payload:**

```typescript
{
  to: string;  // User ID
  notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
  };
}
```

**Example:**

```javascript
socket.emit('send_notification', {
  to: 'user_456',
  notification: {
    title: 'New Message',
    message: 'You have a new message from John',
    type: 'info',
    data: { messageId: 'msg_123' }
  }
});
```

---

### notification

Receive a notification.

**Direction:** Server → Specific User

**Payload:**

```typescript
{
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}
```

**Example:**

```javascript
socket.on('notification', (notification) => {
  console.log(`[${notification.type}] ${notification.title}: ${notification.message}`);
  
  // Show notification UI
  showNotification(notification);
});
```

---

## 🖥️ System Events

### broadcast_system_alert

Broadcast a system-wide alert.

**Direction:** Client → Server (Admin only)

**Payload:**

```typescript
{
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  action?: {
    label: string;
    url: string;
  };
}
```

**Example:**

```javascript
socket.emit('broadcast_system_alert', {
  title: 'Maintenance Notice',
  message: 'System will be down for maintenance in 10 minutes',
  severity: 'warning',
  action: {
    label: 'Learn More',
    url: '/maintenance'
  }
});
```

---

### system_alert

Receive a system alert.

**Direction:** Server → All Clients

**Payload:**

```typescript
{
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  action?: {
    label: string;
    url: string;
  };
}
```

**Example:**

```javascript
socket.on('system_alert', (alert) => {
  console.log(`[${alert.severity}] ${alert.title}: ${alert.message}`);
  
  // Show alert banner
  showSystemAlert(alert);
});
```

---

### update_app_status

Update an app's status.

**Direction:** Client → Server

**Payload:**

```typescript
{
  appId: string;
  status: 'active' | 'inactive';
}
```

**Example:**

```javascript
socket.emit('update_app_status', {
  appId: 'app_123',
  status: 'active'
});
```

**Server Response Events:**
- `app_updated` - Broadcast to all clients

---

### app_updated

Notification of app status update.

**Direction:** Server → All Clients

**Payload:**

```typescript
{
  appId: string;
  status: 'active' | 'inactive';
  updatedAt: string;
}
```

**Example:**

```javascript
socket.on('app_updated', (data) => {
  console.log(`App ${data.appId} is now ${data.status}`);
  
  // Update UI
  updateAppStatus(data.appId, data.status);
});
```

---

### request_system_status

Request current system status.

**Direction:** Client → Server

**Payload:** None

**Example:**

```javascript
socket.emit('request_system_status');
```

**Server Response Events:**
- `system_status_update` - System status data

---

### system_status_update

System status update (periodic or on-demand).

**Direction:** Server → Client/All Clients

**Payload:**

```typescript
{
  totalApps: number;
  activeApps: number;
  inactiveApps: number;
  uptime: string;
  timestamp: string;
}
```

**Example:**

```javascript
socket.on('system_status_update', (status) => {
  console.log(`System Status:`);
  console.log(`- Total Apps: ${status.totalApps}`);
  console.log(`- Active: ${status.activeApps}`);
  console.log(`- Inactive: ${status.inactiveApps}`);
  console.log(`- Uptime: ${status.uptime}`);
});
```

**Note:** This event is automatically broadcast every 30 seconds.

---

### data_agent_update

Data agent status update.

**Direction:** Client → Server

**Payload:**

```typescript
{
  agentId: string;
  status: string;
  data: any;
}
```

**Example:**

```javascript
socket.emit('data_agent_update', {
  agentId: 'agent_123',
  status: 'processing',
  data: { progress: 75 }
});
```

**Server Response Events:**
- `data_agent_update` - Broadcast with timestamp

---

## ❌ Error Handling

### error

Error event from server.

**Direction:** Server → Client

**Payload:**

```typescript
{
  message: string;
  code?: string;
  details?: any;
}
```

**Example:**

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  
  // Handle specific errors
  if (error.code === 'AUTH_FAILED') {
    // Redirect to login
  }
});
```

---

## 🎯 Best Practices

### Connection Management

```javascript
// Reconnection handling
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  
  // Re-join rooms
  socket.emit('join_user_room', userData);
  socket.emit('join_chat_room', chatData);
});

// Cleanup on disconnect
socket.on('disconnect', () => {
  // Clear local state
  clearUserPresence();
});
```

### Event Listeners

```javascript
// Use once() for one-time events
socket.once('user_joined', (data) => {
  console.log('Initial join confirmed');
});

// Remove listeners when component unmounts
useEffect(() => {
  socket.on('new_message', handleMessage);
  
  return () => {
    socket.off('new_message', handleMessage);
  };
}, []);
```

### Error Handling

```javascript
// Always handle errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
  showErrorNotification(error.message);
});

// Timeout for responses
const timeout = setTimeout(() => {
  console.error('Request timeout');
}, 5000);

socket.once('response_event', (data) => {
  clearTimeout(timeout);
  handleResponse(data);
});
```

### Performance

```javascript
// Throttle frequent events
import { throttle } from 'lodash';

const handleTyping = throttle(() => {
  socket.emit('typing_start', data);
}, 1000);

// Debounce typing stop
import { debounce } from 'lodash';

const handleTypingStop = debounce(() => {
  socket.emit('typing_stop', data);
}, 2000);
```

### Security

```javascript
// Validate data before emitting
function sendMessage(message) {
  if (!message || message.trim().length === 0) {
    return;
  }
  
  if (message.length > 1000) {
    console.error('Message too long');
    return;
  }
  
  socket.emit('send_message', {
    roomName: currentRoom,
    message: sanitize(message),
    userProfile: currentUser
  });
}
```

---

## 📊 Event Flow Diagrams

### User Join Flow

```
Client                          Server
  |                               |
  |-- join_user_room ----------->|
  |                               |-- Store user data
  |                               |-- Join user room
  |<---------- user_joined -------|
  |<---------- online_users ------|
  |                               |-- Broadcast to all
  |<---------- online_users ------|
```

### Chat Message Flow

```
Client A                        Server                        Client B
  |                               |                               |
  |-- send_message -------------->|                               |
  |                               |-- Store message               |
  |                               |-- Broadcast to room           |
  |<---------- new_message -------|                               |
  |                               |---------- new_message -------->|
  |                               |                               |
  |                               |-- Generate AI response        |
  |<---------- new_message -------|                               |
  |                               |---------- new_message -------->|
```

---

## 🔗 Related Documentation

- [API Reference](./API_REFERENCE.md) - REST API documentation
- [API Server README](../services/api/README.md) - Server setup
- [Socket.io Documentation](https://socket.io/docs/) - Official docs

---

**Last Updated:** October 3, 2025  
**Socket.io Version:** 4.7.4
