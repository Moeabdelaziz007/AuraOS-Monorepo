# AuraOS Database Setup

## PostgreSQL Schema

This directory contains the database schema for AuraOS production infrastructure.

## Setup Instructions

### Local Development

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql@15
   ```

2. **Start PostgreSQL service**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql@15
   ```

3. **Create database and user**:
   ```bash
   sudo -u postgres psql
   ```
   
   Then in PostgreSQL shell:
   ```sql
   CREATE DATABASE auraos_dev;
   CREATE USER auraos_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE auraos_dev TO auraos_user;
   \c auraos_dev
   GRANT ALL ON SCHEMA public TO auraos_user;
   \q
   ```

4. **Apply schema**:
   ```bash
   psql -U auraos_user -d auraos_dev -f infrastructure/database/schema.sql
   ```

### Production Setup

For production deployment, use managed PostgreSQL services:

- **AWS RDS**: PostgreSQL 15+
- **Google Cloud SQL**: PostgreSQL 15+
- **Azure Database**: PostgreSQL 15+
- **DigitalOcean Managed Databases**: PostgreSQL 15+

### Environment Variables

Add to your `.env` file:

```env
DATABASE_URL=postgresql://auraos_user:your_secure_password@localhost:5432/auraos_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=false  # Set to true in production
```

### Migrations

Future migrations will be managed using a migration tool (to be implemented in Sprint 2).

## Schema Overview

### Core Tables

- **users**: User accounts (Telegram and web)
- **sessions**: User session management
- **programs**: BASIC programs and 6502 assembly code
- **execution_logs**: Program execution history
- **research_queries**: Telegram bot research queries
- **queue_jobs**: Background job tracking
- **audit_logs**: Security and compliance audit trail

### Features

- UUID primary keys for distributed systems
- JSONB metadata columns for flexibility
- Comprehensive indexing for performance
- Automatic timestamp updates
- Materialized views for common queries
- Foreign key constraints for data integrity

## Backup Strategy

1. **Daily automated backups** (production)
2. **Point-in-time recovery** enabled
3. **Backup retention**: 30 days
4. **Test restore procedures** monthly

## Security

- Use strong passwords (minimum 16 characters)
- Enable SSL/TLS in production
- Restrict network access (firewall rules)
- Regular security updates
- Audit log monitoring
- Encrypted backups

## Performance Tuning

Key PostgreSQL settings for production:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

## Monitoring

Monitor these metrics:

- Connection count
- Query performance (slow query log)
- Cache hit ratio
- Index usage
- Table bloat
- Replication lag (if applicable)

## Support

For issues or questions, refer to:
- PostgreSQL documentation: https://www.postgresql.org/docs/
- AuraOS project documentation
