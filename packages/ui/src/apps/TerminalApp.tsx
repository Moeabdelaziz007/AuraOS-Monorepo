import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal as TerminalIcon, 
  Copy, 
  Download, 
  Trash2, 
  Maximize2,
  Minimize2
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
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPath] = useState('/home/user');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (command.trim()) {
      executeCommand(command);
      setCommandHistory(prev => [...prev, command]);
      setHistoryIndex(-1);
      setCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (command.trim()) {
        executeCommand(command);
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(-1);
        setCommand('');
      }
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

  const highlightSyntax = (text: string) => {
    const keywords = ['PRINT', 'HELLO', 'VERSION', 'HELP', 'CLEAR', 'LS', 'PWD', 'DATE', 'LET', 'IF', 'THEN', 'GOTO', 'FOR', 'NEXT'];
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      let highlighted = line;
      
      // Highlight keywords
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        highlighted = highlighted.replace(regex, match => `<span class="text-blue-400 font-bold">${match}</span>`);
      });
      
      // Highlight strings
      highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-yellow-400">"$1"</span>');
      
      // Highlight numbers
      highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-purple-400">$1</span>');
      
      return (
        <div key={lineIndex} dangerouslySetInnerHTML={{ __html: highlighted }} />
      );
    });
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
                {highlightSyntax(output.output)}
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
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command... (↑↓ for history)"
            className="flex-1 bg-transparent border-none focus:ring-0 font-mono"
            autoFocus
          />
        </form>
        {commandHistory.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 font-mono">
            History: {commandHistory.length} commands | Use ↑↓ to navigate
          </div>
        )}
      </div>
    </div>
  );
};
