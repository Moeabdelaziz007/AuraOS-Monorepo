/**
 * Note Processing Queue
 * Handles background processing for note-related tasks
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { redisConnection } from '../redis-connection';

export interface NoteProcessingJobData {
  noteId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface NoteProcessingResult {
  success: boolean;
  noteId: string;
  processedAt: Date;
  message?: string;
  error?: string;
}

const QUEUE_NAME = 'note-processing';

export class NoteProcessingQueue {
  private queue: Queue<NoteProcessingJobData, NoteProcessingResult>;
  private worker: Worker<NoteProcessingJobData, NoteProcessingResult> | null = null;
  private queueEvents: QueueEvents;

  constructor() {
    this.queue = new Queue<NoteProcessingJobData, NoteProcessingResult>(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          count: 100,
          age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
          count: 1000,
          age: 7 * 24 * 3600, // 7 days
        },
      },
    });

    this.queueEvents = new QueueEvents(QUEUE_NAME, {
      connection: redisConnection,
    });

    this.setupEventListeners();
  }

  /**
   * Add a note processing job to the queue
   */
  async addJob(
    data: NoteProcessingJobData,
    options?: {
      priority?: number;
      delay?: number;
      jobId?: string;
    }
  ): Promise<Job<NoteProcessingJobData, NoteProcessingResult>> {
    return this.queue.add('process-note', data, {
      priority: options?.priority,
      delay: options?.delay,
      jobId: options?.jobId,
    });
  }

  /**
   * Start the worker to process jobs
   */
  startWorker(
    processor?: (job: Job<NoteProcessingJobData>) => Promise<NoteProcessingResult>
  ): void {
    if (this.worker) {
      console.warn('Worker already started');
      return;
    }

    const defaultProcessor = async (
      job: Job<NoteProcessingJobData>
    ): Promise<NoteProcessingResult> => {
      console.log(`Processing note job: ${job.id}`, job.data);

      try {
        const { noteId, userId, action, metadata } = job.data;

        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log(`Note ${action}: ${noteId} for user ${userId}`);

        if (metadata) {
          console.log('Metadata:', metadata);
        }

        return {
          success: true,
          noteId,
          processedAt: new Date(),
          message: `Note ${action} processed successfully`,
        };
      } catch (error: any) {
        console.error('Error processing note job:', error);
        return {
          success: false,
          noteId: job.data.noteId,
          processedAt: new Date(),
          error: error.message,
        };
      }
    };

    this.worker = new Worker<NoteProcessingJobData, NoteProcessingResult>(
      QUEUE_NAME,
      processor || defaultProcessor,
      {
        connection: redisConnection,
        concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
      }
    );

    this.worker.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed:`, error.message);
    });

    this.worker.on('error', (error) => {
      console.error('Worker error:', error);
    });

    console.log('Note processing worker started');
  }

  /**
   * Stop the worker
   */
  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
      console.log('Note processing worker stopped');
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job<NoteProcessingJobData, NoteProcessingResult> | undefined> {
    return this.queue.getJob(jobId);
  }

  /**
   * Remove job by ID
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  /**
   * Clean old jobs
   */
  async cleanJobs(grace: number = 24 * 3600 * 1000): Promise<void> {
    await this.queue.clean(grace, 100, 'completed');
    await this.queue.clean(grace * 7, 1000, 'failed');
  }

  /**
   * Pause the queue
   */
  async pause(): Promise<void> {
    await this.queue.pause();
    console.log('Queue paused');
  }

  /**
   * Resume the queue
   */
  async resume(): Promise<void> {
    await this.queue.resume();
    console.log('Queue resumed');
  }

  /**
   * Close queue and cleanup
   */
  async close(): Promise<void> {
    await this.stopWorker();
    await this.queueEvents.close();
    await this.queue.close();
    console.log('Queue closed');
  }

  private setupEventListeners(): void {
    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completed with result:`, returnvalue);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`Job ${jobId} failed:`, failedReason);
    });

    this.queueEvents.on('progress', ({ jobId, data }) => {
      console.log(`Job ${jobId} progress:`, data);
    });
  }
}

export const noteProcessingQueue = new NoteProcessingQueue();
