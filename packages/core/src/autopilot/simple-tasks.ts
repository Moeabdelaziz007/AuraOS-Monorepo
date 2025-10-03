/**
 * Simple Task Templates
 * Pre-defined simple tasks that autopilot starts learning from
 */

import { SimpleTaskTemplate } from './types';

/**
 * Simple tasks that autopilot can learn and execute
 * These serve as starting points for the learning system
 */
export const SIMPLE_TASK_TEMPLATES: SimpleTaskTemplate[] = [
  // File Operations
  {
    name: 'Open Recent File',
    category: 'file_operation',
    description: 'Open the most recently used file',
    actions: [
      { type: 'open', target: 'filemanager' },
      { type: 'wait', delay: 500 },
      { type: 'click', target: 'recent-files' },
      { type: 'click', target: 'first-file' },
    ],
    learnFromUser: true,
  },
  
  {
    name: 'Save Current Work',
    category: 'file_operation',
    description: 'Save the current document or file',
    actions: [
      { type: 'click', target: 'save-button' },
      { type: 'wait', delay: 300 },
    ],
    learnFromUser: true,
  },

  // App Launch
  {
    name: 'Open Terminal',
    category: 'app_launch',
    description: 'Launch the terminal application',
    actions: [
      { type: 'open', target: 'terminal' },
      { type: 'wait', delay: 500 },
    ],
    learnFromUser: true,
  },

  {
    name: 'Open Dashboard',
    category: 'app_launch',
    description: 'Launch the dashboard application',
    actions: [
      { type: 'open', target: 'dashboard' },
      { type: 'wait', delay: 500 },
    ],
    learnFromUser: true,
  },

  // Window Management
  {
    name: 'Maximize Active Window',
    category: 'window_management',
    description: 'Maximize the currently active window',
    actions: [
      { type: 'click', target: 'maximize-button' },
    ],
    learnFromUser: false,
  },

  {
    name: 'Close All Windows',
    category: 'window_management',
    description: 'Close all open windows',
    actions: [
      { type: 'click', target: 'close-all' },
    ],
    learnFromUser: false,
  },

  // Text Input
  {
    name: 'Type Hello Command',
    category: 'text_input',
    description: 'Type a hello command in terminal',
    actions: [
      { type: 'open', target: 'terminal' },
      { type: 'wait', delay: 500 },
      { type: 'type', value: 'PRINT "Hello, AuraOS!"' },
      { type: 'type', value: '\n' },
    ],
    learnFromUser: true,
  },

  // Navigation
  {
    name: 'Switch to Next Window',
    category: 'navigation',
    description: 'Switch to the next open window',
    actions: [
      { type: 'navigate', target: 'next-window' },
    ],
    learnFromUser: false,
  },

  {
    name: 'Go to Desktop',
    category: 'navigation',
    description: 'Minimize all windows and show desktop',
    actions: [
      { type: 'navigate', target: 'desktop' },
    ],
    learnFromUser: false,
  },

  // System Actions
  {
    name: 'Open Settings',
    category: 'system_action',
    description: 'Open system settings',
    actions: [
      { type: 'click', target: 'start-menu' },
      { type: 'wait', delay: 300 },
      { type: 'click', target: 'settings' },
    ],
    learnFromUser: true,
  },
];

/**
 * Get simple tasks by category
 */
export function getSimpleTasksByCategory(category: string): SimpleTaskTemplate[] {
  return SIMPLE_TASK_TEMPLATES.filter(task => task.category === category);
}

/**
 * Get all learnable tasks
 */
export function getLearnableTasks(): SimpleTaskTemplate[] {
  return SIMPLE_TASK_TEMPLATES.filter(task => task.learnFromUser);
}

/**
 * Find task by name
 */
export function findTaskByName(name: string): SimpleTaskTemplate | undefined {
  return SIMPLE_TASK_TEMPLATES.find(
    task => task.name.toLowerCase() === name.toLowerCase()
  );
}
