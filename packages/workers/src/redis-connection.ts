/**
 * Redis Connection Configuration
 * Manages Redis connection for BullMQ queues
 */

import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  retryStrategy?: (times: number) => number | void;
}

export function createRedisConnection(config?: Partial<RedisConfig>): Redis {
  const defaultConfig: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  const redis = new Redis(finalConfig);

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('Redis ready to accept commands');
  });

  redis.on('close', () => {
    console.log('Redis connection closed');
  });

  return redis;
}

export const redisConnection = createRedisConnection();
