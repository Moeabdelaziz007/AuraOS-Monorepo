/**
 * Note Types and Interfaces
 */

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  contentVector?: number[];
  tags: string[];
  folderId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  metadata: NoteMetadata;
  ai?: AIMetadata;
  automation?: AutomationMetadata;
  collaboration?: CollaborationMetadata;
  connections?: ConnectionsMetadata;
}

export interface NoteMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  wordCount: number;
  readingTime: number;
  language: string;
  color?: string;
}

export interface AIMetadata {
  summary?: string;
  keyPoints: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  importance: number;
  suggestedTags: string[];
}

export interface AutomationMetadata {
  reminders: Reminder[];
  workflows: string[];
  rules: string[];
  actionItems: ActionItem[];
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  notified: boolean;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  assignee?: string;
}

export interface CollaborationMetadata {
  sharedWith: string[];
  permissions: Record<string, 'view' | 'edit' | 'admin'>;
  comments: Comment[];
  version: number;
  lastEditedBy?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  resolved: boolean;
}

export interface ConnectionsMetadata {
  relatedNotes: string[];
  references: string[];
  backlinks: string[];
  mentions: string[];
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
  automation?: FolderAutomation;
  metadata: FolderMetadata;
}

export interface FolderAutomation {
  autoTag: boolean;
  autoArchive: boolean;
  rules: AutomationRule[];
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleTrigger {
  type: 'note_created' | 'note_updated' | 'tag_added' | 'schedule';
  config: any;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface RuleAction {
  type: 'add_tag' | 'move_folder' | 'archive' | 'notify' | 'run_workflow';
  config: any;
}

export interface FolderMetadata {
  createdAt: Date;
  noteCount: number;
  lastModified: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  noteCount: number;
  relatedTags: string[];
  createdAt: Date;
}

export interface SearchQuery {
  text: string;
  filters: SearchFilters;
  semantic: boolean;
}

export interface SearchFilters {
  tags?: string[];
  folders?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasReminders?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface SearchResult {
  note: Note;
  score: number;
  highlights: string[];
  matchedFields: string[];
}

export type NoteView = 'list' | 'grid' | 'timeline' | 'graph';
export type SortBy = 'updated' | 'created' | 'title' | 'importance';
export type SortOrder = 'asc' | 'desc';
