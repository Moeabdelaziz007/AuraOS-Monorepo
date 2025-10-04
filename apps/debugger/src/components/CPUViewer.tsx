/**
 * CPUViewer Component
 * Displays CPU state (registers, flags, program counter)
 * 
 * TODO: Implement CPU state visualization in Sprint 2
 */

import React from 'react';

export interface CPUViewerProps {
  cpuState?: any;
}

export const CPUViewer: React.FC<CPUViewerProps> = ({ cpuState }) => {
  return (
    <div className="cpu-viewer">
      <h2>CPU State</h2>
      <p>Registers, flags, and program counter</p>
      {/* TODO: Implement CPU state display */}
      <div style={{ display: 'none' }}>{cpuState ? 'loaded' : 'empty'}</div>
    </div>
  );
};

export default CPUViewer;
