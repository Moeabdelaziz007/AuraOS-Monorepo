import React from 'react';
import { useDesktopStore } from '../store/desktopStore';
import './Settings.css';

export const Settings: React.FC = () => {
  const { theme, setTheme, toggleSettings } = useDesktopStore();

  return (
    <div className="settings-overlay" onClick={toggleSettings}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={toggleSettings}>
            ✕
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="settings-option">
              <label>Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>About</h3>
            <div className="settings-info">
              <p><strong>AuraOS Desktop</strong></p>
              <p>Version 1.0.0</p>
              <p>AI-Powered Operating System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
