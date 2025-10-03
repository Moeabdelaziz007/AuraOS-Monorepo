import React from 'react';
import { Taskbar } from './Taskbar';
import { AppContainer } from './AppContainer';
import { Settings } from './Settings';
import { useDesktopStore } from '../store/desktopStore';
import './Desktop.css';

export const Desktop: React.FC = () => {
  const { showSettings, theme } = useDesktopStore();

  return (
    <div className={`desktop ${theme}`}>
      <div className="desktop-background">
        <div className="desktop-content">
          <AppContainer />
        </div>
      </div>

      <Taskbar />

      {showSettings && <Settings />}
    </div>
  );
};
