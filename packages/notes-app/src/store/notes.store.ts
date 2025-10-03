/**
 * Notes Store - Zustand State Management
 */

import { create } from 'zustand';
import { Note, Folder, Tag, NoteView, SortBy, SortOrder } from '../types/note.types';

interface NotesState {
  // Data
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  
  // UI State
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  selectedTags: string[];
  view: NoteView;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions - Notes
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  
  // Actions - Folders
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  selectFolder: (id: string | null) => void;
  
  // Actions - Tags
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  toggleTagFilter: (tagId: string) => void;
  clearTagFilters: () => void;
  
  // Actions - UI
  setView: (view: NoteView) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  
  // Computed
  getSelectedNote: () => Note | null;
  getNotesInFolder: (folderId: string | null) => Note[];
  getNotesWithTag: (tagId: string) => Note[];
  getFilteredNotes: () => Note[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  // Initial state
  notes: [],
  folders: [],
  tags: [],
  selectedNoteId: null,
  selectedFolderId: null,
  selectedTags: [],
  view: 'list',
  sortBy: 'updated',
  sortOrder: 'desc',
  searchQuery: '',
  isLoading: false,
  isSaving: false,
  
  // Notes actions
  setNotes: (notes) => set({ notes }),
  
  addNote: (note) => set((state) => ({
    notes: [note, ...state.notes],
  })),
  
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, ...updates } : note
    ),
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id),
    selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
  })),
  
  selectNote: (id) => set({ selectedNoteId: id }),
  
  // Folders actions
  setFolders: (folders) => set({ folders }),
  
  addFolder: (folder) => set((state) => ({
    folders: [...state.folders, folder],
  })),
  
  updateFolder: (id, updates) => set((state) => ({
    folders: state.folders.map((folder) =>
      folder.id === id ? { ...folder, ...updates } : folder
    ),
  })),
  
  deleteFolder: (id) => set((state) => ({
    folders: state.folders.filter((folder) => folder.id !== id),
    selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
  })),
  
  selectFolder: (id) => set({ selectedFolderId: id }),
  
  // Tags actions
  setTags: (tags) => set({ tags }),
  
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, tag],
  })),
  
  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map((tag) =>
      tag.id === id ? { ...tag, ...updates } : tag
    ),
  })),
  
  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter((tag) => tag.id !== id),
    selectedTags: state.selectedTags.filter((tagId) => tagId !== id),
  })),
  
  toggleTagFilter: (tagId) => set((state) => ({
    selectedTags: state.selectedTags.includes(tagId)
      ? state.selectedTags.filter((id) => id !== tagId)
      : [...state.selectedTags, tagId],
  })),
  
  clearTagFilters: () => set({ selectedTags: [] }),
  
  // UI actions
  setView: (view) => set({ view }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  
  // Computed getters
  getSelectedNote: () => {
    const state = get();
    return state.notes.find((note) => note.id === state.selectedNoteId) || null;
  },
  
  getNotesInFolder: (folderId) => {
    const state = get();
    return state.notes.filter((note) => note.folderId === folderId);
  },
  
  getNotesWithTag: (tagId) => {
    const state = get();
    return state.notes.filter((note) => note.tags.includes(tagId));
  },
  
  getFilteredNotes: () => {
    const state = get();
    let filtered = [...state.notes];
    
    // Filter by folder
    if (state.selectedFolderId !== null) {
      filtered = filtered.filter((note) => note.folderId === state.selectedFolderId);
    }
    
    // Filter by tags
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter((note) =>
        state.selectedTags.some((tagId) => note.tags.includes(tagId))
      );
    }
    
    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter archived
    filtered = filtered.filter((note) => !note.isArchived);
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'updated':
          comparison = new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime();
          break;
        case 'created':
          comparison = new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'importance':
          comparison = (b.ai?.importance || 0) - (a.ai?.importance || 0);
          break;
      }
      
      return state.sortOrder === 'asc' ? -comparison : comparison;
    });
    
    // Pinned notes first
    const pinned = filtered.filter((note) => note.isPinned);
    const unpinned = filtered.filter((note) => !note.isPinned);
    
    return [...pinned, ...unpinned];
  },
}));
