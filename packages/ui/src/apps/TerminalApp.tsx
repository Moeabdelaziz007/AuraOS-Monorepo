import React, { useState } from 'react';

/**
 * Terminal App
 * Integrates the BASIC interpreter from SelfOS
 */

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

export const TerminalApp: React.FC = () => {
  const [command, setCommand] = useState('');
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    {
      id: '0',
      command: '',
      output: 'AuraOS Terminal v1.0\nType HELP for available commands',
      timestamp: new Date(),
      type: 'info',
    },
  ]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    const newOutput: CommandOutput = {
      id: Date.now().toString(),
      command: cmd,
      output: '',
      timestamp: new Date(),
      type: 'info',
    };

    setOutputs((prev) => [...prev, newOutput]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      let result = '';
      const upperCmd = cmd.toUpperCase();

      if (upperCmd.includes('PRINT')) {
        const match = cmd.match(/PRINT\s+"([^"]+)"/i) || cmd.match(/PRINT\s+(.+)/i);
        result = match ? match[1] : 'OK';
      } else if (upperCmd.includes('HELLO')) {
        result = 'Hello from AuraOS!';
      } else if (upperCmd.includes('VERSION')) {
        result = 'AuraOS v1.0.0 - AI Vintage Operating System';
      } else if (upperCmd.includes('HELP')) {
        result = `Available commands:
PRINT "text" - Print text
HELLO - Greeting
VERSION - Show version
HELP - Show this help
CLEAR - Clear screen
LS - List files
PWD - Current directory
DATE - Show date/time`;
      } else if (upperCmd.includes('CLEAR')) {
        setOutputs([]);
        return;
      } else if (upperCmd.includes('LS')) {
        result = `documents/
downloads/
pictures/
projects/
README.md
config.json`;
      } else if (upperCmd.includes('PWD')) {
        result = '/home/user';
      } else if (upperCmd.includes('DATE')) {
        result = new Date().toString();
      } else {
        result = 'OK';
      }

      setOutputs((prev) =>
        prev.map((output) =>
          output.id === newOutput.id
            ? { ...output, output: result, type: 'success' }
            : output
        )
      );
    } catch (error) {
      setOutputs((prev) =>
        prev.map((output) =>
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
    <div className="app-container terminal-app">
      <div className="terminal-output">
        {outputs.map((output) => (
          <div key={output.id} className={`terminal-line ${output.type}`}>
            {output.command && (
              <div className="terminal-command">
                <span className="prompt">$</span> {output.command}
              </div>
            )}
            {output.output && (
              <div className="terminal-result">{output.output}</div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="terminal-input-form">
        <span className="prompt">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          className="terminal-input"
          autoFocus
        />
      </form>
    </div>
  );
};
