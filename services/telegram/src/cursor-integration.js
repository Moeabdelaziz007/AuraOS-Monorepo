import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Cursor CLI Integration for AuraOS Telegram Bot
 * Enables AI-powered code analysis and development tasks
 */

export class CursorIntegration {
  constructor() {
    this.projectRoot = process.env.PROJECT_ROOT || '/workspaces/AuraOS-Monorepo';
    this.maxOutputLength = 4000; // Telegram message limit
  }

  /**
   * Check if Cursor CLI is available
   */
  async isCursorAvailable() {
    try {
      await execAsync('which cursor');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute a shell command safely
   */
  async executeCommand(command, options = {}) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 30000, // 30 seconds timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
        ...options
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.message
      };
    }
  }

  /**
   * Analyze code file using AI
   */
  async analyzeCode(filePath) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // Basic code analysis
      const lines = content.split('\n');
      const analysis = {
        lines: lines.length,
        functions: (content.match(/function\s+\w+/g) || []).length,
        classes: (content.match(/class\s+\w+/g) || []).length,
        imports: (content.match(/import\s+.*from/g) || []).length,
        exports: (content.match(/export\s+(default\s+)?(class|function|const)/g) || []).length,
        comments: lines.filter(line => line.trim().startsWith('//')).length,
        todos: (content.match(/TODO:|FIXME:|HACK:/g) || []).length
      };
      
      return {
        success: true,
        analysis,
        preview: lines.slice(0, 10).join('\n')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List files in directory
   */
  async listFiles(directory = '.') {
    const result = await this.executeCommand(`ls -lah ${directory}`);
    return result;
  }

  /**
   * Search for text in files
   */
  async searchInFiles(searchTerm, filePattern = '*') {
    const result = await this.executeCommand(
      `grep -r "${searchTerm}" --include="${filePattern}" . | head -20`
    );
    return result;
  }

  /**
   * Get git status
   */
  async getGitStatus() {
    const result = await this.executeCommand('git status --short');
    return result;
  }

  /**
   * Get git log
   */
  async getGitLog(count = 5) {
    const result = await this.executeCommand(
      `git log --oneline -${count}`
    );
    return result;
  }

  /**
   * Run tests
   */
  async runTests(testPath = '') {
    const result = await this.executeCommand(
      `npm test ${testPath}`,
      { timeout: 60000 } // 1 minute for tests
    );
    return result;
  }

  /**
   * Check code quality with linter
   */
  async lintCode(filePath = '') {
    const result = await this.executeCommand(
      `npm run lint ${filePath}`
    );
    return result;
  }

  /**
   * Get project structure
   */
  async getProjectStructure(depth = 2) {
    const result = await this.executeCommand(
      `tree -L ${depth} -I 'node_modules|dist|.git'`
    );
    return result;
  }

  /**
   * Read file content
   */
  async readFile(filePath, lines = 50) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const fileLines = content.split('\n');
      
      return {
        success: true,
        content: fileLines.slice(0, lines).join('\n'),
        totalLines: fileLines.length,
        truncated: fileLines.length > lines
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get package.json info
   */
  async getPackageInfo() {
    try {
      const pkgPath = path.join(this.projectRoot, 'package.json');
      const content = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      
      return {
        success: true,
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        scripts: Object.keys(pkg.scripts || {}),
        dependencies: Object.keys(pkg.dependencies || {}).length,
        devDependencies: Object.keys(pkg.devDependencies || {}).length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Find files by name
   */
  async findFiles(pattern) {
    const result = await this.executeCommand(
      `find . -name "${pattern}" -not -path "*/node_modules/*" -not -path "*/.git/*" | head -20`
    );
    return result;
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    const [disk, memory, cpu] = await Promise.all([
      this.executeCommand('df -h / | tail -1'),
      this.executeCommand('free -h | grep Mem'),
      this.executeCommand('uptime')
    ]);
    
    return {
      disk: disk.output,
      memory: memory.output,
      cpu: cpu.output
    };
  }

  /**
   * Count lines of code
   */
  async countLinesOfCode(directory = '.') {
    const result = await this.executeCommand(
      `find ${directory} -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | xargs wc -l | tail -1`
    );
    return result;
  }

  /**
   * Get recent changes
   */
  async getRecentChanges(hours = 24) {
    const result = await this.executeCommand(
      `git log --since="${hours} hours ago" --oneline`
    );
    return result;
  }

  /**
   * Check dependencies
   */
  async checkDependencies() {
    const result = await this.executeCommand('npm outdated');
    return result;
  }

  /**
   * Format output for Telegram
   */
  formatOutput(output) {
    if (!output) return 'No output';
    
    // Truncate if too long
    if (output.length > this.maxOutputLength) {
      return output.substring(0, this.maxOutputLength) + '\n\n... (truncated)';
    }
    
    return output;
  }

  /**
   * Execute AI-powered command
   */
  async executeAICommand(command, context = {}) {
    // Map natural language to actual commands
    const commandMap = {
      'show files': () => this.listFiles(),
      'git status': () => this.getGitStatus(),
      'git log': () => this.getGitLog(),
      'run tests': () => this.runTests(),
      'check lint': () => this.lintCode(),
      'project structure': () => this.getProjectStructure(),
      'package info': () => this.getPackageInfo(),
      'system info': () => this.getSystemInfo(),
      'count lines': () => this.countLinesOfCode(),
      'recent changes': () => this.getRecentChanges(),
      'check deps': () => this.checkDependencies()
    };

    const lowerCommand = command.toLowerCase();
    
    // Find matching command
    for (const [key, handler] of Object.entries(commandMap)) {
      if (lowerCommand.includes(key)) {
        return await handler();
      }
    }

    // If no match, try to execute as shell command (with safety checks)
    if (this.isSafeCommand(command)) {
      return await this.executeCommand(command);
    }

    return {
      success: false,
      error: 'Command not recognized or not safe to execute'
    };
  }

  /**
   * Check if command is safe to execute
   */
  isSafeCommand(command) {
    const dangerousCommands = ['rm', 'del', 'format', 'dd', 'mkfs', ':(){:|:&};:'];
    const lowerCommand = command.toLowerCase();
    
    return !dangerousCommands.some(dangerous => lowerCommand.includes(dangerous));
  }
}

export default CursorIntegration;
