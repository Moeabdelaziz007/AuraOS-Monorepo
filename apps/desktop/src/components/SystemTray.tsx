import React from 'react';

interface SystemTrayProps {
  className?: string;
}

export const SystemTray: React.FC<SystemTrayProps> = ({ 
  className = '' 
}) => {
  return (
    <div 
      className={`system-tray flex items-center space-x-2 ${className}`}
      data-testid="system-tray"
    >
      <span className="text-lg cursor-pointer" title="Network">📶</span>
      <span className="text-lg cursor-pointer" title="Volume">🔊</span>
      <span className="text-lg cursor-pointer" title="Notifications">🔔</span>
    </div>
  );
};
