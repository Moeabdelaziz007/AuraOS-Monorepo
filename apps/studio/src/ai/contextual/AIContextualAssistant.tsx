/**
 * AIContextualAssistant - The 🤖 Helper Component
 * 
 * This is the core AI assistant that provides contextual help
 * in every part of the AuraOS Studio interface.
 * 
 * Features:
 * - Context-aware suggestions
 * - Real-time code analysis
 * - Smart error explanations
 * - Proactive assistance
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface AIContextualAssistantProps {
  context: {
    activeElement: string;
    context: string;
    content: string;
    cursorPosition?: { line: number; column: number };
    selectedText?: string;
  };
  onSuggestion?: (suggestion: string) => void;
  onAction?: (action: string, data?: any) => void;
  className?: string;
}

interface AISuggestion {
  id: string;
  type: 'explanation' | 'suggestion' | 'fix' | 'enhancement';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  data?: any;
}

export const AIContextualAssistant: React.FC<AIContextualAssistantProps> = ({
  context,
  onSuggestion,
  onAction,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const assistantRef = useRef<HTMLDivElement>(null);

  // Analyze context and generate suggestions
  useEffect(() => {
    if (!context.content || context.content.trim().length === 0) {
      setSuggestions([]);
      setIsVisible(false);
      return;
    }

    setIsAnalyzing(true);
    setIsVisible(true);

    // Simulate AI analysis (replace with real AI integration)
    setTimeout(() => {
      const newSuggestions = generateContextualSuggestions(context);
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 1000);
  }, [context]);

  const generateContextualSuggestions = (ctx: typeof context): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];

    // Code analysis suggestions
    if (ctx.context === 'python_code' || ctx.context === 'javascript_code') {
      suggestions.push({
        id: 'code-explanation',
        type: 'explanation',
        title: 'شرح الكود',
        description: 'أريد شرح هذا الكود بالتفصيل',
        confidence: 0.9,
        action: 'explain_code',
        data: { code: ctx.content }
      });

      // Check for potential issues
      if (ctx.content.includes('console.log') || ctx.content.includes('print')) {
        suggestions.push({
          id: 'debug-suggestion',
          type: 'suggestion',
          title: 'تحسين التصحيح',
          description: 'يمكن استخدام أدوات تصحيح أفضل',
          confidence: 0.8,
          action: 'improve_debugging'
        });
      }
    }

    // Notes suggestions
    if (ctx.context === 'notes' && ctx.content.length > 100) {
      suggestions.push({
        id: 'summarize-notes',
        type: 'enhancement',
        title: 'تلخيص الملاحظات',
        description: 'إنشاء ملخص ذكي للملاحظات',
        confidence: 0.85,
        action: 'summarize_notes'
      });
    }

    // Error detection
    if (ctx.content.includes('error') || ctx.content.includes('Error')) {
      suggestions.push({
        id: 'error-fix',
        type: 'fix',
        title: 'إصلاح الخطأ',
        description: 'تحليل وإصلاح الخطأ المكتشف',
        confidence: 0.95,
        action: 'fix_error'
      });
    }

    return suggestions;
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (onAction && suggestion.action) {
      onAction(suggestion.action, suggestion.data);
    }
    if (onSuggestion) {
      onSuggestion(suggestion.description);
    }
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'explanation':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'suggestion':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'fix':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'enhancement':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bot className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'explanation':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'suggestion':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'fix':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'enhancement':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={assistantRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">المساعد الذكي</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            {isAnalyzing ? (
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">جاري التحليل...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  اقتراحات ذكية بناءً على السياق:
                </p>
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${getSuggestionColor(suggestion.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${suggestion.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Bot className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  ابدأ بالكتابة لأحصل على اقتراحات ذكية
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIContextualAssistant;
