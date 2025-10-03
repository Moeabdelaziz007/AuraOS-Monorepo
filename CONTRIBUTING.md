# Contributing to AuraOS

Thank you for your interest in contributing to AuraOS! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 10+
- pnpm 8+ (package manager)
- Git
- Firebase account (for testing)
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**

```bash
# Click "Fork" on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/AuraOS-Monorepo.git
cd AuraOS-Monorepo
```

2. **Add upstream remote**

```bash
git remote add upstream https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
```

3. **Install dependencies**

```bash
pnpm install
```

4. **Set up environment variables**

```bash
cp .env.template .env
# Edit .env with your Firebase credentials
```

5. **Verify setup**

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## 🔄 Development Workflow

### 1. Sync with Upstream

Always start by syncing with the latest changes:

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create a Feature Branch

Use descriptive branch names:

```bash
# Feature branches
git checkout -b feature/add-new-app

# Bug fix branches
git checkout -b fix/window-resize-bug

# Documentation branches
git checkout -b docs/update-api-reference
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-settings-app` |
| Bug Fix | `fix/description` | `fix/taskbar-overflow` |
| Documentation | `docs/description` | `docs/add-api-guide` |
| Refactor | `refactor/description` | `refactor/window-manager` |
| Test | `test/description` | `test/add-billing-tests` |
| Chore | `chore/description` | `chore/update-dependencies` |

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits focused and atomic

### 4. Test Your Changes

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @auraos/billing test

# Type check
pnpm typecheck

# Lint and fix
pnpm lint:fix

# Format code
pnpm format
```

### 5. Commit Changes

Follow our commit message guidelines (see below).

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 💻 Coding Standards

### TypeScript

**Use TypeScript for all new code:**

```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad - No types
function getUser(id) {
  // ...
}
```

**Avoid `any` type:**

```typescript
// ✅ Good - Specific type
function processData(data: UserData): void {
  // ...
}

// ❌ Bad - Using any
function processData(data: any): void {
  // ...
}
```

### React Components

**Use functional components with hooks:**

```typescript
// ✅ Good - Functional component
export function MyComponent({ title }: { title: string }) {
  const [count, setCount] = useState(0);
  
  return <div>{title}: {count}</div>;
}

// ❌ Bad - Class component
export class MyComponent extends React.Component {
  // ...
}
```

**Use proper prop types:**

```typescript
interface MyComponentProps {
  title: string;
  count?: number;
  onUpdate: (value: number) => void;
}

export function MyComponent({ title, count = 0, onUpdate }: MyComponentProps) {
  // ...
}
```

### Code Style

**Formatting:**
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line
- Max line length: 100 characters

**Naming Conventions:**

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Functions | camelCase | `getUserData`, `handleClick` |
| Components | PascalCase | `UserProfile`, `WindowManager` |
| Interfaces | PascalCase | `UserData`, `WindowProps` |
| Types | PascalCase | `SubscriptionTier`, `AppStatus` |
| Files | kebab-case | `user-profile.tsx`, `api-client.ts` |

### Comments

**Document the "why", not the "what":**

```typescript
// ✅ Good - Explains reasoning
// Use debounce to prevent excessive API calls during rapid typing
const debouncedSearch = debounce(searchUsers, 300);

// ❌ Bad - States the obvious
// This function debounces the search
const debouncedSearch = debounce(searchUsers, 300);
```

**Use JSDoc for public APIs:**

```typescript
/**
 * Creates a new user profile in Firestore
 * 
 * @param uid - User ID from Firebase Auth
 * @param data - Partial user profile data
 * @returns Promise that resolves when profile is created
 * @throws Error if user already exists
 */
export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  // ...
}
```

### Error Handling

**Always handle errors:**

```typescript
// ✅ Good - Proper error handling
try {
  const user = await getUserProfile(uid);
  return user;
} catch (error) {
  console.error('Failed to get user profile:', error);
  throw new Error('User profile not found');
}

// ❌ Bad - Unhandled promise
const user = await getUserProfile(uid); // Can throw
```

### Async/Await

**Prefer async/await over promises:**

```typescript
// ✅ Good - Async/await
async function loadData() {
  const user = await getUser();
  const posts = await getPosts(user.id);
  return { user, posts };
}

// ❌ Bad - Promise chains
function loadData() {
  return getUser()
    .then(user => getPosts(user.id)
      .then(posts => ({ user, posts })));
}
```

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Scope

The scope should be the package or area affected:
- `ui` - UI package
- `core` - Core package
- `firebase` - Firebase package
- `billing` - Billing package
- `api` - API service
- `docs` - Documentation

### Examples

```bash
# Feature
feat(ui): add settings app with theme switcher

# Bug fix
fix(billing): correct subscription status check

# Documentation
docs(api): add Socket.io events documentation

# Refactor
refactor(core): simplify MCP gateway logic

# Test
test(firebase): add user profile service tests

# Chore
chore(deps): update Firebase SDK to v10.8.0
```

### Commit Message Rules

1. **Subject line:**
   - Use imperative mood ("add" not "added")
   - Don't capitalize first letter
   - No period at the end
   - Max 72 characters

2. **Body (optional):**
   - Explain what and why, not how
   - Wrap at 72 characters
   - Separate from subject with blank line

3. **Footer (optional):**
   - Reference issues: `Fixes #123`
   - Breaking changes: `BREAKING CHANGE: description`
   - Co-authors: `Co-authored-by: Name <email>`

### Example with Body

```
feat(ui): add drag-and-drop file upload

Implement drag-and-drop functionality for file uploads in the
File Manager app. Users can now drag files from their desktop
directly into the app window.

- Add drop zone component
- Handle file validation
- Show upload progress
- Display error messages

Fixes #45
```

## 🔀 Pull Request Process

### Before Creating PR

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ Documentation is updated
4. ✅ Commits follow guidelines
5. ✅ Branch is up to date with main

### PR Title

Use the same format as commit messages:

```
feat(ui): add settings app with theme switcher
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
- [ ] Dependent changes merged

## Related Issues
Fixes #123
Related to #456
```

### Review Process

1. **Automated Checks:**
   - CI/CD pipeline runs tests
   - Linting and type checking
   - Build verification

2. **Code Review:**
   - At least one approval required
   - Address all review comments
   - Keep discussions professional

3. **Merge:**
   - Squash and merge (preferred)
   - Rebase and merge (for clean history)
   - Never force push to main

## 🧪 Testing Requirements

### Test Coverage

- **Minimum coverage:** 60% overall
- **Critical packages:** 70%+ (billing, firebase, api)
- **New features:** Must include tests

### Test Types

**Unit Tests:**
```typescript
import { canCreateWorkflow } from '@auraos/billing';

describe('canCreateWorkflow', () => {
  test('allows creation under limit', () => {
    const subscription = { tier: 'free', status: 'active' };
    const { allowed } = canCreateWorkflow(subscription, 2);
    expect(allowed).toBe(true);
  });
});
```

**Integration Tests:**
```typescript
describe('User Profile Integration', () => {
  test('creates and retrieves user profile', async () => {
    await createUserProfile('user_123', { email: 'test@example.com' });
    const profile = await getUserProfile('user_123');
    expect(profile.email).toBe('test@example.com');
  });
});
```

**Component Tests:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Window } from './Window';

test('closes window on close button click', () => {
  const onClose = jest.fn();
  render(<Window title="Test" onClose={onClose} />);
  
  fireEvent.click(screen.getByLabelText('Close'));
  expect(onClose).toHaveBeenCalled();
});
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @auraos/billing test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing APIs
- Fixing bugs that affect usage
- Adding configuration options
- Updating dependencies

### Documentation Types

1. **README files** - Package overviews and usage
2. **API documentation** - Function and type references
3. **Guides** - Step-by-step tutorials
4. **Code comments** - Inline explanations

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep examples up to date
- Link to related documentation

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Verify it's reproducible
3. Test on latest version
4. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, or other context
```

## 🎯 Good First Issues

Look for issues labeled `good first issue` - these are great for new contributors!

## 📞 Getting Help

- **GitHub Issues:** For bugs and features
- **Discussions:** For questions and ideas
- **Documentation:** Check docs first

## 🙏 Thank You

Thank you for contributing to AuraOS! Your efforts help make this project better for everyone.

---

**Happy Coding! 🚀**
