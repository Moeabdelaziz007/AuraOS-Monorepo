import React from 'react';
import { useDesktopStore } from '../store/desktopStore';
import { apps } from '../apps/registry';
import './AppContainer.css';

export const AppContainer: React.FC = () => {
  const { activeAppId, runningApps, closeApp } = useDesktopStore();

  if (runningApps.length === 0) {
    return (
      <div className="app-container-empty">
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <h2>Welcome to AuraOS</h2>
          <p>Click the AuraOS button to launch an application</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {runningApps.map((appId) => {
        const app = apps.find((a) => a.id === appId);
        if (!app) return null;

        const AppComponent = app.component;
        const isActive = activeAppId === appId;

        return (
          <div
            key={appId}
            className={`app-window ${isActive ? 'active' : 'inactive'}`}
          >
            <div className="app-header">
              <div className="app-title">
                <span className="app-icon">{app.icon}</span>
                <span className="app-name">{app.name}</span>
              </div>
              <button
                className="app-close"
                onClick={() => closeApp(appId)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="app-content">
              <AppComponent windowId={appId} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
