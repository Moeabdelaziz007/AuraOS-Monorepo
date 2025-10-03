import React from 'react';
import { DesktopApp } from '../types/window';
import { useLearningLoop, useUserProfile } from '@auraos/hooks';

interface DesktopProps {
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
}

export const Desktop: React.FC<DesktopProps> = ({ apps, onAppLaunch }) => {
  const { trackAppLaunch } = useLearningLoop();
  const { profile } = useUserProfile();

  const handleDoubleClick = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
      // Track app launch in learning loop
      trackAppLaunch(appId, app.name);
    }
    onAppLaunch(appId);
  };

  // Get pinned apps from user preferences
  const pinnedApps = profile?.preferences.desktopLayout.pinnedApps || [];
  const sortedApps = [...apps].sort((a, b) => {
    const aIsPinned = pinnedApps.includes(a.id);
    const bIsPinned = pinnedApps.includes(b.id);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  return (
    <div className="desktop">
      <div className="desktop-icons">
        {sortedApps.map((app) => (
          <div
            key={app.id}
            className="desktop-icon"
            onDoubleClick={() => handleDoubleClick(app.id)}
            title={app.name}
          >
            <div className="icon-image">{app.icon}</div>
            <div className="icon-label">{app.name}</div>
            {pinnedApps.includes(app.id) && (
              <div className="icon-pin" title="Pinned">📌</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
