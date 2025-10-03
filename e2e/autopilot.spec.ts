import { test, expect } from '@playwright/test';

test.describe('Autopilot E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    await expect(page.locator('.window-title', { hasText: 'Terminal' })).toBeVisible();
  });

  test('Autopilot should learn from user behavior', async ({ page }) => {
    // Simulate user behavior
    await page.getByRole('textbox').fill('ls');
    await page.getByRole('textbox').press('Enter');
    
    await page.getByRole('textbox').fill('cd /home');
    await page.getByRole('textbox').press('Enter');
    
    await page.getByRole('textbox').fill('pwd');
    await page.getByRole('textbox').press('Enter');
    
    // Check if autopilot learned the pattern
    await expect(page.getByText('Autopilot learned new pattern')).toBeVisible();
  });

  test('Autopilot should suggest automation', async ({ page }) => {
    // Perform repetitive actions
    for (let i = 0; i < 3; i++) {
      await page.getByRole('textbox').fill('ls');
      await page.getByRole('textbox').press('Enter');
      await page.waitForTimeout(500);
    }
    
    // Check for automation suggestion
    await expect(page.getByText('Suggest automation for')).toBeVisible();
    await expect(page.getByText('ls command')).toBeVisible();
  });

  test('Autopilot should execute automated tasks', async ({ page }) => {
    // Enable autopilot
    await page.getByTestId('autopilot-toggle').click();
    await expect(page.getByText('Autopilot enabled')).toBeVisible();
    
    // Create a task
    await page.getByTestId('create-task').click();
    await page.getByTestId('task-description').fill('Create test file');
    await page.getByTestId('task-tools').selectOption('fs_write');
    await page.getByTestId('task-parameters').fill('{"path": "test.txt", "content": "Hello World"}');
    await page.getByTestId('save-task').click();
    
    // Execute task
    await page.getByTestId('execute-task').click();
    await expect(page.getByText('Task completed successfully')).toBeVisible();
  });

  test('Autopilot should handle task failures', async ({ page }) => {
    // Create a failing task
    await page.getByTestId('create-task').click();
    await page.getByTestId('task-description').fill('Access protected file');
    await page.getByTestId('task-tools').selectOption('fs_read');
    await page.getByTestId('task-parameters').fill('{"path": "/etc/passwd"}');
    await page.getByTestId('save-task').click();
    
    // Execute task
    await page.getByTestId('execute-task').click();
    await expect(page.getByText('Task failed: Access denied')).toBeVisible();
    
    // Check retry mechanism
    await expect(page.getByText('Retrying task...')).toBeVisible();
  });

  test('Autopilot should learn from feedback', async ({ page }) => {
    // Complete a task
    await page.getByTestId('create-task').click();
    await page.getByTestId('task-description').fill('Simple task');
    await page.getByTestId('task-tools').selectOption('fs_write');
    await page.getByTestId('task-parameters').fill('{"path": "simple.txt", "content": "Simple content"}');
    await page.getByTestId('save-task').click();
    
    await page.getByTestId('execute-task').click();
    await expect(page.getByText('Task completed successfully')).toBeVisible();
    
    // Provide feedback
    await page.getByTestId('feedback-rating').selectOption('5');
    await page.getByTestId('feedback-comment').fill('Great job!');
    await page.getByTestId('submit-feedback').click();
    
    // Check if autopilot learned
    await expect(page.getByText('Feedback received and learned')).toBeVisible();
  });

  test('Autopilot should adapt to user preferences', async ({ page }) => {
    // Set user preferences
    await page.getByTestId('preferences').click();
    await page.getByTestId('automation-level').selectOption('high');
    await page.getByTestId('working-hours').fill('9-17');
    await page.getByTestId('preferred-apps').fill('terminal,files');
    await page.getByTestId('save-preferences').click();
    
    // Check if autopilot adapted
    await expect(page.getByText('Preferences updated')).toBeVisible();
    await expect(page.getByText('Autopilot adapted to your preferences')).toBeVisible();
  });

  test('Autopilot should handle complex workflows', async ({ page }) => {
    // Create complex workflow
    await page.getByTestId('create-workflow').click();
    await page.getByTestId('workflow-name').fill('Development Setup');
    await page.getByTestId('workflow-steps').fill(JSON.stringify([
      { action: 'fs_write', params: { path: 'main.py', content: 'print("Hello World")' } },
      { action: 'fs_write', params: { path: 'requirements.txt', content: 'requests==2.28.0' } },
      { action: 'fs_write', params: { path: 'README.md', content: '# My Project' } }
    ]));
    await page.getByTestId('save-workflow').click();
    
    // Execute workflow
    await page.getByTestId('execute-workflow').click();
    await expect(page.getByText('Workflow completed successfully')).toBeVisible();
    
    // Verify files were created
    await page.getByRole('textbox').fill('ls');
    await page.getByRole('textbox').press('Enter');
    await expect(page.getByText('main.py')).toBeVisible();
    await expect(page.getByText('requirements.txt')).toBeVisible();
    await expect(page.getByText('README.md')).toBeVisible();
  });

  test('Autopilot should handle concurrent tasks', async ({ page }) => {
    // Create multiple tasks
    const tasks = [
      { name: 'Task 1', description: 'Create file 1' },
      { name: 'Task 2', description: 'Create file 2' },
      { name: 'Task 3', description: 'Create file 3' }
    ];
    
    for (const task of tasks) {
      await page.getByTestId('create-task').click();
      await page.getByTestId('task-description').fill(task.description);
      await page.getByTestId('task-tools').selectOption('fs_write');
      await page.getByTestId('task-parameters').fill(`{"path": "${task.name.toLowerCase().replace(' ', '_')}.txt", "content": "${task.description}"}`);
      await page.getByTestId('save-task').click();
    }
    
    // Execute all tasks concurrently
    await page.getByTestId('execute-all-tasks').click();
    await expect(page.getByText('All tasks completed')).toBeVisible();
    
    // Verify all files were created
    await page.getByRole('textbox').fill('ls');
    await page.getByRole('textbox').press('Enter');
    for (const task of tasks) {
      await expect(page.getByText(`${task.name.toLowerCase().replace(' ', '_')}.txt`)).toBeVisible();
    }
  });

  test('Autopilot should handle performance monitoring', async ({ page }) => {
    // Start performance monitoring
    await page.getByTestId('performance-monitor').click();
    await expect(page.getByText('Performance monitoring started')).toBeVisible();
    
    // Execute resource-intensive task
    await page.getByTestId('create-task').click();
    await page.getByTestId('task-description').fill('Resource intensive task');
    await page.getByTestId('task-tools').selectOption('fs_write');
    await page.getByTestId('task-parameters').fill('{"path": "large.txt", "content": "x".repeat(10000)}');
    await page.getByTestId('save-task').click();
    
    await page.getByTestId('execute-task').click();
    
    // Check performance metrics
    await expect(page.getByText('Memory usage:')).toBeVisible();
    await expect(page.getByText('CPU usage:')).toBeVisible();
    await expect(page.getByText('Execution time:')).toBeVisible();
  });

  test('Autopilot should handle error recovery', async ({ page }) => {
    // Create task that will fail
    await page.getByTestId('create-task').click();
    await page.getByTestId('task-description').fill('Failing task');
    await page.getByTestId('task-tools').selectOption('fs_read');
    await page.getByTestId('task-parameters').fill('{"path": "/nonexistent/file.txt"}');
    await page.getByTestId('save-task').click();
    
    // Execute task
    await page.getByTestId('execute-task').click();
    await expect(page.getByText('Task failed')).toBeVisible();
    
    // Check error recovery
    await expect(page.getByText('Attempting recovery...')).toBeVisible();
    await expect(page.getByText('Recovery failed, task marked as failed')).toBeVisible();
  });

  test('Autopilot should handle learning loop integration', async ({ page }) => {
    // Enable learning loop
    await page.getByTestId('learning-loop-toggle').click();
    await expect(page.getByText('Learning loop enabled')).toBeVisible();
    
    // Perform various actions to build learning data
    const actions = [
      { type: 'app_launch', app: 'terminal' },
      { type: 'command_execute', command: 'ls' },
      { type: 'app_launch', app: 'files' },
      { type: 'file_open', file: 'test.txt' }
    ];
    
    for (const action of actions) {
      await page.getByTestId(`action-${action.type}`).click();
      await page.waitForTimeout(100);
    }
    
    // Check if learning loop processed the data
    await expect(page.getByText('Learning data processed')).toBeVisible();
    await expect(page.getByText('Patterns identified')).toBeVisible();
    await expect(page.getByText('Adaptations generated')).toBeVisible();
  });
});
