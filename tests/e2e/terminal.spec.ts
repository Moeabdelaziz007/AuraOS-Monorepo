import { test, expect } from '@playwright/test';

test.describe('Terminal App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Wait for desktop to load
    await page.waitForSelector('[data-testid="desktop"]', { timeout: 10000 });
  });

  test('should open Terminal app from desktop', async ({ page }) => {
    // Click Terminal icon
    await page.click('[data-testid="app-icon-terminal"]');
    
    // Wait for Terminal window to appear
    await page.waitForSelector('[data-testid="window-terminal"]');
    
    // Verify Terminal is visible
    const terminal = page.locator('[data-testid="window-terminal"]');
    await expect(terminal).toBeVisible();
  });

  test('should execute basic commands', async ({ page }) => {
    // Open Terminal
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    // Type and execute 'help' command
    const input = page.locator('[data-testid="terminal-input"]');
    await input.fill('help');
    await input.press('Enter');
    
    // Verify output contains help text
    const output = page.locator('[data-testid="terminal-output"]');
    await expect(output).toContainText('Available commands');
  });

  test('should navigate directories', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    
    // Create directory
    await input.fill('mkdir testdir');
    await input.press('Enter');
    
    // Change to directory
    await input.fill('cd testdir');
    await input.press('Enter');
    
    // Verify current directory changed
    const prompt = page.locator('[data-testid="terminal-prompt"]');
    await expect(prompt).toContainText('testdir');
  });

  test('should maintain command history', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    
    // Execute multiple commands
    await input.fill('echo test1');
    await input.press('Enter');
    
    await input.fill('echo test2');
    await input.press('Enter');
    
    // Navigate history with arrow up
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo test2');
    
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo test1');
  });

  test('should support tab completion', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    
    // Type partial command and press tab
    await input.fill('hel');
    await input.press('Tab');
    
    // Verify command completed
    await expect(input).toHaveValue('help');
  });

  test('should handle window operations', async ({ page }) => {
    // Open Terminal
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    await expect(window).toBeVisible();
    
    // Minimize window
    await page.click('[data-testid="window-minimize-terminal"]');
    await expect(window).not.toBeVisible();
    
    // Restore from taskbar
    await page.click('[data-testid="taskbar-terminal"]');
    await expect(window).toBeVisible();
    
    // Close window
    await page.click('[data-testid="window-close-terminal"]');
    await expect(window).not.toBeVisible();
  });

  test('should persist data across sessions', async ({ page, context }) => {
    // Open Terminal and create file
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    await input.fill('echo "test data" > test.txt');
    await input.press('Enter');
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="desktop"]');
    
    // Open Terminal again
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    // Verify file still exists
    await input.fill('cat test.txt');
    await input.press('Enter');
    
    const output = page.locator('[data-testid="terminal-output"]');
    await expect(output).toContainText('test data');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    
    // Execute invalid command
    await input.fill('invalidcommand123');
    await input.press('Enter');
    
    // Verify error message
    const output = page.locator('[data-testid="terminal-output"]');
    await expect(output).toContainText('command not found');
  });

  test('should support multiple Terminal instances', async ({ page }) => {
    // Open first Terminal
    await page.click('[data-testid="app-icon-terminal"]');
    const terminal1 = page.locator('[data-testid="window-terminal"]').first();
    await expect(terminal1).toBeVisible();
    
    // Open second Terminal
    await page.click('[data-testid="app-icon-terminal"]');
    const terminals = page.locator('[data-testid^="window-terminal"]');
    await expect(terminals).toHaveCount(2);
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    
    // Type command
    await input.fill('echo test');
    
    // Clear with Ctrl+C
    await input.press('Control+C');
    await expect(input).toHaveValue('');
    
    // Type command and execute
    await input.fill('help');
    await input.press('Enter');
    
    // Clear screen with Ctrl+L
    await input.press('Control+L');
    
    const output = page.locator('[data-testid="terminal-output"]');
    await expect(output).toBeEmpty();
  });
});
