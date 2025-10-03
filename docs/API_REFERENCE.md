# AuraOS API Reference

Complete REST API documentation for AuraOS backend services.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Health & Config](#health--config)
- [Apps API](#apps-api)
- [System API](#system-api)
- [Chat API](#chat-api)
- [Response Codes](#response-codes)

## 🌐 Base URL

```
Development: http://localhost:5000
Production:  https://your-domain.com
```

All API endpoints are prefixed with `/api`.

## 🔐 Authentication

Currently, the API uses Firebase Authentication. Include the Firebase ID token in requests:

```http
Authorization: Bearer <firebase_id_token>
```

### Getting a Token

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const token = await auth.currentUser.getIdToken();
```

## ❌ Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server issue |

## ⏱️ Rate Limiting

Currently no rate limiting is implemented. Recommended limits for production:

- **General endpoints**: 100 requests/minute
- **Write operations**: 30 requests/minute
- **System endpoints**: 10 requests/minute

---

## 🏥 Health & Config

### Health Check

Check if the API server is running.

**Endpoint:** `GET /api/health`

**Authentication:** Not required

**Response:**

```json
{
  "status": "OK",
  "message": "AIOS Server is running",
  "timestamp": "2025-10-03T13:00:00.000Z"
}
```

**Example:**

```bash
curl http://localhost:5000/api/health
```

```javascript
const response = await fetch('http://localhost:5000/api/health');
const data = await response.json();
console.log(data.status); // "OK"
```

---

### Get Configuration

Get public configuration values.

**Endpoint:** `GET /api/config`

**Authentication:** Not required

**Response:**

```json
{
  "projectId": "your-firebase-project",
  "apiUrl": "http://localhost:5000",
  "wsUrl": "ws://localhost:5000"
}
```

**Example:**

```bash
curl http://localhost:5000/api/config
```

```javascript
const response = await fetch('http://localhost:5000/api/config');
const config = await response.json();
console.log(config.projectId);
```

---

## 📱 Apps API

Manage applications in the AuraOS system.

### List All Apps

Get all applications, ordered by creation date (newest first).

**Endpoint:** `GET /api/apps`

**Authentication:** Optional

**Query Parameters:** None

**Response:**

```json
{
  "apps": [
    {
      "id": "app_123",
      "name": "My App",
      "description": "App description",
      "category": "general",
      "config": {},
      "status": "active",
      "createdAt": "2025-10-03T10:00:00.000Z",
      "updatedAt": "2025-10-03T12:00:00.000Z"
    }
  ]
}
```

**Example:**

```bash
curl http://localhost:5000/api/apps
```

```javascript
const response = await fetch('http://localhost:5000/api/apps');
const { apps } = await response.json();
console.log(`Found ${apps.length} apps`);
```

---

### Get Single App

Get details of a specific application.

**Endpoint:** `GET /api/apps/:id`

**Authentication:** Optional

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | App ID |

**Response:**

```json
{
  "id": "app_123",
  "name": "My App",
  "description": "App description",
  "category": "general",
  "config": {
    "setting1": "value1"
  },
  "status": "active",
  "createdAt": "2025-10-03T10:00:00.000Z",
  "updatedAt": "2025-10-03T12:00:00.000Z"
}
```

**Error Responses:**

- `404` - App not found

**Example:**

```bash
curl http://localhost:5000/api/apps/app_123
```

```javascript
const response = await fetch('http://localhost:5000/api/apps/app_123');
if (response.ok) {
  const app = await response.json();
  console.log(app.name);
} else {
  console.error('App not found');
}
```

---

### Create App

Create a new application.

**Endpoint:** `POST /api/apps`

**Authentication:** Required (future)

**Request Body:**

```json
{
  "name": "My New App",
  "description": "App description",
  "category": "general",
  "config": {
    "setting1": "value1"
  }
}
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | App name |
| `description` | string | Yes | App description |
| `category` | string | No | App category (default: "general") |
| `config` | object | No | App configuration (default: {}) |

**Response:**

```json
{
  "id": "app_456",
  "name": "My New App",
  "description": "App description",
  "category": "general",
  "config": {
    "setting1": "value1"
  },
  "status": "inactive",
  "createdAt": "2025-10-03T13:00:00.000Z",
  "updatedAt": "2025-10-03T13:00:00.000Z"
}
```

**Status Code:** `201 Created`

**Error Responses:**

- `400` - Name and description are required

**Example:**

```bash
curl -X POST http://localhost:5000/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New App",
    "description": "This is a test app",
    "category": "automation"
  }'
```

```javascript
const response = await fetch('http://localhost:5000/api/apps', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My New App',
    description: 'This is a test app',
    category: 'automation'
  })
});

const newApp = await response.json();
console.log(`Created app with ID: ${newApp.id}`);
```

---

### Update App

Update an existing application.

**Endpoint:** `PUT /api/apps/:id`

**Authentication:** Required (future)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | App ID |

**Request Body:**

```json
{
  "name": "Updated App Name",
  "description": "Updated description",
  "status": "active",
  "config": {
    "setting1": "new_value"
  }
}
```

**Body Parameters:**

All parameters are optional. Only include fields you want to update.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | App name |
| `description` | string | App description |
| `category` | string | App category |
| `status` | string | App status ("active" or "inactive") |
| `config` | object | App configuration |

**Response:**

```json
{
  "id": "app_123",
  "name": "Updated App Name",
  "description": "Updated description",
  "status": "active",
  "updatedAt": "2025-10-03T14:00:00.000Z"
}
```

**Example:**

```bash
curl -X PUT http://localhost:5000/api/apps/app_123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "config": {"enabled": true}
  }'
```

```javascript
const response = await fetch('http://localhost:5000/api/apps/app_123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'active',
    config: { enabled: true }
  })
});

const updatedApp = await response.json();
console.log(`Updated app: ${updatedApp.name}`);
```

---

### Delete App

Delete an application.

**Endpoint:** `DELETE /api/apps/:id`

**Authentication:** Required (future)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | App ID |

**Response:**

```json
{
  "message": "App deleted successfully"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:5000/api/apps/app_123
```

```javascript
const response = await fetch('http://localhost:5000/api/apps/app_123', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result.message); // "App deleted successfully"
```

---

## 🖥️ System API

Monitor and manage system status and logs.

### Get System Status

Get current system status and statistics.

**Endpoint:** `GET /api/system/status`

**Authentication:** Optional

**Response:**

```json
{
  "status": "online",
  "totalApps": 15,
  "activeApps": 10,
  "inactiveApps": 5,
  "timestamp": "2025-10-03T13:00:00.000Z"
}
```

**Example:**

```bash
curl http://localhost:5000/api/system/status
```

```javascript
const response = await fetch('http://localhost:5000/api/system/status');
const status = await response.json();
console.log(`System is ${status.status}`);
console.log(`Active apps: ${status.activeApps}/${status.totalApps}`);
```

---

### Get System Logs

Get system logs, ordered by timestamp (newest first).

**Endpoint:** `GET /api/system/logs`

**Authentication:** Required (future)

**Response:**

```json
{
  "logs": [
    {
      "id": "log_123",
      "level": "info",
      "message": "System started successfully",
      "metadata": {
        "source": "server",
        "version": "1.0.0"
      },
      "timestamp": "2025-10-03T13:00:00.000Z"
    }
  ]
}
```

**Log Levels:**

- `info` - Informational messages
- `warn` - Warning messages
- `error` - Error messages
- `debug` - Debug messages

**Example:**

```bash
curl http://localhost:5000/api/system/logs
```

```javascript
const response = await fetch('http://localhost:5000/api/system/logs');
const { logs } = await response.json();
logs.forEach(log => {
  console.log(`[${log.level}] ${log.message}`);
});
```

---

### Create System Log

Create a new system log entry.

**Endpoint:** `POST /api/system/logs`

**Authentication:** Required (future)

**Request Body:**

```json
{
  "level": "info",
  "message": "User action completed",
  "metadata": {
    "userId": "user_123",
    "action": "create_app"
  }
}
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `level` | string | Yes | Log level (info, warn, error, debug) |
| `message` | string | Yes | Log message |
| `metadata` | object | No | Additional log data |

**Response:**

```json
{
  "id": "log_456",
  "level": "info",
  "message": "User action completed",
  "metadata": {
    "userId": "user_123",
    "action": "create_app"
  },
  "timestamp": "2025-10-03T13:00:00.000Z"
}
```

**Status Code:** `201 Created`

**Error Responses:**

- `400` - Level and message are required

**Example:**

```bash
curl -X POST http://localhost:5000/api/system/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "User logged in",
    "metadata": {"userId": "user_123"}
  }'
```

```javascript
const response = await fetch('http://localhost:5000/api/system/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    level: 'info',
    message: 'User logged in',
    metadata: { userId: 'user_123' }
  })
});

const log = await response.json();
console.log(`Log created with ID: ${log.id}`);
```

---

## 💬 Chat API

Manage chat rooms and messages.

### List Chat Rooms

Get all active chat rooms.

**Endpoint:** `GET /api/chat/rooms`

**Authentication:** Optional

**Response:**

```json
{
  "rooms": [
    {
      "name": "general_chat",
      "userCount": 5,
      "messageCount": 42,
      "createdAt": "2025-10-03T10:00:00.000Z",
      "lastActivity": "2025-10-03T13:00:00.000Z"
    }
  ]
}
```

**Example:**

```bash
curl http://localhost:5000/api/chat/rooms
```

```javascript
const response = await fetch('http://localhost:5000/api/chat/rooms');
const { rooms } = await response.json();
rooms.forEach(room => {
  console.log(`${room.name}: ${room.userCount} users, ${room.messageCount} messages`);
});
```

---

### Get Chat History

Get message history for a specific chat room.

**Endpoint:** `GET /api/chat/rooms/:roomName/history`

**Authentication:** Optional

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roomName` | string | Chat room name |

**Response:**

```json
{
  "messages": [
    {
      "id": "msg_123",
      "roomName": "general_chat",
      "userId": "user_123",
      "userName": "John Doe",
      "userAvatar": "https://example.com/avatar.jpg",
      "message": "Hello everyone!",
      "messageType": "text",
      "timestamp": "2025-10-03T13:00:00.000Z",
      "isAI": false
    }
  ]
}
```

**Message Types:**

- `text` - Regular text message
- `ai_response` - AI assistant response
- `system` - System message

**Error Responses:**

- `404` - Chat room not found

**Example:**

```bash
curl http://localhost:5000/api/chat/rooms/general_chat/history
```

```javascript
const response = await fetch('http://localhost:5000/api/chat/rooms/general_chat/history');
const { messages } = await response.json();
messages.forEach(msg => {
  console.log(`${msg.userName}: ${msg.message}`);
});
```

---

### Create Chat Room

Create a new chat room.

**Endpoint:** `POST /api/chat/rooms`

**Authentication:** Required (future)

**Request Body:**

```json
{
  "name": "my_custom_room",
  "description": "A custom chat room",
  "isPrivate": false
}
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Room name (alphanumeric + underscore) |
| `description` | string | No | Room description |
| `isPrivate` | boolean | No | Private room flag (default: false) |

**Response:**

```json
{
  "name": "my_custom_room",
  "description": "A custom chat room",
  "isPrivate": false,
  "createdAt": "2025-10-03T13:00:00.000Z"
}
```

**Status Code:** `201 Created`

**Error Responses:**

- `400` - Room name is required
- `409` - Room already exists

**Example:**

```bash
curl -X POST http://localhost:5000/api/chat/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my_custom_room",
    "description": "A custom chat room"
  }'
```

```javascript
const response = await fetch('http://localhost:5000/api/chat/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'my_custom_room',
    description: 'A custom chat room'
  })
});

const room = await response.json();
console.log(`Created room: ${room.name}`);
```

---

## 📊 Response Codes

### Success Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |

### Client Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |

### Server Error Codes

| Code | Description |
|------|-------------|
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - Upstream server error |
| 503 | Service Unavailable - Server temporarily unavailable |
| 504 | Gateway Timeout - Upstream server timeout |

---

## 🔗 Related Documentation

- [Socket.io Events](./SOCKET_IO_EVENTS.md) - Real-time event documentation
- [API Server README](../services/api/README.md) - Server setup and configuration
- [Authentication Guide](./FIREBASE_AUTH_GUIDE.md) - Firebase authentication setup

---

## 📝 Notes

### Future Enhancements

- [ ] Add authentication to all endpoints
- [ ] Implement rate limiting
- [ ] Add pagination to list endpoints
- [ ] Add filtering and sorting options
- [ ] Add webhook support
- [ ] Add GraphQL API
- [ ] Add API versioning

### Best Practices

1. **Always handle errors** - Check response status codes
2. **Use HTTPS in production** - Never send tokens over HTTP
3. **Cache responses** - Reduce API calls where possible
4. **Implement retry logic** - Handle temporary failures
5. **Monitor rate limits** - Track your API usage

---

**Last Updated:** October 3, 2025  
**API Version:** 1.0.0
