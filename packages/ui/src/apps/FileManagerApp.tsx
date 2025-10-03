import React, { useState } from 'react';

/**
 * File Manager App
 * Simple file browser with MCP integration
 */

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  icon: string;
}

export const FileManagerApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [files] = useState<FileItem[]>([
    { name: 'documents', type: 'folder', modified: '2025-10-01', icon: '📁' },
    { name: 'downloads', type: 'folder', modified: '2025-10-02', icon: '📁' },
    { name: 'pictures', type: 'folder', modified: '2025-09-28', icon: '📁' },
    { name: 'projects', type: 'folder', modified: '2025-10-03', icon: '📁' },
    { name: 'README.md', type: 'file', size: '2.4 KB', modified: '2025-10-01', icon: '📄' },
    { name: 'config.json', type: 'file', size: '1.2 KB', modified: '2025-10-02', icon: '⚙️' },
    { name: 'notes.txt', type: 'file', size: '856 B', modified: '2025-10-03', icon: '📝' },
    { name: 'image.png', type: 'file', size: '245 KB', modified: '2025-09-30', icon: '🖼️' },
  ]);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileClick = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(`${currentPath}/${file.name}`);
    } else {
      alert(`Opening ${file.name}...`);
    }
  };

  const handleBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/') || '/');
  };

  return (
    <div className="app-container file-manager-app">
      {/* Toolbar */}
      <div className="file-manager-toolbar">
        <button onClick={handleBack} disabled={currentPath === '/'}>
          ← Back
        </button>
        <button>↑ Up</button>
        <button>🔄 Refresh</button>
        <div className="path-bar">
          <span className="path-icon">📂</span>
          <span className="path-text">{currentPath}</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="file-manager-content">
        <div className="file-manager-sidebar">
          <div className="sidebar-section">
            <h4>Quick Access</h4>
            <div className="sidebar-item">
              <span className="sidebar-icon">🏠</span>
              <span>Home</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">📄</span>
              <span>Documents</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">⬇️</span>
              <span>Downloads</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">🖼️</span>
              <span>Pictures</span>
            </div>
          </div>
          <div className="sidebar-section">
            <h4>Storage</h4>
            <div className="storage-info">
              <div className="storage-bar">
                <div className="storage-used" style={{ width: '45%' }}></div>
              </div>
              <div className="storage-text">125 GB / 512 GB</div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="file-manager-main">
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Modified</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.name}
                  className={`file-row ${selectedFile === file.name ? 'selected' : ''}`}
                  onClick={() => handleFileClick(file.name)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                >
                  <td>
                    <span className="file-icon">{file.icon}</span>
                    <span className="file-name">{file.name}</span>
                  </td>
                  <td>{file.type === 'folder' ? 'Folder' : 'File'}</td>
                  <td>{file.size || '—'}</td>
                  <td>{file.modified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Bar */}
      <div className="file-manager-statusbar">
        <span>{files.length} items</span>
        {selectedFile && <span>Selected: {selectedFile}</span>}
      </div>
    </div>
  );
};
