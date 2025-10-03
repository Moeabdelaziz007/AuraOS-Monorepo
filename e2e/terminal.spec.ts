import { test, expect } from '@playwright/test';

test.describe('Terminal App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/desktop');
    await page.click('[data-testid="desktop-icon-terminal"]');
  });

  test('should display terminal interface', async ({ page }) => {
    await expect(page.locator('.terminal-emulator')).toBeVisible();
    await expect(page.locator('.terminal-output')).toBeVisible();
    await expect(page.locator('.terminal-input')).toBeVisible();
    await expect(page.locator('.terminal-prompt')).toBeVisible();
  });

  test('should execute commands', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Type command
    await input.fill('echo Hello World');
    await input.press('Enter');
    
    // Check output
    await expect(page.locator('.terminal-output')).toContainText('Hello World');
  });

  test('should handle command history', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Execute first command
    await input.fill('ls');
    await input.press('Enter');
    
    // Execute second command
    await input.fill('pwd');
    await input.press('Enter');
    
    // Navigate history with arrow keys
    await input.press('ArrowUp');
    await expect(input).toHaveValue('pwd');
    
    await input.press('ArrowUp');
    await expect(input).toHaveValue('ls');
    
    await input.press('ArrowDown');
    await expect(input).toHaveValue('pwd');
  });

  test('should handle tab completion', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Type partial command
    await input.fill('l');
    await input.press('Tab');
    
    // Should complete to 'ls'
    await expect(input).toHaveValue('ls');
  });

  test('should handle clear screen', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Execute command to add output
    await input.fill('echo test');
    await input.press('Enter');
    
    // Clear screen with Ctrl+L
    await input.press('Control+l');
    
    // Output should be cleared
    await expect(page.locator('.terminal-output')).not.toContainText('test');
  });

  test('should handle interrupt', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Start long-running command
    await input.fill('sleep 10');
    await input.press('Enter');
    
    // Interrupt with Ctrl+C
    await input.press('Control+c');
    
    // Should show interrupt signal
    await expect(page.locator('.terminal-output')).toContainText('^C');
  });

  test('should display current directory', async ({ page }) => {
    await expect(page.locator('.terminal-prompt')).toContainText('/home/user');
  });

  test('should handle auto-complete suggestions', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Type partial command
    await input.fill('l');
    
    // Should show suggestions
    await expect(page.locator('.terminal-suggestions')).toBeVisible();
    await expect(page.locator('.terminal-suggestion')).toContainText('ls');
  });

  test('should handle multiple commands', async ({ page }) => {
    const input = page.locator('.terminal-input-field');
    
    // Execute multiple commands
    await input.fill('echo "First command"');
    await input.press('Enter');
    
    await input.fill('echo "Second command"');
    await input.press('Enter');
    
    // Check both outputs are visible
    await expect(page.locator('.terminal-output')).toContainText('First command');
    await expect(page.locator('.terminal-output')).toContainText('Second command');
  });

  test('should handle window operations', async ({ page }) => {
    // Test minimize
    await page.click('.window-control.minimize');
    await expect(page.locator('.terminal-emulator')).not.toBeVisible();
    
    // Test restore from taskbar
    await page.click('.taskbar-window');
    await expect(page.locator('.terminal-emulator')).toBeVisible();
    
    // Test maximize
    await page.click('.window-control.maximize');
    await expect(page.locator('.window')).toHaveCSS('width', '100vw');
    
    // Test restore
    await page.click('.window-control.maximize');
    await expect(page.locator('.window')).not.toHaveCSS('width', '100vw');
  });
});
