/**
 * VariableInspector Component
 * Inspects and displays variable values during debugging
 * 
 * TODO: Implement variable inspection UI in Sprint 2
 */

import React from 'react';

export interface VariableInspectorProps {
  variables?: Record<string, any>;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({ variables = {} }) => {
  return (
    <div className="variable-inspector">
      <h2>Variables</h2>
      <p>Inspect variable values ({Object.keys(variables).length} variables)</p>
      {/* TODO: Implement variable tree view */}
    </div>
  );
};

export default VariableInspector;
