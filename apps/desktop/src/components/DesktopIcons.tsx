import React from 'react';
import { DesktopApp as DesktopAppType } from '../types';

interface DesktopIconsProps {
  apps: DesktopAppType[];
  onAppLaunch: (appId: string) => void;
  className?: string;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ 
  apps, 
  onAppLaunch, 
  className = '' 
}) => {
  return (
    <div 
      className={`desktop-icons-container p-4 ${className}`}
      data-testid="desktop-icons-container"
    >
      {apps.map((app) => (
        <div
          key={app.id}
          className="flex flex-col items-center justify-center p-2 m-2 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors"
          data-testid={`desktop-icon-${app.id}`}
          onDoubleClick={() => onAppLaunch(app.id)}
        >
          <span className="text-4xl mb-1">{app.icon}</span>
          <span className="text-sm text-white">{app.name}</span>
        </div>
      ))}
    </div>
  );
};
