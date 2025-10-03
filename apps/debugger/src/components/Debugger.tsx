import React from 'react';
import { CodeEditor } from './CodeEditor';
import { DebugControls } from './DebugControls';
import { VariableInspector } from './VariableInspector';
import { OutputPanel } from './OutputPanel';
import { CallStack } from './CallStack';
import './Debugger.css';

export const Debugger: React.FC = () => {
  return (
    <div className="debugger">
      <div className="debugger-header">
        <h1>🐛 AuraOS Debugger</h1>
        <DebugControls />
      </div>
      
      <div className="debugger-content">
        <div className="debugger-main">
          <CodeEditor />
        </div>
        
        <div className="debugger-sidebar">
          <div className="sidebar-section">
            <h3>Variables</h3>
            <VariableInspector />
          </div>
          
          <div className="sidebar-section">
            <h3>Call Stack</h3>
            <CallStack />
          </div>
          
          <div className="sidebar-section">
            <h3>Output</h3>
            <OutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
