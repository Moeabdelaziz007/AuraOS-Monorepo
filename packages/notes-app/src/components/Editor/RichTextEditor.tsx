/**
 * Rich Text Editor Component
 * TipTap-based editor with AI features
 */

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Note } from '../../types/note.types';
import { EditorToolbar } from './EditorToolbar';
import { AIAssistant } from './AIAssistant';
import { useAICompletion } from '../../services/ai/completion.service';

interface RichTextEditorProps {
  note: Note;
  onUpdate: (content: string) => void;
  onTitleChange: (title: string) => void;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  note,
  onUpdate,
  onTitleChange,
  readOnly = false,
}) => {
  const { getCompletion, isLoading: aiLoading } = useAICompletion();
  const [showAIPanel, setShowAIPanel] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing... (Press / for commands, Ctrl+Space for AI)',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: note.content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onUpdate(content);
      
      // Trigger AI suggestions on pause
      handleAISuggestion(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-4',
      },
      handleKeyDown: (view, event) => {
        // Ctrl+Space for AI completion
        if (event.ctrlKey && event.code === 'Space') {
          event.preventDefault();
          handleAICompletion();
          return true;
        }
        
        // Ctrl+K for AI assistant
        if (event.ctrlKey && event.key === 'k') {
          event.preventDefault();
          setShowAIPanel(!showAIPanel);
          return true;
        }
        
        return false;
      },
    },
  });

  // Handle AI completion
  const handleAICompletion = async () => {
    if (!editor) return;
    
    const text = editor.getText();
    const cursorPos = editor.state.selection.from;
    const textBeforeCursor = text.substring(0, cursorPos);
    
    try {
      const completion = await getCompletion(textBeforeCursor, {
        maxTokens: 50,
        temperature: 0.7,
      });
      
      if (completion) {
        // Insert completion at cursor
        editor.commands.insertContent(completion);
      }
    } catch (error) {
      console.error('AI completion error:', error);
    }
  };

  // Handle AI suggestions (debounced)
  const handleAISuggestion = React.useCallback(
    debounce(async (text: string) => {
      if (text.length < 50) return; // Only suggest for longer text
      
      try {
        const suggestion = await getCompletion(text, {
          maxTokens: 30,
          temperature: 0.5,
          prompt: 'Suggest the next sentence:',
        });
        
        if (suggestion) {
          setAiSuggestion(suggestion);
        }
      } catch (error) {
        console.error('AI suggestion error:', error);
      }
    }, 1000),
    []
  );

  // Accept AI suggestion
  const acceptSuggestion = () => {
    if (editor && aiSuggestion) {
      editor.commands.insertContent(' ' + aiSuggestion);
      setAiSuggestion('');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Title Input */}
      <div className="border-b border-gray-200 p-4">
        <input
          type="text"
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full text-3xl font-bold focus:outline-none"
          disabled={readOnly}
        />
        
        {/* Metadata */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{note.metadata.wordCount} words</span>
          <span>•</span>
          <span>{note.metadata.readingTime} min read</span>
          <span>•</span>
          <span>
            Updated {new Date(note.metadata.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && <EditorToolbar editor={editor} />}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />
        
        {/* AI Suggestion Overlay */}
        {aiSuggestion && !readOnly && (
          <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-md">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  AI Suggestion
                </div>
                <div className="text-sm text-gray-700">{aiSuggestion}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={acceptSuggestion}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => setAiSuggestion('')}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      {showAIPanel && (
        <AIAssistant
          note={note}
          editor={editor}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center gap-4">
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Space</kbd> AI Complete
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+K</kbd> AI Assistant
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">/</kbd> Commands
        </span>
      </div>
    </div>
  );
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
