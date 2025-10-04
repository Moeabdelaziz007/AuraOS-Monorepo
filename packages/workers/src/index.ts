/**
 * Workers Package Entry Point
 * Exports all queue utilities and workers
 */

export { createRedisConnection, redisConnection } from './redis-connection';
export { NoteProcessingQueue, noteProcessingQueue } from './queues/note-processing-queue';
export type { NoteProcessingJobData, NoteProcessingResult } from './queues/note-processing-queue';
