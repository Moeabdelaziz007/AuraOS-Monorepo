import { test, expect } from '@playwright/test';

test.describe('Debugger App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForSelector('[data-testid="desktop"]', { timeout: 10000 });
  });

  test('should open Debugger app from desktop', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="window-debugger"]');
    
    const debugger = page.locator('[data-testid="window-debugger"]');
    await expect(debugger).toBeVisible();
  });

  test('should load and display code', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="code-editor"]');
    
    const editor = page.locator('[data-testid="code-editor"]');
    await expect(editor).toBeVisible();
    
    // Verify line numbers are displayed
    const lineNumbers = page.locator('[data-testid="line-numbers"]');
    await expect(lineNumbers).toBeVisible();
  });

  test('should set and remove breakpoints', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="code-editor"]');
    
    // Click on line number to set breakpoint
    await page.click('[data-testid="line-number-5"]');
    
    // Verify breakpoint indicator appears
    const breakpoint = page.locator('[data-testid="breakpoint-5"]');
    await expect(breakpoint).toBeVisible();
    
    // Click again to remove breakpoint
    await page.click('[data-testid="line-number-5"]');
    await expect(breakpoint).not.toBeVisible();
  });

  test('should start and stop debugging session', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debugger-controls"]');
    
    // Start debugging
    await page.click('[data-testid="debug-start"]');
    
    // Verify debugging state
    const status = page.locator('[data-testid="debug-status"]');
    await expect(status).toContainText('Running');
    
    // Stop debugging
    await page.click('[data-testid="debug-stop"]');
    await expect(status).toContainText('Stopped');
  });

  test('should step through code', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debugger-controls"]');
    
    // Set breakpoint
    await page.click('[data-testid="line-number-5"]');
    
    // Start debugging
    await page.click('[data-testid="debug-start"]');
    
    // Wait for breakpoint hit
    await page.waitForSelector('[data-testid="current-line-5"]');
    
    // Step over
    await page.click('[data-testid="debug-step-over"]');
    
    // Verify moved to next line
    const currentLine = page.locator('[data-testid="current-line-6"]');
    await expect(currentLine).toBeVisible();
  });

  test('should display variables in scope', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debugger-controls"]');
    
    // Set breakpoint and start debugging
    await page.click('[data-testid="line-number-10"]');
    await page.click('[data-testid="debug-start"]');
    
    // Wait for breakpoint
    await page.waitForSelector('[data-testid="current-line-10"]');
    
    // Verify variables panel shows data
    const variablesPanel = page.locator('[data-testid="variables-panel"]');
    await expect(variablesPanel).toBeVisible();
    await expect(variablesPanel).not.toBeEmpty();
  });

  test('should display call stack', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debugger-controls"]');
    
    // Set breakpoint in nested function
    await page.click('[data-testid="line-number-20"]');
    await page.click('[data-testid="debug-start"]');
    
    // Wait for breakpoint
    await page.waitForSelector('[data-testid="current-line-20"]');
    
    // Verify call stack shows multiple frames
    const callStack = page.locator('[data-testid="call-stack"]');
    await expect(callStack).toBeVisible();
    
    const frames = page.locator('[data-testid^="stack-frame-"]');
    await expect(frames).not.toHaveCount(0);
  });

  test('should evaluate expressions in console', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debug-console"]');
    
    const consoleInput = page.locator('[data-testid="console-input"]');
    
    // Evaluate expression
    await consoleInput.fill('2 + 2');
    await consoleInput.press('Enter');
    
    // Verify result
    const consoleOutput = page.locator('[data-testid="console-output"]');
    await expect(consoleOutput).toContainText('4');
  });

  test('should watch expressions', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="watch-panel"]');
    
    // Add watch expression
    await page.click('[data-testid="add-watch"]');
    const watchInput = page.locator('[data-testid="watch-input"]');
    await watchInput.fill('myVariable');
    await watchInput.press('Enter');
    
    // Verify watch added
    const watchList = page.locator('[data-testid="watch-list"]');
    await expect(watchList).toContainText('myVariable');
  });

  test('should handle debugging errors gracefully', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debugger-controls"]');
    
    // Try to start debugging without code
    await page.click('[data-testid="debug-start"]');
    
    // Verify error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.click('[data-testid="app-icon-debugger"]');
    await page.waitForSelector('[data-testid="debugger-controls"]');
    
    // Set breakpoint with F9
    await page.click('[data-testid="line-number-5"]');
    await page.keyboard.press('F9');
    
    const breakpoint = page.locator('[data-testid="breakpoint-5"]');
    await expect(breakpoint).toBeVisible();
    
    // Start debugging with F5
    await page.keyboard.press('F5');
    
    const status = page.locator('[data-testid="debug-status"]');
    await expect(status).toContainText('Running');
  });
});
