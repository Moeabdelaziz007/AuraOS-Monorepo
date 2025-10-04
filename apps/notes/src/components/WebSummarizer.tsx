/**
 * Web Summarizer Component
 * UI component for web content summarization in the Notes app
 */

import React, { useState, useCallback } from 'react';
import { webSummarizerHandler } from '@auraos/core/autopilot/web-summarizer-handler';

interface WebSummarizerProps {
  onSummarizationComplete?: (result: {
    title: string;
    summary: string;
    noteId?: string;
  }) => void;
  onError?: (error: string) => void;
}

interface SummarizationState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  result?: {
    title: string;
    summary: string;
    keyPoints: string[];
    metadata: {
      author?: string;
      publishedDate?: string;
      wordCount: number;
      readingTime: number;
      confidence: number;
    };
    noteId?: string;
    noteUrl?: string;
  };
  error?: string;
  learningInsights: string[];
}

export const WebSummarizer: React.FC<WebSummarizerProps> = ({
  onSummarizationComplete,
  onError,
}) => {
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState({
    maxSummaryLength: 1000,
    includeMetadata: true,
    saveToNotes: true,
    folder: 'Web Summaries',
    tags: ['web-summary', 'ai-generated'],
  });
  const [state, setState] = useState<SummarizationState>({
    isProcessing: false,
    progress: 0,
    currentStep: '',
    learningInsights: [],
  });

  const handleSummarize = useCallback(async () => {
    if (!url.trim()) {
      onError?.('Please enter a URL');
      return;
    }

    setState({
      isProcessing: true,
      progress: 0,
      currentStep: 'Initializing...',
      learningInsights: [],
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await webSummarizerHandler.summarizeWebContent({
        userId: 'current-user', // This would come from auth context
        sessionId: `session-${Date.now()}`,
        url: url.trim(),
        options,
      });

      clearInterval(progressInterval);

      if (result.success && result.result) {
        setState({
          isProcessing: false,
          progress: 100,
          currentStep: 'Completed',
          result: result.result,
          learningInsights: result.learningInsights,
        });

        onSummarizationComplete?.({
          title: result.result.title,
          summary: result.result.summary,
          noteId: result.result.noteId,
        });
      } else {
        setState({
          isProcessing: false,
          progress: 0,
          currentStep: '',
          error: result.error || 'Summarization failed',
          learningInsights: result.learningInsights,
        });

        onError?.(result.error || 'Summarization failed');
      }
    } catch (error) {
      setState({
        isProcessing: false,
        progress: 0,
        currentStep: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        learningInsights: [],
      });

      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [url, options, onSummarizationComplete, onError]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  const handleOptionChange = useCallback((key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return (
    <div className="web-summarizer">
      <div className="web-summarizer-header">
        <h2>🌐 Web Summarizer</h2>
        <p>Summarize web articles and save them to your notes</p>
      </div>

      <div className="web-summarizer-form">
        <div className="url-input-group">
          <label htmlFor="url-input">Article URL:</label>
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/article"
            disabled={state.isProcessing}
            className="url-input"
          />
        </div>

        <div className="options-group">
          <h3>Options</h3>
          
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                disabled={state.isProcessing}
              />
              Include metadata (author, date, etc.)
            </label>
          </div>

          <div className="option-row">
            <label>
              <input
                type="checkbox"
                checked={options.saveToNotes}
                onChange={(e) => handleOptionChange('saveToNotes', e.target.checked)}
                disabled={state.isProcessing}
              />
              Save to notes
            </label>
          </div>

          <div className="option-row">
            <label>
              Max summary length:
              <input
                type="number"
                value={options.maxSummaryLength}
                onChange={(e) => handleOptionChange('maxSummaryLength', parseInt(e.target.value))}
                disabled={state.isProcessing}
                min="100"
                max="5000"
                step="100"
              />
            </label>
          </div>

          <div className="option-row">
            <label>
              Folder:
              <input
                type="text"
                value={options.folder}
                onChange={(e) => handleOptionChange('folder', e.target.value)}
                disabled={state.isProcessing}
              />
            </label>
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={state.isProcessing || !url.trim()}
          className="summarize-button"
        >
          {state.isProcessing ? 'Summarizing...' : 'Summarize Article'}
        </button>
      </div>

      {state.isProcessing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="progress-text">{state.currentStep}</p>
        </div>
      )}

      {state.error && (
        <div className="error-section">
          <h3>❌ Error</h3>
          <p>{state.error}</p>
        </div>
      )}

      {state.result && (
        <div className="result-section">
          <h3>✅ Summary Complete</h3>
          
          <div className="result-content">
            <h4>{state.result.title}</h4>
            
            <div className="metadata">
              {state.result.metadata.author && (
                <p><strong>Author:</strong> {state.result.metadata.author}</p>
              )}
              {state.result.metadata.publishedDate && (
                <p><strong>Published:</strong> {state.result.metadata.publishedDate}</p>
              )}
              <p><strong>Word Count:</strong> {state.result.metadata.wordCount}</p>
              <p><strong>Reading Time:</strong> {state.result.metadata.readingTime} minutes</p>
              <p><strong>Confidence:</strong> {Math.round(state.result.metadata.confidence * 100)}%</p>
            </div>

            <div className="summary">
              <h5>Summary:</h5>
              <p>{state.result.summary}</p>
            </div>

            {state.result.keyPoints.length > 0 && (
              <div className="key-points">
                <h5>Key Points:</h5>
                <ul>
                  {state.result.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {state.result.noteId && (
              <div className="note-info">
                <p>✅ Saved to notes</p>
                {state.result.noteUrl && (
                  <a href={state.result.noteUrl} target="_blank" rel="noopener noreferrer">
                    View Note
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {state.learningInsights.length > 0 && (
        <div className="learning-insights">
          <h3>🧠 Learning Insights</h3>
          <ul>
            {state.learningInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebSummarizer;
