import React from 'react';
import { DesktopApp } from '../types/window';

interface DesktopProps {
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
}

export const Desktop: React.FC<DesktopProps> = ({ apps, onAppLaunch }) => {
  const handleDoubleClick = (appId: string) => {
    onAppLaunch(appId);
  };

  return (
    <div className="desktop">
      <div className="desktop-icons">
        {apps.map((app) => (
          <div
            key={app.id}
            className="desktop-icon"
            onDoubleClick={() => handleDoubleClick(app.id)}
            title={app.name}
          >
            <div className="icon-image">{app.icon}</div>
            <div className="icon-label">{app.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
