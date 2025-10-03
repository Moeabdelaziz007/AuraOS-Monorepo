import React, { useState } from 'react';
import { useDesktopStore } from '../store/desktopStore';
import { apps } from '../apps/registry';
import './Taskbar.css';

export const Taskbar: React.FC = () => {
  const [showLauncher, setShowLauncher] = useState(false);
  const { activeAppId, runningApps, launchApp, setActiveApp, toggleSettings } =
    useDesktopStore();

  const handleAppClick = (appId: string) => {
    if (runningApps.includes(appId)) {
      setActiveApp(appId);
    } else {
      launchApp(appId);
    }
    setShowLauncher(false);
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="taskbar">
      <button
        className="start-button"
        onClick={() => setShowLauncher(!showLauncher)}
      >
        <span className="start-icon">⚡</span>
        <span className="start-text">AuraOS</span>
      </button>

      {showLauncher && (
        <div className="app-launcher">
          <div className="launcher-header">
            <h3>Applications</h3>
          </div>
          <div className="launcher-grid">
            {apps.map((app) => (
              <button
                key={app.id}
                className="launcher-app"
                onClick={() => handleAppClick(app.id)}
              >
                <span className="launcher-app-icon">{app.icon}</span>
                <span className="launcher-app-name">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="taskbar-apps">
        {runningApps.map((appId) => {
          const app = apps.find((a) => a.id === appId);
          if (!app) return null;

          return (
            <button
              key={appId}
              className={`taskbar-app ${
                activeAppId === appId ? 'active' : ''
              }`}
              onClick={() => setActiveApp(appId)}
            >
              <span className="taskbar-app-icon">{app.icon}</span>
              <span className="taskbar-app-name">{app.name}</span>
            </button>
          );
        })}
      </div>

      <div className="taskbar-tray">
        <button className="tray-button" onClick={toggleSettings}>
          ⚙️
        </button>
        <div className="tray-clock">{currentTime}</div>
      </div>
    </div>
  );
};
