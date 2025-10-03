# AuraOS Notes

AI-powered note-taking application with smart features.

## Features

- **Rich Text Editor**: Modern editor powered by TipTap
- **AI-Powered**:
  - Automatic summarization
  - Smart tag generation
  - Related notes discovery
  - Content enhancement suggestions
  - Voice-to-text transcription (coming soon)
- **Organization**:
  - Folders and nested folders
  - Tags for flexible categorization
  - Pin important notes
  - Archive old notes
- **Three-Pane Layout**:
  - Folders/Tags sidebar
  - Notes list
  - Rich text editor

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter @auraos/notes dev

# Build for production
pnpm --filter @auraos/notes build

# Run tests
pnpm --filter @auraos/notes test
```

## Architecture

### Backend (MCP Servers)

- **NotesMCP**: Core CRUD operations (create, read, update, delete, list)
- **NotesAIMCP**: AI-powered features (summarize, find related, enhance, etc.)

### Frontend

- **React** with TypeScript
- **TipTap** for rich text editing
- **@auraos/ui** components for consistent design
- **Firebase Firestore** for data persistence

## Usage

1. Create folders to organize your notes
2. Create notes with rich text formatting
3. Use AI features:
   - Click "Summarize" to get a quick summary
   - Click "Find Related" to discover connected notes
   - Click "Generate Tags" for automatic categorization
   - Click "Enhance" for writing suggestions
4. Search and filter notes by folder, tags, or content
5. Pin important notes to keep them at the top

## Integration

The Notes app integrates with:
- **Firebase Firestore**: Data storage
- **Gemini AI**: AI-powered features
- **MCP Protocol**: Tool-based architecture
