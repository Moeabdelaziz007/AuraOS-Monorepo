# Instructions for AI Agents

**For: Claude, GPT-4, Copilot, Cursor AI, and other AI coding assistants**

This file contains everything an AI agent needs to work effectively with this codebase.

---

## 🎯 Project Overview

**Name**: AuraOS  
**Type**: Web-based Operating System with AI Integration  
**Tech Stack**: React + TypeScript + Vite + Firebase + Tailwind CSS  
**Architecture**: Monorepo with multiple packages  

---

## 📁 Critical File Locations

### Main Application
- **Entry Point**: `packages/ui/src/main.tsx`
- **Root Component**: `packages/ui/src/App.tsx`
- **Components**: `packages/ui/src/components/`
- **Pages**: `packages/ui/src/pages/`
- **Hooks**: `packages/ui/src/hooks/`

### Business Logic
- **AI Services**: `packages/core/src/ai/`
- **Learning System**: `packages/core/src/learning/`
- **MCP Tools**: `packages/core/src/mcp/`
- **Firebase**: `packages/firebase/src/`

### Configuration
- **Environment**: `.env` (secrets), `.env.template` (template)
- **TypeScript**: `tsconfig.json`, `packages/*/tsconfig.json`
- **Firebase**: `firebase.json`, `firestore.rules`, `.firebaserc`
- **Build**: `packages/ui/vite.config.ts`
- **Package**: `package.json`, `packages/*/package.json`

### Scripts
- **Setup**: `scripts/setup-workspace.sh`
- **Check**: `scripts/auto-check.sh`
- **Debug**: `scripts/auto-debug.sh`
- **Deploy**: `scripts/auto-deploy.sh`

---

## 🤖 AI Agent Workflow

### 1. Before Making Changes

```bash
# Always run this first
npm run auto-check
```

**What it checks:**
- Node.js version
- Environment variables
- TypeScript errors
- ESLint issues
- Firebase configuration
- Git status
- Security issues

### 2. Making Changes

**Rules:**
1. ✅ Read the file before editing
2. ✅ Maintain existing code style
3. ✅ Use TypeScript types
4. ✅ Follow React best practices
5. ✅ Add comments for complex logic
6. ❌ Never hardcode API keys
7. ❌ Never commit `.env` file
8. ❌ Never remove error handling

**Code Style:**
- Use functional components
- Use hooks (useState, useEffect, etc.)
- Use TypeScript interfaces
- Use Tailwind CSS for styling
- Use async/await for promises
- Use proper error handling

### 3. After Making Changes

```bash
# Check for errors
npm run auto-check

# Fix common issues
npm run auto-debug

# Test locally
npm run dev:desktop

# Deploy (if approved)
npm run auto-deploy "feat: description"
```

---

## 🔍 Understanding the Codebase

### Component Structure

```typescript
// Standard component pattern
import React from 'react';

interface Props {
  title: string;
  onClose: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onClose }) => {
  const [state, setState] = React.useState<string>('');

  React.useEffect(() => {
    // Side effects here
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1>{title}</h1>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

### State Management

```typescript
// Using Zustand (in packages/ui/src/store/)
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Firebase Integration

```typescript
// Using Firebase (in packages/firebase/src/)
import { db } from './config';
import { collection, addDoc } from 'firebase/firestore';

export const addDocument = async (data: any) => {
  const docRef = await addDoc(collection(db, 'collection'), data);
  return docRef.id;
};
```

### AI Services

```typescript
// Using AI (in packages/core/src/ai/)
import { GeminiService } from './gemini';

const ai = new GeminiService(apiKey);
const response = await ai.generateText(prompt);
```

---

## 📝 Common Tasks

### Task 1: Add New Component

```bash
# 1. Create file
touch packages/ui/src/components/NewComponent.tsx

# 2. Write component (see template above)

# 3. Export from index
echo "export { NewComponent } from './NewComponent';" >> packages/ui/src/components/index.ts

# 4. Use in page
# Import and use in packages/ui/src/pages/YourPage.tsx

# 5. Test
npm run dev:desktop

# 6. Check and deploy
npm run auto-check && npm run auto-deploy "feat: add NewComponent"
```

### Task 2: Fix Bug

```bash
# 1. Identify the file
# Use IDE search or grep

# 2. Make the fix
# Edit the file

# 3. Test
npm run dev:desktop

# 4. Verify
npm run auto-check

# 5. Deploy
npm run auto-deploy "fix: description of bug"
```

### Task 3: Add API Endpoint

```bash
# 1. Add to packages/core/src/api/
# Create new service file

# 2. Add types
# Define interfaces in types.ts

# 3. Integrate
# Use in components

# 4. Test
npm run dev:desktop

# 5. Deploy
npm run auto-deploy "feat: add API endpoint"
```

### Task 4: Update Database Rules

```bash
# 1. Edit firestore.rules
# Add new collection rules

# 2. Test with emulator (optional)
firebase emulators:start

# 3. Deploy
npm run auto-deploy "feat: update firestore rules"
```

### Task 5: Add Environment Variable

```bash
# 1. Add to .env.template
echo "VITE_NEW_VAR=description" >> .env.template

# 2. Add to .env
echo "VITE_NEW_VAR=actual_value" >> .env

# 3. Use in code
const value = import.meta.env.VITE_NEW_VAR;

# 4. Document
# Add comment in .env.template

# 5. Deploy
npm run auto-deploy "feat: add new environment variable"
```

---

## 🚨 Error Handling

### TypeScript Errors

```bash
# Check types
npm run typecheck

# Common fixes:
# - Add missing types
# - Fix type mismatches
# - Add proper interfaces
```

### ESLint Errors

```bash
# Check linting
npm run lint

# Auto-fix
npm run lint:fix

# Common issues:
# - Unused variables
# - Missing dependencies in useEffect
# - Console.log statements
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build:desktop

# Common causes:
# - Missing dependencies
# - TypeScript errors
# - Import path issues
```

### Runtime Errors

```bash
# Check browser console
# Check terminal output
# Add error boundaries
# Add try-catch blocks
```

---

## 🔐 Security Guidelines

### DO:
- ✅ Use environment variables for secrets
- ✅ Validate user input
- ✅ Use Firebase security rules
- ✅ Sanitize data before display
- ✅ Use HTTPS in production
- ✅ Implement proper authentication
- ✅ Log security events

### DON'T:
- ❌ Hardcode API keys
- ❌ Commit `.env` file
- ❌ Expose sensitive data in logs
- ❌ Trust user input
- ❌ Skip authentication checks
- ❌ Use `eval()` or `dangerouslySetInnerHTML`
- ❌ Store passwords in plain text

---

## 📊 Code Quality Standards

### TypeScript
- Use strict mode
- Define interfaces for all props
- Use proper types (not `any`)
- Export types when needed

### React
- Use functional components
- Use hooks properly
- Avoid prop drilling (use context/store)
- Memoize expensive computations
- Clean up effects

### Styling
- Use Tailwind CSS classes
- Follow mobile-first approach
- Use consistent spacing
- Support dark mode

### Performance
- Lazy load components
- Optimize images
- Minimize bundle size
- Use code splitting

---

## 🧪 Testing

### Manual Testing
```bash
# Start dev server
npm run dev:desktop

# Test in browser
# - Check functionality
# - Check responsive design
# - Check error handling
# - Check performance
```

### Automated Checks
```bash
# Run all checks
npm run auto-check

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format
```

---

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console.log statements
- [ ] Environment variables set
- [ ] Firebase token configured
- [ ] Changes tested locally
- [ ] Commit message is descriptive

### Deploy Command
```bash
npm run auto-deploy "type: description"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Tests
- `chore:` - Maintenance

---

## 📚 Important Patterns

### Pattern 1: Async Data Fetching

```typescript
const [data, setData] = useState<Data | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Pattern 2: Form Handling

```typescript
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.submit(formData);
  } catch (error) {
    console.error(error);
  }
};
```

### Pattern 3: Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## 🎯 AI Agent Best Practices

1. **Always read before writing**
   - Understand existing code
   - Follow established patterns
   - Maintain consistency

2. **Use automated tools**
   - Run `npm run auto-check` frequently
   - Use `npm run auto-debug` for fixes
   - Let automation handle repetitive tasks

3. **Write clear code**
   - Use descriptive names
   - Add comments for complex logic
   - Keep functions small and focused

4. **Handle errors properly**
   - Use try-catch blocks
   - Provide user feedback
   - Log errors appropriately

5. **Test thoroughly**
   - Test happy path
   - Test error cases
   - Test edge cases

6. **Document changes**
   - Update comments
   - Update README if needed
   - Write clear commit messages

---

## 🔄 Continuous Improvement

### After Each Task
1. Run `npm run auto-check`
2. Review changes
3. Test functionality
4. Update documentation
5. Deploy with clear message

### Weekly
1. Update dependencies: `npm update`
2. Review security: `npm audit`
3. Clean up: `npm run clean`
4. Optimize performance

### Monthly
1. Review and refactor code
2. Update documentation
3. Check for deprecated packages
4. Optimize bundle size

---

## 📞 Getting Help

### For AI Agents
1. Read this file first
2. Check `QUICK-START.md`
3. Run `npm run auto-check`
4. Check error messages
5. Review documentation in `docs/`

### Useful Commands
```bash
# See all commands
npm run

# Check project health
npm run auto-check

# Fix common issues
npm run auto-debug

# View documentation
ls docs/
```

---

## ✅ Final Checklist

Before completing any task:

- [ ] Code follows project patterns
- [ ] TypeScript types are correct
- [ ] No hardcoded secrets
- [ ] Error handling is proper
- [ ] Code is tested locally
- [ ] `npm run auto-check` passes
- [ ] Commit message is clear
- [ ] Documentation is updated

---

**Remember**: When in doubt, run `npm run auto-check` and `npm run auto-debug`

**Last Updated**: October 3, 2025  
**For**: AI Coding Assistants  
**Maintained By**: AuraOS Team
