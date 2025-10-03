# AuraOS Testing Strategy

## 🎯 Testing Philosophy

**Goal**: Achieve 80%+ code coverage with automated tests that run on every commit.

**Testing Pyramid**:
```
        /\
       /  \      E2E Tests (10%)
      /    \     - Playwright
     /------\    
    /        \   Integration Tests (30%)
   /          \  - Component integration
  /------------\ - API integration
 /              \
/________________\ Unit Tests (60%)
                   - Pure functions
                   - Components
                   - Utilities
```

---

## 🏗️ Testing Infrastructure

### Test Frameworks

#### Unit & Integration Tests
- **Vitest**: Fast, Vite-native testing
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation

#### E2E Tests
- **Playwright**: Cross-browser E2E testing
- **@playwright/test**: Test runner

#### Coverage
- **c8**: Code coverage reporting
- **Istanbul**: Coverage visualization

---

## 📦 Test Structure

### Per-App Structure
```
apps/terminal/
├── src/
│   ├── components/
│   │   ├── Terminal.tsx
│   │   └── Terminal.test.tsx
│   ├── store/
│   │   ├── terminalStore.ts
│   │   └── terminalStore.test.ts
│   └── core/
│       ├── commandExecutor.ts
│       └── commandExecutor.test.ts
├── tests/
│   ├── integration/
│   │   ├── vfs.test.ts
│   │   └── commands.test.ts
│   └── e2e/
│       ├── terminal.spec.ts
│       └── file-operations.spec.ts
└── vitest.config.ts
```

---

## 🧪 Test Categories

### 1. Unit Tests

**What to Test**:
- Pure functions
- Utility functions
- Store actions
- Component rendering
- Component props

**Example**:
```typescript
// commandExecutor.test.ts
describe('CommandExecutor', () => {
  it('should parse command with arguments', () => {
    const result = parseCommand('ls -la /home');
    expect(result).toEqual({
      command: 'ls',
      args: ['-la', '/home'],
      flags: { l: true, a: true },
    });
  });
});
```

### 2. Integration Tests

**What to Test**:
- Component interactions
- Store integration
- API calls
- VFS operations
- Command execution

**Example**:
```typescript
// vfs.test.ts
describe('VFS Integration', () => {
  it('should persist files across sessions', async () => {
    const vfs = new VirtualFileSystem();
    await vfs.initialize();
    
    await vfs.writeFile('/test.txt', 'content');
    const content = await vfs.readFile('/test.txt');
    
    expect(content).toBe('content');
  });
});
```

### 3. E2E Tests

**What to Test**:
- User workflows
- Cross-app interactions
- Real browser behavior
- Performance
- Accessibility

**Example**:
```typescript
// terminal.spec.ts
test('user can create and read files', async ({ page }) => {
  await page.goto('https://auraos-terminal.web.app');
  
  await page.locator('.xterm-helper-textarea').fill('touch test.txt\n');
  await page.locator('.xterm-helper-textarea').fill('echo "hello" > test.txt\n');
  await page.locator('.xterm-helper-textarea').fill('cat test.txt\n');
  
  await expect(page.locator('.xterm-screen')).toContainText('hello');
});
```

---

## 🤖 Autopilot Testing

### Autopilot Test Runner

**Purpose**: Automatically run tests and fix failures using AI.

**Features**:
- Run all tests
- Detect failures
- Analyze failure reasons
- Generate fixes using AI
- Apply fixes
- Re-run tests
- Report results

**Workflow**:
```typescript
interface AutopilotTestResult {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  
  failures: TestFailure[];
  fixes: TestFix[];
  
  duration: number;
  coverage: number;
}

async function runAutopilotTests(): Promise<AutopilotTestResult> {
  // 1. Run all tests
  const results = await runTests();
  
  // 2. Analyze failures
  const failures = analyzeFailures(results);
  
  // 3. Generate fixes using AI
  const fixes = await generateFixes(failures);
  
  // 4. Apply fixes
  for (const fix of fixes) {
    await applyFix(fix);
  }
  
  // 5. Re-run tests
  const retryResults = await runTests();
  
  // 6. Report
  return generateReport(retryResults);
}
```

---

## 📊 Test Coverage Goals

### Per-App Targets

| App | Unit | Integration | E2E | Total |
|-----|------|-------------|-----|-------|
| Terminal | 80% | 70% | 90% | 80% |
| Debugger | 80% | 70% | 90% | 80% |
| Desktop | 80% | 70% | 90% | 80% |
| Core | 90% | 80% | N/A | 85% |

### Critical Paths (100% Coverage)
- Authentication
- File operations
- Command execution
- Code execution
- Data persistence

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [main, feature/*]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run integration tests
        run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  autopilot-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run autopilot tests
        run: pnpm test:autopilot
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Create PR with fixes
        if: failure()
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'fix: autopilot test fixes'
          body: 'Automated fixes generated by autopilot testing'
```

---

## 📝 Test Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:autopilot": "node scripts/autopilot-test.js",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
  }
}
```

---

## 🎯 Test Priorities

### Phase 1: Critical Tests (Week 1)
- [ ] Terminal command execution
- [ ] VFS file operations
- [ ] Debugger code execution
- [ ] Desktop app launching
- [ ] Authentication flows

### Phase 2: Feature Tests (Week 2)
- [ ] Terminal history
- [ ] VFS persistence
- [ ] Debugger breakpoints
- [ ] Desktop settings
- [ ] Error handling

### Phase 3: Edge Cases (Week 3)
- [ ] Invalid inputs
- [ ] Network failures
- [ ] Storage limits
- [ ] Concurrent operations
- [ ] Performance under load

### Phase 4: Autopilot (Week 4)
- [ ] Autopilot test runner
- [ ] AI fix generation
- [ ] Automated PR creation
- [ ] Continuous improvement

---

## 🔍 Test Examples

### Terminal App Tests

#### Unit Test
```typescript
// terminalStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTerminalStore } from './terminalStore';

describe('Terminal Store', () => {
  it('should add command to history', () => {
    const { result } = renderHook(() => useTerminalStore());
    
    act(() => {
      result.current.addToHistory('ls -la');
    });
    
    expect(result.current.history).toContain('ls -la');
  });
});
```

#### Integration Test
```typescript
// commands.test.ts
import { executeCommand } from '../core/commandExecutor';
import { VirtualFileSystem } from '@auraos/core/vfs/VirtualFileSystem';

describe('Command Execution', () => {
  let vfs: VirtualFileSystem;
  
  beforeEach(async () => {
    vfs = new VirtualFileSystem();
    await vfs.initialize();
  });
  
  it('should create file with touch command', async () => {
    const result = await executeCommand('touch test.txt');
    
    expect(result.type).toBe('success');
    
    const files = await vfs.listDirectory('/home/aura');
    expect(files.some(f => f.name === 'test.txt')).toBe(true);
  });
});
```

#### E2E Test
```typescript
// terminal.spec.ts
import { test, expect } from '@playwright/test';

test('complete file workflow', async ({ page }) => {
  await page.goto('https://auraos-terminal.web.app');
  
  // Create directory
  await page.keyboard.type('mkdir projects\n');
  await expect(page.locator('.xterm-screen')).toContainText('Directory created');
  
  // Navigate to directory
  await page.keyboard.type('cd projects\n');
  await page.keyboard.type('pwd\n');
  await expect(page.locator('.xterm-screen')).toContainText('/home/aura/projects');
  
  // Create file
  await page.keyboard.type('touch README.md\n');
  await page.keyboard.type('ls\n');
  await expect(page.locator('.xterm-screen')).toContainText('README.md');
});
```

### Debugger App Tests

#### Unit Test
```typescript
// debuggerStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebuggerStore } from './debuggerStore';

describe('Debugger Store', () => {
  it('should add breakpoint', () => {
    const { result } = renderHook(() => useDebuggerStore());
    
    act(() => {
      result.current.addBreakpoint(42);
    });
    
    expect(result.current.breakpoints).toHaveLength(1);
    expect(result.current.breakpoints[0].line).toBe(42);
  });
});
```

#### Integration Test
```typescript
// executor.test.ts
import { executeCode } from '../core/executor';

describe('Code Execution', () => {
  it('should execute code and capture output', async () => {
    const code = 'console.log("Hello World");';
    
    await executeCode(code);
    
    const { output } = useDebuggerStore.getState();
    expect(output).toContain('Hello World');
  });
});
```

### Desktop App Tests

#### Unit Test
```typescript
// desktopStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDesktopStore } from './desktopStore';

describe('Desktop Store', () => {
  it('should launch app', () => {
    const { result } = renderHook(() => useDesktopStore());
    
    act(() => {
      result.current.launchApp('terminal');
    });
    
    expect(result.current.runningApps).toContain('terminal');
    expect(result.current.activeAppId).toBe('terminal');
  });
});
```

---

## 📈 Success Metrics

### Coverage Targets
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: 90%+ critical paths
- **Overall**: 80%+ total coverage

### Performance Targets
- **Unit Tests**: < 5s total
- **Integration Tests**: < 30s total
- **E2E Tests**: < 5min total
- **Autopilot**: < 10min total

### Quality Targets
- **Flakiness**: < 1% flaky tests
- **Maintenance**: < 10% test updates per feature
- **Reliability**: 99%+ test reliability

---

## 🛠️ Tools & Setup

### Required Packages

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/ui": "^1.0.4",
    "c8": "^8.0.1",
    "jsdom": "^23.0.1",
    "playwright": "^1.40.0",
    "vitest": "^1.0.4"
  }
}
```

### Configuration Files

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

**playwright.config.ts**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://auraos-desktop.web.app',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
npx playwright install
```

### 2. Run Tests
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests
pnpm test:all

# Watch mode
pnpm test:watch

# UI mode
pnpm test:ui
```

### 3. View Coverage
```bash
pnpm test:unit --coverage
open coverage/index.html
```

### 4. Run Autopilot
```bash
pnpm test:autopilot
```

---

**Ready to implement comprehensive testing!** 🧪
