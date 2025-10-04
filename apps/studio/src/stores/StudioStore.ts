/**
 * Studio Store - Zustand Store for AuraOS Studio
 * 
 * Central state management for the entire Studio application
 * with real-time synchronization and AI integration
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { UserContext, ContextAnalysis } from '../ai/propagation/ContextPropagationEngine';

export interface StudioState {
  // UI State
  activeMode: 'tabs' | 'flow';
  activeTab: string;
  isAssistantVisible: boolean;
  isFullscreen: boolean;
  
  // Content State
  notes: Record<string, string>;
  code: Record<string, string>;
  terminalOutput: string[];
  debugInfo: any[];
  
  // AI State
  currentContext: UserContext | null;
  contextAnalysis: ContextAnalysis | null;
  aiSuggestions: any[];
  isAIProcessing: boolean;
  
  // Flow Mode State
  flowNodes: any[];
  flowEdges: any[];
  selectedNode: string | null;
  
  // Settings
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  aiProvider: 'openai' | 'anthropic' | 'local';
  
  // Actions
  setActiveMode: (mode: 'tabs' | 'flow') => void;
  setActiveTab: (tab: string) => void;
  toggleAssistant: () => void;
  toggleFullscreen: () => void;
  
  updateNotes: (id: string, content: string) => void;
  updateCode: (id: string, content: string) => void;
  addTerminalOutput: (output: string) => void;
  addDebugInfo: (info: any) => void;
  
  setCurrentContext: (context: UserContext | null) => void;
  setContextAnalysis: (analysis: ContextAnalysis | null) => void;
  setAISuggestions: (suggestions: any[]) => void;
  setAIProcessing: (processing: boolean) => void;
  
  addFlowNode: (node: any) => void;
  updateFlowNode: (id: string, updates: any) => void;
  removeFlowNode: (id: string) => void;
  addFlowEdge: (edge: any) => void;
  removeFlowEdge: (id: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'ar' | 'en') => void;
  setAIProvider: (provider: 'openai' | 'anthropic' | 'local') => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  activeMode: 'tabs' as const,
  activeTab: 'notes',
  isAssistantVisible: false,
  isFullscreen: false,
  
  notes: {},
  code: {},
  terminalOutput: [],
  debugInfo: [],
  
  currentContext: null,
  contextAnalysis: null,
  aiSuggestions: [],
  isAIProcessing: false,
  
  flowNodes: [],
  flowEdges: [],
  selectedNode: null,
  
  theme: 'auto' as const,
  language: 'ar' as const,
  aiProvider: 'openai' as const,
};

export const useStudioStore = create<StudioState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // UI Actions
    setActiveMode: (mode) => set({ activeMode: mode }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    toggleAssistant: () => set((state) => ({ isAssistantVisible: !state.isAssistantVisible })),
    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
    
    // Content Actions
    updateNotes: (id, content) => set((state) => ({
      notes: { ...state.notes, [id]: content }
    })),
    updateCode: (id, content) => set((state) => ({
      code: { ...state.code, [id]: content }
    })),
    addTerminalOutput: (output) => set((state) => ({
      terminalOutput: [...state.terminalOutput, output]
    })),
    addDebugInfo: (info) => set((state) => ({
      debugInfo: [...state.debugInfo, info]
    })),
    
    // AI Actions
    setCurrentContext: (context) => set({ currentContext: context }),
    setContextAnalysis: (analysis) => set({ contextAnalysis: analysis }),
    setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
    setAIProcessing: (processing) => set({ isAIProcessing: processing }),
    
    // Flow Mode Actions
    addFlowNode: (node) => set((state) => ({
      flowNodes: [...state.flowNodes, node]
    })),
    updateFlowNode: (id, updates) => set((state) => ({
      flowNodes: state.flowNodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    })),
    removeFlowNode: (id) => set((state) => ({
      flowNodes: state.flowNodes.filter(node => node.id !== id),
      flowEdges: state.flowEdges.filter(edge => 
        edge.source !== id && edge.target !== id
      )
    })),
    addFlowEdge: (edge) => set((state) => ({
      flowEdges: [...state.flowEdges, edge]
    })),
    removeFlowEdge: (id) => set((state) => ({
      flowEdges: state.flowEdges.filter(edge => edge.id !== id)
    })),
    setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
    
    // Settings Actions
    setTheme: (theme) => set({ theme }),
    setLanguage: (language) => set({ language }),
    setAIProvider: (provider) => set({ aiProvider: provider }),
    
    // Reset
    reset: () => set(initialState),
  }))
);

// Pub/Sub system for real-time synchronization
export class StudioPubSub {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  publish(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export const studioPubSub = new StudioPubSub();

// Real-time synchronization between components
export const setupRealtimeSync = () => {
  // Sync notes updates
  useStudioStore.subscribe(
    (state) => state.notes,
    (notes) => {
      studioPubSub.publish('notes.updated', notes);
    }
  );
  
  // Sync code updates
  useStudioStore.subscribe(
    (state) => state.code,
    (code) => {
      studioPubSub.publish('code.updated', code);
    }
  );
  
  // Sync terminal output
  useStudioStore.subscribe(
    (state) => state.terminalOutput,
    (output) => {
      studioPubSub.publish('terminal.output', output);
    }
  );
  
  // Sync debug info
  useStudioStore.subscribe(
    (state) => state.debugInfo,
    (info) => {
      studioPubSub.publish('debug.updated', info);
    }
  );
  
  // Sync context changes
  useStudioStore.subscribe(
    (state) => state.currentContext,
    (context) => {
      studioPubSub.publish('context.changed', context);
    }
  );
  
  // Sync AI suggestions
  useStudioStore.subscribe(
    (state) => state.aiSuggestions,
    (suggestions) => {
      studioPubSub.publish('ai.suggestions', suggestions);
    }
  );
};

// Initialize real-time sync
setupRealtimeSync();

export default useStudioStore;
