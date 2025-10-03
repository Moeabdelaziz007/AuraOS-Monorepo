/**
 * AuraOS Notes App
 * AI-powered note-taking application
 */

export { NotesApp } from './components/NotesApp';
export { Sidebar } from './components/Sidebar';
export { NoteList } from './components/NoteList';
export { NoteEditor } from './components/NoteEditor';

export { NotesClient, initNotesClient, getNotesClient } from './lib/notes-client';

export type {
  Note,
  Folder,
  NoteSummary,
  RelatedNote,
  NoteEnhancement,
  ViewMode,
  SortBy,
} from './types';
