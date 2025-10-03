import { test, expect } from '@playwright/test';

test.describe('Desktop App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/desktop');
  });

  test('should display desktop environment', async ({ page }) => {
    // Check if desktop components are rendered
    await expect(page.locator('.desktop-app')).toBeVisible();
    await expect(page.locator('.taskbar')).toBeVisible();
    await expect(page.locator('.desktop-icons')).toBeVisible();
  });

  test('should launch app from desktop icon', async ({ page }) => {
    // Click on terminal icon
    await page.click('[data-testid="desktop-icon-terminal"]');
    
    // Check if window is created
    await expect(page.locator('.window')).toBeVisible();
    await expect(page.locator('.window-title')).toContainText('Terminal');
  });

  test('should handle window operations', async ({ page }) => {
    // Launch terminal app
    await page.click('[data-testid="desktop-icon-terminal"]');
    
    // Test minimize
    await page.click('.window-control.minimize');
    await expect(page.locator('.window')).not.toBeVisible();
    
    // Test maximize
    await page.click('[data-testid="taskbar-window-"]');
    await page.click('.window-control.maximize');
    await expect(page.locator('.window')).toHaveCSS('width', '100vw');
    
    // Test close
    await page.click('.window-control.close');
    await expect(page.locator('.window')).not.toBeVisible();
  });

  test('should handle taskbar interactions', async ({ page }) => {
    // Launch multiple apps
    await page.click('[data-testid="desktop-icon-terminal"]');
    await page.click('[data-testid="desktop-icon-files"]');
    
    // Check taskbar shows both windows
    await expect(page.locator('.taskbar-window')).toHaveCount(2);
    
    // Test window switching
    await page.click('.taskbar-window:first-child');
    await expect(page.locator('.window.active')).toBeVisible();
  });

  test('should handle start menu', async ({ page }) => {
    // Open start menu
    await page.click('.start-button');
    await expect(page.locator('.start-menu')).toBeVisible();
    
    // Launch app from start menu
    await page.click('.start-menu-app:first-child');
    await expect(page.locator('.window')).toBeVisible();
    
    // Start menu should close
    await expect(page.locator('.start-menu')).not.toBeVisible();
  });

  test('should handle window dragging', async ({ page }) => {
    await page.click('[data-testid="desktop-icon-terminal"]');
    
    const window = page.locator('.window');
    const initialPosition = await window.boundingBox();
    
    // Drag window
    await window.dragTo(page.locator('body'), {
      targetPosition: { x: 100, y: 100 }
    });
    
    const newPosition = await window.boundingBox();
    expect(newPosition?.x).not.toBe(initialPosition?.x);
    expect(newPosition?.y).not.toBe(initialPosition?.y);
  });

  test('should handle window resizing', async ({ page }) => {
    await page.click('[data-testid="desktop-icon-terminal"]');
    
    const window = page.locator('.window');
    const initialSize = await window.boundingBox();
    
    // Resize window
    await window.locator('.window-resize-handle').dragTo(window, {
      targetPosition: { x: 200, y: 200 }
    });
    
    const newSize = await window.boundingBox();
    expect(newSize?.width).not.toBe(initialSize?.width);
    expect(newSize?.height).not.toBe(initialSize?.height);
  });
});
