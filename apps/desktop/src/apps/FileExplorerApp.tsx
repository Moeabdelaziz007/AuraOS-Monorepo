import React, { useState, useEffect } from 'react';
import type { AppProps } from '../types';
import './FileExplorerApp.css';

interface FileEntry {
  name: string;
  type: 'file' | 'directory';
  path: string;
}

export const FileExplorerApp: React.FC<AppProps> = () => {
  const [currentPath, setCurrentPath] = useState('/home/aura');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      // Import VFS dynamically
      const { VirtualFileSystem } = await import(
        '@auraos/core/vfs/VirtualFileSystem'
      );
      const vfs = new VirtualFileSystem();
      await vfs.initialize();

      const entries = await vfs.listDirectory(path);
      setFiles(entries as FileEntry[]);
    } catch (error) {
      console.error('Failed to load directory:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: FileEntry) => {
    if (item.type === 'directory') {
      setCurrentPath(item.path);
    }
  };

  const handleBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  return (
    <div className="file-explorer">
      <div className="explorer-toolbar">
        <button onClick={handleBack} disabled={currentPath === '/'}>
          ← Back
        </button>
        <div className="explorer-path">{currentPath}</div>
      </div>

      <div className="explorer-content">
        {loading ? (
          <div className="explorer-loading">Loading...</div>
        ) : files.length === 0 ? (
          <div className="explorer-empty">Empty directory</div>
        ) : (
          <div className="explorer-grid">
            {files.map((file) => (
              <div
                key={file.path}
                className="explorer-item"
                onClick={() => handleItemClick(file)}
              >
                <div className="explorer-item-icon">
                  {file.type === 'directory' ? '📁' : '📄'}
                </div>
                <div className="explorer-item-name">{file.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
