/**
 * Notes AI MCP Server
 * AI-powered features for notes (summarization, semantic search, transcription)
 */

import '../autopilot/logger'; // Initialize global logger
import { BaseMCPServer, Tool } from '@auraos/ai/src/mcp/server';
import { geminiService } from '@auraos/ai/src/services/gemini.service';
import { notesMCPServer } from './notes';
import type { Note } from './notes';

export class NotesAIMCPServer extends BaseMCPServer {
  name = 'notes-ai';
  version = '1.0.0';
  description = 'AI-powered features for notes';

  tools: Tool[] = [
    {
      name: 'summarizeNote',
      description: 'Generate an AI summary of a note',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID to summarize',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
          maxLength: {
            type: 'number',
            description: 'Maximum summary length in words (default: 100)',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          keyPoints: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    {
      name: 'findRelatedNotes',
      description: 'Find notes related to a given note using semantic search',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID to find related notes for',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
          limitCount: {
            type: 'number',
            description: 'Maximum number of related notes to return (default: 5)',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          relatedNotes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                noteId: { type: 'string' },
                title: { type: 'string' },
                similarity: { type: 'number' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    },
    {
      name: 'transcribeAudioToNote',
      description: 'Transcribe audio to create a new note (placeholder for future implementation)',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID who owns the note',
          },
          audioUrl: {
            type: 'string',
            description: 'URL or path to audio file',
          },
          title: {
            type: 'string',
            description: 'Optional title for the note',
          },
          folderId: {
            type: 'string',
            description: 'Optional folder ID',
          },
        },
        required: ['userId', 'audioUrl'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          noteId: { type: 'string' },
          transcription: { type: 'string' },
        },
      },
    },
    {
      name: 'generateNoteTags',
      description: 'Generate relevant tags for a note using AI',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID to generate tags for',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
          maxTags: {
            type: 'number',
            description: 'Maximum number of tags to generate (default: 5)',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    {
      name: 'enhanceNoteContent',
      description: 'Enhance note content with AI suggestions (grammar, clarity, structure)',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID to enhance',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
          enhancementType: {
            type: 'string',
            enum: ['grammar', 'clarity', 'structure', 'all'],
            description: 'Type of enhancement to apply',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          enhancedContent: { type: 'string' },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                original: { type: 'string' },
                suggestion: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    },
  ];

  protected async onInitialize(): Promise<void> {
    logger.info('[NotesAIMCP] Initializing Notes AI MCP Server');
  }

  protected async onShutdown(): Promise<void> {
    logger.info('[NotesAIMCP] Shutting down Notes AI MCP Server');
  }

  protected async handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case 'summarizeNote':
        return this.summarizeNote(input);
      case 'findRelatedNotes':
        return this.findRelatedNotes(input);
      case 'transcribeAudioToNote':
        return this.transcribeAudioToNote(input);
      case 'generateNoteTags':
        return this.generateNoteTags(input);
      case 'enhanceNoteContent':
        return this.enhanceNoteContent(input);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async summarizeNote(input: {
    noteId: string;
    userId: string;
    maxLength?: number;
  }): Promise<{ summary: string; keyPoints: string[] }> {
    // Get the note
    const result = await notesMCPServer.executeTool('getNote', {
      noteId: input.noteId,
      userId: input.userId,
    });

    if (!result.success || !result.data?.note) {
      throw new Error('Note not found or unauthorized');
    }

    const note: Note = result.data.note;
    const maxLength = input.maxLength || 100;

    // Use AI to generate summary
    const prompt = `Summarize the following note in approximately ${maxLength} words and extract 3-5 key points:

Title: ${note.title}
Content: ${note.content}

Provide the response in JSON format:
{
  "summary": "...",
  "keyPoints": ["point1", "point2", ...]
}`;

    try {
      const response = await geminiService.chat([
        { role: 'user', content: prompt },
      ]);

      // Parse AI response
      const parsed = JSON.parse(response.content);
      
      logger.info(`[NotesAIMCP] Summarized note: ${input.noteId}`);
      
      return {
        summary: parsed.summary || 'Unable to generate summary',
        keyPoints: parsed.keyPoints || [],
      };
    } catch (error) {
      logger.error('[NotesAIMCP] Error summarizing note:', error);
      
      // Fallback: simple truncation
      const words = note.content.split(/\s+/);
      const summary = words.slice(0, maxLength).join(' ') + (words.length > maxLength ? '...' : '');
      
      return {
        summary,
        keyPoints: [],
      };
    }
  }

  private async findRelatedNotes(input: {
    noteId: string;
    userId: string;
    limitCount?: number;
  }): Promise<{
    relatedNotes: Array<{
      noteId: string;
      title: string;
      similarity: number;
      reason: string;
    }>;
  }> {
    // Get the source note
    const sourceResult = await notesMCPServer.executeTool('getNote', {
      noteId: input.noteId,
      userId: input.userId,
    });

    if (!sourceResult.success || !sourceResult.data?.note) {
      throw new Error('Note not found or unauthorized');
    }

    const sourceNote: Note = sourceResult.data.note;

    // Get all user notes
    const notesResult = await notesMCPServer.executeTool('listNotes', {
      userId: input.userId,
      isArchived: false,
    });

    if (!notesResult.success || !notesResult.data?.notes) {
      return { relatedNotes: [] };
    }

    const allNotes: Note[] = notesResult.data.notes.filter(
      (n: Note) => n.id !== input.noteId
    );

    if (allNotes.length === 0) {
      return { relatedNotes: [] };
    }

    try {
      // Generate embeddings for source note
      const sourceEmbedding = await geminiService.embed(
        `${sourceNote.title} ${sourceNote.content}`
      );

      // Calculate similarity with other notes
      const similarities = await Promise.all(
        allNotes.map(async (note) => {
          const noteEmbedding = await geminiService.embed(
            `${note.title} ${note.content}`
          );
          
          // Cosine similarity
          const similarity = this.cosineSimilarity(sourceEmbedding, noteEmbedding);
          
          return {
            noteId: note.id,
            title: note.title,
            similarity,
            reason: this.generateSimilarityReason(sourceNote, note, similarity),
          };
        })
      );

      // Sort by similarity and limit
      const limitCount = input.limitCount || 5;
      const relatedNotes = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limitCount);

      logger.info(`[NotesAIMCP] Found ${relatedNotes.length} related notes for: ${input.noteId}`);

      return { relatedNotes };
    } catch (error) {
      logger.error('[NotesAIMCP] Error finding related notes:', error);
      
      // Fallback: tag-based similarity
      const relatedNotes = allNotes
        .filter((note) => {
          const commonTags = note.tags.filter((tag) =>
            sourceNote.tags.includes(tag)
          );
          return commonTags.length > 0;
        })
        .slice(0, input.limitCount || 5)
        .map((note) => ({
          noteId: note.id,
          title: note.title,
          similarity: 0.5,
          reason: 'Shares common tags',
        }));

      return { relatedNotes };
    }
  }

  private async transcribeAudioToNote(input: {
    userId: string;
    audioUrl: string;
    title?: string;
    folderId?: string;
  }): Promise<{ noteId: string; transcription: string }> {
    // Placeholder implementation
    logger.info('[NotesAIMCP] Audio transcription requested (not yet implemented)');
    
    const transcription = 'Audio transcription feature coming soon. This is a placeholder for future voice-to-text integration.';
    
    // Create a note with placeholder content
    const result = await notesMCPServer.executeTool('createNote', {
      userId: input.userId,
      title: input.title || 'Voice Note',
      content: transcription,
      folderId: input.folderId,
      tags: ['voice', 'transcription'],
    });

    if (!result.success || !result.data?.id) {
      throw new Error('Failed to create note');
    }

    return {
      noteId: result.data.id,
      transcription,
    };
  }

  private async generateNoteTags(input: {
    noteId: string;
    userId: string;
    maxTags?: number;
  }): Promise<{ tags: string[] }> {
    // Get the note
    const result = await notesMCPServer.executeTool('getNote', {
      noteId: input.noteId,
      userId: input.userId,
    });

    if (!result.success || !result.data?.note) {
      throw new Error('Note not found or unauthorized');
    }

    const note: Note = result.data.note;
    const maxTags = input.maxTags || 5;

    // Use AI to generate tags
    const prompt = `Analyze the following note and generate ${maxTags} relevant tags:

Title: ${note.title}
Content: ${note.content}

Provide the response as a JSON array of strings: ["tag1", "tag2", ...]`;

    try {
      const response = await geminiService.chat([
        { role: 'user', content: prompt },
      ]);

      const tags = JSON.parse(response.content);
      
      logger.info(`[NotesAIMCP] Generated ${tags.length} tags for note: ${input.noteId}`);
      
      return { tags: Array.isArray(tags) ? tags : [] };
    } catch (error) {
      logger.error('[NotesAIMCP] Error generating tags:', error);
      
      // Fallback: extract keywords from title and content
      const text = `${note.title} ${note.content}`.toLowerCase();
      const words = text.split(/\s+/);
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
      const tags = words
        .filter((word) => word.length > 3 && !commonWords.has(word))
        .slice(0, maxTags);
      
      return { tags };
    }
  }

  private async enhanceNoteContent(input: {
    noteId: string;
    userId: string;
    enhancementType?: string;
  }): Promise<{
    enhancedContent: string;
    suggestions: Array<{
      type: string;
      original: string;
      suggestion: string;
      reason: string;
    }>;
  }> {
    // Get the note
    const result = await notesMCPServer.executeTool('getNote', {
      noteId: input.noteId,
      userId: input.userId,
    });

    if (!result.success || !result.data?.note) {
      throw new Error('Note not found or unauthorized');
    }

    const note: Note = result.data.note;
    const enhancementType = input.enhancementType || 'all';

    // Use AI to enhance content
    const prompt = `Enhance the following note content for ${enhancementType}:

Title: ${note.title}
Content: ${note.content}

Provide the response in JSON format:
{
  "enhancedContent": "...",
  "suggestions": [
    {
      "type": "grammar|clarity|structure",
      "original": "...",
      "suggestion": "...",
      "reason": "..."
    }
  ]
}`;

    try {
      const response = await geminiService.chat([
        { role: 'user', content: prompt },
      ]);

      const parsed = JSON.parse(response.content);
      
      logger.info(`[NotesAIMCP] Enhanced note content: ${input.noteId}`);
      
      return {
        enhancedContent: parsed.enhancedContent || note.content,
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      logger.error('[NotesAIMCP] Error enhancing content:', error);
      
      return {
        enhancedContent: note.content,
        suggestions: [],
      };
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private generateSimilarityReason(
    sourceNote: Note,
    targetNote: Note,
    similarity: number
  ): string {
    const commonTags = sourceNote.tags.filter((tag) =>
      targetNote.tags.includes(tag)
    );

    if (commonTags.length > 0) {
      return `Shares tags: ${commonTags.join(', ')}`;
    }

    if (similarity > 0.8) {
      return 'Very similar content and topics';
    } else if (similarity > 0.6) {
      return 'Related topics and concepts';
    } else if (similarity > 0.4) {
      return 'Some overlapping themes';
    } else {
      return 'Potentially related';
    }
  }
}

export const notesAIMCPServer = new NotesAIMCPServer();
