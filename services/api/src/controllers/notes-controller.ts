/**
 * Notes Controller
 * Handles HTTP requests for notes endpoints
 */

import { Request, Response } from 'express';
import { notesRepository } from '@auraos/database';
import { noteProcessingQueue } from '@auraos/workers';

export class NotesController {
  /**
   * Create a new note
   * POST /api/notes
   */
  async createNote(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { title, content, tags, is_pinned, color, metadata } = req.body;

    const note = await notesRepository.createNote({
      user_id: userId,
      title,
      content,
      tags,
      is_pinned,
      color,
      metadata,
    });

    await noteProcessingQueue.addJob({
      noteId: note.id,
      userId: note.user_id,
      action: 'created',
      timestamp: new Date(),
      metadata: { title: note.title },
    });

    res.status(201).json({
      status: 201,
      message: 'Note created successfully',
      data: note,
    });
  }

  /**
   * Get a note by ID
   * GET /api/notes/:id
   */
  async getNoteById(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { id } = req.params;

    const note = await notesRepository.getNoteById(id, userId);

    res.status(200).json({
      status: 200,
      message: 'Note retrieved successfully',
      data: note,
    });
  }

  /**
   * Get all notes for a user
   * GET /api/notes
   */
  async getAllNotes(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { limit, offset, include_archived, pinned_only, tags } = req.query as any;

    const notes = await notesRepository.getAllNotes({
      user_id: userId,
      limit,
      offset,
      include_archived,
      pinned_only,
      tags,
    });

    const total = await notesRepository.getNotesCount(userId, include_archived);

    res.status(200).json({
      status: 200,
      message: 'Notes retrieved successfully',
      data: notes,
      pagination: {
        total,
        limit: limit || 50,
        offset: offset || 0,
        has_more: (offset || 0) + notes.length < total,
      },
    });
  }

  /**
   * Update a note
   * PUT /api/notes/:id
   */
  async updateNote(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    const note = await notesRepository.updateNote(id, userId, updateData);

    await noteProcessingQueue.addJob({
      noteId: note.id,
      userId: note.user_id,
      action: 'updated',
      timestamp: new Date(),
      metadata: { fields: Object.keys(updateData) },
    });

    res.status(200).json({
      status: 200,
      message: 'Note updated successfully',
      data: note,
    });
  }

  /**
   * Delete a note
   * DELETE /api/notes/:id
   */
  async deleteNote(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { id } = req.params;

    await notesRepository.deleteNote(id, userId);

    await noteProcessingQueue.addJob({
      noteId: id,
      userId,
      action: 'deleted',
      timestamp: new Date(),
    });

    res.status(200).json({
      status: 200,
      message: 'Note deleted successfully',
    });
  }

  /**
   * Search notes
   * GET /api/notes/search
   */
  async searchNotes(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { q, limit, offset, include_archived } = req.query as any;

    const results = await notesRepository.searchNotes({
      user_id: userId,
      query: q,
      limit,
      offset,
      include_archived,
    });

    res.status(200).json({
      status: 200,
      message: 'Search completed successfully',
      data: results,
      pagination: {
        limit: limit || 20,
        offset: offset || 0,
        count: results.length,
      },
    });
  }

  /**
   * Bulk delete notes
   * POST /api/notes/bulk-delete
   */
  async bulkDeleteNotes(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { ids } = req.body;

    const deletedCount = await notesRepository.bulkDeleteNotes(ids, userId);

    res.status(200).json({
      status: 200,
      message: `${deletedCount} note(s) deleted successfully`,
      data: { deleted_count: deletedCount },
    });
  }

  /**
   * Get notes statistics
   * GET /api/notes/stats
   */
  async getNotesStats(req: Request, res: Response): Promise<void> {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        status: 401,
        message: 'User ID is required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const [totalNotes, activeNotes] = await Promise.all([
      notesRepository.getNotesCount(userId, true),
      notesRepository.getNotesCount(userId, false),
    ]);

    res.status(200).json({
      status: 200,
      message: 'Statistics retrieved successfully',
      data: {
        total: totalNotes,
        active: activeNotes,
        archived: totalNotes - activeNotes,
      },
    });
  }
}

export const notesController = new NotesController();
