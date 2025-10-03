/**
 * MCP Control Panel
 * UI for managing and monitoring MCP servers
 */

import React, { useState, useEffect } from 'react';

interface MCPServer {
  name: string;
  version: string;
  toolCount: number;
  callCount: number;
  lastUsed?: string;
}

interface MCPTool {
  name: string;
  description: string;
  serverName: string;
}

export const MCPControlPanel: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolInput, setToolInput] = useState<string>('{}');
  const [toolOutput, setToolOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMCPData();
  }, []);

  const loadMCPData = async () => {
    // Mock data for now - will be replaced with actual MCP gateway calls
    setServers([
      { name: 'filesystem', version: '1.0.0', toolCount: 7, callCount: 0 },
      { name: 'emulator', version: '1.0.0', toolCount: 9, callCount: 0 },
      { name: 'basic', version: '1.0.0', toolCount: 6, callCount: 0 },
    ]);

    setTools([
      { name: 'read_file', description: 'Read file contents', serverName: 'filesystem' },
      { name: 'write_file', description: 'Write to file', serverName: 'filesystem' },
      { name: 'list_directory', description: 'List directory', serverName: 'filesystem' },
      { name: 'execute', description: 'Execute BASIC code', serverName: 'basic' },
      { name: 'load_program', description: 'Load program', serverName: 'emulator' },
      { name: 'run_program', description: 'Run program', serverName: 'emulator' },
    ]);
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    setLoading(true);
    try {
      const input = JSON.parse(toolInput);
      // Mock execution - will be replaced with actual MCP gateway call
      const result = {
        success: true,
        data: { message: 'Tool executed successfully', input },
        metadata: { executionTime: 45, timestamp: new Date().toISOString() },
      };
      setToolOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setToolOutput(JSON.stringify({ success: false, error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mcp-control-panel">
      <div className="panel-header">
        <h2>🔧 MCP Control Panel</h2>
        <p>Model Context Protocol - AI Tool Integration</p>
      </div>

      <div className="panel-content">
        {/* Servers Overview */}
        <div className="section">
          <h3>📊 MCP Servers</h3>
          <div className="servers-grid">
            {servers.map((server) => (
              <div key={server.name} className="server-card">
                <div className="server-header">
                  <span className="server-name">{server.name}</span>
                  <span className="server-version">v{server.version}</span>
                </div>
                <div className="server-stats">
                  <div className="stat">
                    <span className="stat-label">Tools:</span>
                    <span className="stat-value">{server.toolCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Calls:</span>
                    <span className="stat-value">{server.callCount}</span>
                  </div>
                </div>
                {server.lastUsed && (
                  <div className="server-last-used">
                    Last used: {new Date(server.lastUsed).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tool Executor */}
        <div className="section">
          <h3>🛠️ Tool Executor</h3>
          <div className="tool-executor">
            <div className="executor-controls">
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="tool-select"
              >
                <option value="">Select a tool...</option>
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.serverName}.{tool.name} - {tool.description}
                  </option>
                ))}
              </select>

              <textarea
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                placeholder='{"param": "value"}'
                className="tool-input"
                rows={4}
              />

              <button
                onClick={executeTool}
                disabled={!selectedTool || loading}
                className="execute-button"
              >
                {loading ? '⏳ Executing...' : '▶️ Execute Tool'}
              </button>
            </div>

            {toolOutput && (
              <div className="executor-output">
                <h4>Output:</h4>
                <pre>{toolOutput}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Available Tools */}
        <div className="section">
          <h3>📋 Available Tools ({tools.length})</h3>
          <div className="tools-list">
            {tools.map((tool) => (
              <div key={tool.name} className="tool-item">
                <div className="tool-name">
                  <span className="tool-server">{tool.serverName}</span>
                  <span className="tool-method">.{tool.name}</span>
                </div>
                <div className="tool-description">{tool.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .mcp-control-panel {
          padding: 20px;
          background: #1a1a2e;
          color: #eee;
          border-radius: 8px;
          height: 100%;
          overflow-y: auto;
        }

        .panel-header {
          margin-bottom: 30px;
        }

        .panel-header h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .panel-header p {
          margin: 0;
          color: #888;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #4a9eff;
        }

        .servers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .server-card {
          background: #16213e;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #2a3f5f;
        }

        .server-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .server-name {
          font-weight: bold;
          font-size: 16px;
        }

        .server-version {
          color: #888;
          font-size: 12px;
        }

        .server-stats {
          display: flex;
          gap: 20px;
        }

        .stat {
          display: flex;
          gap: 5px;
        }

        .stat-label {
          color: #888;
        }

        .stat-value {
          font-weight: bold;
          color: #4a9eff;
        }

        .server-last-used {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
        }

        .tool-executor {
          background: #16213e;
          padding: 20px;
          border-radius: 6px;
        }

        .executor-controls {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .tool-select {
          padding: 10px;
          background: #0f1419;
          color: #eee;
          border: 1px solid #2a3f5f;
          border-radius: 4px;
          font-size: 14px;
        }

        .tool-input {
          padding: 10px;
          background: #0f1419;
          color: #eee;
          border: 1px solid #2a3f5f;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          resize: vertical;
        }

        .execute-button {
          padding: 12px 24px;
          background: #4a9eff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .execute-button:hover:not(:disabled) {
          background: #3a8eef;
        }

        .execute-button:disabled {
          background: #2a3f5f;
          cursor: not-allowed;
        }

        .executor-output {
          margin-top: 20px;
          padding: 15px;
          background: #0f1419;
          border-radius: 4px;
          border: 1px solid #2a3f5f;
        }

        .executor-output h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #4a9eff;
        }

        .executor-output pre {
          margin: 0;
          color: #0f0;
          font-size: 12px;
          overflow-x: auto;
        }

        .tools-list {
          display: grid;
          gap: 10px;
        }

        .tool-item {
          background: #16213e;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #2a3f5f;
        }

        .tool-name {
          font-family: 'Courier New', monospace;
          margin-bottom: 5px;
        }

        .tool-server {
          color: #4a9eff;
        }

        .tool-method {
          color: #0f0;
        }

        .tool-description {
          font-size: 13px;
          color: #888;
        }
      `}</style>
    </div>
  );
};
