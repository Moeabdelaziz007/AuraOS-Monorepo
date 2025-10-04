/**
 * CallStack Component
 * Displays the call stack during debugging
 * 
 * TODO: Implement call stack visualization in Sprint 2
 */

import React from 'react';

export interface CallStackProps {
  stack?: any[];
}

export const CallStack: React.FC<CallStackProps> = ({ stack = [] }) => {
  return (
    <div className="call-stack">
      <h2>Call Stack</h2>
      <p>Function call hierarchy ({stack.length} frames)</p>
      {/* TODO: Implement call stack display */}
    </div>
  );
};

export default CallStack;
