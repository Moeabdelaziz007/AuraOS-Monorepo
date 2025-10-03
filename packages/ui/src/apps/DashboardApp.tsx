import React from 'react';

/**
 * Dashboard App Wrapper
 * This wraps the existing Dashboard component from packages/common
 * to work within the window system
 */

export const DashboardApp: React.FC = () => {
  return (
    <div className="app-container dashboard-app">
      <div className="app-header">
        <h2>📊 Dashboard</h2>
      </div>
      <div className="app-content">
        <div className="dashboard-grid">
          {/* System Status */}
          <div className="dashboard-card">
            <h3>System Status</h3>
            <div className="status-item">
              <span className="status-label">CPU:</span>
              <span className="status-value">45%</span>
            </div>
            <div className="status-item">
              <span className="status-label">Memory:</span>
              <span className="status-value">2.1 GB / 8 GB</span>
            </div>
            <div className="status-item">
              <span className="status-label">Disk:</span>
              <span className="status-value">125 GB / 512 GB</span>
            </div>
            <div className="status-item">
              <span className="status-label">Network:</span>
              <span className="status-value">🟢 Connected</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-card">
            <h3>Quick Stats</h3>
            <div className="stat-item">
              <div className="stat-icon">📁</div>
              <div className="stat-info">
                <div className="stat-value">1,234</div>
                <div className="stat-label">Files</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🚀</div>
              <div className="stat-info">
                <div className="stat-value">8</div>
                <div className="stat-label">Running Apps</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">2h 34m</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">📄</span>
                <span className="activity-text">Opened document.txt</span>
                <span className="activity-time">2m ago</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">💾</span>
                <span className="activity-text">Saved project.json</span>
                <span className="activity-time">15m ago</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🔧</span>
                <span className="activity-text">Updated settings</span>
                <span className="activity-time">1h ago</span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="dashboard-card">
            <h3>System Information</h3>
            <div className="info-item">
              <span className="info-label">OS:</span>
              <span className="info-value">AuraOS v1.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Kernel:</span>
              <span className="info-value">6502 Emulator</span>
            </div>
            <div className="info-item">
              <span className="info-label">Architecture:</span>
              <span className="info-value">x86_64</span>
            </div>
            <div className="info-item">
              <span className="info-label">Build:</span>
              <span className="info-value">2025.10.03</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
