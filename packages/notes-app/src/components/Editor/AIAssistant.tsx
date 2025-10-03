/**
 * AI Assistant Panel Component
 * Provides AI-powered features for note editing
 */

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Sparkles,
  FileText,
  Languages,
  Lightbulb,
  CheckCircle,
  X,
  Loader,
} from 'lucide-react';
import { Note } from '../../types/note.types';
import { AICompletionService } from '../../services/ai/completion.service';
import { AISummarizationService } from '../../services/ai/summarization.service';

interface AIAssistantProps {
  note: Note;
  editor: Editor;
  onClose: () => void;
}

type AIAction =
  | 'summarize'
  | 'keypoints'
  | 'improve'
  | 'expand'
  | 'translate'
  | 'tone'
  | 'grammar'
  | 'continue';

export const AIAssistant: React.FC<AIAssistantProps> = ({ note, editor, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);

  const completionService = AICompletionService.getInstance();
  const summarizationService = AISummarizationService.getInstance();

  const handleAction = async (action: AIAction) => {
    setSelectedAction(action);
    setIsProcessing(true);
    setResult('');

    try {
      const content = editor.getText();
      let output = '';

      switch (action) {
        case 'summarize':
          output = await summarizationService.summarize(content);
          break;

        case 'keypoints':
          const keyPoints = await summarizationService.extractKeyPoints(content);
          output = keyPoints.map((point) => `• ${point}`).join('\n');
          break;

        case 'improve':
          output = await completionService.improveWriting(content);
          break;

        case 'expand':
          const selection = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
          );
          if (selection) {
            output = await completionService.expandBulletPoint(selection);
          } else {
            output = 'Please select text to expand';
          }
          break;

        case 'translate':
          const translation = await summarizationService.translate(content, 'ar');
          output = translation.translatedText;
          break;

        case 'tone':
          output = await completionService.changeTone(content, 'professional');
          break;

        case 'grammar':
          output = await completionService.fixGrammar(content);
          break;

        case 'continue':
          output = await completionService.continueWriting(content);
          break;
      }

      setResult(output);
    } catch (error) {
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const applyResult = () => {
    if (result && selectedAction) {
      if (selectedAction === 'keypoints' || selectedAction === 'summarize') {
        // Insert at end
        editor.commands.focus('end');
        editor.commands.insertContent('\n\n' + result);
      } else {
        // Replace content
        editor.commands.setContent(result);
      }
      setResult('');
      setSelectedAction(null);
    }
  };

  const actions = [
    {
      id: 'summarize' as AIAction,
      label: 'Summarize',
      icon: <FileText size={18} />,
      description: 'Generate a concise summary',
    },
    {
      id: 'keypoints' as AIAction,
      label: 'Key Points',
      icon: <Lightbulb size={18} />,
      description: 'Extract main points',
    },
    {
      id: 'improve' as AIAction,
      label: 'Improve',
      icon: <Sparkles size={18} />,
      description: 'Enhance clarity and style',
    },
    {
      id: 'expand' as AIAction,
      label: 'Expand',
      icon: <FileText size={18} />,
      description: 'Expand selected text',
    },
    {
      id: 'translate' as AIAction,
      label: 'Translate',
      icon: <Languages size={18} />,
      description: 'Translate to Arabic',
    },
    {
      id: 'tone' as AIAction,
      label: 'Change Tone',
      icon: <Sparkles size={18} />,
      description: 'Make it professional',
    },
    {
      id: 'grammar' as AIAction,
      label: 'Fix Grammar',
      icon: <CheckCircle size={18} />,
      description: 'Correct errors',
    },
    {
      id: 'continue' as AIAction,
      label: 'Continue',
      icon: <FileText size={18} />,
      description: 'Continue writing',
    },
  ];

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-500" size={20} />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Actions Grid */}
      <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-200">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={isProcessing}
            className={`p-3 rounded-lg border transition-all text-left ${
              selectedAction === action.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {action.icon}
              <span className="font-medium text-sm">{action.label}</span>
            </div>
            <p className="text-xs text-gray-500">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Result Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin text-blue-500" size={32} />
            <span className="ml-2 text-gray-600">Processing...</span>
          </div>
        )}

        {result && !isProcessing && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyResult}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Apply
              </button>
              <button
                onClick={() => {
                  setResult('');
                  setSelectedAction(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!result && !isProcessing && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Select an action to get started</p>
            <p className="text-sm mt-2">AI will help you improve your note</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">💡 Tips:</p>
          <ul className="space-y-1">
            <li>• Select text before using "Expand"</li>
            <li>• Use "Continue" to keep writing</li>
            <li>• Press Ctrl+K to toggle this panel</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
