import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from '../../src/components/Terminal';
import { FileSystem } from '../../src/utils/fileSystem';

describe('Terminal Integration Tests', () => {
  let fs: FileSystem;

  beforeEach(async () => {
    fs = new FileSystem();
    await fs.initialize();
    await fs.clear(); // Clear filesystem before each test
  });

  describe('File System Integration', () => {
    it('should create and list files', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create files
      await userEvent.type(input, 'touch file1.txt{Enter}');
      await userEvent.type(input, 'touch file2.txt{Enter}');
      
      // List files
      await userEvent.type(input, 'ls{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('file1.txt');
        expect(output).toHaveTextContent('file2.txt');
      });
    });

    it('should navigate directories and maintain state', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create directory and navigate
      await userEvent.type(input, 'mkdir testdir{Enter}');
      await userEvent.type(input, 'cd testdir{Enter}');
      
      // Verify prompt shows new directory
      await waitFor(() => {
        const prompt = screen.getByTestId('terminal-prompt');
        expect(prompt).toHaveTextContent('testdir');
      });
      
      // Create file in new directory
      await userEvent.type(input, 'touch file.txt{Enter}');
      
      // Go back and verify file is in subdirectory
      await userEvent.type(input, 'cd ..{Enter}');
      await userEvent.type(input, 'ls testdir{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('file.txt');
      });
    });

    it('should read and write file contents', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Write to file
      await userEvent.type(input, 'echo "Hello World" > test.txt{Enter}');
      
      // Read file
      await userEvent.type(input, 'cat test.txt{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('Hello World');
      });
    });

    it('should append to files', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create file with initial content
      await userEvent.type(input, 'echo "Line 1" > test.txt{Enter}');
      
      // Append to file
      await userEvent.type(input, 'echo "Line 2" >> test.txt{Enter}');
      
      // Read file
      await userEvent.type(input, 'cat test.txt{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('Line 1');
        expect(output).toHaveTextContent('Line 2');
      });
    });

    it('should remove files and directories', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create file and directory
      await userEvent.type(input, 'touch file.txt{Enter}');
      await userEvent.type(input, 'mkdir testdir{Enter}');
      
      // Remove file
      await userEvent.type(input, 'rm file.txt{Enter}');
      
      // Remove directory
      await userEvent.type(input, 'rmdir testdir{Enter}');
      
      // Verify removed
      await userEvent.type(input, 'ls{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).not.toHaveTextContent('file.txt');
        expect(output).not.toHaveTextContent('testdir');
      });
    });

    it('should copy files', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create source file
      await userEvent.type(input, 'echo "content" > source.txt{Enter}');
      
      // Copy file
      await userEvent.type(input, 'cp source.txt dest.txt{Enter}');
      
      // Verify both files exist
      await userEvent.type(input, 'ls{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('source.txt');
        expect(output).toHaveTextContent('dest.txt');
      });
      
      // Verify content copied
      await userEvent.type(input, 'cat dest.txt{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('content');
      });
    });

    it('should move files', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create source file
      await userEvent.type(input, 'echo "content" > source.txt{Enter}');
      
      // Move file
      await userEvent.type(input, 'mv source.txt dest.txt{Enter}');
      
      // Verify source removed and dest exists
      await userEvent.type(input, 'ls{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).not.toHaveTextContent('source.txt');
        expect(output).toHaveTextContent('dest.txt');
      });
    });
  });

  describe('Command History Integration', () => {
    it('should persist command history across sessions', async () => {
      const { unmount } = render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Execute commands
      await userEvent.type(input, 'echo test1{Enter}');
      await userEvent.type(input, 'echo test2{Enter}');
      
      // Unmount and remount
      unmount();
      render(<Terminal fileSystem={fs} />);
      
      const newInput = screen.getByTestId('terminal-input');
      
      // Navigate history
      await userEvent.type(newInput, '{ArrowUp}');
      
      expect(newInput).toHaveValue('echo test2');
    });

    it('should limit history size', async () => {
      render(<Terminal fileSystem={fs} maxHistorySize={5} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Execute more commands than limit
      for (let i = 0; i < 10; i++) {
        await userEvent.type(input, `echo ${i}{Enter}`);
      }
      
      // Navigate to oldest command
      for (let i = 0; i < 10; i++) {
        await userEvent.type(input, '{ArrowUp}');
      }
      
      // Should only have last 5 commands
      expect(input).toHaveValue('echo 5');
    });
  });

  describe('Command Piping and Redirection', () => {
    it('should pipe commands', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create files
      await userEvent.type(input, 'echo "apple" > fruits.txt{Enter}');
      await userEvent.type(input, 'echo "banana" >> fruits.txt{Enter}');
      await userEvent.type(input, 'echo "cherry" >> fruits.txt{Enter}');
      
      // Pipe cat to grep
      await userEvent.type(input, 'cat fruits.txt | grep "banana"{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('banana');
        expect(output).not.toHaveTextContent('apple');
        expect(output).not.toHaveTextContent('cherry');
      });
    });

    it('should chain multiple pipes', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create file with numbers
      await userEvent.type(input, 'echo "3\\n1\\n2" > numbers.txt{Enter}');
      
      // Chain pipes: cat | sort | head
      await userEvent.type(input, 'cat numbers.txt | sort | head -n 2{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        const lines = output.textContent?.split('\n') || [];
        expect(lines[0]).toContain('1');
        expect(lines[1]).toContain('2');
      });
    });
  });

  describe('Environment Variables', () => {
    it('should set and use environment variables', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Set variable
      await userEvent.type(input, 'export NAME=John{Enter}');
      
      // Use variable
      await userEvent.type(input, 'echo $NAME{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('John');
      });
    });

    it('should persist environment variables', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Set variable
      await userEvent.type(input, 'export PATH=/usr/bin{Enter}');
      
      // Execute command that uses PATH
      await userEvent.type(input, 'echo $PATH{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('/usr/bin');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle command not found', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      await userEvent.type(input, 'nonexistentcommand{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('command not found');
      });
    });

    it('should handle file not found', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      await userEvent.type(input, 'cat nonexistent.txt{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('No such file or directory');
      });
    });

    it('should handle permission denied', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create read-only file
      await userEvent.type(input, 'touch readonly.txt{Enter}');
      await userEvent.type(input, 'chmod 444 readonly.txt{Enter}');
      
      // Try to write to it
      await userEvent.type(input, 'echo "test" > readonly.txt{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('Permission denied');
      });
    });
  });

  describe('Complex Workflows', () => {
    it('should handle project setup workflow', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create project structure
      await userEvent.type(input, 'mkdir project{Enter}');
      await userEvent.type(input, 'cd project{Enter}');
      await userEvent.type(input, 'mkdir src{Enter}');
      await userEvent.type(input, 'mkdir tests{Enter}');
      await userEvent.type(input, 'touch README.md{Enter}');
      await userEvent.type(input, 'echo "# My Project" > README.md{Enter}');
      
      // Verify structure
      await userEvent.type(input, 'ls{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('src');
        expect(output).toHaveTextContent('tests');
        expect(output).toHaveTextContent('README.md');
      });
      
      // Verify README content
      await userEvent.type(input, 'cat README.md{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('# My Project');
      });
    });

    it('should handle file search and manipulation', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create multiple files
      await userEvent.type(input, 'echo "test" > file1.txt{Enter}');
      await userEvent.type(input, 'echo "test" > file2.txt{Enter}');
      await userEvent.type(input, 'echo "other" > file3.log{Enter}');
      
      // Find all .txt files
      await userEvent.type(input, 'find . -name "*.txt"{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('file1.txt');
        expect(output).toHaveTextContent('file2.txt');
        expect(output).not.toHaveTextContent('file3.log');
      });
    });
  });

  describe('Performance', () => {
    it('should handle large file operations', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create large file
      const largeContent = 'x'.repeat(10000);
      await userEvent.type(input, `echo "${largeContent}" > large.txt{Enter}`);
      
      // Read large file
      await userEvent.type(input, 'cat large.txt{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent(largeContent);
      }, { timeout: 5000 });
    });

    it('should handle many files', async () => {
      render(<Terminal fileSystem={fs} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Create many files
      for (let i = 0; i < 50; i++) {
        await userEvent.type(input, `touch file${i}.txt{Enter}`);
      }
      
      // List all files
      await userEvent.type(input, 'ls{Enter}');
      
      await waitFor(() => {
        const output = screen.getByTestId('terminal-output');
        expect(output).toHaveTextContent('file0.txt');
        expect(output).toHaveTextContent('file49.txt');
      }, { timeout: 5000 });
    });
  });
});
