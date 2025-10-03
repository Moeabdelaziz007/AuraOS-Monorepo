import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useDebuggerStore } from '../store/debuggerStore';
import type { editor } from 'monaco-editor';
import './CodeEditor.css';

export const CodeEditor: React.FC = () => {
  const { code, setCode, breakpoints, currentLine } = useDebuggerStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
    });

    // Handle gutter clicks for breakpoints
    editor.onMouseDown((e) => {
      const target = e.target;
      if (
        target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const lineNumber = target.position?.lineNumber;
        if (lineNumber) {
          handleBreakpointToggle(lineNumber);
        }
      }
    });
  };

  const handleBreakpointToggle = (line: number) => {
    const { breakpoints, addBreakpoint, removeBreakpoint } = useDebuggerStore.getState();
    const existingBreakpoint = breakpoints.find((bp) => bp.line === line);
    
    if (existingBreakpoint) {
      removeBreakpoint(existingBreakpoint.id);
    } else {
      addBreakpoint(line);
    }
  };

  // Update decorations when breakpoints or current line changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const newDecorations: editor.IModelDeltaDecoration[] = [];

    // Add breakpoint decorations
    breakpoints.forEach((bp) => {
      if (bp.enabled) {
        newDecorations.push({
          range: new monaco.Range(bp.line, 1, bp.line, 1),
          options: {
            isWholeLine: false,
            glyphMarginClassName: 'breakpoint-glyph',
            glyphMarginHoverMessage: { value: 'Breakpoint' },
          },
        });
      }
    });

    // Add current line decoration
    if (currentLine !== null) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'current-line',
          glyphMarginClassName: 'current-line-glyph',
        },
      });
    }

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [breakpoints, currentLine]);

  return (
    <div className="code-editor">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly: false,
        }}
      />
    </div>
  );
};
