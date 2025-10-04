/**
 * AuraOS API Server
 * Main entry point for the REST API
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import * as dotenv from 'dotenv';

import notesRoutes from './routes/notes-routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { db } from '@auraos/database';
import { noteProcessingQueue } from '@auraos/workers';

dotenv.config();

const app: Application = express();
const PORT = process.env.API_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbHealthy = await db.healthCheck();
  const queueStats = await noteProcessingQueue.getStats();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'up' : 'down',
      queue: {
        waiting: queueStats.waiting,
        active: queueStats.active,
        completed: queueStats.completed,
        failed: queueStats.failed,
      },
    },
  });
});

// API routes
app.use('/api/notes', notesRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 AuraOS API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
    
    // Start queue worker
    noteProcessingQueue.startWorker();
    console.log('✅ Queue worker started');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await noteProcessingQueue.close();
    await db.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await noteProcessingQueue.close();
    await db.close();
    process.exit(0);
  });
}

export default app;
