import React, { useState } from 'react';
import './App.css';

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [command, setCommand] = useState('');
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    const newOutput: CommandOutput = {
      id: Date.now().toString(),
      command: cmd,
      output: '',
      timestamp: new Date(),
      type: 'info'
    };

    setOutputs(prev => [...prev, newOutput]);

    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 500));

      let result = '';
      if (cmd.toUpperCase().includes('PRINT')) {
        const match = cmd.match(/PRINT\s+"([^"]+)"/i);
        result = match ? match[1] : 'OK';
      } else if (cmd.toUpperCase().includes('HELLO')) {
        result = 'Hello from SelfOS!';
      } else if (cmd.toUpperCase().includes('VERSION')) {
        result = 'SelfOS v1.0.0 - AI Vintage Operating System';
      } else if (cmd.toUpperCase().includes('HELP')) {
        result = 'Available commands: PRINT, HELLO, VERSION, HELP, CLEAR';
      } else if (cmd.toUpperCase().includes('CLEAR')) {
        setOutputs([]);
        return;
      } else {
        result = 'OK';
      }

      setOutputs(prev =>
        prev.map(output =>
          output.id === newOutput.id
            ? { ...output, output: result, type: 'success' }
            : output
        )
      );
    } catch (error) {
      setOutputs(prev =>
        prev.map(output =>
          output.id === newOutput.id
            ? { ...output, output: 'Error: Command failed', type: 'error' }
            : output
        )
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
    setCommand('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand(command);
      setCommand('');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SelfOS - AI Vintage Operating System</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '●' : '○'}
          </span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>

      <main className="app-main">
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-buttons">
              <span className="button red"></span>
              <span className="button yellow"></span>
              <span className="button green"></span>
            </div>
            <span className="terminal-title">SelfOS Terminal</span>
          </div>

          <div className="terminal-body">
            <div className="output-console">
              {outputs.length === 0 && (
                <div className="welcome-message">
                  <p>Welcome to SelfOS - AI Vintage Operating System</p>
                  <p>Type 'HELP' for available commands</p>
                  <p>Try: PRINT "Hello World"</p>
                </div>
              )}

              {outputs.map(output => (
                <div key={output.id} className={`output-line ${output.type}`}>
                  <span className="prompt">&gt;</span>
                  <span className="command">{output.command}</span>
                  {output.output && (
                    <div className="output-result">{output.output}</div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="command-input-form">
              <span className="prompt">&gt;</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter BASIC command..."
                className="command-input"
                autoFocus
              />
            </form>
          </div>
        </div>

        <div className="sidebar">
          <div className="info-panel">
            <h3>System Info</h3>
            <div className="info-item">
              <span className="label">OS:</span>
              <span className="value">SelfOS v1.0.0</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className="value">Running</span>
            </div>
            <div className="info-item">
              <span className="label">Commands:</span>
              <span className="value">{outputs.length}</span>
            </div>
          </div>

          <div className="quick-commands">
            <h3>Quick Commands</h3>
            <button onClick={() => executeCommand('PRINT "Hello World"')}>
              Hello World
            </button>
            <button onClick={() => executeCommand('VERSION')}>
              Version
            </button>
            <button onClick={() => executeCommand('HELP')}>
              Help
            </button>
            <button onClick={() => executeCommand('CLEAR')}>
              Clear
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>SelfOS - AI Vintage Operating System | Phase 6 Complete</p>
      </footer>
    </div>
  );
}

export default App;
