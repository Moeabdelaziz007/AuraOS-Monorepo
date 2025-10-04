/**
 * MemoryViewer Component
 * Displays memory contents in hexadecimal format
 * 
 * TODO: Implement memory viewer with hex dump in Sprint 2
 */

import React from 'react';

export interface MemoryViewerProps {
  memory?: Uint8Array;
  startAddress?: number;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ memory, startAddress = 0 }) => {
  return (
    <div className="memory-viewer">
      <h2>Memory Viewer</h2>
      <p>Hexadecimal memory dump (starting at 0x{startAddress.toString(16).toUpperCase()})</p>
      {/* TODO: Implement memory hex dump */}
      <div style={{ display: 'none' }}>{memory ? `${memory.length} bytes` : 'no data'}</div>
    </div>
  );
};

export default MemoryViewer;
