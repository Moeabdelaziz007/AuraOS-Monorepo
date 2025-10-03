# AuraOS Terminal - Testing Guide

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm --filter @auraos/terminal test

# Run tests with coverage
pnpm --filter @auraos/terminal test -- --coverage

# Run tests in watch mode
pnpm --filter @auraos/terminal test -- --watch

# Run specific test file
pnpm --filter @auraos/terminal test CommandParser.test.ts
```

## Test Structure

```
apps/terminal/src/
├── commands/
│   └── __tests__/
│       ├── test-utils.ts              (Mocking utilities)
│       ├── CommandParser.test.ts      (60+ tests)
│       ├── AICommandExecutor.test.ts  (50+ tests)
│       └── ClientCommands.test.ts     (40+ tests)
├── components/
│   └── __tests__/
│       └── TerminalApp.test.tsx       (50+ tests)
└── test/
    └── setup.ts                       (Test configuration)
```

## Test Coverage

### Command Logic (150+ tests)
- **CommandParser:** Parsing, type detection, edge cases
- **AICommandExecutor:** System commands, natural language, BASIC
- **ClientCommands:** Help, history, theme, settings

### Integration (50+ tests)
- **TerminalApp:** Command routing, MCP integration, user interaction

## Running Specific Tests

```bash
# Command parser tests
pnpm test CommandParser

# AI executor tests
pnpm test AICommandExecutor

# Client commands tests
pnpm test ClientCommands

# Integration tests
pnpm test TerminalApp
```

## Coverage Reports

After running tests with `--coverage`, view reports:

```bash
# HTML report
open apps/terminal/coverage/index.html

# Terminal summary
pnpm test -- --coverage
```

## Test Patterns

### Command Parsing
```typescript
import { CommandParser } from '../CommandParser';

it('should parse command with arguments', () => {
  const result = CommandParser.parse('cat file.txt');
  expect(result.command).toBe('cat');
  expect(result.args).toEqual(['file.txt']);
});
```

### Command Execution
```typescript
import { AICommandExecutor } from '../AICommandExecutor';
import { createMockMCP } from './test-utils';

it('should execute ls command', async () => {
  const mockMCP = createMockMCP();
  const executor = new AICommandExecutor(mockMCP);
  
  const parsed = CommandParser.parse('ls');
  const result = await executor.executeSystemCommand(parsed);
  
  expect(result.exitCode).toBe(0);
  expect(mockMCP.file.list).toHaveBeenCalled();
});
```

### Component Testing
```typescript
import { render } from '@testing-library/react';
import { TerminalApp } from '../TerminalApp';

it('should execute help command', async () => {
  render(<TerminalApp />);
  const result = await onCommand('help');
  expect(result.output).toContain('AuraOS Terminal');
});
```

## Debugging Tests

```bash
# Run single test with verbose output
pnpm test CommandParser.test.ts -- --reporter=verbose

# Debug specific test
pnpm test -- --no-coverage --reporter=verbose CommandParser.test.ts

# Run with console output
pnpm test -- --silent=false
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-commit hooks (optional)

### Required Checks
- ✅ All tests pass
- ✅ Coverage ≥ 70%
- ✅ No TypeScript errors
- ✅ Linting passes

## Writing New Tests

### 1. Command Logic Tests
```typescript
// apps/terminal/src/commands/__tests__/NewCommand.test.ts
import { describe, it, expect } from 'vitest';
import { NewCommand } from '../NewCommand';

describe('NewCommand', () => {
  it('should execute correctly', () => {
    // Test implementation
  });
});
```

### 2. Integration Tests
```typescript
// apps/terminal/src/components/__tests__/NewComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('should render correctly', () => {
    render(<NewComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

**1. Tests fail with "Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

**2. Mock not working**
```bash
# Ensure mocks are set up before imports
# Use vi.mock() at top of test file
```

**3. Async tests timing out**
```typescript
// Increase timeout for specific test
it('should handle async', async () => {
  await waitFor(() => {
    expect(result).toBeDefined();
  }, { timeout: 5000 });
});
```

## Best Practices

1. **Test User Behavior**
   ```typescript
   // Good
   expect(result.output).toContain('Success');
   
   // Avoid
   expect(component.state.success).toBe(true);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should execute ls command and list files', () => {});
   
   // Avoid
   it('test ls', () => {});
   ```

3. **Keep Tests Independent**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

4. **Mock External Dependencies**
   ```typescript
   vi.mock('@auraos/hooks', () => ({
     useMCP: () => mockMCP
   }));
   ```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [TERMINAL_APP_TEST_SUITE.md](../../TERMINAL_APP_TEST_SUITE.md) - Comprehensive documentation

## Support

For test-related issues:
1. Check this README
2. Review existing test files for patterns
3. Check test output for specific errors
4. Review TERMINAL_APP_TEST_SUITE.md for comprehensive documentation
