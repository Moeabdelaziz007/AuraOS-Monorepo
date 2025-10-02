/**
 * Dashboard Component
 * Main OS desktop environment with AI Assistant
 */

import React, { useState } from 'react';
import { AIChat } from '../ai/AIChat';
import './Dashboard.css';

interface SystemStats {
  cpu: number;
  memory: number;
  storage: number;
}

export const Dashboard: React.FC = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [systemStats] = useState<SystemStats>({
    cpu: 45,
    memory: 62,
    storage: 38,
  });

  const handleAIError = (error: Error) => {
    console.error('AI Assistant Error:', error);
    // Could show a toast notification here
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            <span className="title-icon">🌟</span>
            AuraOS
          </h1>
          <span className="version-badge">v1.0.0</span>
        </div>
        <div className="header-right">
          <div className="system-time">
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <button
            className="ai-toggle-button"
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            title={isAIChatOpen ? 'Hide AI Assistant' : 'Show AI Assistant'}
          >
            🤖
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Panel - System Info & Quick Actions */}
        <aside className="dashboard-sidebar">
          {/* System Stats */}
          <div className="stats-panel">
            <h2 className="panel-title">System Status</h2>
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">CPU Usage</span>
                <span className="stat-value">{systemStats.cpu}%</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-fill cpu"
                  style={{ width: `${systemStats.cpu}%` }}
                />
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Memory</span>
                <span className="stat-value">{systemStats.memory}%</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-fill memory"
                  style={{ width: `${systemStats.memory}%` }}
                />
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Storage</span>
                <span className="stat-value">{systemStats.storage}%</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-fill storage"
                  style={{ width: `${systemStats.storage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-panel">
            <h2 className="panel-title">Quick Actions</h2>
            <div className="action-grid">
              <button className="action-button">
                <span className="action-icon">📁</span>
                <span className="action-label">Files</span>
              </button>
              <button className="action-button">
                <span className="action-icon">💻</span>
                <span className="action-label">Terminal</span>
              </button>
              <button className="action-button">
                <span className="action-icon">⚙️</span>
                <span className="action-label">Settings</span>
              </button>
              <button className="action-button">
                <span className="action-icon">🎮</span>
                <span className="action-label">Emulator</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-panel">
            <h2 className="panel-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">📝</span>
                <div className="activity-content">
                  <div className="activity-title">File Created</div>
                  <div className="activity-time">2 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🤖</span>
                <div className="activity-content">
                  <div className="activity-title">AI Assistant Used</div>
                  <div className="activity-time">5 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">💾</span>
                <div className="activity-content">
                  <div className="activity-title">System Updated</div>
                  <div className="activity-time">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Panel - Main Workspace */}
        <main className="dashboard-main">
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome to AuraOS</h2>
            <p className="welcome-subtitle">
              Your AI-powered operating system is ready. Use the AI Assistant to control your system with natural language.
            </p>
          </div>

          {/* App Grid */}
          <div className="app-grid">
            <div className="app-card">
              <div className="app-icon">📁</div>
              <div className="app-name">File Manager</div>
              <div className="app-description">Browse and manage files</div>
            </div>
            <div className="app-card">
              <div className="app-icon">💻</div>
              <div className="app-name">Terminal</div>
              <div className="app-description">Command line interface</div>
            </div>
            <div className="app-card">
              <div className="app-icon">🎮</div>
              <div className="app-name">Emulator</div>
              <div className="app-description">6502 CPU emulator</div>
            </div>
            <div className="app-card">
              <div className="app-icon">📝</div>
              <div className="app-name">Text Editor</div>
              <div className="app-description">Edit code and documents</div>
            </div>
            <div className="app-card">
              <div className="app-icon">⚙️</div>
              <div className="app-name">Settings</div>
              <div className="app-description">System configuration</div>
            </div>
            <div className="app-card">
              <div className="app-icon">📊</div>
              <div className="app-name">Monitor</div>
              <div className="app-description">System performance</div>
            </div>
          </div>
        </main>

        {/* Right Panel - AI Assistant */}
        {isAIChatOpen && (
          <aside className="dashboard-ai-panel">
            <AIChat onError={handleAIError} />
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-left">
          <span className="footer-item">
            <span className="footer-icon">🌐</span>
            Connected
          </span>
          <span className="footer-item">
            <span className="footer-icon">📡</span>
            MCP Active
          </span>
        </div>
        <div className="footer-right">
          <span className="footer-item">AuraOS - AI-Native Operating System</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
