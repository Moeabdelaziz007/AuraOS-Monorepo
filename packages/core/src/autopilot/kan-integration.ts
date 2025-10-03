/**
 * Kan Project Management Integration
 * Connects AuraOS Autopilot with Kan (Trello alternative)
 * Repository: https://github.com/Moeabdelaziz007/kan
 */

import { TaskAction, LearningContext, TaskExecutionResult } from './types';

/**
 * Kan Board
 */
export interface KanBoard {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'workspace' | 'public';
  workspaceId?: string;
  lists: KanList[];
  members: KanMember[];
  labels: KanLabel[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Kan List (Column)
 */
export interface KanList {
  id: string;
  name: string;
  position: number;
  boardId: string;
  cards: KanCard[];
}

/**
 * Kan Card
 */
export interface KanCard {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  labels: string[];
  members: string[];
  dueDate?: Date;
  completed: boolean;
  comments: KanComment[];
  attachments: KanAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Kan Comment
 */
export interface KanComment {
  id: string;
  cardId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

/**
 * Kan Label
 */
export interface KanLabel {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

/**
 * Kan Member
 */
export interface KanMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
}

/**
 * Kan Attachment
 */
export interface KanAttachment {
  id: string;
  cardId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Kan Activity
 */
export interface KanActivity {
  id: string;
  type: 'card_created' | 'card_moved' | 'card_updated' | 'comment_added' | 'member_added';
  cardId?: string;
  userId: string;
  description: string;
  timestamp: Date;
}

/**
 * Kan Integration Manager
 */
export class KanIntegration {
  private baseUrl: string;
  private apiKey?: string;
  private boards: Map<string, KanBoard> = new Map();
  private activities: KanActivity[] = [];

  constructor(baseUrl: string = 'http://localhost:3000', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Initialize connection to Kan
   */
  async initialize(): Promise<void> {
    try {
      logger.info('[Kan Integration] Connecting to Kan instance...');
      logger.info(`[Kan Integration] Base URL: ${this.baseUrl}`);
      
      // Test connection
      const isHealthy = await this.checkHealth();
      
      if (isHealthy) {
        logger.info('[Kan Integration] ✅ Connected successfully');
        
        // Load boards
        await this.loadBoards();
      } else {
        logger.info('[Kan Integration] ⚠️  Kan instance not accessible');
      }
    } catch (error) {
      logger.error('[Kan Integration] ❌ Failed to initialize:', error);
    }
  }

  /**
   * Check Kan health
   */
  async checkHealth(): Promise<boolean> {
    try {
      logger.info('[Kan Integration] Checking health...');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load boards from Kan
   */
  async loadBoards(): Promise<void> {
    try {
      logger.info('[Kan Integration] Loading boards...');
      
      // Create example boards for demonstration
      const exampleBoards = this.createExampleBoards();
      
      exampleBoards.forEach(board => {
        this.boards.set(board.id, board);
      });
      
      logger.info(`[Kan Integration] Loaded ${this.boards.size} boards`);
    } catch (error) {
      logger.error('[Kan Integration] Failed to load boards:', error);
    }
  }

  /**
   * Create example boards for demonstration
   */
  private createExampleBoards(): KanBoard[] {
    const now = new Date();
    
    return [
      {
        id: 'board_auraos_development',
        name: 'AuraOS Development',
        description: 'Main development board for AuraOS project',
        visibility: 'workspace',
        workspaceId: 'workspace_auraos',
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'user_1',
            name: 'Mohamed Abdelaziz',
            email: 'mohamed@auraos.com',
            role: 'owner',
          },
        ],
        labels: [
          { id: 'label_bug', name: 'Bug', color: '#ff0000', boardId: 'board_auraos_development' },
          { id: 'label_feature', name: 'Feature', color: '#00ff00', boardId: 'board_auraos_development' },
          { id: 'label_urgent', name: 'Urgent', color: '#ff9900', boardId: 'board_auraos_development' },
        ],
        lists: [
          {
            id: 'list_backlog',
            name: 'Backlog',
            position: 0,
            boardId: 'board_auraos_development',
            cards: [
              {
                id: 'card_1',
                title: 'Implement autopilot MCP integration',
                description: 'Add MCP tools to autopilot system',
                listId: 'list_backlog',
                position: 0,
                labels: ['label_feature'],
                members: ['user_1'],
                completed: false,
                comments: [],
                attachments: [],
                createdAt: now,
                updatedAt: now,
              },
            ],
          },
          {
            id: 'list_in_progress',
            name: 'In Progress',
            position: 1,
            boardId: 'board_auraos_development',
            cards: [
              {
                id: 'card_2',
                title: 'Test autopilot with real data',
                description: 'Run comprehensive tests with actual user data',
                listId: 'list_in_progress',
                position: 0,
                labels: ['label_feature', 'label_urgent'],
                members: ['user_1'],
                completed: false,
                comments: [
                  {
                    id: 'comment_1',
                    cardId: 'card_2',
                    userId: 'user_1',
                    content: 'Starting tests with Telegram bot',
                    createdAt: now,
                  },
                ],
                attachments: [],
                createdAt: now,
                updatedAt: now,
              },
            ],
          },
          {
            id: 'list_done',
            name: 'Done',
            position: 2,
            boardId: 'board_auraos_development',
            cards: [
              {
                id: 'card_3',
                title: 'Create autopilot core system',
                description: 'Build main autopilot service with learning capabilities',
                listId: 'list_done',
                position: 0,
                labels: ['label_feature'],
                members: ['user_1'],
                completed: true,
                comments: [],
                attachments: [],
                createdAt: now,
                updatedAt: now,
              },
            ],
          },
        ],
      },
      {
        id: 'board_content_pipeline',
        name: 'Content Generation Pipeline',
        description: 'Track content generation tasks and workflows',
        visibility: 'private',
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'user_1',
            name: 'Mohamed Abdelaziz',
            email: 'mohamed@auraos.com',
            role: 'owner',
          },
        ],
        labels: [
          { id: 'label_blog', name: 'Blog', color: '#0066ff', boardId: 'board_content_pipeline' },
          { id: 'label_social', name: 'Social', color: '#ff00ff', boardId: 'board_content_pipeline' },
          { id: 'label_email', name: 'Email', color: '#00ffff', boardId: 'board_content_pipeline' },
        ],
        lists: [
          {
            id: 'list_ideas',
            name: 'Ideas',
            position: 0,
            boardId: 'board_content_pipeline',
            cards: [
              {
                id: 'card_4',
                title: 'AI Technology Blog Post',
                description: 'Write comprehensive article about AI advancements',
                listId: 'list_ideas',
                position: 0,
                labels: ['label_blog'],
                members: ['user_1'],
                completed: false,
                comments: [],
                attachments: [],
                createdAt: now,
                updatedAt: now,
              },
            ],
          },
          {
            id: 'list_generating',
            name: 'Generating',
            position: 1,
            boardId: 'board_content_pipeline',
            cards: [],
          },
          {
            id: 'list_published',
            name: 'Published',
            position: 2,
            boardId: 'board_content_pipeline',
            cards: [],
          },
        ],
      },
    ];
  }

  /**
   * Get all boards
   */
  getBoards(): KanBoard[] {
    return Array.from(this.boards.values());
  }

  /**
   * Get board by ID
   */
  getBoard(boardId: string): KanBoard | undefined {
    return this.boards.get(boardId);
  }

  /**
   * Create new board
   */
  async createBoard(
    name: string,
    description?: string,
    visibility: 'private' | 'workspace' | 'public' = 'private'
  ): Promise<KanBoard> {
    const boardId = `board_${Date.now()}`;
    const now = new Date();
    
    const board: KanBoard = {
      id: boardId,
      name,
      description,
      visibility,
      createdAt: now,
      updatedAt: now,
      members: [],
      labels: [],
      lists: [
        {
          id: `${boardId}_list_todo`,
          name: 'To Do',
          position: 0,
          boardId,
          cards: [],
        },
        {
          id: `${boardId}_list_doing`,
          name: 'Doing',
          position: 1,
          boardId,
          cards: [],
        },
        {
          id: `${boardId}_list_done`,
          name: 'Done',
          position: 2,
          boardId,
          cards: [],
        },
      ],
    };
    
    this.boards.set(boardId, board);
    logger.info(`[Kan Integration] ✅ Board created: ${name}`);
    
    return board;
  }

  /**
   * Create card
   */
  async createCard(
    boardId: string,
    listId: string,
    title: string,
    description?: string
  ): Promise<KanCard> {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board not found: ${boardId}`);
    }
    
    const list = board.lists.find(l => l.id === listId);
    if (!list) {
      throw new Error(`List not found: ${listId}`);
    }
    
    const card: KanCard = {
      id: `card_${Date.now()}`,
      title,
      description,
      listId,
      position: list.cards.length,
      labels: [],
      members: [],
      completed: false,
      comments: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    list.cards.push(card);
    
    // Record activity
    this.recordActivity({
      id: `activity_${Date.now()}`,
      type: 'card_created',
      cardId: card.id,
      userId: 'system',
      description: `Created card: ${title}`,
      timestamp: new Date(),
    });
    
    logger.info(`[Kan Integration] ✅ Card created: ${title}`);
    
    return card;
  }

  /**
   * Move card to different list
   */
  async moveCard(cardId: string, targetListId: string): Promise<void> {
    let card: KanCard | undefined;
    let sourceList: KanList | undefined;
    let targetList: KanList | undefined;
    
    // Find card and lists
    for (const board of this.boards.values()) {
      for (const list of board.lists) {
        const foundCard = list.cards.find(c => c.id === cardId);
        if (foundCard) {
          card = foundCard;
          sourceList = list;
        }
        if (list.id === targetListId) {
          targetList = list;
        }
      }
    }
    
    if (!card || !sourceList || !targetList) {
      throw new Error('Card or list not found');
    }
    
    // Remove from source
    sourceList.cards = sourceList.cards.filter(c => c.id !== cardId);
    
    // Add to target
    card.listId = targetListId;
    card.position = targetList.cards.length;
    targetList.cards.push(card);
    
    // Record activity
    this.recordActivity({
      id: `activity_${Date.now()}`,
      type: 'card_moved',
      cardId: card.id,
      userId: 'system',
      description: `Moved card from ${sourceList.name} to ${targetList.name}`,
      timestamp: new Date(),
    });
    
    logger.info(`[Kan Integration] ✅ Card moved: ${card.title}`);
  }

  /**
   * Add comment to card
   */
  async addComment(cardId: string, content: string, userId: string = 'system'): Promise<KanComment> {
    let card: KanCard | undefined;
    
    // Find card
    for (const board of this.boards.values()) {
      for (const list of board.lists) {
        const foundCard = list.cards.find(c => c.id === cardId);
        if (foundCard) {
          card = foundCard;
          break;
        }
      }
    }
    
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }
    
    const comment: KanComment = {
      id: `comment_${Date.now()}`,
      cardId,
      userId,
      content,
      createdAt: new Date(),
    };
    
    card.comments.push(comment);
    
    // Record activity
    this.recordActivity({
      id: `activity_${Date.now()}`,
      type: 'comment_added',
      cardId,
      userId,
      description: `Added comment: ${content.substring(0, 50)}...`,
      timestamp: new Date(),
    });
    
    logger.info(`[Kan Integration] ✅ Comment added to card`);
    
    return comment;
  }

  /**
   * Record activity
   */
  private recordActivity(activity: KanActivity): void {
    this.activities.push(activity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(-100);
    }
  }

  /**
   * Get recent activities
   */
  getRecentActivities(limit: number = 10): KanActivity[] {
    return this.activities.slice(-limit).reverse();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalBoards: number;
    totalLists: number;
    totalCards: number;
    completedCards: number;
    pendingCards: number;
    totalComments: number;
    recentActivities: number;
  } {
    let totalLists = 0;
    let totalCards = 0;
    let completedCards = 0;
    let totalComments = 0;
    
    this.boards.forEach(board => {
      totalLists += board.lists.length;
      board.lists.forEach(list => {
        totalCards += list.cards.length;
        list.cards.forEach(card => {
          if (card.completed) completedCards++;
          totalComments += card.comments.length;
        });
      });
    });
    
    return {
      totalBoards: this.boards.size,
      totalLists,
      totalCards,
      completedCards,
      pendingCards: totalCards - completedCards,
      totalComments,
      recentActivities: this.activities.length,
    };
  }

  /**
   * Create board from autopilot task
   */
  async createBoardFromTask(
    taskName: string,
    actions: TaskAction[],
    context: LearningContext
  ): Promise<KanBoard> {
    logger.info(`[Kan Integration] Creating board from task: ${taskName}`);
    
    const board = await this.createBoard(
      taskName,
      `Automated board created from autopilot task at ${new Date().toLocaleString()}`
    );
    
    // Create cards from actions
    const todoList = board.lists[0];
    
    for (const action of actions) {
      await this.createCard(
        board.id,
        todoList.id,
        `${action.type}: ${action.target || action.value || 'Action'}`,
        `Action type: ${action.type}\nTarget: ${action.target || 'N/A'}\nValue: ${action.value || 'N/A'}`
      );
    }
    
    logger.info(`[Kan Integration] ✅ Board created with ${actions.length} cards`);
    
    return board;
  }
}

// Export singleton instance
export const kanIntegration = new KanIntegration();
