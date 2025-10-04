/**
 * TabsMode - Traditional Tab-based Interface
 * 
 * The classic interface with tabs for Notes, Terminal, and Debugger
 * with AI integration in each tab
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../stores/StudioStore';
import { studioPubSub } from '../../stores/StudioStore';
import { FileText, Terminal, Bug, Settings, Bot, Mic } from 'lucide-react';
import NotesPanel from './NotesPanel';
import TerminalPanel from './TerminalPanel';
import DebuggerPanel from './DebuggerPanel';
import SettingsPanel from './SettingsPanel';

const TabsMode: React.FC = () => {
  const { activeTab, setActiveTab } = useStudioStore();
  const [tabs] = useState([
    { id: 'notes', label: 'الملاحظات', icon: FileText },
    { id: 'terminal', label: 'الطرفية', icon: Terminal },
    { id: 'debugger', label: 'المصحح', icon: Bug },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ]);

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'notes':
        return <NotesPanel />;
      case 'terminal':
        return <TerminalPanel />;
      case 'debugger':
        return <DebuggerPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <NotesPanel />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              whileHover={{ backgroundColor: isActive ? '#f3f4f6' : '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {/* AI Indicator */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
        
        {/* AI Assistant Tab */}
        <motion.button
          whileHover={{ backgroundColor: '#f9fafb' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => useStudioStore.getState().toggleAssistant()}
          className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-auto"
        >
          <Bot className="w-4 h-4" />
          <span>المساعد الذكي</span>
        </motion.button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderActivePanel()}
        </motion.div>
      </div>
    </div>
  );
};

export default TabsMode;
