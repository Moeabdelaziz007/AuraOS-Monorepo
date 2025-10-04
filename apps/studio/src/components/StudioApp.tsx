/**
 * StudioApp - Main Application Component
 * 
 * The main component that orchestrates the entire AuraOS Studio experience
 * with Tabs Mode and Flow Mode support
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../stores/StudioStore';
import ContextPropagationEngine from '../ai/propagation/ContextPropagationEngine';
import AIContextualAssistant from '../ai/contextual/AIContextualAssistant';
import TabsMode from './tabs/TabsMode';
import FlowMode from './flow/FlowMode';
import VoiceDock from './VoiceDock';
import { studioPubSub } from '../stores/StudioStore';
import { createIntentRouter } from '../intent/intentRouter';

const StudioApp: React.FC = () => {
  const {
    activeMode,
    currentContext,
    isAssistantVisible,
    setCurrentContext,
    setContextAnalysis,
    setAISuggestions,
    setAIProcessing
  } = useStudioStore();

  const [cpe, setCpe] = useState<ContextPropagationEngine | null>(null);
  const [intentRouter, setIntentRouter] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Context Propagation Engine and Intent Router
  useEffect(() => {
    const sessionId = 'studio-session-' + Date.now();
    const engine = new ContextPropagationEngine(sessionId);
    const router = createIntentRouter(sessionId, engine);
    
    setCpe(engine);
    setIntentRouter(router);
    setIsInitialized(true);

    // Set up context analysis
    const analyzeContext = async () => {
      if (engine) {
        const analysis = await engine.analyzeContext();
        setContextAnalysis(analysis);
        
        // Generate AI suggestions based on analysis
        if (analysis.suggestions.length > 0) {
          setAISuggestions(analysis.suggestions.map((suggestion: string, index: number) => ({
            id: `suggestion-${index}`,
            type: 'suggestion',
            title: suggestion,
            description: `اقتراح ذكي: ${suggestion}`,
            confidence: analysis.confidence,
            action: 'suggest',
            data: { suggestion }
          })));
        }
      }
    };

    // Listen for context changes
    engine.addEventListener('context-updated', (context: any) => {
      setCurrentContext(context);
      setAIProcessing(true);
      
      // Debounce analysis
      setTimeout(() => {
        analyzeContext();
        setAIProcessing(false);
      }, 500);
    });

    return () => {
      engine.clearCache();
    };
  }, [setCurrentContext, setContextAnalysis, setAISuggestions, setAIProcessing]);

  // Set up real-time synchronization
  useEffect(() => {
    if (!isInitialized) return;

    // Listen for notes updates
    const unsubscribeNotes = studioPubSub.subscribe('notes.updated', (notes: any) => {
      console.log('Notes updated:', notes);
    });

    // Listen for code updates
    const unsubscribeCode = studioPubSub.subscribe('code.updated', (code: any) => {
      console.log('Code updated:', code);
    });

    // Listen for terminal output
    const unsubscribeTerminal = studioPubSub.subscribe('terminal.output', (output: any) => {
      console.log('Terminal output:', output);
    });

    // Listen for debug updates
    const unsubscribeDebug = studioPubSub.subscribe('debug.updated', (info: any) => {
      console.log('Debug info:', info);
    });

    // Listen for voice events
    const unsubscribeVoice = studioPubSub.subscribe('voice.intent.detected', (intent: any) => {
      console.log('Voice intent detected:', intent);
      if (intentRouter) {
        intentRouter.processIntent(intent);
      }
    });

    return () => {
      unsubscribeNotes();
      unsubscribeCode();
      unsubscribeTerminal();
      unsubscribeDebug();
      unsubscribeVoice();
    };
  }, [isInitialized]);

  const handleAIAction = (action: string, data?: any) => {
    console.log('AI Action:', action, data);
    
    switch (action) {
      case 'explain_code':
        // Handle code explanation
        break;
      case 'improve_debugging':
        // Handle debugging improvement
        break;
      case 'summarize_notes':
        // Handle notes summarization
        break;
      case 'fix_error':
        // Handle error fixing
        break;
      default:
        console.log('Unknown AI action:', action);
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    console.log('AI Suggestion:', suggestion);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل AuraOS Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeMode === 'tabs' ? (
          <motion.div
            key="tabs-mode"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <TabsMode />
          </motion.div>
        ) : (
          <motion.div
            key="flow-mode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <FlowMode />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Dock */}
      <div className="fixed top-4 left-4 z-50">
        <VoiceDock />
      </div>

      {/* AI Contextual Assistant */}
      {isAssistantVisible && currentContext && (
        <AIContextualAssistant
          context={currentContext}
          onAction={handleAIAction}
          onSuggestion={handleAISuggestion}
        />
      )}

      {/* Mode Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => useStudioStore.getState().setActiveMode(
          activeMode === 'tabs' ? 'flow' : 'tabs'
        )}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
      >
        {activeMode === 'tabs' ? 'Flow Mode' : 'Tabs Mode'}
      </motion.button>

      {/* Assistant Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => useStudioStore.getState().toggleAssistant()}
        className="fixed bottom-4 right-4 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </motion.button>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Mode: {activeMode === 'tabs' ? 'Tabs' : 'Flow'}</span>
            <span>Context: {currentContext?.context || 'None'}</span>
            <span>AI: {useStudioStore.getState().isAIProcessing ? 'Processing...' : 'Ready'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Session: {cpe?.getContextStats().totalContexts || 0} contexts</span>
            <span>•</span>
            <span>AuraOS Studio v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioApp;
