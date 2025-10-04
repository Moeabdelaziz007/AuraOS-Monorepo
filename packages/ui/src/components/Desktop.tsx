import React from 'react';
import { Pin, LucideIcon } from 'lucide-react';
import { DesktopApp } from '../types/window';
import { useLearningLoop } from '@auraos/hooks';
import { useAuth } from '../contexts/AuthContext';
import { QuantumAppIcon } from './quantum-elements';

interface DesktopProps {
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
}

export const Desktop: React.FC<DesktopProps> = ({ apps, onAppLaunch }) => {
  const { trackAppLaunch } = useLearningLoop();
  const { userProfile: profile } = useAuth();

  const handleDoubleClick = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
      // Track app launch in learning loop
      trackAppLaunch(appId, app.name);
    }
    onAppLaunch(appId);
  };

  // Get pinned apps from user preferences
  const pinnedApps = profile?.preferences?.desktopLayout?.pinnedApps || [];
  const sortedApps = [...apps].sort((a, b) => {
    const aIsPinned = pinnedApps.includes(a.id);
    const bIsPinned = pinnedApps.includes(b.id);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  return (
    <div className="desktop-enhanced">
      <div className="desktop-icons-grid">
        {sortedApps.map((app) => (
          <QuantumAppIcon
            key={app.id}
            icon={app.icon}
            label={app.name}
            onClick={() => handleDoubleClick(app.id)}
            size="medium"
            isPinned={pinnedApps.includes(app.id)}
            className="desktop-quantum-icon"
          />
        ))}
      </div>
    </div>
  );
};
