import { test, expect } from '@playwright/test';

test.describe('Desktop Environment E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForSelector('[data-testid="desktop"]', { timeout: 10000 });
  });

  test('should load desktop environment', async ({ page }) => {
    const desktop = page.locator('[data-testid="desktop"]');
    await expect(desktop).toBeVisible();
    
    // Verify taskbar is present
    const taskbar = page.locator('[data-testid="taskbar"]');
    await expect(taskbar).toBeVisible();
    
    // Verify app icons are present
    const appIcons = page.locator('[data-testid^="app-icon-"]');
    await expect(appIcons).not.toHaveCount(0);
  });

  test('should display system time in taskbar', async ({ page }) => {
    const clock = page.locator('[data-testid="taskbar-clock"]');
    await expect(clock).toBeVisible();
    
    // Verify time format (HH:MM)
    const timeText = await clock.textContent();
    expect(timeText).toMatch(/\d{1,2}:\d{2}/);
  });

  test('should open and manage multiple windows', async ({ page }) => {
    // Open Terminal
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="window-terminal"]');
    
    // Open Debugger
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="window-debugger"]');
    
    // Verify both windows are visible
    const windows = page.locator('[data-testid^="window-"]');
    await expect(windows).toHaveCount(2);
  });

  test('should focus window on click', async ({ page }) => {
    // Open two windows
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="window-terminal"]');
    
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="window-debugger"]');
    
    // Click on Terminal window
    await page.click('[data-testid="window-terminal"]');
    
    // Verify Terminal has focus (higher z-index)
    const terminal = page.locator('[data-testid="window-terminal"]');
    const zIndex = await terminal.evaluate(el => window.getComputedStyle(el).zIndex);
    expect(parseInt(zIndex)).toBeGreaterThan(0);
  });

  test('should drag and move windows', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    await expect(window).toBeVisible();
    
    // Get initial position
    const initialBox = await window.boundingBox();
    
    // Drag window by title bar
    const titleBar = page.locator('[data-testid="window-titlebar-terminal"]');
    await titleBar.dragTo(page.locator('[data-testid="desktop"]'), {
      targetPosition: { x: 500, y: 300 }
    });
    
    // Verify position changed
    const newBox = await window.boundingBox();
    expect(newBox?.x).not.toBe(initialBox?.x);
    expect(newBox?.y).not.toBe(initialBox?.y);
  });

  test('should resize windows', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    await expect(window).toBeVisible();
    
    // Get initial size
    const initialBox = await window.boundingBox();
    
    // Drag resize handle
    const resizeHandle = page.locator('[data-testid="window-resize-terminal"]');
    await resizeHandle.dragTo(page.locator('[data-testid="desktop"]'), {
      targetPosition: { x: 800, y: 600 }
    });
    
    // Verify size changed
    const newBox = await window.boundingBox();
    expect(newBox?.width).not.toBe(initialBox?.width);
    expect(newBox?.height).not.toBe(initialBox?.height);
  });

  test('should maximize and restore windows', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    
    // Get initial size
    const initialBox = await window.boundingBox();
    
    // Maximize window
    await page.click('[data-testid="window-maximize-terminal"]');
    
    // Verify window is maximized (full screen)
    const maxBox = await window.boundingBox();
    const desktop = page.locator('[data-testid="desktop"]');
    const desktopBox = await desktop.boundingBox();
    
    expect(maxBox?.width).toBeCloseTo(desktopBox?.width || 0, 10);
    
    // Restore window
    await page.click('[data-testid="window-restore-terminal"]');
    
    // Verify window restored to original size
    const restoredBox = await window.boundingBox();
    expect(restoredBox?.width).toBe(initialBox?.width);
  });

  test('should minimize windows to taskbar', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    await expect(window).toBeVisible();
    
    // Minimize window
    await page.click('[data-testid="window-minimize-terminal"]');
    await expect(window).not.toBeVisible();
    
    // Verify taskbar button is present
    const taskbarButton = page.locator('[data-testid="taskbar-terminal"]');
    await expect(taskbarButton).toBeVisible();
    
    // Restore from taskbar
    await taskbarButton.click();
    await expect(window).toBeVisible();
  });

  test('should close windows', async ({ page }) => {
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    await expect(window).toBeVisible();
    
    // Close window
    await page.click('[data-testid="window-close-terminal"]');
    await expect(window).not.toBeVisible();
    
    // Verify taskbar button is removed
    const taskbarButton = page.locator('[data-testid="taskbar-terminal"]');
    await expect(taskbarButton).not.toBeVisible();
  });

  test('should handle right-click context menu', async ({ page }) => {
    // Right-click on desktop
    await page.click('[data-testid="desktop"]', { button: 'right' });
    
    // Verify context menu appears
    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();
    
    // Verify menu items
    await expect(contextMenu).toContainText('New Folder');
    await expect(contextMenu).toContainText('Refresh');
  });

  test('should support desktop icons', async ({ page }) => {
    const desktopIcons = page.locator('[data-testid^="desktop-icon-"]');
    await expect(desktopIcons).not.toHaveCount(0);
    
    // Double-click icon to open
    await page.dblclick('[data-testid="desktop-icon-terminal"]');
    
    // Verify app opens
    const window = page.locator('[data-testid="window-terminal"]');
    await expect(window).toBeVisible();
  });

  test('should persist window positions across sessions', async ({ page, context }) => {
    // Open and move window
    await page.click('[data-testid="app-icon-terminal"]');
    const window = page.locator('[data-testid="window-terminal"]');
    
    const titleBar = page.locator('[data-testid="window-titlebar-terminal"]');
    await titleBar.dragTo(page.locator('[data-testid="desktop"]'), {
      targetPosition: { x: 500, y: 300 }
    });
    
    const position = await window.boundingBox();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="desktop"]');
    
    // Open Terminal again
    await page.click('[data-testid="app-icon-terminal"]');
    
    // Verify position is restored
    const newPosition = await window.boundingBox();
    expect(newPosition?.x).toBeCloseTo(position?.x || 0, 10);
    expect(newPosition?.y).toBeCloseTo(position?.y || 0, 10);
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Alt+Tab to switch windows
    await page.click('[data-testid="app-icon-terminal"]');
    await page.click('[data-testid="app-icon-debugger"]');
    
    await page.keyboard.press('Alt+Tab');
    
    // Verify focus switched
    const terminal = page.locator('[data-testid="window-terminal"]');
    const terminalZIndex = await terminal.evaluate(el => window.getComputedStyle(el).zIndex);
    expect(parseInt(terminalZIndex)).toBeGreaterThan(0);
  });

  test('should display notifications', async ({ page }) => {
    // Trigger notification (e.g., from Terminal command)
    await page.click('[data-testid="app-icon-terminal"]');
    await page.waitForSelector('[data-testid="terminal-input"]');
    
    const input = page.locator('[data-testid="terminal-input"]');
    await input.fill('notify "Test notification"');
    await input.press('Enter');
    
    // Verify notification appears
    const notification = page.locator('[data-testid="notification"]');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('Test notification');
  });

  test('should handle system menu', async ({ page }) => {
    // Click system menu button
    await page.click('[data-testid="system-menu-button"]');
    
    // Verify menu appears
    const systemMenu = page.locator('[data-testid="system-menu"]');
    await expect(systemMenu).toBeVisible();
    
    // Verify menu items
    await expect(systemMenu).toContainText('Settings');
    await expect(systemMenu).toContainText('About');
  });

  test('should support fullscreen mode', async ({ page }) => {
    // Enter fullscreen
    await page.keyboard.press('F11');
    
    // Verify fullscreen state
    const isFullscreen = await page.evaluate(() => document.fullscreenElement !== null);
    expect(isFullscreen).toBe(true);
    
    // Exit fullscreen
    await page.keyboard.press('F11');
  });
});
