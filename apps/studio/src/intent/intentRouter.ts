/**
 * Intent Router
 * 
 * Routes voice intents to appropriate actions in AuraOS Studio
 * Integrates with CPE and Pub/Sub system for real-time coordination
 */

import { IntentResult } from '../voice/types';
import { studioPubSub } from '../stores/StudioStore';
import { useStudioStore } from '../stores/StudioStore';
import ContextPropagationEngine, { UserContext } from '../ai/propagation/ContextPropagationEngine';

export interface IntentAction {
  type: 'execute' | 'note' | 'explain' | 'navigate' | 'search';
  target: string;
  payload: any;
  context?: UserContext;
}

export class IntentRouter {
  private cpe: ContextPropagationEngine;
  private sessionId: string;
  private intentHistory: IntentResult[] = [];

  constructor(sessionId: string, cpe: ContextPropagationEngine) {
    this.sessionId = sessionId;
    this.cpe = cpe;
    this.setupEventListeners();
  }

  /**
   * Process a voice intent and route to appropriate action
   */
  public async processIntent(intent: IntentResult): Promise<IntentAction | null> {
    try {
      // Add to history
      this.intentHistory.push(intent);
      
      // Get current context
      const currentContext = this.cpe.getCurrentContext();
      
      // Analyze intent with context
      const action = await this.analyzeIntent(intent, currentContext);
      
      if (action) {
        // Execute the action
        await this.executeAction(action);
        
        // Publish intent processed event
        studioPubSub.publish('intent.processed', { intent, action });
      }
      
      return action;
    } catch (error) {
      console.error('Intent processing failed:', error);
      studioPubSub.publish('intent.error', { intent, error });
      return null;
    }
  }

  /**
   * Analyze intent with current context
   */
  private async analyzeIntent(intent: IntentResult, context: UserContext | null): Promise<IntentAction | null> {
    const text = intent.payload?.text || '';
    const lowerText = text.toLowerCase();
    
    // Get current studio state
    const studioState = useStudioStore.getState();
    
    // Route based on intent type and context
    switch (intent.type) {
      case 'execute':
        return this.handleExecuteIntent(text, context, studioState);
      
      case 'note':
        return this.handleNoteIntent(text, context, studioState);
      
      case 'explain':
        return this.handleExplainIntent(text, context, studioState);
      
      default:
        return this.handleUnknownIntent(text, context, studioState);
    }
  }

  /**
   * Handle execute intents (run code, execute commands)
   */
  private handleExecuteIntent(text: string, context: UserContext | null, studioState: any): IntentAction | null {
    // Extract code or command from text
    const codeMatch = text.match(/(?:شغّل|نفّذ|run|execute)\s+(.+)/i);
    const command = codeMatch ? codeMatch[1] : text;
    
    // Check if there's code in notes
    const notes = studioState.notes;
    let codeToExecute = '';
    
    // Look for code in notes
    for (const [noteId, content] of Object.entries(notes)) {
      if (this.isCodeContent(content as string)) {
        codeToExecute = content as string;
        break;
      }
    }
    
    // If no code found in notes, use the command directly
    if (!codeToExecute) {
      codeToExecute = command;
    }
    
    return {
      type: 'execute',
      target: 'terminal',
      payload: {
        command: codeToExecute,
        source: 'voice',
        timestamp: Date.now()
      },
      context
    };
  }

  /**
   * Handle note intents (create, update notes)
   */
  private handleNoteIntent(text: string, context: UserContext | null, studioState: any): IntentAction | null {
    // Extract note content
    const noteMatch = text.match(/(?:دوّن|اكتب|سجّل|note|write|record)\s+(.+)/i);
    const noteContent = noteMatch ? noteMatch[1] : text;
    
    // Generate note ID
    const noteId = `note_${Date.now()}`;
    
    return {
      type: 'note',
      target: 'notes',
      payload: {
        id: noteId,
        content: noteContent,
        timestamp: Date.now(),
        source: 'voice'
      },
      context
    };
  }

  /**
   * Handle explain intents (AI assistance)
   */
  private handleExplainIntent(text: string, context: UserContext | null, studioState: any): IntentAction | null {
    // Extract what to explain
    const explainMatch = text.match(/(?:اشرح|وضّح|explain|clarify)\s+(.+)/i);
    const explainTarget = explainMatch ? explainMatch[1] : text;
    
    // Get relevant content from context
    let contentToExplain = '';
    if (context?.content) {
      contentToExplain = context.content;
    } else if (context?.selectedText) {
      contentToExplain = context.selectedText;
    }
    
    return {
      type: 'explain',
      target: 'ai_assistant',
      payload: {
        query: explainTarget,
        content: contentToExplain,
        context: context?.context,
        timestamp: Date.now()
      },
      context
    };
  }

  /**
   * Handle unknown intents
   */
  private handleUnknownIntent(text: string, context: UserContext | null, studioState: any): IntentAction | null {
    // Try to infer intent from text patterns
    if (this.looksLikeCode(text)) {
      return this.handleExecuteIntent(text, context, studioState);
    } else if (this.looksLikeNote(text)) {
      return this.handleNoteIntent(text, context, studioState);
    } else {
      // Default to AI assistance
      return this.handleExplainIntent(text, context, studioState);
    }
  }

  /**
   * Execute the determined action
   */
  private async executeAction(action: IntentAction): Promise<void> {
    switch (action.type) {
      case 'execute':
        await this.executeTerminalCommand(action);
        break;
      
      case 'note':
        await this.createNote(action);
        break;
      
      case 'explain':
        await this.requestAIExplanation(action);
        break;
      
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  /**
   * Execute terminal command
   */
  private async executeTerminalCommand(action: IntentAction): Promise<void> {
    const { command } = action.payload;
    
    // Update studio state
    useStudioStore.getState().addTerminalOutput(`$ ${command}`);
    
    // Publish terminal execute event
    studioPubSub.publish('terminal.execute', {
      command,
      source: 'voice',
      timestamp: Date.now()
    });
  }

  /**
   * Create new note
   */
  private async createNote(action: IntentAction): Promise<void> {
    const { id, content } = action.payload;
    
    // Update studio state
    useStudioStore.getState().updateNotes(id, content);
    
    // Publish notes updated event
    studioPubSub.publish('notes.updated', {
      id,
      content,
      source: 'voice',
      timestamp: Date.now()
    });
  }

  /**
   * Request AI explanation
   */
  private async requestAIExplanation(action: IntentAction): Promise<void> {
    const { query, content } = action.payload;
    
    // Publish AI request event
    studioPubSub.publish('ai.request', {
      query,
      content,
      context: action.context,
      source: 'voice',
      timestamp: Date.now()
    });
  }

  /**
   * Check if content looks like code
   */
  private isCodeContent(content: string): boolean {
    const codePatterns = [
      /function\s+\w+/,
      /class\s+\w+/,
      /import\s+.*from/,
      /console\.log/,
      /def\s+\w+/,
      /if\s*\(/,
      /for\s*\(/,
      /while\s*\(/
    ];
    
    return codePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if text looks like code
   */
  private looksLikeCode(text: string): boolean {
    return this.isCodeContent(text) || text.includes('function') || text.includes('class');
  }

  /**
   * Check if text looks like a note
   */
  private looksLikeNote(text: string): boolean {
    const notePatterns = [
      /^#\s+/,  // Headers
      /^\*\s+/, // Bullet points
      /^\d+\.\s+/, // Numbered lists
      /TODO:/,
      /NOTE:/
    ];
    
    return notePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Setup event listeners for real-time coordination
   */
  private setupEventListeners(): void {
    // Listen for voice intents
    studioPubSub.subscribe('voice.intent.detected', (intent: IntentResult) => {
      this.processIntent(intent);
    });
    
    // Listen for context changes
    studioPubSub.subscribe('context.changed', (context: UserContext) => {
      // Update CPE context
      this.cpe.getCurrentContext();
    });
  }

  /**
   * Get intent history
   */
  public getIntentHistory(): IntentResult[] {
    return [...this.intentHistory];
  }

  /**
   * Clear intent history
   */
  public clearHistory(): void {
    this.intentHistory = [];
  }
}

// Factory function
export const createIntentRouter = (sessionId: string, cpe: ContextPropagationEngine): IntentRouter => {
  return new IntentRouter(sessionId, cpe);
};
