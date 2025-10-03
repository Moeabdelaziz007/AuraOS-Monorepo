/**
 * Sidebar - Folders and tags navigation
 */

import React, { useState } from 'react';
import { Folder, FolderPlus, Tag, ChevronRight, ChevronDown } from 'lucide-react';
import type { Folder as FolderType } from '../types';

interface SidebarProps {
  folders: FolderType[];
  selectedFolderId?: string;
  selectedTags: string[];
  onSelectFolder: (folderId?: string) => void;
  onSelectTags: (tags: string[]) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
  allTags: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolderId,
  selectedTags,
  onSelectFolder,
  onSelectTags,
  onCreateFolder,
  allTags,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelectTags(selectedTags.filter(t => t !== tag));
    } else {
      onSelectTags([...selectedTags, tag]);
    }
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const hasChildren = folders.some(f => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`sidebar-folder ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren && (
            <button
              className="folder-toggle"
              onClick={() => toggleFolder(folder.id)}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <button
            className="folder-button"
            onClick={() => onSelectFolder(folder.id)}
          >
            <Folder size={16} style={{ color: folder.color }} />
            <span>{folder.name}</span>
          </button>
        </div>
        {isExpanded &&
          folders
            .filter(f => f.parentId === folder.id)
            .map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parentId);

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-header">
          <h3>Folders</h3>
          <button
            className="icon-button"
            onClick={() => setShowNewFolderInput(true)}
            title="New Folder"
          >
            <FolderPlus size={18} />
          </button>
        </div>

        <button
          className={`sidebar-folder ${!selectedFolderId ? 'selected' : ''}`}
          onClick={() => onSelectFolder(undefined)}
        >
          <Folder size={16} />
          <span>All Notes</span>
        </button>

        {rootFolders.map(folder => renderFolder(folder))}

        {showNewFolderInput && (
          <div className="new-folder-input">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name"
              autoFocus
            />
            <button onClick={handleCreateFolder}>Create</button>
            <button onClick={() => {
              setShowNewFolderInput(false);
              setNewFolderName('');
            }}>Cancel</button>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-header">
          <h3>Tags</h3>
        </div>
        <div className="tags-list">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <Tag size={14} />
              <span>{tag}</span>
            </button>
          ))}
          {allTags.length === 0 && (
            <p className="empty-state">No tags yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
