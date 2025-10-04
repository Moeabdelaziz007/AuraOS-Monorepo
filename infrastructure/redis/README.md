# AuraOS Redis Setup

## Redis Configuration

This directory contains Redis configuration for AuraOS queue management and caching.

## Setup Instructions

### Local Development

1. **Install Redis** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   ```

2. **Start Redis with custom config**:
   ```bash
   redis-server infrastructure/redis/redis.conf
   ```

3. **Verify Redis is running**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Production Setup

For production deployment, use managed Redis services:

- **AWS ElastiCache**: Redis 7.0+
- **Google Cloud Memorystore**: Redis 7.0+
- **Azure Cache for Redis**: Redis 7.0+
- **DigitalOcean Managed Redis**: Redis 7.0+
- **Redis Cloud**: Managed Redis service

### Environment Variables

Add to your `.env` file:

```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_DB=0
REDIS_TLS=false  # Set to true in production
```

## Use Cases

### 1. Queue Management (BullMQ)

Redis serves as the backend for job queues:

- **Research queries**: Telegram bot research processing
- **Program execution**: BASIC/6502 program execution jobs
- **Email notifications**: Async email sending
- **Data processing**: Background data processing tasks

```javascript
// Example queue configuration
const queueConfig = {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
};
```

### 2. Session Storage

Store user sessions with automatic expiration:

```javascript
// Session key pattern: session:{session_id}
// TTL: 24 hours (86400 seconds)
```

### 3. Caching

Cache frequently accessed data:

- User profiles
- Program metadata
- Research query results
- API responses

```javascript
// Cache key patterns:
// user:{user_id}
// program:{program_id}
// research:{query_hash}
```

### 4. Rate Limiting

Implement rate limiting for API endpoints:

```javascript
// Rate limit key pattern: ratelimit:{user_id}:{endpoint}
// Example: 100 requests per minute
```

### 5. Real-time Features

Support real-time features using Pub/Sub:

- Live program execution updates
- Chat notifications
- System alerts

## Key Patterns

### Queue Keys
```
bull:{queue_name}:id
bull:{queue_name}:wait
bull:{queue_name}:active
bull:{queue_name}:completed
bull:{queue_name}:failed
```

### Session Keys
```
session:{session_id}
```

### Cache Keys
```
cache:user:{user_id}
cache:program:{program_id}
cache:research:{query_hash}
```

### Rate Limit Keys
```
ratelimit:{user_id}:{endpoint}:{window}
```

## Performance Tuning

### Memory Management

- **maxmemory**: Set to 70-80% of available RAM
- **maxmemory-policy**: `allkeys-lru` for cache, `noeviction` for queues
- Monitor memory usage: `redis-cli info memory`

### Persistence

- **RDB**: Point-in-time snapshots (configured)
- **AOF**: Append-only file for durability (enabled)
- Trade-off: Performance vs. durability

### Connection Pooling

Use connection pooling in your application:

```javascript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});
```

## Monitoring

Monitor these metrics:

- **Memory usage**: `INFO memory`
- **Connected clients**: `INFO clients`
- **Operations per second**: `INFO stats`
- **Slow queries**: `SLOWLOG GET 10`
- **Key space**: `INFO keyspace`
- **Persistence**: `INFO persistence`

### Monitoring Commands

```bash
# Real-time monitoring
redis-cli --stat

# Monitor all commands
redis-cli MONITOR

# Check slow queries
redis-cli SLOWLOG GET 10

# Memory analysis
redis-cli --bigkeys

# Latency monitoring
redis-cli --latency
```

## Backup Strategy

1. **RDB snapshots**: Automatic (configured in redis.conf)
2. **AOF persistence**: Enabled for durability
3. **Manual backup**: `redis-cli BGSAVE`
4. **Backup files**: `dump.rdb` and `appendonly.aof`

## Security

### Production Security Checklist

- ✅ Enable `requirepass` authentication
- ✅ Use TLS/SSL encryption
- ✅ Bind to private network only
- ✅ Disable dangerous commands: `FLUSHALL`, `FLUSHDB`, `CONFIG`
- ✅ Use firewall rules to restrict access
- ✅ Regular security updates
- ✅ Monitor access logs

### Secure Configuration

```conf
# redis.conf (production)
requirepass your_very_strong_password_here
bind 10.0.0.1  # Private IP only
protected-mode yes
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

## Troubleshooting

### Common Issues

1. **Connection refused**
   ```bash
   # Check if Redis is running
   ps aux | grep redis
   
   # Check port
   netstat -an | grep 6379
   ```

2. **Out of memory**
   ```bash
   # Check memory usage
   redis-cli INFO memory
   
   # Increase maxmemory or enable eviction
   ```

3. **Slow performance**
   ```bash
   # Check slow queries
   redis-cli SLOWLOG GET 10
   
   # Monitor latency
   redis-cli --latency
   ```

4. **Persistence issues**
   ```bash
   # Check persistence status
   redis-cli INFO persistence
   
   # Check disk space
   df -h
   ```

## Development Tools

### Redis CLI

```bash
# Connect to Redis
redis-cli

# Connect with password
redis-cli -a your_password

# Execute command
redis-cli SET mykey "Hello"
redis-cli GET mykey

# Flush all data (development only!)
redis-cli FLUSHALL
```

### Redis GUI Tools

- **RedisInsight**: Official Redis GUI
- **Medis**: macOS Redis GUI
- **Redis Commander**: Web-based Redis management

## Integration Examples

### Node.js (ioredis)

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Set with expiration
await redis.set('key', 'value', 'EX', 3600);

// Get value
const value = await redis.get('key');
```

### BullMQ Queue

```javascript
const { Queue, Worker } = require('bullmq');

const researchQueue = new Queue('research', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

// Add job
await researchQueue.add('research-query', {
  query: 'What is quantum computing?',
  userId: 'user-123',
});

// Process jobs
const worker = new Worker('research', async (job) => {
  const { query, userId } = job.data;
  // Process research query
  return { result: 'Research completed' };
});
```

## Support

For issues or questions, refer to:
- Redis documentation: https://redis.io/documentation
- BullMQ documentation: https://docs.bullmq.io/
- AuraOS project documentation
