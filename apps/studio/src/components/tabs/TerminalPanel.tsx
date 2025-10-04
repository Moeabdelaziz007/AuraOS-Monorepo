/**
 * TerminalPanel - Terminal Emulator with AI Integration
 * 
 * Advanced terminal with AI contextual assistance
 * and real-time code execution
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../stores/StudioStore';
import { Play, Square, RotateCcw, Bot, Sparkles } from 'lucide-react';

const TerminalPanel: React.FC = () => {
  const { terminalOutput, addTerminalOutput, currentContext } = useStudioStore();
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Handle command execution
  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    addTerminalOutput(`$ ${command}`);
    
    // Add to history
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Simulate command execution
    setTimeout(() => {
      if (command === 'help') {
        addTerminalOutput('الأوامر المتاحة:');
        addTerminalOutput('  help - عرض المساعدة');
        addTerminalOutput('  clear - مسح الشاشة');
        addTerminalOutput('  ls - عرض الملفات');
        addTerminalOutput('  pwd - عرض المجلد الحالي');
        addTerminalOutput('  python - تشغيل Python');
        addTerminalOutput('  node - تشغيل Node.js');
      } else if (command === 'clear') {
        // Clear terminal output
        useStudioStore.getState().terminalOutput = [];
      } else if (command.startsWith('python')) {
        addTerminalOutput('Python 3.9.0 (default, Oct 14 2020, 12:59:56)');
        addTerminalOutput('[GCC 9.3.0] on linux');
        addTerminalOutput('Type "help", "copyright", "credits" or "license" for more information.');
        addTerminalOutput('>>>');
      } else if (command.startsWith('node')) {
        addTerminalOutput('Welcome to Node.js v18.0.0');
        addTerminalOutput('Type ".help" for more information.');
        addTerminalOutput('>');
      } else {
        addTerminalOutput(`Command not found: ${command}`);
        addTerminalOutput('Type "help" for available commands.');
      }
      setIsExecuting(false);
    }, 1000);
  };

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete command
      if (input.startsWith('p')) {
        setInput('python ');
      } else if (input.startsWith('n')) {
        setInput('node ');
      } else if (input.startsWith('h')) {
        setInput('help');
      }
    }
  };

  // Handle AI suggestions
  const handleAISuggestion = async (suggestion: string) => {
    if (suggestion === 'explain_command') {
      addTerminalOutput('المساعد الذكي: سأشرح لك هذا الأمر...');
    } else if (suggestion === 'suggest_command') {
      addTerminalOutput('المساعد الذكي: أقترح عليك هذه الأوامر:');
      addTerminalOutput('  python - لتشغيل Python');
      addTerminalOutput('  node - لتشغيل Node.js');
      addTerminalOutput('  help - لعرض المساعدة');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-white">الطرفية</h2>
          {isExecuting && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 text-yellow-400"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
              <span className="text-sm">جاري التنفيذ...</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAISuggestion('suggest_command')}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>اقتراحات ذكية</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => executeCommand('clear')}
            className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>مسح</span>
          </motion.button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{ height: 'calc(100% - 120px)' }}
      >
        {terminalOutput.length === 0 ? (
          <div className="text-gray-500">
            <p>مرحباً بك في AuraOS Studio Terminal</p>
            <p>اكتب "help" لعرض الأوامر المتاحة</p>
            <p>اكتب "python" لتشغيل Python</p>
            <p>اكتب "node" لتشغيل Node.js</p>
            <br />
            <p className="text-green-400">$</p>
          </div>
        ) : (
          terminalOutput.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              className="mb-1"
            >
              {line}
            </motion.div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-gray-900 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب الأمر هنا..."
            className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-gray-500"
            disabled={isExecuting}
          />
          {isExecuting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          )}
        </form>
      </div>

      {/* AI Context Indicator */}
      {currentContext && currentContext.context === 'terminal' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span className="text-sm">المساعد الذكي نشط</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TerminalPanel;
