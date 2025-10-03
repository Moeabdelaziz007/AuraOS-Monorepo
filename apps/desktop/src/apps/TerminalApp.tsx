import React from 'react';
import type { AppProps } from '../types';

export const TerminalApp: React.FC<AppProps> = () => {
  return (
    <iframe
      src="https://auraos-terminal.web.app"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#1e1e1e',
      }}
      title="AuraOS Terminal"
    />
  );
};
