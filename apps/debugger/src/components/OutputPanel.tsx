import React, { useEffect, useRef } from 'react';
import { useDebuggerStore } from '../store/debuggerStore';
import './OutputPanel.css';

export const OutputPanel: React.FC = () => {
  const { output, error, clearOutput } = useDebuggerStore();
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="output-panel">
      <div className="output-header">
        <button
          className="clear-btn"
          onClick={clearOutput}
          title="Clear output"
        >
          🗑️ Clear
        </button>
      </div>
      
      <div className="output-content" ref={outputRef}>
        {output.length === 0 && !error && (
          <div className="output-empty">
            <p>No output</p>
            <p className="hint">Run the code to see output</p>
          </div>
        )}
        
        {output.map((line, index) => (
          <div key={index} className="output-line">
            {line}
          </div>
        ))}
        
        {error && (
          <div className="output-error">
            ❌ Error: {error}
          </div>
        )}
      </div>
    </div>
  );
};
