import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Debugger from '../../src/components/Debugger';
import { DebugProtocol } from '../../src/core/debugProtocol';

describe('Debugger Integration Tests', () => {
  let protocol: DebugProtocol;

  beforeEach(async () => {
    protocol = new DebugProtocol();
    await protocol.connect('ws://localhost:9229');
  });

  describe('Breakpoint Management', () => {
    it('should set and hit breakpoint', async () => {
      render(<Debugger protocol={protocol} />);
      
      // Load source code
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Click line number to set breakpoint
      const lineNumber = screen.getByTestId('line-number-10');
      await userEvent.click(lineNumber);
      
      // Verify breakpoint indicator
      await waitFor(() => {
        expect(screen.getByTestId('breakpoint-10')).toBeInTheDocument();
      });
      
      // Start debugging
      await userEvent.click(screen.getByTestId('debug-start'));
      
      // Wait for breakpoint hit
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
    });

    it('should manage multiple breakpoints', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set multiple breakpoints
      await userEvent.click(screen.getByTestId('line-number-5'));
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('line-number-15'));
      
      // Verify all breakpoints set
      await waitFor(() => {
        expect(screen.getByTestId('breakpoint-5')).toBeInTheDocument();
        expect(screen.getByTestId('breakpoint-10')).toBeInTheDocument();
        expect(screen.getByTestId('breakpoint-15')).toBeInTheDocument();
      });
      
      // Start debugging and verify hits each breakpoint
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-5')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByTestId('debug-continue'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
    });

    it('should handle conditional breakpoints', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Right-click to set conditional breakpoint
      const lineNumber = screen.getByTestId('line-number-10');
      await userEvent.pointer({ keys: '[MouseRight]', target: lineNumber });
      
      // Enter condition
      const conditionInput = screen.getByTestId('breakpoint-condition-input');
      await userEvent.type(conditionInput, 'x > 5{Enter}');
      
      // Verify conditional breakpoint set
      await waitFor(() => {
        const breakpoint = screen.getByTestId('breakpoint-10');
        expect(breakpoint).toHaveClass('conditional');
      });
    });
  });

  describe('Stepping Through Code', () => {
    it('should step over function calls', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Step over
      await userEvent.click(screen.getByTestId('debug-step-over'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-11')).toBeInTheDocument();
      });
    });

    it('should step into function calls', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint at function call
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Step into
      await userEvent.click(screen.getByTestId('debug-step-into'));
      
      // Verify entered function (different file/line)
      await waitFor(() => {
        const callStack = screen.getByTestId('call-stack');
        const frames = callStack.querySelectorAll('[data-testid^="stack-frame-"]');
        expect(frames.length).toBeGreaterThan(1);
      });
    });

    it('should step out of function', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint inside function
      await userEvent.click(screen.getByTestId('line-number-20'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-20')).toBeInTheDocument();
      });
      
      const initialStackDepth = screen.getByTestId('call-stack')
        .querySelectorAll('[data-testid^="stack-frame-"]').length;
      
      // Step out
      await userEvent.click(screen.getByTestId('debug-step-out'));
      
      await waitFor(() => {
        const newStackDepth = screen.getByTestId('call-stack')
          .querySelectorAll('[data-testid^="stack-frame-"]').length;
        expect(newStackDepth).toBeLessThan(initialStackDepth);
      });
    });
  });

  describe('Variable Inspection', () => {
    it('should display local variables', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Verify variables panel shows local variables
      const variablesPanel = screen.getByTestId('variables-panel');
      await waitFor(() => {
        expect(variablesPanel).not.toBeEmptyDOMElement();
      });
    });

    it('should expand object variables', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Find object variable and expand
      const objectVar = screen.getByTestId('variable-obj');
      await userEvent.click(objectVar);
      
      // Verify properties shown
      await waitFor(() => {
        expect(screen.getByTestId('variable-obj-property-a')).toBeInTheDocument();
      });
    });

    it('should modify variable values', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Double-click variable to edit
      const variable = screen.getByTestId('variable-x');
      await userEvent.dblClick(variable);
      
      // Change value
      const input = screen.getByTestId('variable-edit-input');
      await userEvent.clear(input);
      await userEvent.type(input, '42{Enter}');
      
      // Verify value updated
      await waitFor(() => {
        expect(screen.getByTestId('variable-x')).toHaveTextContent('42');
      });
    });
  });

  describe('Call Stack Navigation', () => {
    it('should display call stack frames', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint in nested function
      await userEvent.click(screen.getByTestId('line-number-20'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-20')).toBeInTheDocument();
      });
      
      // Verify call stack shows multiple frames
      const callStack = screen.getByTestId('call-stack');
      const frames = callStack.querySelectorAll('[data-testid^="stack-frame-"]');
      expect(frames.length).toBeGreaterThan(1);
    });

    it('should navigate between stack frames', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint in nested function
      await userEvent.click(screen.getByTestId('line-number-20'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-20')).toBeInTheDocument();
      });
      
      // Click on parent frame
      const parentFrame = screen.getByTestId('stack-frame-1');
      await userEvent.click(parentFrame);
      
      // Verify code editor shows parent frame location
      await waitFor(() => {
        const highlightedLine = screen.getByTestId('highlighted-line');
        expect(highlightedLine).not.toHaveAttribute('data-line', '20');
      });
    });
  });

  describe('Watch Expressions', () => {
    it('should add and evaluate watch expressions', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Add watch expression
      await userEvent.click(screen.getByTestId('add-watch'));
      const watchInput = screen.getByTestId('watch-input');
      await userEvent.type(watchInput, 'x + y{Enter}');
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Verify watch expression evaluated
      const watchList = screen.getByTestId('watch-list');
      await waitFor(() => {
        expect(watchList).toHaveTextContent('x + y');
        expect(watchList).toHaveTextContent(/\d+/); // Should show result
      });
    });

    it('should update watch values on step', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Add watch
      await userEvent.click(screen.getByTestId('add-watch'));
      await userEvent.type(screen.getByTestId('watch-input'), 'counter{Enter}');
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      const initialValue = screen.getByTestId('watch-value-0').textContent;
      
      // Step over
      await userEvent.click(screen.getByTestId('debug-step-over'));
      
      // Verify watch value updated
      await waitFor(() => {
        const newValue = screen.getByTestId('watch-value-0').textContent;
        expect(newValue).not.toBe(initialValue);
      });
    });
  });

  describe('Console Integration', () => {
    it('should display console output', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('debug-console')).toBeInTheDocument();
      });
      
      // Start debugging
      await userEvent.click(screen.getByTestId('debug-start'));
      
      // Wait for console.log output
      await waitFor(() => {
        const console = screen.getByTestId('console-output');
        expect(console).not.toBeEmptyDOMElement();
      });
    });

    it('should evaluate expressions in console', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('debug-console')).toBeInTheDocument();
      });
      
      // Set breakpoint and start
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-line-10')).toBeInTheDocument();
      });
      
      // Evaluate expression
      const consoleInput = screen.getByTestId('console-input');
      await userEvent.type(consoleInput, '2 + 2{Enter}');
      
      // Verify result
      await waitFor(() => {
        const consoleOutput = screen.getByTestId('console-output');
        expect(consoleOutput).toHaveTextContent('4');
      });
    });

    it('should show console errors', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('debug-console')).toBeInTheDocument();
      });
      
      // Start debugging
      await userEvent.click(screen.getByTestId('debug-start'));
      
      // Wait for error output
      await waitFor(() => {
        const console = screen.getByTestId('console-output');
        const errorMessage = console.querySelector('.console-error');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Source Code Management', () => {
    it('should load and display source code', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        const editor = screen.getByTestId('code-editor');
        expect(editor).not.toBeEmptyDOMElement();
      });
    });

    it('should switch between source files', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Click on different file in file tree
      const fileNode = screen.getByTestId('file-node-utils.js');
      await userEvent.click(fileNode);
      
      // Verify editor shows new file
      await waitFor(() => {
        const editor = screen.getByTestId('code-editor');
        expect(editor).toHaveAttribute('data-file', 'utils.js');
      });
    });

    it('should handle source maps', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set breakpoint in TypeScript file
      await userEvent.click(screen.getByTestId('line-number-10'));
      await userEvent.click(screen.getByTestId('debug-start'));
      
      // Verify breakpoint hit shows TypeScript source, not compiled JS
      await waitFor(() => {
        const editor = screen.getByTestId('code-editor');
        expect(editor).toHaveAttribute('data-file', /\.ts$/);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle runtime errors gracefully', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Start debugging code with error
      await userEvent.click(screen.getByTestId('debug-start'));
      
      // Verify error displayed
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should handle debugger disconnection', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Start debugging
      await userEvent.click(screen.getByTestId('debug-start'));
      
      // Simulate disconnection
      await protocol.disconnect();
      
      // Verify UI shows disconnected state
      await waitFor(() => {
        const status = screen.getByTestId('debug-status');
        expect(status).toHaveTextContent('Disconnected');
      });
    });
  });

  describe('Performance', () => {
    it('should handle large source files', async () => {
      const largeSource = 'function test() {\n'.repeat(10000) + '}\n'.repeat(10000);
      
      render(<Debugger protocol={protocol} initialSource={largeSource} />);
      
      await waitFor(() => {
        const editor = screen.getByTestId('code-editor');
        expect(editor).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle many breakpoints', async () => {
      render(<Debugger protocol={protocol} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
      
      // Set many breakpoints
      for (let i = 1; i <= 100; i++) {
        await userEvent.click(screen.getByTestId(`line-number-${i}`));
      }
      
      // Verify all set
      await waitFor(() => {
        const breakpoints = screen.getAllByTestId(/^breakpoint-\d+$/);
        expect(breakpoints.length).toBe(100);
      });
    });
  });
});
