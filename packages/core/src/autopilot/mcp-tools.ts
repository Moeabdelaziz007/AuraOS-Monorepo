/**
 * MCP Tool Definitions
 * Contains all available MCP tools and their specifications
 */

/**
 * MCP Tool Definition
 */
export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  category: 'file' | 'code' | 'web' | 'system' | 'ai' | 'data';
}

/**
 * Tool Usage Pattern
 */
export interface ToolUsagePattern {
  toolName: string;
  frequency: number;
  avgDuration: number;
  successRate: number;
  commonParameters: Record<string, any>;
  lastUsed: Date;
  context: string[];
}

/**
 * Available MCP Tools
 */
export const MCP_TOOLS: MCPTool[] = [
  // File Operations
  {
    name: 'read_file',
    description: 'Read file contents with optional line range',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true },
      { name: 'start_line', type: 'number', description: 'Start line', required: false },
      { name: 'end_line', type: 'number', description: 'End line', required: false },
    ],
    category: 'file',
  },
  {
    name: 'str_replace_based_edit_tool',
    description: 'Edit files with view, create, str_replace, or insert operations',
    parameters: [
      { name: 'command', type: 'string', description: 'Operation: view, create, str_replace, insert', required: true },
      { name: 'path', type: 'string', description: 'File path', required: true },
      { name: 'old_str', type: 'string', description: 'String to replace', required: false },
      { name: 'new_str', type: 'string', description: 'Replacement string', required: false },
    ],
    category: 'file',
  },
  {
    name: 'list_directory',
    description: 'List files and directories in a path',
    parameters: [
      { name: 'path', type: 'string', description: 'Directory path', required: true },
      { name: 'recursive', type: 'boolean', description: 'List recursively', required: false },
    ],
    category: 'file',
  },
  {
    name: 'search_files',
    description: 'Search for files by name or pattern',
    parameters: [
      { name: 'pattern', type: 'string', description: 'Search pattern', required: true },
      { name: 'path', type: 'string', description: 'Search path', required: false },
    ],
    category: 'file',
  },
  {
    name: 'file_stats',
    description: 'Get file statistics (size, modified date, permissions)',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true },
    ],
    category: 'file',
  },
  
  // Code Operations
  {
    name: 'exec',
    description: 'Execute shell commands',
    parameters: [
      { name: 'command', type: 'string', description: 'Command to execute', required: true },
      { name: 'working_dir', type: 'string', description: 'Working directory', required: false },
      { name: 'timeout', type: 'number', description: 'Timeout in seconds', required: false },
    ],
    category: 'code',
  },
  {
    name: 'exec_preview',
    description: 'Run development server and get preview URL',
    parameters: [
      { name: 'command', type: 'string', description: 'Server command', required: true },
      { name: 'port', type: 'number', description: 'Port number', required: true },
    ],
    category: 'code',
  },
  {
    name: 'annotate_code',
    description: 'Create code annotations for explanations and suggestions',
    parameters: [
      { name: 'file_path', type: 'string', description: 'File to annotate', required: true },
      { name: 'start_line', type: 'number', description: 'Start line', required: true },
      { name: 'end_line', type: 'number', description: 'End line', required: true },
      { name: 'description', type: 'string', description: 'Annotation description', required: true },
    ],
    category: 'code',
  },
  {
    name: 'run_tests',
    description: 'Execute test suite',
    parameters: [
      { name: 'test_path', type: 'string', description: 'Test file or directory', required: false },
      { name: 'framework', type: 'string', description: 'Test framework (jest, vitest, etc)', required: false },
    ],
    category: 'code',
  },
  {
    name: 'lint_code',
    description: 'Run linter on code',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to lint', required: true },
      { name: 'fix', type: 'boolean', description: 'Auto-fix issues', required: false },
    ],
    category: 'code',
  },
  {
    name: 'format_code',
    description: 'Format code with prettier or similar',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to format', required: true },
    ],
    category: 'code',
  },
  
  // Web Operations
  {
    name: 'web_read',
    description: 'Read website content and convert to markdown',
    parameters: [
      { name: 'url', type: 'string', description: 'Website URL', required: true },
      { name: 'length', type: 'number', description: 'Max content length', required: false },
    ],
    category: 'web',
  },
  {
    name: 'web_search',
    description: 'Search the web for information',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query', required: true },
      { name: 'max_results', type: 'number', description: 'Maximum results', required: false },
    ],
    category: 'web',
  },
  {
    name: 'api_request',
    description: 'Make HTTP API requests',
    parameters: [
      { name: 'url', type: 'string', description: 'API endpoint', required: true },
      { name: 'method', type: 'string', description: 'HTTP method', required: false },
      { name: 'body', type: 'object', description: 'Request body', required: false },
    ],
    category: 'web',
  },
  
  // AI Operations
  {
    name: 'researcher',
    description: 'Research codebase concepts and architecture',
    parameters: [
      { name: 'description', type: 'string', description: 'Research task description', required: true },
      { name: 'context', type: 'string', description: 'Additional context', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'code_analysis',
    description: 'Analyze code for patterns, issues, and improvements',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to analyze', required: true },
      { name: 'focus', type: 'string', description: 'Analysis focus area', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'generate_code',
    description: 'Generate code based on description',
    parameters: [
      { name: 'description', type: 'string', description: 'What to generate', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'style', type: 'string', description: 'Code style preferences', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'explain_code',
    description: 'Explain how code works',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to explain', required: true },
      { name: 'detail_level', type: 'string', description: 'brief, detailed, or expert', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'suggest_improvements',
    description: 'Suggest code improvements and optimizations',
    parameters: [
      { name: 'path', type: 'string', description: 'File to improve', required: true },
      { name: 'focus', type: 'string', description: 'performance, readability, security', required: false },
    ],
    category: 'ai',
  },
  
  // System Operations
  {
    name: 'git_status',
    description: 'Check git repository status',
    parameters: [
      { name: 'path', type: 'string', description: 'Repository path', required: false },
    ],
    category: 'system',
  },
  {
    name: 'git_commit',
    description: 'Commit changes to git',
    parameters: [
      { name: 'message', type: 'string', description: 'Commit message', required: true },
      { name: 'files', type: 'array', description: 'Files to commit', required: false },
    ],
    category: 'system',
  },
  {
    name: 'git_push',
    description: 'Push commits to remote',
    parameters: [
      { name: 'remote', type: 'string', description: 'Remote name', required: false },
      { name: 'branch', type: 'string', description: 'Branch name', required: false },
    ],
    category: 'system',
  },
  {
    name: 'git_diff',
    description: 'Show git diff',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory', required: false },
      { name: 'staged', type: 'boolean', description: 'Show staged changes', required: false },
    ],
    category: 'system',
  },
  {
    name: 'environment_info',
    description: 'Get environment information',
    parameters: [],
    category: 'system',
  },
  {
    name: 'install_dependencies',
    description: 'Install project dependencies',
    parameters: [
      { name: 'package_manager', type: 'string', description: 'npm, pnpm, yarn', required: false },
      { name: 'path', type: 'string', description: 'Project path', required: false },
    ],
    category: 'system',
  },
  {
    name: 'build_project',
    description: 'Build the project',
    parameters: [
      { name: 'path', type: 'string', description: 'Project path', required: false },
      { name: 'target', type: 'string', description: 'Build target', required: false },
    ],
    category: 'system',
  },
  
  // Data Operations
  {
    name: 'parse_json',
    description: 'Parse and validate JSON data',
    parameters: [
      { name: 'data', type: 'string', description: 'JSON string', required: true },
    ],
    category: 'data',
  },
  {
    name: 'parse_yaml',
    description: 'Parse YAML data',
    parameters: [
      { name: 'data', type: 'string', description: 'YAML string', required: true },
    ],
    category: 'data',
  },
  {
    name: 'query_database',
    description: 'Query database',
    parameters: [
      { name: 'query', type: 'string', description: 'SQL or query string', required: true },
      { name: 'database', type: 'string', description: 'Database name', required: false },
    ],
    category: 'data',
  },
  {
    name: 'transform_data',
    description: 'Transform data between formats',
    parameters: [
      { name: 'data', type: 'string', description: 'Input data', required: true },
      { name: 'from_format', type: 'string', description: 'Source format', required: true },
      { name: 'to_format', type: 'string', description: 'Target format', required: true },
    ],
    category: 'data',
  },
  {
    name: 'validate_data',
    description: 'Validate data against schema',
    parameters: [
      { name: 'data', type: 'string', description: 'Data to validate', required: true },
      { name: 'schema', type: 'string', description: 'Validation schema', required: true },
    ],
    category: 'data',
  },
];

/**
 * Tool recommendation mappings
 */
export const TOOL_RECOMMENDATIONS: Map<string, string[]> = new Map([
  // File operations
  ['file_operation', ['read_file', 'str_replace_based_edit_tool', 'list_directory', 'search_files', 'file_stats']],
  
  // Code analysis and development
  ['code_analysis', ['read_file', 'researcher', 'annotate_code', 'code_analysis', 'explain_code']],
  ['code_generation', ['generate_code', 'str_replace_based_edit_tool', 'format_code', 'lint_code']],
  ['code_improvement', ['suggest_improvements', 'code_analysis', 'lint_code', 'format_code']],
  
  // Testing and quality
  ['testing', ['run_tests', 'lint_code', 'code_analysis']],
  
  // Automation
  ['automation', ['exec', 'read_file', 'str_replace_based_edit_tool', 'exec_preview']],
  
  // Web operations
  ['web_scraping', ['web_read', 'str_replace_based_edit_tool', 'parse_json']],
  ['api_integration', ['api_request', 'parse_json', 'validate_data']],
  
  // Research and learning
  ['research', ['researcher', 'read_file', 'web_read', 'web_search']],
  
  // Git operations
  ['version_control', ['git_status', 'git_diff', 'git_commit', 'git_push']],
  
  // Project management
  ['project_setup', ['install_dependencies', 'build_project', 'environment_info']],
  
  // Data operations
  ['data_processing', ['parse_json', 'parse_yaml', 'transform_data', 'validate_data']],
]);

/**
 * Common tool chains for complex tasks
 */
export const TOOL_CHAINS: Map<string, string[]> = new Map([
  // Code review chain
  ['code_review', ['read_file', 'code_analysis', 'suggest_improvements', 'lint_code']],
  
  // Deploy chain
  ['deploy', ['run_tests', 'lint_code', 'build_project', 'git_status', 'git_commit', 'git_push']],
  
  // Research chain
  ['research', ['web_search', 'web_read', 'researcher']],
  
  // Setup project chain
  ['setup_project', ['list_directory', 'read_file', 'install_dependencies', 'build_project']],
  
  // API integration chain
  ['api_integration', ['api_request', 'parse_json', 'validate_data']],
  
  // Refactor code chain
  ['refactor', ['read_file', 'code_analysis', 'suggest_improvements', 'str_replace_based_edit_tool', 'format_code', 'run_tests']],
  
  // Debug chain
  ['debug', ['read_file', 'explain_code', 'code_analysis', 'run_tests']],
  
  // Content generation chain
  ['content_generation', ['researcher', 'generate_code', 'str_replace_based_edit_tool']],
]);
