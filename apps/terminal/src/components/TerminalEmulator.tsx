import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalConfig, Command, CommandResult, EmulatorState } from '../types';
import { useTerminal } from '../hooks/useTerminal';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { useAutoComplete } from '../hooks/useAutoComplete';

interface TerminalEmulatorProps {
  config: TerminalConfig;
  onCommand?: (command: string) => Promise<CommandResult>;
  onEmulatorStateChange?: (state: EmulatorState) => void;
}

export const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({
  config,
  onCommand,
  onEmulatorStateChange
}) => {
  const [currentLine, setCurrentLine] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    output,
    addOutput,
    clearOutput,
    getCurrentDirectory,
    setCurrentDirectory
  } = useTerminal();

  const {
    history,
    addToHistory,
    getPreviousCommand,
    getNextCommand,
    searchHistory
  } = useCommandHistory();

  const {
    suggestions,
    getSuggestions,
    clearSuggestions
  } = useAutoComplete();

  // Focus terminal on mount
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  }, []);

  // Handle command execution
  const executeCommand = useCallback(async (commandText: string) => {
    if (!commandText.trim()) return;

    setIsExecuting(true);
    addToHistory(commandText);
    addOutput(`$ ${commandText}`);

    try {
      const result = onCommand ? await onCommand(commandText) : {
        output: `Command not implemented: ${commandText}`,
        exitCode: 1,
        duration: 0
      };

      if (result.output) {
        addOutput(result.output);
      }

      if (result.error) {
        addOutput(`Error: ${result.error}`);
      }

      addOutput(`Exit code: ${result.exitCode}`);
    } catch (error) {
      addOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
      setCurrentLine('');
      setCursorPosition(0);
    }
  }, [onCommand, addToHistory, addOutput]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        executeCommand(currentLine);
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevCmd = getPreviousCommand();
        if (prevCmd) {
          setCurrentLine(prevCmd);
          setCursorPosition(prevCmd.length);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        const nextCmd = getNextCommand();
        if (nextCmd) {
          setCurrentLine(nextCmd);
          setCursorPosition(nextCmd.length);
        } else {
          setCurrentLine('');
          setCursorPosition(0);
        }
        break;

      case 'Tab':
        e.preventDefault();
        if (suggestions.length > 0) {
          setCurrentLine(suggestions[0]);
          setCursorPosition(suggestions[0].length);
          clearSuggestions();
        } else {
          const suggestions = getSuggestions(currentLine);
          if (suggestions.length > 0) {
            setCurrentLine(suggestions[0]);
            setCursorPosition(suggestions[0].length);
          }
        }
        break;

      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          clearOutput();
        }
        break;

      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          setIsExecuting(false);
          addOutput('^C');
        }
        break;
    }
  }, [currentLine, executeCommand, getPreviousCommand, getNextCommand, suggestions, getSuggestions, clearSuggestions, clearOutput]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentLine(value);
    setCursorPosition(value.length);
    
    // Get suggestions for auto-complete
    if (value.trim()) {
      getSuggestions(value);
    } else {
      clearSuggestions();
    }
  }, [getSuggestions, clearSuggestions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div 
      ref={terminalRef}
      className="terminal-emulator"
      style={{
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        backgroundColor: config.theme.background,
        color: config.theme.foreground,
        cursor: config.cursorBlink ? 'blink' : 'default'
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Output */}
      <div className="terminal-output">
        {output.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
      </div>

      {/* Current Directory */}
      <div className="terminal-prompt">
        <span className="prompt-user">user</span>
        <span className="prompt-separator">@</span>
        <span className="prompt-host">auraos</span>
        <span className="prompt-separator">:</span>
        <span className="prompt-path">{getCurrentDirectory()}</span>
        <span className="prompt-separator">$</span>
        <span className="prompt-cursor"> </span>
      </div>

      {/* Input Line */}
      <div className="terminal-input">
        <input
          ref={inputRef}
          type="text"
          value={currentLine}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          className="terminal-input-field"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: config.theme.foreground,
            fontFamily: config.fontFamily,
            fontSize: `${config.fontSize}px`,
            width: '100%'
          }}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Auto-complete Suggestions */}
      {suggestions.length > 0 && (
        <div className="terminal-suggestions">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="terminal-suggestion"
              onClick={() => {
                setCurrentLine(suggestion);
                setCursorPosition(suggestion.length);
                clearSuggestions();
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
