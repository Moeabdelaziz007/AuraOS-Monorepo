/**
 * Automation Dashboard
 * Monitor and manage background workers, automations, and scheduled tasks
 */

import React, { useState, useEffect } from 'react';

interface WorkerStatus {
  name: string;
  running: boolean;
  interval: string;
  lastExecution: string;
  executionCount: number;
  errors: number;
}

interface AutomationTrigger {
  id: string;
  event: string;
  enabled: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  runCount: number;
  nextRun?: string;
}

export const AutomationDashboard: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerStatus[]>([]);
  const [automations, setAutomations] = useState<AutomationTrigger[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [activeTab, setActiveTab] = useState<'workers' | 'automations' | 'tasks'>('workers');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // Mock data - will be replaced with actual API calls
    setWorkers([
      {
        name: 'Health Check',
        running: true,
        interval: '5m',
        lastExecution: new Date(Date.now() - 120000).toISOString(),
        executionCount: 24,
        errors: 0,
      },
      {
        name: 'Learning Analysis',
        running: true,
        interval: '30m',
        lastExecution: new Date(Date.now() - 600000).toISOString(),
        executionCount: 8,
        errors: 0,
      },
      {
        name: 'Backup',
        running: true,
        interval: '6h',
        lastExecution: new Date(Date.now() - 3600000).toISOString(),
        executionCount: 4,
        errors: 0,
      },
    ]);

    setAutomations([
      {
        id: 'auto_1',
        event: 'user.login',
        enabled: true,
        triggerCount: 15,
        lastTriggered: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'auto_2',
        event: 'code.error',
        enabled: true,
        triggerCount: 3,
        lastTriggered: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'auto_3',
        event: 'file.created',
        enabled: true,
        triggerCount: 42,
        lastTriggered: new Date(Date.now() - 60000).toISOString(),
      },
    ]);

    setTasks([
      {
        id: 'task_1',
        name: 'Daily Backup',
        schedule: '24h',
        enabled: true,
        runCount: 7,
        nextRun: new Date(Date.now() + 7200000).toISOString(),
      },
      {
        id: 'task_2',
        name: 'Hourly Health Check',
        schedule: '1h',
        enabled: true,
        runCount: 168,
        nextRun: new Date(Date.now() + 1800000).toISOString(),
      },
      {
        id: 'task_3',
        name: 'Cleanup',
        schedule: '15m',
        enabled: true,
        runCount: 672,
        nextRun: new Date(Date.now() + 300000).toISOString(),
      },
    ]);
  };

  const toggleWorker = (name: string) => {
    setWorkers(workers.map((w) => (w.name === name ? { ...w, running: !w.running } : w)));
  };

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const formatTimeAgo = (isoString: string) => {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatTimeUntil = (isoString: string) => {
    const seconds = Math.floor((new Date(isoString).getTime() - Date.now()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="automation-dashboard">
      <div className="dashboard-header">
        <h2>🔄 Automation Dashboard</h2>
        <p>Monitor and manage all automation systems</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          🔧 Background Workers ({workers.length})
        </button>
        <button
          className={`tab ${activeTab === 'automations' ? 'active' : ''}`}
          onClick={() => setActiveTab('automations')}
        >
          ⚡ Automations ({automations.length})
        </button>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ⏰ Scheduled Tasks ({tasks.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'workers' && (
          <div className="workers-section">
            <div className="section-header">
              <h3>Background Workers</h3>
              <span className="status-badge">
                {workers.filter((w) => w.running).length} / {workers.length} Running
              </span>
            </div>
            <div className="items-grid">
              {workers.map((worker) => (
                <div key={worker.name} className="item-card">
                  <div className="item-header">
                    <div className="item-title">
                      <span className={`status-dot ${worker.running ? 'running' : 'stopped'}`} />
                      <span className="item-name">{worker.name}</span>
                    </div>
                    <button
                      onClick={() => toggleWorker(worker.name)}
                      className={`toggle-btn ${worker.running ? 'stop' : 'start'}`}
                    >
                      {worker.running ? '⏸️ Stop' : '▶️ Start'}
                    </button>
                  </div>
                  <div className="item-stats">
                    <div className="stat">
                      <span className="stat-label">Interval:</span>
                      <span className="stat-value">{worker.interval}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Executions:</span>
                      <span className="stat-value">{worker.executionCount}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Errors:</span>
                      <span className="stat-value error">{worker.errors}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Last Run:</span>
                      <span className="stat-value">{formatTimeAgo(worker.lastExecution)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'automations' && (
          <div className="automations-section">
            <div className="section-header">
              <h3>Event-Driven Automations</h3>
              <span className="status-badge">
                {automations.filter((a) => a.enabled).length} / {automations.length} Enabled
              </span>
            </div>
            <div className="items-grid">
              {automations.map((automation) => (
                <div key={automation.id} className="item-card">
                  <div className="item-header">
                    <div className="item-title">
                      <span className={`status-dot ${automation.enabled ? 'running' : 'stopped'}`} />
                      <span className="item-name">{automation.event}</span>
                    </div>
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`toggle-btn ${automation.enabled ? 'stop' : 'start'}`}
                    >
                      {automation.enabled ? '⏸️ Disable' : '▶️ Enable'}
                    </button>
                  </div>
                  <div className="item-stats">
                    <div className="stat">
                      <span className="stat-label">Triggers:</span>
                      <span className="stat-value">{automation.triggerCount}</span>
                    </div>
                    {automation.lastTriggered && (
                      <div className="stat">
                        <span className="stat-label">Last Triggered:</span>
                        <span className="stat-value">{formatTimeAgo(automation.lastTriggered)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h3>Scheduled Tasks</h3>
              <span className="status-badge">
                {tasks.filter((t) => t.enabled).length} / {tasks.length} Enabled
              </span>
            </div>
            <div className="items-grid">
              {tasks.map((task) => (
                <div key={task.id} className="item-card">
                  <div className="item-header">
                    <div className="item-title">
                      <span className={`status-dot ${task.enabled ? 'running' : 'stopped'}`} />
                      <span className="item-name">{task.name}</span>
                    </div>
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`toggle-btn ${task.enabled ? 'stop' : 'start'}`}
                    >
                      {task.enabled ? '⏸️ Disable' : '▶️ Enable'}
                    </button>
                  </div>
                  <div className="item-stats">
                    <div className="stat">
                      <span className="stat-label">Schedule:</span>
                      <span className="stat-value">{task.schedule}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Runs:</span>
                      <span className="stat-value">{task.runCount}</span>
                    </div>
                    {task.nextRun && (
                      <div className="stat">
                        <span className="stat-label">Next Run:</span>
                        <span className="stat-value">{formatTimeUntil(task.nextRun)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .automation-dashboard {
          padding: 20px;
          background: #1a1a2e;
          color: #eee;
          border-radius: 8px;
          height: 100%;
          overflow-y: auto;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .dashboard-header p {
          margin: 0;
          color: #888;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #2a3f5f;
        }

        .tab {
          padding: 12px 20px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
        }

        .tab:hover {
          color: #eee;
        }

        .tab.active {
          color: #4a9eff;
          border-bottom-color: #4a9eff;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .status-badge {
          background: #2a3f5f;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .items-grid {
          display: grid;
          gap: 15px;
        }

        .item-card {
          background: #16213e;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #2a3f5f;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .item-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #666;
        }

        .status-dot.running {
          background: #0f0;
          box-shadow: 0 0 10px #0f0;
        }

        .status-dot.stopped {
          background: #f44;
        }

        .item-name {
          font-size: 16px;
          font-weight: bold;
        }

        .toggle-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .toggle-btn.stop {
          background: #f44;
          color: white;
        }

        .toggle-btn.stop:hover {
          background: #d33;
        }

        .toggle-btn.start {
          background: #0f0;
          color: black;
        }

        .toggle-btn.start:hover {
          background: #0d0;
        }

        .item-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #888;
        }

        .stat-value {
          font-size: 14px;
          font-weight: bold;
          color: #4a9eff;
        }

        .stat-value.error {
          color: #f44;
        }
      `}</style>
    </div>
  );
};
