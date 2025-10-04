/**
 * Note Validators
 * Zod schemas for request validation
 */

import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(500, 'Title cannot exceed 500 characters')
      .trim(),
    content: z
      .string()
      .min(1, 'Content is required')
      .trim(),
    tags: z
      .array(z.string().trim())
      .optional()
      .default([]),
    is_pinned: z
      .boolean()
      .optional()
      .default(false),
    color: z
      .string()
      .optional()
      .default('default'),
    metadata: z
      .record(z.any())
      .optional()
      .default({}),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(500, 'Title cannot exceed 500 characters')
      .trim()
      .optional(),
    content: z
      .string()
      .min(1, 'Content cannot be empty')
      .trim()
      .optional(),
    tags: z
      .array(z.string().trim())
      .optional(),
    is_pinned: z
      .boolean()
      .optional(),
    is_archived: z
      .boolean()
      .optional(),
    color: z
      .string()
      .optional(),
    metadata: z
      .record(z.any())
      .optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export const getNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
});

export const deleteNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
});

export const getNotesSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine((val) => val > 0 && val <= 100, {
        message: 'Limit must be between 1 and 100',
      }),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 0))
      .refine((val) => val >= 0, {
        message: 'Offset must be non-negative',
      }),
    include_archived: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    pinned_only: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    tags: z
      .string()
      .optional()
      .transform((val) => (val ? val.split(',').map((t) => t.trim()) : undefined)),
  }),
});

export const searchNotesSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, 'Search query is required')
      .trim(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine((val) => val > 0 && val <= 100, {
        message: 'Limit must be between 1 and 100',
      }),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 0))
      .refine((val) => val >= 0, {
        message: 'Offset must be non-negative',
      }),
    include_archived: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});

export const bulkDeleteNotesSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().uuid('Invalid note ID'))
      .min(1, 'At least one note ID is required')
      .max(100, 'Cannot delete more than 100 notes at once'),
  }),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>['body'];
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>['body'];
export type GetNotesQuery = z.infer<typeof getNotesSchema>['query'];
export type SearchNotesQuery = z.infer<typeof searchNotesSchema>['query'];
export type BulkDeleteInput = z.infer<typeof bulkDeleteNotesSchema>['body'];
