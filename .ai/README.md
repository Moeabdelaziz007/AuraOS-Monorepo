# AI Agent Configuration

This directory contains instructions and configuration for AI coding assistants.

## Files

- **INSTRUCTIONS.md** - Complete guide for AI agents working with this codebase
- **README.md** - This file

## For AI Agents

If you're an AI agent (Claude, GPT-4, Copilot, Cursor AI, etc.), read `INSTRUCTIONS.md` first.

It contains:
- Project structure
- Common tasks
- Code patterns
- Best practices
- Security guidelines
- Error handling
- Deployment process

## For Developers

These files help AI assistants understand the project better and provide more accurate help.

You can customize `INSTRUCTIONS.md` to:
- Add project-specific patterns
- Document custom conventions
- Provide examples
- Add troubleshooting tips

## Quick Reference

```bash
# For AI: Read this first
cat .ai/INSTRUCTIONS.md

# For Humans: Start here
cat QUICK-START.md

# For detailed setup
cat docs/IDE-SETUP.md
```

## Integration

### GitHub Copilot
- Automatically reads `.ai/INSTRUCTIONS.md`
- Uses it for context-aware suggestions

### Cursor AI
- Reads `.ai/` directory for context
- Uses instructions for better code generation

### Claude / GPT-4
- Provide `INSTRUCTIONS.md` as context
- Reference for specific tasks

## Maintenance

Keep these files updated when:
- Project structure changes
- New patterns are introduced
- Dependencies are updated
- Deployment process changes

---

**Last Updated**: October 3, 2025
