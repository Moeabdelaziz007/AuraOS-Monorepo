import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal as TerminalIcon, 
  Copy, 
  Download, 
  Trash2, 
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const terminalRef = useRef<HTMLDivElement>(null);

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

  const clearTerminal = () => {
    setOutputs([]);
  };

  const copyOutput = () => {
    const text = outputs.map(output => 
      output.command ? `$ ${output.command}\n${output.output}` : output.output
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  const downloadOutput = () => {
    const text = outputs.map(output => 
      output.command ? `$ ${output.command}\n${output.output}` : output.output
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-output-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="font-medium">Terminal</span>
          <Badge variant="outline" className="text-xs">
            {currentPath}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyOutput}
            title="Copy Output"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadOutput}
            title="Download Output"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            title="Clear Terminal"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm bg-black text-green-400"
      >
        {outputs.map((output) => (
          <div key={output.id} className="mb-2">
            {output.command && (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-green-400">$</span>
                <span className="text-white">{output.command}</span>
              </div>
            )}
            {output.output && (
              <div className={`whitespace-pre-wrap ${
                output.type === 'error' ? 'text-red-400' : 
                output.type === 'success' ? 'text-green-400' : 
                'text-gray-300'
              }`}>
                {output.output}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="border-t border-border p-3 bg-card">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-green-400 font-mono">$</span>
          <Input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none focus:ring-0 font-mono"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};
