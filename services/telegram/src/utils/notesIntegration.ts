/**
 * Notes Integration Service for Telegram Bot
 * Handles saving research results to the Notes app
 */

import { logger } from './logger.js';
// Note: NotesClient will be imported when the notes app is properly set up
// import { NotesClient } from '@auraos/notes-app';

export interface ResearchSource {
  title: string;
  url: string;
  summary: string;
  keyPoints: string[];
  metadata: {
    author?: string;
    publishedDate?: string;
    wordCount: number;
    readingTime: number;
    confidence: number;
    domain: string;
  };
}

export interface ResearchOverview {
  query: string;
  totalSources: number;
  overviewSummary: string;
  keyFindings: string[];
  sources: ResearchSource[];
  createdAt: Date;
}

export interface SaveResearchResult {
  success: boolean;
  individualNoteIds: string[];
  overviewNoteId: string;
  noteUrls: {
    individual: string[];
    overview: string;
  };
  error?: string;
}

export class NotesIntegrationService {
  private notesClient: any | null = null; // TODO: Replace with proper NotesClient type
  private defaultFolder: string;
  private defaultTags: string[];

  constructor() {
    this.defaultFolder = 'Research';
    this.defaultTags = ['research', 'ai-generated', 'telegram'];
  }

  /**
   * Initialize notes client for a user
   */
  async initialize(userId: string): Promise<void> {
    try {
      // TODO: Initialize proper NotesClient when available
      // this.notesClient = new NotesClient(userId);
      logger.info(`[NotesIntegration] Initialized for user: ${userId}`);
    } catch (error) {
      logger.error('[NotesIntegration] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Save research results to notes
   */
  async saveResearchResults(
    userId: string,
    researchOverview: ResearchOverview
  ): Promise<SaveResearchResult> {
    try {
      await this.initialize(userId);
      
      if (!this.notesClient) {
        throw new Error('Notes client not initialized');
      }

      logger.info(`[NotesIntegration] Saving research results for query: ${researchOverview.query}`);

      const individualNoteIds: string[] = [];
      const noteUrls: string[] = [];

      // Create individual notes for each source
      for (const source of researchOverview.sources) {
        try {
          const noteContent = this.formatSourceNote(source);
          
          const { id } = await this.notesClient.createNote({
            title: `📄 ${source.title}`,
            content: noteContent,
            folderId: await this.getOrCreateFolder('Research Sources'),
            tags: [...this.defaultTags, 'source', source.metadata.domain]
          });

          individualNoteIds.push(id);
          noteUrls.push(`/notes/${id}`); // Assuming this is the note URL format
          
          logger.info(`[NotesIntegration] Created note for source: ${source.title}`);
        } catch (error) {
          logger.error(`[NotesIntegration] Failed to create note for source ${source.title}:`, error);
          // Continue with other sources
        }
      }

      // Create aggregate overview note
      const overviewContent = this.formatOverviewNote(researchOverview);
      const { id: overviewNoteId } = await this.notesClient.createNote({
        title: `🔍 Research: ${researchOverview.query}`,
        content: overviewContent,
        folderId: await this.getOrCreateFolder('Research Overviews'),
        tags: [...this.defaultTags, 'overview', 'research-summary']
      });

      logger.info(`[NotesIntegration] Created overview note: ${overviewNoteId}`);

      return {
        success: true,
        individualNoteIds,
        overviewNoteId,
        noteUrls: {
          individual: noteUrls,
          overview: `/notes/${overviewNoteId}`
        }
      };

    } catch (error) {
      logger.error('[NotesIntegration] Failed to save research results:', error);
      return {
        success: false,
        individualNoteIds: [],
        overviewNoteId: '',
        noteUrls: {
          individual: [],
          overview: ''
        },
        error: error instanceof Error ? error.message : 'Failed to save research results'
      };
    }
  }

  /**
   * Format individual source note content
   */
  private formatSourceNote(source: ResearchSource): string {
    let content = `# ${source.title}\n\n`;
    
    // Add metadata
    content += `## 📊 Metadata\n`;
    content += `- **URL:** ${source.url}\n`;
    content += `- **Domain:** ${source.metadata.domain}\n`;
    if (source.metadata.author) {
      content += `- **Author:** ${source.metadata.author}\n`;
    }
    if (source.metadata.publishedDate) {
      content += `- **Published:** ${source.metadata.publishedDate}\n`;
    }
    content += `- **Word Count:** ${source.metadata.wordCount}\n`;
    content += `- **Reading Time:** ${source.metadata.readingTime} minutes\n`;
    content += `- **Confidence:** ${Math.round(source.metadata.confidence * 100)}%\n\n`;

    // Add summary
    content += `## 📝 Summary\n\n${source.summary}\n\n`;

    // Add key points
    if (source.keyPoints.length > 0) {
      content += `## 🔑 Key Points\n\n`;
      source.keyPoints.forEach((point, index) => {
        content += `${index + 1}. ${point}\n`;
      });
      content += `\n`;
    }

    // Add original link
    content += `## 🔗 Original Source\n\n[View Original Article](${source.url})\n\n`;
    content += `---\n*Generated by AuraOS Telegram Bot*`;

    return content;
  }

  /**
   * Format overview note content
   */
  private formatOverviewNote(overview: ResearchOverview): string {
    let content = `# 🔍 Research: ${overview.query}\n\n`;
    content += `**Research Date:** ${overview.createdAt.toLocaleDateString()}\n`;
    content += `**Total Sources:** ${overview.totalSources}\n\n`;

    // Add overview summary
    content += `## 📋 Overview Summary\n\n${overview.overviewSummary}\n\n`;

    // Add key findings
    if (overview.keyFindings.length > 0) {
      content += `## 🎯 Key Findings\n\n`;
      overview.keyFindings.forEach((finding, index) => {
        content += `${index + 1}. ${finding}\n`;
      });
      content += `\n`;
    }

    // Add sources list
    content += `## 📚 Sources\n\n`;
    overview.sources.forEach((source, index) => {
      content += `${index + 1}. **[${source.title}](${source.url})**\n`;
      content += `   - Domain: ${source.metadata.domain}\n`;
      content += `   - Confidence: ${Math.round(source.metadata.confidence * 100)}%\n`;
      if (source.metadata.author) {
        content += `   - Author: ${source.metadata.author}\n`;
      }
      content += `\n`;
    });

    content += `---\n*Generated by AuraOS Telegram Bot*`;

    return content;
  }

  /**
   * Get or create a folder
   */
  private async getOrCreateFolder(folderName: string): Promise<string> {
    if (!this.notesClient) {
      throw new Error('Notes client not initialized');
    }

    try {
      // Try to find existing folder
      const folders = await this.notesClient.listFolders();
      const existingFolder = folders.find(f => f.name === folderName);
      
      if (existingFolder) {
        return existingFolder.id;
      }

      // Create new folder
      const { id } = await this.notesClient.createFolder({
        name: folderName,
        color: '#3B82F6' // Blue color for research folders
      });

      return id;
    } catch (error) {
      logger.error(`[NotesIntegration] Failed to get/create folder ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Get research statistics for a user
   */
  async getResearchStats(userId: string): Promise<{
    totalResearchSessions: number;
    totalSources: number;
    averageSourcesPerSession: number;
    mostResearchedTopics: string[];
    recentResearch: string[];
  }> {
    try {
      await this.initialize(userId);
      
      if (!this.notesClient) {
        throw new Error('Notes client not initialized');
      }

      // Get all research notes
      const researchNotes = await this.notesClient.listNotes({
        tags: ['research'],
        limitCount: 100
      });

      const overviewNotes = researchNotes.filter(note => 
        note.tags.includes('overview') && note.title.startsWith('🔍 Research:')
      );

      const sourceNotes = researchNotes.filter(note => 
        note.tags.includes('source')
      );

      // Extract topics from overview notes
      const topics = overviewNotes.map(note => {
        const match = note.title.match(/🔍 Research: (.+)/);
        return match ? match[1] : 'Unknown';
      });

      // Count topic frequency
      const topicCounts = topics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostResearchedTopics = Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic);

      return {
        totalResearchSessions: overviewNotes.length,
        totalSources: sourceNotes.length,
        averageSourcesPerSession: overviewNotes.length > 0 ? 
          Math.round(sourceNotes.length / overviewNotes.length * 10) / 10 : 0,
        mostResearchedTopics,
        recentResearch: overviewNotes
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
          .map(note => note.title.replace('🔍 Research: ', ''))
      };

    } catch (error) {
      logger.error('[NotesIntegration] Failed to get research stats:', error);
      return {
        totalResearchSessions: 0,
        totalSources: 0,
        averageSourcesPerSession: 0,
        mostResearchedTopics: [],
        recentResearch: []
      };
    }
  }
}

export default NotesIntegrationService;
