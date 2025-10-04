/**
 * DebuggerApp Component
 * Main debugger application interface
 * 
 * TODO: Implement full debugger UI in Sprint 2
 */

import React from 'react';

export interface DebuggerAppProps {
  initialState?: any;
}

export const DebuggerApp: React.FC<DebuggerAppProps> = ({ initialState }) => {
  return (
    <div className="debugger-app">
      <h1>AuraOS Debugger</h1>
      <p>Visual debugger for BASIC programs and 6502 emulator</p>
      {/* TODO: Implement debugger UI */}
      <div style={{ display: 'none' }}>{initialState ? 'initialized' : 'default'}</div>
    </div>
  );
};

export default DebuggerApp;
