import React, { useState } from 'react';
import { WindowState, DesktopApp } from '../types';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';

interface TaskbarProps {
  windows: WindowState[];
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
  onWindowClick: (windowId: string) => void;
  onWindowFocus: (windowId: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  apps,
  onAppLaunch,
  onWindowClick,
  onWindowFocus
}) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleWindowClick = (window: WindowState) => {
    if (window.minimized) {
      onWindowClick(window.id); // Toggle minimize
    }
    onWindowFocus(window.id);
  };

  return (
    <div className="taskbar">
      {/* Start Button */}
      <div className="taskbar-start">
        <button
          className={`start-button ${showStartMenu ? 'active' : ''}`}
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <span className="start-icon">⚡</span>
          <span className="start-text">AuraOS</span>
        </button>

        {/* Start Menu */}
        {showStartMenu && (
          <StartMenu
            apps={apps}
            onAppLaunch={(appId) => {
              onAppLaunch(appId);
              setShowStartMenu(false);
            }}
            onClose={() => setShowStartMenu(false)}
          />
        )}
      </div>

      {/* Running Apps / Windows */}
      <div className="taskbar-windows">
        {windows.map((window) => (
          <button
            key={window.id}
            className={`taskbar-window ${window.isActive ? 'active' : ''} ${
              window.minimized ? 'minimized' : ''
            }`}
            onClick={() => handleWindowClick(window)}
            title={window.title}
          >
            {window.icon && <span className="window-icon">{window.icon}</span>}
            <span className="window-title">{window.title}</span>
          </button>
        ))}
      </div>

      {/* System Tray */}
      <SystemTray currentTime={currentTime} />
    </div>
  );
};
