# AuraOS API Server

Backend API server for AuraOS with REST endpoints and real-time Socket.io communication.

## 🚀 Features

- **REST API** - Full CRUD operations for apps, system logs, and chat
- **Real-time Communication** - Socket.io for live updates and chat
- **Firebase Integration** - Firestore database and authentication
- **User Presence** - Track online users and their status
- **Live Chat System** - Multi-room chat with AI assistant
- **System Monitoring** - Real-time system status updates
- **CORS Enabled** - Cross-origin resource sharing configured

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Socket.io Events](#socketio-events)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🔧 Installation

```bash
# Navigate to API directory
cd services/api

# Install dependencies
npm install
# or
pnpm install
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `services/api` directory:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API URLs (optional)
AIOS_API_URL=http://localhost:5000
AIOS_WS_URL=ws://localhost:5000
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `CLIENT_URL` | Frontend URL for CORS | No |
| `FIREBASE_API_KEY` | Firebase API key | Yes |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `FIREBASE_APP_ID` | Firebase app ID | Yes |

## 🏃 Running the Server

### Development Mode

```bash
# With auto-reload on file changes
npm run dev
```

### Production Mode

```bash
# Start server
npm start
```

### Using Docker

```bash
# Build image
docker build -t auraos-api .

# Run container
docker run -p 5000:5000 --env-file .env auraos-api
```

## 🏗️ Architecture

### Technology Stack

- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **Firebase** - Backend-as-a-Service (Firestore + Auth)
- **Node.js** - Runtime environment

### Project Structure

```
services/api/
├── src/
│   └── index.js          # Main server file
├── tests/
│   └── api.test.js       # API tests
├── .env                  # Environment variables (gitignored)
├── .env.example          # Example environment file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Server Components

1. **Express Server** - HTTP server for REST API
2. **Socket.io Server** - WebSocket server for real-time features
3. **Firebase Client** - Database and authentication
4. **In-Memory Stores** - User sessions, chat rooms, presence

### Data Flow

```
Client → REST API → Firebase Firestore → Response
Client ↔ Socket.io ↔ Server State ↔ Broadcast to Clients
```

## 📚 API Documentation

See [API_REFERENCE.md](../../docs/API_REFERENCE.md) for complete REST API documentation.

### Quick Reference

#### Health Check
```bash
GET /api/health
```

#### Apps Management
```bash
GET    /api/apps           # List all apps
GET    /api/apps/:id       # Get single app
POST   /api/apps           # Create app
PUT    /api/apps/:id       # Update app
DELETE /api/apps/:id       # Delete app
```

#### System
```bash
GET  /api/system/status    # System status
GET  /api/system/logs      # System logs
POST /api/system/logs      # Create log
```

#### Chat
```bash
GET  /api/chat/rooms                      # List chat rooms
GET  /api/chat/rooms/:roomName/history    # Chat history
POST /api/chat/rooms                      # Create room
```

## 🔌 Socket.io Events

See [SOCKET_IO_EVENTS.md](../../docs/SOCKET_IO_EVENTS.md) for complete Socket.io documentation.

### Quick Reference

#### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join_user_room` | Join user-specific room | `{ userId, userProfile }` |
| `join_chat_room` | Join chat room | `{ roomName, userProfile }` |
| `send_message` | Send chat message | `{ roomName, message, userProfile }` |
| `typing_start` | User started typing | `{ roomName, userProfile }` |
| `typing_stop` | User stopped typing | `{ roomName, userProfile }` |

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `online_users` | List of online users | `Array<User>` |
| `new_message` | New chat message | `Message` |
| `system_status_update` | System status | `SystemStatus` |
| `notification` | User notification | `Notification` |

## 💻 Development

### Code Style

- Use ES6+ features
- Follow Express.js best practices
- Handle errors gracefully
- Log important events

### Adding New Endpoints

1. Define route in `src/index.js`
2. Add validation
3. Implement business logic
4. Handle errors
5. Add tests
6. Update documentation

Example:

```javascript
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation
    if (!id) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Business logic
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Response
    res.json({ id: userSnap.id, ...userSnap.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Adding New Socket.io Events

1. Define event handler in `io.on('connection', ...)`
2. Validate payload
3. Update server state
4. Emit response/broadcast
5. Add tests
6. Update documentation

Example:

```javascript
socket.on('custom_event', (data) => {
  // Validate
  if (!data.required_field) {
    socket.emit('error', { message: 'Missing required field' });
    return;
  }
  
  // Process
  const result = processData(data);
  
  // Respond
  socket.emit('custom_event_response', result);
  
  // Or broadcast
  io.emit('custom_event_broadcast', result);
});
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Structure

```javascript
describe('API Endpoint', () => {
  test('should return expected result', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### Testing Socket.io

```javascript
const io = require('socket.io-client');

test('should handle socket event', (done) => {
  const socket = io('http://localhost:5000');
  
  socket.on('connect', () => {
    socket.emit('test_event', { data: 'test' });
  });
  
  socket.on('test_response', (data) => {
    expect(data).toBeDefined();
    socket.disconnect();
    done();
  });
});
```

## 🚀 Deployment

### Production Checklist

- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Enable compression
- [ ] Set up health checks
- [ ] Configure auto-scaling

### Environment-Specific Configuration

```javascript
const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
  origin: isProduction 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
```

### Deployment Platforms

#### Heroku

```bash
# Login
heroku login

# Create app
heroku create auraos-api

# Set environment variables
heroku config:set FIREBASE_API_KEY=your_key

# Deploy
git push heroku main
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "AIOS Server is running",
  "timestamp": "2025-10-03T13:00:00.000Z"
}
```

### Logs

Server logs include:
- Connection events
- API requests
- Errors and warnings
- System status updates

### Metrics to Monitor

- Request rate
- Response time
- Error rate
- Active connections
- Memory usage
- CPU usage

## 🔒 Security

### Best Practices

1. **Environment Variables** - Never commit secrets
2. **Input Validation** - Validate all user input
3. **Authentication** - Verify Firebase tokens
4. **Authorization** - Check user permissions
5. **Rate Limiting** - Prevent abuse
6. **CORS** - Configure allowed origins
7. **HTTPS** - Use SSL in production

### Adding Authentication Middleware

```javascript
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use in routes
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ user: req.user });
});
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### Firebase Connection Error

- Verify environment variables
- Check Firebase project settings
- Ensure Firestore is enabled
- Verify network connectivity

#### Socket.io Connection Failed

- Check CORS configuration
- Verify client URL
- Check firewall settings
- Ensure WebSocket support

#### Memory Leaks

- Monitor connected users
- Clear old chat messages
- Implement connection timeouts
- Use memory profiling tools

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [API Reference](../../docs/API_REFERENCE.md)
- [Socket.io Events](../../docs/SOCKET_IO_EVENTS.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Made with ❤️ for AuraOS**
