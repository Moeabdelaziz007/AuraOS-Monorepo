import { Plugin, PluginAPI } from '@selfos/plugin-sdk';

export interface CustomAIConfig {
  name: string;
  personality: string;
  knowledgeBase: string[];
  specializations: string[];
  responseStyle: 'formal' | 'casual' | 'technical' | 'creative';
  maxContextLength: number;
  learningEnabled: boolean;
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  confidence: number;
  lastUpdated: number;
  tags: string[];
}

export class CustomAIAgentPlugin implements Plugin {
  name = 'custom-ai-agent';
  version = '1.0.0';
  description = 'Custom AI agent with specialized knowledge and personality';

  private api: PluginAPI;
  private config: CustomAIConfig;
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map();
  private conversationHistory: Array<{role: string, content: string, timestamp: number}> = [];
  private learningData: Map<string, number> = new Map();

  constructor(config: CustomAIConfig, api: PluginAPI) {
    this.config = config;
    this.api = api;
    this.loadKnowledgeBase();
  }

  async initialize(): Promise<void> {
    console.log(`Custom AI Agent "${this.config.name}" initialized`);

    // Register AI agent
    this.api.registerAIAgent({
      name: this.config.name,
      description: `Specialized AI agent: ${this.config.personality}`,
      handler: async (query: string, context?: any) => {
        return await this.processQuery(query, context);
      }
    });

    // Register knowledge management commands
    this.api.registerCommand('learn', {
      description: 'Add knowledge to the custom agent',
      handler: async (args: string[]) => {
        if (args.length < 2) {
          return 'Usage: learn <topic> <content>';
        }

        const [topic, ...contentParts] = args;
        const content = contentParts.join(' ');

        await this.addKnowledge(topic, content);
        return `Learned: ${topic}`;
      }
    });

    this.api.registerCommand('forget', {
      description: 'Remove knowledge from the custom agent',
      handler: async (args: string[]) => {
        if (args.length === 0) {
          return 'Usage: forget <topic>';
        }

        const topic = args[0];
        const removed = this.removeKnowledge(topic);

        if (removed) {
          return `Forgot: ${topic}`;
        } else {
          return `Topic not found: ${topic}`;
        }
      }
    });

    this.api.registerCommand('knowledge', {
      description: 'List all knowledge topics',
      handler: async () => {
        const topics = Array.from(this.knowledgeBase.keys());
        return `Knowledge topics: ${topics.join(', ')}`;
      }
    });

    this.api.registerCommand('personality', {
      description: 'Get or set agent personality',
      handler: async (args: string[]) => {
        if (args.length === 0) {
          return `Current personality: ${this.config.personality}`;
        }

        const newPersonality = args.join(' ');
        this.config.personality = newPersonality;
        await this.saveConfig();

        return `Personality updated to: ${newPersonality}`;
      }
    });

    this.api.registerCommand('specialize', {
      description: 'Add specialization to the agent',
      handler: async (args: string[]) => {
        if (args.length === 0) {
          return `Current specializations: ${this.config.specializations.join(', ')}`;
        }

        const specialization = args.join(' ');
        if (!this.config.specializations.includes(specialization)) {
          this.config.specializations.push(specialization);
          await this.saveConfig();
          return `Added specialization: ${specialization}`;
        } else {
          return `Specialization already exists: ${specialization}`;
        }
      }
    });

    // Register conversation commands
    this.api.registerCommand('chat', {
      description: 'Start a conversation with the custom agent',
      handler: async (args: string[]) => {
        if (args.length === 0) {
          return 'Usage: chat <message>';
        }

        const message = args.join(' ');
        const response = await this.processQuery(message);

        // Add to conversation history
        this.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: Date.now()
        });

        this.conversationHistory.push({
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        });

        // Keep only recent history
        if (this.conversationHistory.length > this.config.maxContextLength) {
          this.conversationHistory = this.conversationHistory.slice(-this.config.maxContextLength);
        }

        return response;
      }
    });

    this.api.registerCommand('history', {
      description: 'Show conversation history',
      handler: async () => {
        if (this.conversationHistory.length === 0) {
          return 'No conversation history';
        }

        return this.conversationHistory
          .map(entry => `${entry.role}: ${entry.content}`)
          .join('\n');
      }
    });

    this.api.registerCommand('clear-history', {
      description: 'Clear conversation history',
      handler: async () => {
        this.conversationHistory = [];
        return 'Conversation history cleared';
      }
    });

    // Register UI component
    this.api.registerApp({
      name: 'Custom AI Agent',
      icon: 'brain',
      component: this.createAgentComponent(),
      category: 'ai'
    });

    // Load saved data
    await this.loadSavedData();
  }

  async destroy(): Promise<void> {
    // Save all data
    await this.saveAllData();
    console.log('Custom AI Agent destroyed');
  }

  private async processQuery(query: string, context?: any): Promise<string> {
    try {
      // Check knowledge base first
      const knowledgeResponse = this.searchKnowledgeBase(query);
      if (knowledgeResponse) {
        return this.formatResponse(knowledgeResponse, query);
      }

      // Check if query matches specializations
      const specializationResponse = this.checkSpecializations(query);
      if (specializationResponse) {
        return this.formatResponse(specializationResponse, query);
      }

      // Use default AI with personality
      const defaultResponse = await this.api.ai.query(query, {
        personality: this.config.personality,
        specializations: this.config.specializations,
        conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages
      });

      // Learn from interaction if enabled
      if (this.config.learningEnabled) {
        await this.learnFromInteraction(query, defaultResponse);
      }

      return this.formatResponse(defaultResponse, query);
    } catch (error: any) {
      return `Error processing query: ${error.message}`;
    }
  }

  private searchKnowledgeBase(query: string): string | null {
    const queryLower = query.toLowerCase();

    for (const [topic, entry] of this.knowledgeBase) {
      if (queryLower.includes(topic.toLowerCase()) ||
          entry.tags.some(tag => queryLower.includes(tag.toLowerCase()))) {
        return entry.content;
      }
    }

    return null;
  }

  private checkSpecializations(query: string): string | null {
    const queryLower = query.toLowerCase();

    for (const specialization of this.config.specializations) {
      if (queryLower.includes(specialization.toLowerCase())) {
        return `I specialize in ${specialization}. Let me help you with that.`;
      }
    }

    return null;
  }

  private formatResponse(response: string, query: string): string {
    const personalityPrefix = this.getPersonalityPrefix();
    return `${personalityPrefix} ${response}`;
  }

  private getPersonalityPrefix(): string {
    switch (this.config.responseStyle) {
      case 'formal':
        return 'As your AI assistant,';
      case 'casual':
        return 'Hey there!';
      case 'technical':
        return 'From a technical perspective,';
      case 'creative':
        return 'Let me paint you a picture:';
      default:
        return '';
    }
  }

  private async addKnowledge(topic: string, content: string): Promise<void> {
    const entry: KnowledgeEntry = {
      id: `kb_${Date.now()}`,
      topic,
      content,
      confidence: 1.0,
      lastUpdated: Date.now(),
      tags: this.extractTags(content)
    };

    this.knowledgeBase.set(topic, entry);
    await this.saveKnowledgeBase();
  }

  private removeKnowledge(topic: string): boolean {
    return this.knowledgeBase.delete(topic);
  }

  private extractTags(content: string): string[] {
    // Simple tag extraction - in a real implementation, this would be more sophisticated
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => word.length > 3 && !commonWords.includes(word)).slice(0, 5);
  }

  private async learnFromInteraction(query: string, response: string): Promise<void> {
    // Simple learning mechanism - track which topics are asked about most
    const words = query.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (word.length > 3) {
        const currentCount = this.learningData.get(word) || 0;
        this.learningData.set(word, currentCount + 1);
      }
    }

    // If a topic is asked about frequently, add it to knowledge base
    for (const [word, count] of this.learningData) {
      if (count > 5 && !this.knowledgeBase.has(word)) {
        await this.addKnowledge(word, `Frequently asked topic: ${word}`);
      }
    }
  }

  private loadKnowledgeBase(): void {
    // Load initial knowledge from config
    for (const knowledge of this.config.knowledgeBase) {
      const [topic, content] = knowledge.split(':');
      if (topic && content) {
        this.addKnowledge(topic.trim(), content.trim());
      }
    }
  }

  private async loadSavedData(): Promise<void> {
    try {
      const savedKnowledge = await this.api.storage.get('custom-ai-knowledge');
      if (savedKnowledge) {
        this.knowledgeBase = new Map(savedKnowledge);
      }

      const savedHistory = await this.api.storage.get('custom-ai-history');
      if (savedHistory) {
        this.conversationHistory = savedHistory;
      }

      const savedLearning = await this.api.storage.get('custom-ai-learning');
      if (savedLearning) {
        this.learningData = new Map(savedLearning);
      }
    } catch (error) {
      console.warn('Failed to load saved data:', error);
    }
  }

  private async saveAllData(): Promise<void> {
    try {
      await this.api.storage.set('custom-ai-knowledge', Array.from(this.knowledgeBase.entries()));
      await this.api.storage.set('custom-ai-history', this.conversationHistory);
      await this.api.storage.set('custom-ai-learning', Array.from(this.learningData.entries()));
      await this.saveConfig();
    } catch (error) {
      console.warn('Failed to save data:', error);
    }
  }

  private async saveKnowledgeBase(): Promise<void> {
    await this.api.storage.set('custom-ai-knowledge', Array.from(this.knowledgeBase.entries()));
  }

  private async saveConfig(): Promise<void> {
    await this.api.storage.set('custom-ai-config', this.config);
  }

  private createAgentComponent(): any {
    // This would be a React component in a real implementation
    return {
      name: 'CustomAIAgent',
      props: {
        agent: this
      }
    };
  }
}

export default CustomAIAgentPlugin;
