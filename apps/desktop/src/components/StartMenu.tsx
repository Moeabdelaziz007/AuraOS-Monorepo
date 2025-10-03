import React from 'react';
import { DesktopApp } from '../types';

interface StartMenuProps {
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  apps,
  onAppLaunch,
  onClose
}) => {
  // Group apps by category
  const appsByCategory = apps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, DesktopApp[]>);

  const categoryLabels = {
    system: 'System',
    development: 'Development',
    productivity: 'Productivity',
    entertainment: 'Entertainment',
    utilities: 'Utilities'
  };

  return (
    <div className="start-menu">
      <div className="start-menu-header">
        <h3>Applications</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="start-menu-content">
        {Object.entries(appsByCategory).map(([category, categoryApps]) => (
          <div key={category} className="start-menu-category">
            <h4 className="category-title">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </h4>
            <div className="category-apps">
              {categoryApps.map((app) => (
                <button
                  key={app.id}
                  className="start-menu-app"
                  onClick={() => onAppLaunch(app.id)}
                  title={app.description}
                >
                  <span className="app-icon">{app.icon}</span>
                  <span className="app-name">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="start-menu-footer">
        <button className="start-menu-power">⏻ Power</button>
        <button className="start-menu-settings">⚙️ Settings</button>
      </div>
    </div>
  );
};
