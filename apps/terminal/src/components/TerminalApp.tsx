/**
 * Terminal App
 * Main AI-powered terminal application
 */

import React, { useCallback, useState } from 'react';
import { TerminalEmulator } from './TerminalEmulator';
import { CommandParser } from '../commands/CommandParser';
import { ClientCommands } from '../commands/ClientCommands';
import { AICommandExecutor } from '../commands/AICommandExecutor';
import { useMCP } from '@auraos/hooks';
import { TerminalConfig, CommandResult } from '../types';

const defaultConfig: TerminalConfig = {
  rows: 24,
  cols: 80,
  fontSize: 14,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
  theme: {
    name: 'default',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#ffffff',
    selection: '#264f78',
    colors: {
      black: '#000000',
      red: '#cd3131',
      green: '#0dbc79',
      yellow: '#e5e510',
      blue: '#2472c8',
      magenta: '#bc3fbc',
      cyan: '#11a8cd',
      white: '#e5e5e5',
      brightBlack: '#666666',
      brightRed: '#f14c4c',
      brightGreen: '#23d18b',
      brightYellow: '#f5f543',
      brightBlue: '#3b8eea',
      brightMagenta: '#d670d6',
      brightCyan: '#29b8db',
      brightWhite: '#ffffff',
    },
  },
  cursorBlink: true,
  scrollback: 1000,
};

export const TerminalApp: React.FC = () => {
  const mcp = useMCP();
  const [config] = useState<TerminalConfig>(defaultConfig);
  const [clientCommands] = useState(() => new ClientCommands());
  const [aiExecutor] = useState(() => new AICommandExecutor(mcp as any));

  // Handle command execution
  const handleCommand = useCallback(async (commandText: string): Promise<CommandResult> => {
    const parsed = CommandParser.parse(commandText);
    const commandType = CommandParser.getCommandType(commandText);

    try {
      // Check if MCP is initialized for AI commands
      if (commandType !== 'client' && !mcp.initialized) {
        return {
          output: 'Initializing AI assistant...',
          exitCode: 0,
          duration: 0,
        };
      }

      // Route command based on type
      switch (commandType) {
        case 'client':
          // Execute client-side command
          return await clientCommands.execute(parsed, {
            clearOutput: () => {}, // Will be handled by TerminalEmulator
            getHistory: () => [], // Will be handled by TerminalEmulator
          });

        case 'natural':
          // Execute natural language command via AI
          return await aiExecutor.executeNaturalLanguage(commandText);

        case 'system':
          // Execute system command
          return await aiExecutor.executeSystemCommand(parsed);

        default:
          return {
            output: `Unknown command: ${commandText}`,
            exitCode: 1,
            duration: 0,
          };
      }
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        duration: 0,
        error: error instanceof Error ? error.message : 'Command execution failed',
      };
    }
  }, [mcp, clientCommands, aiExecutor]);

  // Show loading state while MCP initializes
  if (!mcp.initialized && mcp.loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: config.theme.background,
        color: config.theme.foreground,
        fontFamily: config.fontFamily,
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🚀</div>
          <div>Initializing AI Terminal Assistant...</div>
        </div>
      </div>
    );
  }

  // Show error state if MCP failed to initialize
  if (mcp.error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: config.theme.background,
        color: config.theme.colors.red,
        fontFamily: config.fontFamily,
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>❌</div>
          <div>Failed to initialize AI assistant</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            {mcp.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: config.theme.background,
    }}>
      {/* Terminal Header */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottom: `1px solid ${config.theme.colors.brightBlack}`,
        color: config.theme.foreground,
        fontFamily: config.fontFamily,
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>AuraOS Terminal</span>
          <span style={{ marginLeft: '16px', opacity: 0.7 }}>
            AI-Powered Assistant
          </span>
        </div>
        <div style={{ opacity: 0.7 }}>
          Type 'help' for commands
        </div>
      </div>

      {/* Terminal Emulator */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TerminalEmulator
          config={config}
          onCommand={handleCommand}
        />
      </div>

      {/* Terminal Footer */}
      <div style={{
        padding: '4px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTop: `1px solid ${config.theme.colors.brightBlack}`,
        color: config.theme.foreground,
        fontFamily: config.fontFamily,
        fontSize: '10px',
        opacity: 0.5,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <div>
          {mcp.loading ? '⏳ Processing...' : '✓ Ready'}
        </div>
        <div>
          MCP: {mcp.initialized ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
};
