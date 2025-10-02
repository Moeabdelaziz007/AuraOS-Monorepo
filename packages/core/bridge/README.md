# AI Vintage OS Bridge Layer

The Bridge Layer serves as the communication hub between the frontend UI, AI processing layer, and the 6502 emulator engine. It provides real-time command translation, execution management, and output capture for the AI Vintage OS system.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   AI Layer      │    │   Manual Input  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Bridge Server         │
                    │  ┌─────────────────────┐  │
                    │  │  Command Processing │  │
                    │  │  - Input Validation │  │
                    │  │  - Queue Management │  │
                    │  │  - Priority Handling│  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   AI Translator     │  │
                    │  │  - Natural Language │  │
                    │  │  - BASIC Commands   │  │
                    │  │  - Pattern Matching │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │ Emulator Integration│  │
                    │  │  - Command Execution│  │
                    │  │  - Output Capture   │  │
                    │  │  - State Management │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   Error Handler     │  │
                    │  │  - Exception Logging│  │
                    │  │  - Performance Track│  │
                    │  │  - Health Monitoring│  │
                    │  └─────────────────────┘  │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     6502 Emulator         │
                    │  ┌─────────────────────┐  │
                    │  │   BASIC-M6502       │  │
                    │  │   Engine            │  │
                    │  └─────────────────────┘  │
                    └───────────────────────────┘
```

## Components

### 1. Bridge Server (`bridge_server.py`)
- **Purpose**: Main FastAPI server handling HTTP/WebSocket requests
- **Features**:
  - REST API endpoints for command execution
  - WebSocket support for real-time communication
  - Command queue management with priority handling
  - Performance monitoring and statistics
  - CORS support for cross-origin requests

### 2. AI Translator (`translators/ai_translator.py`)
- **Purpose**: Converts natural language prompts to BASIC-M6502 commands
- **Features**:
  - Pattern-based command recognition
  - Variable tracking and management
  - Confidence scoring for translations
  - Support for complex command sequences
  - Extensible command pattern system

### 3. Emulator Integration (`translators/emulator_integration.py`)
- **Purpose**: Manages communication with the 6502 emulator
- **Features**:
  - Command sequence execution
  - Output capture and buffering
  - CPU state monitoring
  - Performance tracking
  - Error recovery and handling

### 4. Error Handler (`core/error_handler.py`)
- **Purpose**: Comprehensive error handling and system monitoring
- **Features**:
  - Categorized error logging
  - Performance monitoring
  - Health status tracking
  - Automatic error recovery
  - System recommendations

## Installation and Setup

### Prerequisites
```bash
# Install required dependencies
pip install fastapi uvicorn loguru pydantic

# Ensure emulator components are available
# (See engine/README.md for emulator setup)
```

### Configuration
The bridge layer uses the main `settings.json` configuration file. Key bridge settings:

```json
{
  "bridge": {
    "host": "localhost",
    "port": 8000,
    "debug": true,
    "translation": {
      "max_command_length": 1000,
      "timeout_seconds": 30,
      "retry_attempts": 3,
      "command_validation": true,
      "syntax_checking": true
    },
    "logging": {
      "level": "INFO",
      "format": "json",
      "file_path": "logs/bridge.log",
      "max_file_size": "10MB",
      "backup_count": 5
    },
    "performance": {
      "max_concurrent_requests": 10,
      "request_timeout": 30,
      "connection_pool_size": 20
    }
  }
}
```

### Starting the Bridge Server
```bash
# Start the bridge server
python bridge/bridge_server.py

# Or use uvicorn directly
uvicorn bridge.bridge_server:create_app --host localhost --port 8000 --reload
```

## API Reference

### REST Endpoints

#### `POST /command`
Execute a command through the bridge.

**Request:**
```json
{
  "command": "PRINT \"Hello World\"",
  "source": "frontend",
  "priority": 1,
  "timeout": 30,
  "context": {
    "user_id": "user123",
    "session_id": "session456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "type": "print",
    "output": "Hello World"
  },
  "output": "Hello World",
  "error": null,
  "execution_time": 15.5,
  "timestamp": 1703123456.789,
  "command_id": "cmd_123_1703123456"
}
```

#### `POST /ai/process`
Process an AI request and generate BASIC commands.

**Request:**
```json
{
  "prompt": "Print hello world and calculate 5 plus 3",
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000,
  "context": {
    "session_id": "session123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "Generated 4 BASIC command(s) from prompt",
  "commands": [
    "10 PRINT \"hello world\"",
    "20 LET A = 5",
    "30 LET B = 3",
    "40 PRINT \"A + B = \"; A + B"
  ],
  "confidence": 0.85,
  "error": null,
  "processing_time": 125.3
}
```

#### `GET /emulator/status`
Get current emulator status and information.

**Response:**
```json
{
  "name": "Py65 6502 Emulator",
  "version": "1.2.0",
  "memory_size": 65536,
  "cpu_speed": 1000000,
  "debug_mode": true,
  "basic_start_address": "0x8000",
  "basic_end_address": "0xFFFF",
  "is_running": true,
  "cpu_initialized": true,
  "memory_initialized": true
}
```

#### `GET /emulator/cpu`
Get current CPU state.

**Response:**
```json
{
  "pc": 32832,
  "a": 0,
  "x": 0,
  "y": 0,
  "sp": 255,
  "status": 0,
  "flags": {
    "carry": false,
    "zero": true,
    "interrupt": true,
    "decimal": false,
    "break": false,
    "overflow": false,
    "negative": false
  }
}
```

### WebSocket Endpoint

#### `WS /ws`
Real-time bidirectional communication for command execution.

**Message Format:**
```json
{
  "command": "PRINT \"Hello\"",
  "source": "frontend",
  "priority": 1
}
```

**Response Format:**
```json
{
  "success": true,
  "result": {...},
  "output": "Hello",
  "execution_time": 12.3,
  "timestamp": 1703123456.789,
  "command_id": "cmd_123_1703123456"
}
```

## Usage Examples

### 1. Basic Command Execution
```python
import requests

# Execute a simple PRINT command
response = requests.post('http://localhost:8000/command', json={
    "command": 'PRINT "Hello from AI Vintage OS!"',
    "source": "frontend"
})

result = response.json()
print(f"Output: {result['output']}")
```

### 2. AI Command Translation
```python
# Process an AI request
response = requests.post('http://localhost:8000/ai/process', json={
    "prompt": "Create a loop that prints numbers 1 to 10"
})

result = response.json()
for command in result['commands']:
    print(command)
```

### 3. WebSocket Communication
```javascript
// JavaScript WebSocket client
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = function() {
    // Send command
    ws.send(JSON.stringify({
        command: 'PRINT "Hello WebSocket!"',
        source: "frontend"
    }));
};

ws.onmessage = function(event) {
    const response = JSON.parse(event.data);
    console.log('Command result:', response.output);
};
```

### 4. Complex Command Sequence
```python
# Execute multiple commands
commands = [
    'PRINT "Starting calculation"',
    'LET A = 10',
    'LET B = 20',
    'LET C = A + B',
    'PRINT "A + B = "; C',
    'END'
]

for cmd in commands:
    response = requests.post('http://localhost:8000/command', json={
        "command": cmd,
        "source": "frontend"
    })
    result = response.json()
    if result['output']:
        print(result['output'])
```

## Error Handling

The bridge layer provides comprehensive error handling with categorized errors and automatic recovery:

### Error Categories
- **Validation**: Input validation errors
- **Translation**: AI translation errors
- **Execution**: Emulator execution errors
- **Communication**: Network/communication errors
- **System**: General system errors
- **Performance**: Performance-related issues
- **Security**: Security-related errors

### Error Severity Levels
- **Low**: Minor issues, system continues normally
- **Medium**: Moderate issues, may affect performance
- **High**: Serious issues, functionality may be limited
- **Critical**: Fatal errors, system may be unstable

### Health Monitoring
```python
# Check system health
response = requests.get('http://localhost:8000/health')
health = response.json()

print(f"Overall Status: {health['status']}")
print(f"Components: {health['components']}")
```

## Performance Monitoring

The bridge provides detailed performance metrics:

```python
# Get performance statistics
response = requests.get('http://localhost:8000/stats')
stats = response.json()

print(f"Commands Processed: {stats['stats']['commands_processed']}")
print(f"Average Execution Time: {stats['stats']['average_execution_time']:.2f}ms")
print(f"Error Count: {stats['stats']['error_count']}")
```

## Testing

Run the comprehensive test suite:

```bash
# Run all bridge tests
python -m pytest tests/bridge/ -v

# Run specific test file
python -m pytest tests/bridge/test_bridge_server.py -v

# Run with coverage
python -m pytest tests/bridge/ --cov=bridge --cov-report=html
```

## Development

### Adding New Command Patterns
To add support for new AI command patterns, extend the `AITranslator` class:

```python
# In ai_translator.py
def _initialize_command_patterns(self):
    patterns = super()._initialize_command_patterns()

    # Add new pattern
    patterns["new_command"] = {
        "patterns": [
            r"new\s+command\s+(.+)",
            r"custom\s+action\s+(.+)"
        ],
        "handler": self._handle_new_command,
        "description": "Handle new command type"
    }

    return patterns

def _handle_new_command(self, match, command):
    # Implementation for new command
    content = match.group(1)
    return [f"{self.line_number} NEW_COMMAND {content}"]
```

### Custom Error Handling
Add custom error handling by extending the `ErrorHandler` class:

```python
# In error_handler.py
def _classify_error(self, error):
    # Add custom classification logic
    if "custom_error" in str(error).lower():
        return ErrorCategory.CUSTOM

    return super()._classify_error(error)
```

## Troubleshooting

### Common Issues

1. **Emulator Not Initialized**
   ```
   Error: Emulator not initialized
   Solution: Ensure emulator components are properly installed and configured
   ```

2. **Command Translation Fails**
   ```
   Error: Translation failed
   Solution: Check AI translator patterns and input validation
   ```

3. **Performance Issues**
   ```
   Warning: Slow operation detected
   Solution: Monitor performance metrics and optimize slow operations
   ```

4. **WebSocket Connection Issues**
   ```
   Error: WebSocket connection failed
   Solution: Check firewall settings and CORS configuration
   ```

### Logs and Debugging

Bridge logs are stored in `logs/bridge.log` with configurable rotation:

```bash
# View recent logs
tail -f logs/bridge.log

# Search for specific errors
grep "ERROR" logs/bridge.log

# Monitor performance
grep "Slow operation" logs/bridge.log
```

## Contributing

When contributing to the bridge layer:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new functionality
3. Update documentation for API changes
4. Ensure error handling is robust
5. Monitor performance impact of changes

## License

This bridge layer is part of the AI Vintage OS project and follows the same license terms as the main project.
