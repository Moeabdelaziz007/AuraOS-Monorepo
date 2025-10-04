import React, { useState } from 'react';
import { Zap, Power, Settings, Wifi, Volume2, Bell, Moon, Sun, LucideIcon } from 'lucide-react';
import { WindowState, DesktopApp } from '../types/window';
import { useTheme } from '../contexts/ThemeContext';

interface TaskbarProps {
  windows: WindowState[];
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
  onWindowFocus: (windowId: string) => void;
  onWindowMinimize: (windowId: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  apps,
  onAppLaunch,
  onWindowFocus,
  onWindowMinimize,
}) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { effectiveTheme, toggleTheme } = useTheme();

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
    if (window.isMinimized) {
      onWindowMinimize(window.id); // Toggle minimize
    }
    onWindowFocus(window.id);
  };

  const renderIcon = (icon: LucideIcon | string, className: string = "w-5 h-5") => {
    if (typeof icon === 'string') {
      return <span className="text-xl">{icon}</span>;
    }
    const IconComponent = icon;
    return <IconComponent className={className} />;
  };

  return (
    <div className="taskbar">
      {/* Start Button */}
      <div className="taskbar-start">
        <button
          className={`start-button ${showStartMenu ? 'active' : ''}`}
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <Zap className="start-icon w-5 h-5" />
          <span className="start-text">AuraOS</span>
        </button>

        {/* Start Menu */}
        {showStartMenu && (
          <div className="start-menu">
            <div className="start-menu-header">
              <h3>Applications</h3>
            </div>
            <div className="start-menu-apps">
              {apps.map((app) => (
                <button
                  key={app.id}
                  className="start-menu-app"
                  onClick={() => {
                    onAppLaunch(app.id);
                    setShowStartMenu(false);
                  }}
                >
                  <span className="app-icon">{renderIcon(app.icon, "w-6 h-6")}</span>
                  <span className="app-name">{app.name}</span>
                </button>
              ))}
            </div>
            <div className="start-menu-footer">
              <button className="start-menu-power">
                <Power className="w-4 h-4" /> Power
              </button>
              <button className="start-menu-settings">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Running Apps / Windows */}
      <div className="taskbar-windows">
        {windows.map((window) => (
          <button
            key={window.id}
            className={`taskbar-window ${window.isActive ? 'active' : ''} ${
              window.isMinimized ? 'minimized' : ''
            }`}
            onClick={() => handleWindowClick(window)}
            title={window.title}
          >
            {window.icon && <span className="window-icon">{renderIcon(window.icon, "w-4 h-4")}</span>}
            <span className="window-title">{window.title}</span>
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="taskbar-tray">
        <div className="tray-icons">
          <button 
            className="tray-icon" 
            title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button className="tray-icon" title="Network">
            <Wifi className="w-4 h-4" />
          </button>
          <button className="tray-icon" title="Volume">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className="tray-icon" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
        </div>
        <div className="tray-clock">
          <div className="clock-time">{formatTime(currentTime)}</div>
          <div className="clock-date">{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};
