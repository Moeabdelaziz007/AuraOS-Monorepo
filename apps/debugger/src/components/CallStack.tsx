import React from 'react';
import { useDebuggerStore } from '../store/debuggerStore';
import './CallStack.css';

export const CallStack: React.FC = () => {
  const { callStack } = useDebuggerStore();

  if (callStack.length === 0) {
    return (
      <div className="call-stack empty">
        <p>No call stack</p>
        <p className="hint">Pause execution to see call stack</p>
      </div>
    );
  }

  return (
    <div className="call-stack">
      {callStack.map((frame, index) => (
        <div key={frame.id} className="stack-frame">
          <div className="frame-index">{index}</div>
          <div className="frame-info">
            <div className="frame-function">{frame.functionName}</div>
            <div className="frame-location">
              Line {frame.line}, Column {frame.column}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
