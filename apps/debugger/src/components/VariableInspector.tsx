import React from 'react';
import { useDebuggerStore } from '../store/debuggerStore';
import './VariableInspector.css';

export const VariableInspector: React.FC = () => {
  const { variables } = useDebuggerStore();

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (variables.length === 0) {
    return (
      <div className="variable-inspector empty">
        <p>No variables to display</p>
        <p className="hint">Run the code to see variables</p>
      </div>
    );
  }

  return (
    <div className="variable-inspector">
      {variables.map((variable, index) => (
        <div key={index} className="variable-item">
          <div className="variable-header">
            <span className="variable-name">{variable.name}</span>
            <span className="variable-type">{variable.type}</span>
          </div>
          <div className="variable-value">
            {formatValue(variable.value)}
          </div>
          <div className="variable-scope">{variable.scope}</div>
        </div>
      ))}
    </div>
  );
};
