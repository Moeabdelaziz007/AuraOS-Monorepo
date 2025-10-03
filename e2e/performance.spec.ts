import { test, expect } from '@playwright/test';

test.describe('Performance and Stress Tests', () => {
  test('should handle multiple concurrent applications', async ({ page }) => {
    await page.goto('/desktop');
    
    // Launch multiple applications concurrently
    const apps = ['Terminal', 'Files', 'Notes', 'AI Chat', 'Settings'];
    
    for (const app of apps) {
      await page.getByText(app).dblclick();
      await page.waitForTimeout(100);
    }
    
    // Verify all applications are running
    for (const app of apps) {
      await expect(page.locator('.window-title', { hasText: app })).toBeVisible();
    }
    
    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
  });

  test('should handle rapid window operations', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    
    const window = page.locator('.window-title', { hasText: 'Terminal' });
    await expect(window).toBeVisible();
    
    // Perform rapid minimize/maximize operations
    for (let i = 0; i < 20; i++) {
      await page.getByRole('button', { name: /minimize/i }).click();
      await page.getByTestId('taskbar-window-').click();
      await page.getByRole('button', { name: /maximize/i }).click();
      await page.getByRole('button', { name: /maximize/i }).click();
    }
    
    // Window should still be functional
    await expect(window).toBeVisible();
  });

  test('should handle large file operations', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    
    // Create large file
    const largeContent = 'x'.repeat(1024 * 1024); // 1MB
    await page.getByRole('textbox').fill(`echo "${largeContent}" > large.txt`);
    await page.getByRole('textbox').press('Enter');
    
    // Verify file was created
    await page.getByRole('textbox').fill('ls -la large.txt');
    await page.getByRole('textbox').press('Enter');
    await expect(page.getByText('1048576')).toBeVisible();
    
    // Check memory usage after large file operation
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    expect(memoryUsage).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
  });

  test('should handle rapid command execution', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    
    const startTime = Date.now();
    
    // Execute commands rapidly
    for (let i = 0; i < 50; i++) {
      await page.getByRole('textbox').fill(`echo "Command ${i}"`);
      await page.getByRole('textbox').press('Enter');
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000); // Less than 5 seconds
    
    // Verify all commands were executed
    await expect(page.getByText('Command 49')).toBeVisible();
  });

  test('should handle memory leaks', async ({ page }) => {
    await page.goto('/desktop');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Perform memory-intensive operations
    for (let i = 0; i < 10; i++) {
      await page.getByText('Terminal').dblclick();
      await page.getByRole('button', { name: /close/i }).click();
      await page.waitForTimeout(100);
    }
    
    // Force garbage collection
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not have increased significantly
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
  });

  test('should handle concurrent MCP operations', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    
    // Execute multiple MCP operations concurrently
    const operations = [
      'ls',
      'pwd',
      'whoami',
      'date',
      'echo "test"'
    ];
    
    const startTime = Date.now();
    
    // Execute all operations
    for (const operation of operations) {
      await page.getByRole('textbox').fill(operation);
      await page.getByRole('textbox').press('Enter');
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(3000); // Less than 3 seconds
    
    // Verify all operations completed
    for (const operation of operations) {
      await expect(page.getByText(operation)).toBeVisible();
    }
  });

  test('should handle autopilot stress test', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    
    // Enable autopilot
    await page.getByTestId('autopilot-toggle').click();
    
    // Create multiple tasks
    const tasks = Array.from({ length: 20 }, (_, i) => ({
      id: `task-${i}`,
      description: `Task ${i}`,
      tools: ['fs_write'],
      parameters: { path: `file${i}.txt`, content: `Content ${i}` }
    }));
    
    const startTime = Date.now();
    
    // Execute all tasks
    for (const task of tasks) {
      await page.getByTestId('create-task').click();
      await page.getByTestId('task-description').fill(task.description);
      await page.getByTestId('task-tools').selectOption('fs_write');
      await page.getByTestId('task-parameters').fill(JSON.stringify(task.parameters));
      await page.getByTestId('save-task').click();
      await page.getByTestId('execute-task').click();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(10000); // Less than 10 seconds
    
    // Verify all tasks completed
    await expect(page.getByText('All tasks completed')).toBeVisible();
  });

  test('should handle learning loop stress test', async ({ page }) => {
    await page.goto('/desktop');
    
    // Enable learning loop
    await page.getByTestId('learning-loop-toggle').click();
    
    // Generate large amount of learning data
    const behaviors = Array.from({ length: 1000 }, (_, i) => ({
      type: 'app_launch',
      app: `app_${i % 10}`,
      timestamp: Date.now() - (i * 1000)
    }));
    
    const startTime = Date.now();
    
    // Process all behaviors
    for (const behavior of behaviors) {
      await page.getByTestId(`action-${behavior.type}`).click();
      await page.waitForTimeout(1);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(15000); // Less than 15 seconds
    
    // Check if learning loop processed the data
    await expect(page.getByText('Learning data processed')).toBeVisible();
    await expect(page.getByText('Patterns identified')).toBeVisible();
  });

  test('should handle network failures gracefully', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByText('Terminal').dblclick();
    
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    // Try to execute network-dependent command
    await page.getByRole('textbox').fill('curl https://example.com');
    await page.getByRole('textbox').press('Enter');
    
    // Should handle failure gracefully
    await expect(page.getByText('Network error')).toBeVisible();
    await expect(page.getByText('Retrying...')).toBeVisible();
  });

  test('should handle resource exhaustion', async ({ page }) => {
    await page.goto('/desktop');
    
    // Create resource-intensive operations
    const operations = Array.from({ length: 100 }, (_, i) => ({
      id: `op-${i}`,
      description: `Operation ${i}`,
      tools: ['fs_write'],
      parameters: { path: `file${i}.txt`, content: 'x'.repeat(10000) }
    }));
    
    const startTime = Date.now();
    
    // Execute operations
    for (const operation of operations) {
      await page.getByTestId('create-task').click();
      await page.getByTestId('task-description').fill(operation.description);
      await page.getByTestId('task-tools').selectOption('fs_write');
      await page.getByTestId('task-parameters').fill(JSON.stringify(operation.parameters));
      await page.getByTestId('save-task').click();
      await page.getByTestId('execute-task').click();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(30000); // Less than 30 seconds
    
    // Check system resources
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    expect(memoryUsage).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
  });

  test('should handle concurrent user sessions', async ({ browser }) => {
    // Create multiple browser contexts
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Navigate all pages to desktop
    await Promise.all(
      pages.map(page => page.goto('/desktop'))
    );
    
    // Launch applications on all pages
    await Promise.all(
      pages.map(page => page.getByText('Terminal').dblclick())
    );
    
    // Verify all pages are functional
    for (const page of pages) {
      await expect(page.locator('.window-title', { hasText: 'Terminal' })).toBeVisible();
    }
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });
});
