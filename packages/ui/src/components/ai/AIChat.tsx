/**
 * AI Chat Component
 * Interactive chat interface for AuraOS AI Assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { MCPGateway } from '../../../../ai/src/mcp/gateway';
import { createAIAssistant, IAIAssistant, AIAssistantConfig } from '../../../../ai/src/assistant-factory';
import { FileSystemMCPServer } from '../../../../core/src/mcp/filesystem';
import { EmulatorControlMCPServer } from '../../../../core/src/mcp/emulator';
import './AIChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface AIChatProps {
  className?: string;
  onError?: (error: Error) => void;
  aiConfig?: AIAssistantConfig;
}

export const AIChat: React.FC<AIChatProps> = ({ className = '', onError, aiConfig }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'Welcome to AuraOS AI Assistant! I can help you with file operations, emulator control, and more. Try asking me to create a file or list directories.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistant, setAssistant] = useState<IAIAssistant | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize AI Assistant
  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        // Create MCP Gateway
        const gateway = new MCPGateway({
          maxServers: 10,
          requestTimeout: 30000,
          enableLogging: true,
        });

        // Register MCP servers
        const fsServer = new FileSystemMCPServer('/tmp/auraos-workspace');
        const emuServer = new EmulatorControlMCPServer();

        await gateway.registerServer(fsServer);
        await gateway.registerServer(emuServer);

        // Determine AI provider configuration
        const config: AIAssistantConfig = aiConfig || {
          provider: (process.env.AI_PROVIDER as 'anthropic' | 'vllm') || 'anthropic',
          ...(process.env.AI_PROVIDER === 'vllm'
            ? {
                vllmUrl: process.env.VLLM_URL || 'http://localhost:8000/v1',
                modelName: process.env.VLLM_MODEL || 'meta-llama/Llama-3.1-8B-Instruct',
              }
            : {
                apiKey: process.env.ANTHROPIC_API_KEY,
              }),
        };

        // Create AI Assistant using factory
        const aiAssistant = await createAIAssistant(gateway, config);

        setAssistant(aiAssistant);
        setProviderName(config.provider === 'vllm' ? 'vLLM (Self-Hosted)' : 'Anthropic Claude');
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize AI Assistant';
        setError(errorMessage);
        if (onError && err instanceof Error) {
          onError(err);
        }
        console.error('Failed to initialize AI Assistant:', err);
      }
    };

    initializeAssistant();

    // Cleanup on unmount
    return () => {
      // Gateway cleanup would go here if needed
    };
  }, [onError, aiConfig]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !assistant || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: `${Date.now()}-loading`,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Call AI Assistant
      const response = await assistant.chat(userMessage.content);

      // Remove loading message and add actual response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...filtered,
          {
            id: `${Date.now()}-response`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          },
        ];
      });
    } catch (err) {
      // Remove loading message and add error message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...filtered,
          {
            id: `${Date.now()}-error`,
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
            timestamp: new Date(),
          },
        ];
      });

      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '0',
        role: 'system',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date(),
      },
    ]);
    if (assistant) {
      assistant.clearHistory();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`ai-chat ${className}`}>
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <span className="ai-icon">🤖</span>
          <div className="title-content">
            <h3>AI Assistant</h3>
            {providerName && <span className="provider-name">{providerName}</span>}
          </div>
          {isInitialized && (
            <span className="status-badge online">Online</span>
          )}
          {!isInitialized && !error && (
            <span className="status-badge loading">Initializing...</span>
          )}
          {error && (
            <span className="status-badge error">Error</span>
          )}
        </div>
        <button
          className="clear-button"
          onClick={handleClearChat}
          disabled={!isInitialized || isLoading}
          title="Clear chat"
        >
          🗑️
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="ai-chat-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Messages */}
      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message message-${message.role} ${message.isLoading ? 'loading' : ''}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : message.role === 'assistant' ? '🤖' : 'ℹ️'}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI Assistant' : 'System'}
                </span>
                <span className="message-time">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="message-text">
                {message.isLoading ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <pre>{message.content}</pre>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-chat-input">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isInitialized
              ? 'Ask me anything... (e.g., "Create a file called hello.txt")'
              : 'Initializing AI Assistant...'
          }
          disabled={!isInitialized || isLoading}
          className="chat-input"
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || !isInitialized || isLoading}
          className="send-button"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>

      {/* Quick Actions */}
      {isInitialized && messages.length === 1 && (
        <div className="quick-actions">
          <button
            onClick={() => setInput('List all files in the current directory')}
            className="quick-action-button"
          >
            📁 List Files
          </button>
          <button
            onClick={() => setInput('Create a new CPU emulator')}
            className="quick-action-button"
          >
            💻 Create Emulator
          </button>
          <button
            onClick={() => setInput('What tools do you have available?')}
            className="quick-action-button"
          >
            🔧 Show Tools
          </button>
        </div>
      )}
    </div>
  );
};

export default AIChat;
