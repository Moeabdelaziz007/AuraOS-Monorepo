import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { executeCommand } from '../core/commandExecutor';
import { useTerminalStore } from '../store/terminalStore';
import 'xterm/css/xterm.css';
import './Terminal.css';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const { addToHistory, history } = useTerminalStore();
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Fira Code", "Courier New", monospace',
      theme: {
        background: '#0a0e14',
        foreground: '#b3b1ad',
        cursor: '#ffcc66',
        black: '#01060e',
        red: '#ea6c73',
        green: '#91b362',
        yellow: '#f9af4f',
        blue: '#53bdfa',
        magenta: '#fae994',
        cyan: '#90e1c6',
        white: '#c7c7c7',
        brightBlack: '#686868',
        brightRed: '#f07178',
        brightGreen: '#c2d94c',
        brightYellow: '#ffb454',
        brightBlue: '#59c2ff',
        brightMagenta: '#ffee99',
        brightCyan: '#95e6cb',
        brightWhite: '#ffffff',
      },
      rows: 30,
      cols: 100,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;36m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║                                                              ║\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m              \x1b[1;33m⚡ Welcome to AuraOS Terminal ⚡\x1b[0m              \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m║                                                              ║\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m          \x1b[1;32mAI-Powered Command Line Interface\x1b[0m             \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m║                                                              ║\x1b[0m');
    term.writeln('\x1b[1;36m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1;33mType "help" for available commands\x1b[0m');
    term.writeln('');
    
    writePrompt(term);

    // Handle input
    term.onData((data) => {
      handleTerminalInput(term, data);
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const writePrompt = (term: XTerm) => {
    term.write('\r\n\x1b[1;32maura@os\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
  };

  const handleTerminalInput = async (term: XTerm, data: string) => {
    const code = data.charCodeAt(0);

    // Handle Enter
    if (code === 13) {
      term.write('\r\n');
      
      if (currentLine.trim()) {
        addToHistory(currentLine);
        
        try {
          const result = await executeCommand(currentLine.trim());
          
          if (result.type === 'error') {
            term.write(`\x1b[1;31m${result.message}\x1b[0m\r\n`);
          } else if (result.type === 'success') {
            term.write(`\x1b[1;32m${result.message}\x1b[0m\r\n`);
          } else {
            term.write(`${result.message}\r\n`);
          }
        } catch (error) {
          term.write(`\x1b[1;31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m\r\n`);
        }
      }
      
      setCurrentLine('');
      setCursorPosition(0);
      setHistoryIndex(-1);
      writePrompt(term);
      return;
    }

    // Handle Backspace
    if (code === 127) {
      if (cursorPosition > 0) {
        const newLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
        setCurrentLine(newLine);
        setCursorPosition(cursorPosition - 1);
        term.write('\b \b');
      }
      return;
    }

    // Handle Up Arrow (previous command)
    if (data === '\x1b[A') {
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const cmd = history[history.length - 1 - newIndex];
        
        // Clear current line
        term.write('\r\x1b[K');
        writePrompt(term);
        term.write(cmd);
        
        setCurrentLine(cmd);
        setCursorPosition(cmd.length);
        setHistoryIndex(newIndex);
      }
      return;
    }

    // Handle Down Arrow (next command)
    if (data === '\x1b[B') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const cmd = history[history.length - 1 - newIndex];
        
        // Clear current line
        term.write('\r\x1b[K');
        writePrompt(term);
        term.write(cmd);
        
        setCurrentLine(cmd);
        setCursorPosition(cmd.length);
        setHistoryIndex(newIndex);
      } else if (historyIndex === 0) {
        // Clear line
        term.write('\r\x1b[K');
        writePrompt(term);
        setCurrentLine('');
        setCursorPosition(0);
        setHistoryIndex(-1);
      }
      return;
    }

    // Handle Ctrl+C
    if (code === 3) {
      term.write('^C\r\n');
      setCurrentLine('');
      setCursorPosition(0);
      writePrompt(term);
      return;
    }

    // Handle Ctrl+L (clear screen)
    if (code === 12) {
      term.clear();
      writePrompt(term);
      return;
    }

    // Handle regular characters
    if (code >= 32 && code < 127) {
      const newLine = currentLine.slice(0, cursorPosition) + data + currentLine.slice(cursorPosition);
      setCurrentLine(newLine);
      setCursorPosition(cursorPosition + 1);
      term.write(data);
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-button close"></span>
          <span className="terminal-button minimize"></span>
          <span className="terminal-button maximize"></span>
        </div>
        <div className="terminal-title">AuraOS Terminal</div>
      </div>
      <div ref={terminalRef} className="terminal-body" />
    </div>
  );
};

export default Terminal;
