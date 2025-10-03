# AuraOS Notes - Testing Guide

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm --filter @auraos/notes test

# Run tests with coverage
pnpm --filter @auraos/notes test -- --coverage

# Run tests in watch mode
pnpm --filter @auraos/notes test -- --watch

# Run specific test file
pnpm --filter @auraos/notes test Sidebar.test.tsx
```

## Test Structure

```
apps/notes/src/
├── components/
│   └── __tests__/
│       ├── Sidebar.test.tsx       (28 tests)
│       ├── NoteList.test.tsx      (32 tests)
│       └── NoteEditor.test.tsx    (25 tests)
├── lib/
│   └── __tests__/
│       └── notes-client.test.ts   (33 tests)
└── test/
    └── setup.ts                   (Test configuration)
```

## Backend Tests

```
packages/core/src/mcp/__tests__/
├── test-utils.ts                  (Mocking utilities)
├── notes.test.ts                  (31 tests)
└── notes-ai.test.ts               (24 tests)
```

## Test Coverage

### Components
- **Sidebar:** User interactions, folder management, tag selection
- **NoteList:** Note display, search, actions (pin, archive, delete)
- **NoteEditor:** Rich text editing, AI features, auto-save

### Backend
- **NotesMCP:** CRUD operations, authorization, Firestore integration
- **NotesAIMCP:** AI features, embeddings, fallback mechanisms

### Integration
- **NotesClient:** API wrapper, error handling, MCP integration

## Running Specific Tests

```bash
# Component tests
pnpm test Sidebar
pnpm test NoteList
pnpm test NoteEditor

# Backend tests
cd packages/core
pnpm test notes.test
pnpm test notes-ai.test

# Integration tests
pnpm test notes-client
```

## Coverage Reports

After running tests with `--coverage`, view reports:

```bash
# HTML report
open apps/notes/coverage/index.html

# Terminal summary
pnpm test -- --coverage
```

## Test Patterns

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('should handle user interaction', () => {
  render(<Component {...props} />);
  const button = screen.getByText('Click me');
  fireEvent.click(button);
  expect(mockCallback).toHaveBeenCalled();
});
```

### Backend Testing
```typescript
import { vi } from 'vitest';

it('should call Firestore correctly', async () => {
  mockFirestore.getDoc.mockResolvedValue(mockData);
  const result = await server.executeTool('getNote', { noteId: '123' });
  expect(result.success).toBe(true);
});
```

### Integration Testing
```typescript
it('should integrate with MCP server', async () => {
  mockServer.executeTool.mockResolvedValue({ success: true, data: {} });
  const result = await client.getNote('123');
  expect(mockServer.executeTool).toHaveBeenCalledWith('getNote', ...);
});
```

## Debugging Tests

```bash
# Run single test with verbose output
pnpm test Sidebar.test.tsx -- --reporter=verbose

# Debug specific test
pnpm test -- --no-coverage --reporter=verbose Sidebar.test.tsx

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

### 1. Component Tests
```typescript
// apps/notes/src/components/__tests__/NewComponent.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('should render correctly', () => {
    render(<NewComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### 2. Backend Tests
```typescript
// packages/core/src/mcp/__tests__/new-server.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { NewServer } from '../new-server';
import { setupFirestoreMocks, resetAllMocks } from './test-utils';

setupFirestoreMocks();

describe('NewServer', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should execute tool correctly', async () => {
    // Test implementation
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

**2. Coverage not generating**
```bash
# Ensure vitest config is correct
# Check vitest.config.ts coverage settings
```

**3. Mock not working**
```bash
# Ensure mocks are set up before imports
# Use vi.mock() at top of test file
```

**4. Async tests timing out**
```typescript
// Increase timeout for specific test
it('should handle async', async () => {
  await waitFor(() => {
    expect(result).toBeDefined();
  }, { timeout: 5000 });
});
```

## Best Practices

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const props = { ... };
     
     // Act
     render(<Component {...props} />);
     fireEvent.click(screen.getByText('Button'));
     
     // Assert
     expect(mockCallback).toHaveBeenCalled();
   });
   ```

2. **Test User Behavior, Not Implementation**
   ```typescript
   // Good
   expect(screen.getByText('Success')).toBeInTheDocument();
   
   // Avoid
   expect(component.state.success).toBe(true);
   ```

3. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should display error message when API call fails', () => {});
   
   // Avoid
   it('test error', () => {});
   ```

4. **Keep Tests Independent**
   ```typescript
   beforeEach(() => {
     // Reset state before each test
     vi.clearAllMocks();
   });
   ```

5. **Mock External Dependencies**
   ```typescript
   vi.mock('@auraos/core/src/mcp', () => ({
     notesMCPServer: { executeTool: vi.fn() }
   }));
   ```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

For test-related issues:
1. Check this README
2. Review existing test files for patterns
3. Check test output for specific errors
4. Review NOTES_APP_TEST_SUITE.md for comprehensive documentation
