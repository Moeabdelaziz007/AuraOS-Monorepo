# AuraOS Infrastructure

## Overview

This directory contains infrastructure configuration for the AuraOS production environment, implementing the 7-layer architecture:

1. **Layer 1**: User Interface (Web/Telegram)
2. **Layer 2**: API Gateway
3. **Layer 3**: Business Logic Services
4. **Layer 4**: Queue Management (Redis)
5. **Layer 5**: Database (PostgreSQL)
6. **Layer 6**: File Storage
7. **Layer 7**: Monitoring & Logging

## Quick Start

### Using Docker Compose (Recommended for Development)

Start all infrastructure services:

```bash
cd infrastructure
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- pgAdmin (port 5050)
- RedisInsight (port 8001)

### Manual Setup

See individual README files:
- [Database Setup](./database/README.md)
- [Redis Setup](./redis/README.md)

## Services

### PostgreSQL Database

- **Port**: 5432
- **Database**: auraos_dev
- **User**: auraos_user
- **Management UI**: http://localhost:5050 (pgAdmin)

### Redis Cache & Queue

- **Port**: 6379
- **Management UI**: http://localhost:8001 (RedisInsight)

## Environment Configuration

1. Copy environment examples:
   ```bash
   cp database/.env.example ../.env
   cat redis/.env.example >> ../.env
   ```

2. Update passwords and configuration in `.env`

3. Source environment variables:
   ```bash
   source .env
   ```

## Health Checks

Check service health:

```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U auraos_user

# Redis
docker-compose exec redis redis-cli ping
```

## Backup & Restore

### PostgreSQL Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U auraos_user auraos_dev > backup.sql

# Restore
docker-compose exec -T postgres psql -U auraos_user auraos_dev < backup.sql
```

### Redis Backup

```bash
# Trigger save
docker-compose exec redis redis-cli BGSAVE

# Copy RDB file
docker cp auraos-redis:/data/dump.rdb ./redis-backup.rdb
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Resource Usage

```bash
docker-compose stats
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Production Deployment

For production, use managed services:

### Database
- AWS RDS PostgreSQL
- Google Cloud SQL
- Azure Database for PostgreSQL
- DigitalOcean Managed Databases

### Cache & Queue
- AWS ElastiCache Redis
- Google Cloud Memorystore
- Azure Cache for Redis
- Redis Cloud

### Configuration Management
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Enable SSL/TLS for all connections
- Implement proper backup strategies
- Set up monitoring and alerting

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS in production
- [ ] Restrict network access (firewall rules)
- [ ] Use secrets management
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Implement backup strategy
- [ ] Set up monitoring and alerts

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5432
lsof -i :6379

# Kill process or change port in docker-compose.yml
```

### Permission Denied

```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./data
```

### Connection Refused

```bash
# Check if services are running
docker-compose ps

# Restart services
docker-compose restart
```

## Support

For issues or questions:
- Check service-specific README files
- Review Docker Compose logs
- Consult official documentation
