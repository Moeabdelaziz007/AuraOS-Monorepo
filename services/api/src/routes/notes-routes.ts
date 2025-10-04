/**
 * Notes Routes
 * Defines all routes for notes endpoints
 */

import { Router } from 'express';
import { notesController } from '../controllers/notes-controller';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import {
  createNoteSchema,
  getNoteSchema,
  getNotesSchema,
  updateNoteSchema,
  deleteNoteSchema,
  searchNotesSchema,
  bulkDeleteNotesSchema,
} from '../validators/note-validators';

const router = Router();

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private
 */
router.post(
  '/',
  validate(createNoteSchema),
  asyncHandler(notesController.createNote.bind(notesController))
);

/**
 * @route   GET /api/notes/search
 * @desc    Search notes using full-text search
 * @access  Private
 */
router.get(
  '/search',
  validate(searchNotesSchema),
  asyncHandler(notesController.searchNotes.bind(notesController))
);

/**
 * @route   GET /api/notes/stats
 * @desc    Get notes statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(notesController.getNotesStats.bind(notesController))
);

/**
 * @route   POST /api/notes/bulk-delete
 * @desc    Bulk delete notes
 * @access  Private
 */
router.post(
  '/bulk-delete',
  validate(bulkDeleteNotesSchema),
  asyncHandler(notesController.bulkDeleteNotes.bind(notesController))
);

/**
 * @route   GET /api/notes/:id
 * @desc    Get a note by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getNoteSchema),
  asyncHandler(notesController.getNoteById.bind(notesController))
);

/**
 * @route   GET /api/notes
 * @desc    Get all notes for a user
 * @access  Private
 */
router.get(
  '/',
  validate(getNotesSchema),
  asyncHandler(notesController.getAllNotes.bind(notesController))
);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateNoteSchema),
  asyncHandler(notesController.updateNote.bind(notesController))
);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteNoteSchema),
  asyncHandler(notesController.deleteNote.bind(notesController))
);

export default router;
