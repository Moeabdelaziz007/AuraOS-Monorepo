-- Migration: Create notes table with full-text search support
-- Sprint 2: Core Features - Notes Backend

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    color VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    search_vector tsvector,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_notes_search_vector ON notes USING GIN(search_vector);

-- Function to update search_vector automatically
CREATE OR REPLACE FUNCTION notes_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain search_vector on insert/update
CREATE TRIGGER notes_search_vector_trigger
    BEFORE INSERT OR UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION notes_search_vector_update();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for active notes (not archived)
CREATE OR REPLACE VIEW active_notes AS
SELECT n.*, u.username
FROM notes n
JOIN users u ON n.user_id = u.id
WHERE n.is_archived = false
ORDER BY n.is_pinned DESC, n.updated_at DESC;

-- Create view for pinned notes
CREATE OR REPLACE VIEW pinned_notes AS
SELECT n.*, u.username
FROM notes n
JOIN users u ON n.user_id = u.id
WHERE n.is_pinned = true AND n.is_archived = false
ORDER BY n.updated_at DESC;

-- Sample data for testing (optional)
-- INSERT INTO notes (user_id, title, content, tags) VALUES
-- ((SELECT id FROM users LIMIT 1), 'Welcome to AuraOS Notes', 'This is your first note!', ARRAY['welcome', 'getting-started']);

COMMENT ON TABLE notes IS 'User notes with full-text search support';
COMMENT ON COLUMN notes.search_vector IS 'Automatically maintained tsvector for full-text search';
COMMENT ON COLUMN notes.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN notes.is_pinned IS 'Pinned notes appear at the top';
COMMENT ON COLUMN notes.is_archived IS 'Archived notes are hidden from main view';
COMMENT ON COLUMN notes.color IS 'UI color theme for the note';
