/**
 * NotesPanel - Notes Editor with AI Integration
 * 
 * Advanced notes editor with AI contextual assistance
 * and real-time synchronization
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../stores/StudioStore';
import { Save, Share, Download, Upload, Sparkles, Bot } from 'lucide-react';

const NotesPanel: React.FC = () => {
  const { notes, updateNotes, currentContext } = useStudioStore();
  const [activeNote, setActiveNote] = useState<string>('default');
  const [content, setContent] = useState<string>(notes[activeNote] || '');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update content when active note changes
  useEffect(() => {
    setContent(notes[activeNote] || '');
  }, [activeNote, notes]);

  // Save content to store
  useEffect(() => {
    if (content !== notes[activeNote]) {
      updateNotes(activeNote, content);
    }
  }, [content, activeNote, updateNotes, notes]);

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Handle AI suggestions
  const handleAISuggestion = async (suggestion: string) => {
    setIsAIProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      if (suggestion === 'summarize_notes') {
        const summary = `ملخص ذكي للملاحظات:\n\n${content.substring(0, 100)}...`;
        setContent(content + '\n\n' + summary);
      } else if (suggestion === 'organize_notes') {
        const organized = `# ${content.split('\n')[0]}\n\n${content}`;
        setContent(organized);
      }
      setIsAIProcessing(false);
    }, 1000);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          // Save note
          break;
        case 'n':
          e.preventDefault();
          // New note
          break;
        case 'f':
          e.preventDefault();
          // Find in notes
          break;
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">الملاحظات</h2>
          {isAIProcessing && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 text-blue-600"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">جاري المعالجة...</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAISuggestion('summarize_notes')}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>تلخيص ذكي</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAISuggestion('organize_notes')}
            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>تنظيم ذكي</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ</span>
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">الملاحظات</h3>
            <div className="space-y-2">
              {Object.keys(notes).map((noteId) => (
                <motion.button
                  key={noteId}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNote(noteId)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    activeNote === noteId
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {noteId === 'default' ? 'ملاحظة جديدة' : noteId}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <motion.textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="ابدأ بكتابة ملاحظاتك هنا... المساعد الذكي سيساعدك في التنظيم والتحسين"
              className="w-full h-full resize-none border-none outline-none text-gray-800 leading-relaxed"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
          </div>
          
          {/* Status Bar */}
          <div className="border-t border-gray-200 px-4 py-2 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>الملاحظة: {activeNote}</span>
              <span>الأحرف: {content.length}</span>
              <span>الأسطر: {content.split('\n').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Context Indicator */}
      {currentContext && currentContext.context === 'note_editor' && (
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

export default NotesPanel;
