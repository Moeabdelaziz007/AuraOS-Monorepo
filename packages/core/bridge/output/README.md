# Bridge Output Handler Module

The Bridge Output Handler module provides comprehensive output handling for the AI Vintage OS bridge, capturing emulator responses, formatting them appropriately, and dispatching them to frontend and AI layers in real-time.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   M6502         │    │   Output        │    │   Frontend &    │
│   Emulator      │    │   Handler       │    │   AI Layers     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ 1. Raw Output        │                      │
          ├─────────────────────►│                      │
          │                      │ 2. Format & Route    │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 3. WebSocket         │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 4. REST API          │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 5. AI Feedback       │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 6. Logging           │
          │                      ├─────────────────────►│
```

## Output Types

### 📤 Supported Output Types

- **PRINT**: Text output from PRINT statements
- **ERROR**: Error messages and exceptions
- **RESULT**: Command execution results
- **DEBUG**: Debug information and diagnostics
- **STATUS**: System status updates
- **CPU_STATE**: CPU register and state information
- **MEMORY_DUMP**: Memory content dumps
- **PERFORMANCE**: Performance metrics and timing
- **LOG**: General logging messages

### 🎨 Output Formatting

Each output type is formatted specifically for different consumption channels:

- **Frontend Display**: HTML-ready with CSS classes and display types
- **API Response**: JSON-structured with metadata
- **WebSocket**: Real-time streaming format
- **AI Context**: Structured for AI consumption
- **Logging**: Formatted for log files

## Output Channels

### 🔌 WebSocket Channel
Real-time communication with frontend clients.

**Features:**
- Live output streaming
- Multiple client support
- Automatic client management
- Message buffering for reliability

**Usage:**
```python
# Add WebSocket client
output_handler.add_websocket_client(websocket)

# Outputs automatically sent to all connected clients
await output_handler.capture_output("Hello World", OutputType.PRINT)
```

### 🌐 REST API Channel
Polling-based access for API consumers.

**Features:**
- Output buffering with configurable size
- Unique ID assignment
- Timestamp tracking
- Recent output retrieval

**Usage:**
```python
# Get recent outputs
recent_outputs = output_handler.get_recent_outputs(limit=50)

# Each output has unique ID and timestamp
for output in recent_outputs:
    print(f"ID: {output['id']}, Time: {output['timestamp']}")
```

### 📝 Log Channel
Comprehensive logging for debugging and monitoring.

**Features:**
- Severity-based logging
- Structured log messages
- Performance tracking
- Debug information capture

**Usage:**
```python
# Automatic logging based on severity
await output_handler.capture_output(
    "Error occurred",
    OutputType.ERROR,
    OutputSeverity.ERROR
)
```

### 🤖 AI Feedback Channel
Context provision for AI layer.

**Features:**
- Context history maintenance
- Callback support
- AI-consumable format
- Context retrieval

**Usage:**
```python
# Set AI callback
async def ai_callback(output_data):
    # Process output for AI context
    pass

output_handler.set_ai_callback(ai_callback)

# Get context history
context = ai_channel.get_context_history(limit=10)
```

## Features

### ⚡ Real-time Processing
- **Instant Capture**: Immediate processing of emulator outputs
- **Multi-channel Dispatch**: Simultaneous delivery to all channels
- **Performance Monitoring**: Sub-millisecond processing times
- **Async Operations**: Non-blocking output handling

### 🎯 Intelligent Formatting
- **Channel-specific Formatting**: Optimized for each consumption type
- **Type-aware Processing**: Different handling for each output type
- **Metadata Enrichment**: Timestamps, IDs, and context information
- **Display Optimization**: CSS classes and display types for frontend

### 📊 Comprehensive Monitoring
- **Performance Statistics**: Processing times and throughput metrics
- **Channel Health**: Real-time channel status and connectivity
- **Error Tracking**: Detailed error logging and recovery
- **Usage Analytics**: Output type distribution and frequency

### 🔧 Robust Error Handling
- **Graceful Degradation**: Continues operation when channels fail
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Exception Isolation**: Channel failures don't affect others
- **Detailed Logging**: Comprehensive error reporting

## Usage

### Basic Usage
```python
from bridge.output.bridge_output_handler import BridgeOutputHandler, OutputType, OutputSeverity

# Initialize output handler
output_handler = BridgeOutputHandler()

# Capture simple output
result = await output_handler.capture_output(
    "Hello World",
    OutputType.PRINT,
    OutputSeverity.INFO
)

if result["success"]:
    print(f"Output processed in {result['processing_time']:.2f}ms")
    print(f"Dispatched to {sum(result['dispatch_results'].values())} channels")
```

### With Metadata
```python
# Capture output with additional context
result = await output_handler.capture_output(
    "Command executed successfully",
    OutputType.RESULT,
    OutputSeverity.INFO,
    metadata={
        "command": "PRINT 'Hello'",
        "execution_time": 1.5,
        "user_id": "user123"
    }
)
```

### WebSocket Integration
```python
# Add WebSocket client for real-time updates
output_handler.add_websocket_client(websocket)

# Outputs will automatically stream to WebSocket clients
await output_handler.capture_output(
    "Real-time update",
    OutputType.STATUS,
    OutputSeverity.INFO
)

# Remove client when disconnected
output_handler.remove_websocket_client(websocket)
```

### AI Integration
```python
# Set AI callback for context provision
async def ai_context_callback(output_data):
    # Provide context to AI layer
    ai_layer.update_context(output_data)

output_handler.set_ai_callback(ai_context_callback)

# Get context history for AI
context_history = output_handler.get_recent_outputs(50)
```

## API Reference

### BridgeOutputHandler Class

#### Methods

##### `capture_output(raw_output, output_type, severity, metadata=None)`

Capture and process emulator output.

**Parameters:**
- `raw_output`: The raw output from emulator (str or dict)
- `output_type`: Type of output (OutputType enum)
- `severity`: Severity level (OutputSeverity enum)
- `metadata`: Additional metadata (optional dict)

**Returns:**
```python
{
    "output_id": "out_1703123456_0",
    "success": True,
    "output_type": "print",
    "severity": "info",
    "processing_time": 2.5,
    "dispatch_results": {
        "websocket": True,
        "rest_api": True,
        "log": True,
        "ai_feedback": True
    },
    "timestamp": 1703123456.789,
    "formatted_outputs": {...}
}
```

##### `add_websocket_client(websocket)`

Add a WebSocket client for real-time output streaming.

**Parameters:**
- `websocket`: WebSocket connection object

##### `remove_websocket_client(websocket)`

Remove a WebSocket client.

**Parameters:**
- `websocket`: WebSocket connection object to remove

##### `set_ai_callback(callback)`

Set AI callback for output feedback.

**Parameters:**
- `callback`: Async function to call with output data

##### `get_recent_outputs(limit=50)`

Get recent outputs for API polling.

**Parameters:**
- `limit`: Maximum number of outputs to return

**Returns:** List of recent output dictionaries

##### `get_output_statistics()`

Get comprehensive output statistics.

**Returns:**
```python
{
    "stats": {
        "total_outputs": 150,
        "success_count": 142,
        "error_count": 8,
        "average_processing_time": 3.2,
        "outputs_by_type": {
            "print": 85,
            "error": 10,
            "result": 45
        },
        "outputs_by_channel": {
            "websocket": {"success": 140, "failed": 2},
            "rest_api": {"success": 145, "failed": 5}
        }
    },
    "channels": {
        "websocket": {"type": "websocket", "connected_clients": 3},
        "rest_api": {"type": "rest_api", "buffered_outputs": 45}
    },
    "history_size": 150,
    "active_outputs": 10
}
```

##### `get_output_history(limit=100)`

Get output history.

**Parameters:**
- `limit`: Maximum number of history entries to return

**Returns:** List of output history entries

##### `clear_history()`

Clear output history and active outputs.

##### `test_output_processing(test_outputs)`

Test output processing with sample outputs.

**Parameters:**
- `test_outputs`: List of test output dictionaries

**Returns:**
```python
{
    "total_outputs": 10,
    "successful": 8,
    "failed": 2,
    "success_rate": 0.8,
    "average_processing_time": 2.5,
    "results": [...]  # List of individual results
}
```

### OutputFormatter Class

#### Methods

##### `format_output(raw_output, output_type, target_channel)`

Format output for specific channel and type.

**Parameters:**
- `raw_output`: Raw output data
- `output_type`: Type of output (OutputType enum)
- `target_channel`: Target channel name

**Returns:** Formatted output dictionary

### Output Channel Classes

#### WebSocketChannel
- `add_client(websocket)`: Add WebSocket client
- `remove_client(websocket)`: Remove WebSocket client
- `send_output(output_data)`: Send output to clients
- `get_channel_info()`: Get channel information

#### APIRestChannel
- `send_output(output_data)`: Store output for API polling
- `get_recent_outputs(limit)`: Get recent outputs
- `clear_buffer()`: Clear output buffer
- `get_channel_info()`: Get channel information

#### LogChannel
- `send_output(output_data)`: Log output data
- `get_channel_info()`: Get channel information

#### AIFeedbackChannel
- `send_output(output_data)`: Send to AI layer
- `get_context_history(limit)`: Get context history
- `get_channel_info()`: Get channel information

## Output Examples

### Print Output
```python
# Input
raw_output = "Hello World!"

# Formatted for frontend
{
    "type": "print",
    "message": "Hello World!",
    "severity": "info",
    "timestamp": 1703123456.789,
    "formatted_for": "frontend",
    "display_type": "text",
    "css_class": "emulator-output"
}
```

### Error Output
```python
# Input
raw_output = {"error": "Runtime error", "error_code": "RUNTIME_ERROR"}

# Formatted for frontend
{
    "type": "error",
    "message": "Runtime error",
    "error_code": "RUNTIME_ERROR",
    "severity": "error",
    "timestamp": 1703123456.789,
    "formatted_for": "frontend",
    "display_type": "error",
    "css_class": "emulator-error"
}
```

### CPU State Output
```python
# Input
raw_output = {"pc": 0x8000, "a": 0x42, "x": 0x10, "y": 0x20}

# Formatted for frontend
{
    "type": "cpu_state",
    "cpu_state": {"pc": 0x8000, "a": 0x42, "x": 0x10, "y": 0x20},
    "message": "CPU State: PC=0x8000, A=0x42",
    "severity": "info",
    "timestamp": 1703123456.789,
    "formatted_for": "frontend",
    "display_type": "cpu_state",
    "css_class": "emulator-cpu-state"
}
```

### Performance Output
```python
# Input
raw_output = {"execution_time": 1.5, "memory_used": 1024}

# Formatted for frontend
{
    "type": "performance",
    "performance": {"execution_time": 1.5, "memory_used": 1024},
    "message": "Performance: 1.50ms",
    "severity": "info",
    "timestamp": 1703123456.789,
    "formatted_for": "frontend",
    "display_type": "performance",
    "css_class": "emulator-performance"
}
```

## Performance Optimization

### Processing Speed
- **Average Time**: 2-5ms per output
- **Channel Parallelism**: All channels processed simultaneously
- **Format Caching**: Cached formatters for common output types
- **Memory Management**: Automatic cleanup of old outputs

### Scalability
- **Concurrent Processing**: Thread-safe for multiple simultaneous outputs
- **Resource Usage**: Minimal memory footprint with configurable limits
- **Error Isolation**: Channel failures don't affect other channels
- **Load Balancing**: Automatic distribution across channels

### Memory Management
- **History Limits**: Configurable history buffer sizes
- **Active Output Cleanup**: Automatic cleanup of old active outputs
- **Channel Buffering**: Bounded buffers prevent memory leaks
- **Garbage Collection**: Automatic cleanup of disconnected clients

## Configuration

### Settings
Output handling behavior can be configured in `settings.json`:

```json
{
  "bridge": {
    "output": {
      "channels": {
        "websocket": {
          "enabled": true,
          "max_clients": 100,
          "message_buffer_size": 1000
        },
        "rest_api": {
          "enabled": true,
          "buffer_size": 1000,
          "retention_hours": 24
        },
        "log": {
          "enabled": true,
          "log_level": "INFO"
        },
        "ai_feedback": {
          "enabled": true,
          "context_buffer_size": 100,
          "callback_timeout": 30
        }
      },
      "processing": {
        "max_concurrent_outputs": 100,
        "timeout_seconds": 30,
        "retry_attempts": 3
      },
      "formatting": {
        "frontend_css_classes": true,
        "include_timestamps": true,
        "include_metadata": true
      }
    }
  }
}
```

### Channel Configuration
```json
{
  "output_channels": {
    "websocket": {
      "enabled": true,
      "max_clients": 100,
      "heartbeat_interval": 30,
      "disconnect_timeout": 60
    },
    "rest_api": {
      "enabled": true,
      "buffer_size": 1000,
      "cleanup_interval": 300,
      "max_age_seconds": 86400
    },
    "log": {
      "enabled": true,
      "log_level": "INFO",
      "include_performance": true,
      "include_context": false
    },
    "ai_feedback": {
      "enabled": true,
      "context_size": 100,
      "callback_timeout": 30,
      "include_metadata": true
    }
  }
}
```

## Testing

### Run Test Suite
```bash
# Run comprehensive test suite
python bridge/test_output_handler.py

# Run unit tests
python -m pytest tests/bridge/test_bridge_output_handler.py -v

# Test specific functionality
python bridge/test_output_handler.py --test-formatting
```

### Test Coverage
- ✅ All output types and formatting
- ✅ All output channels (WebSocket, REST API, Log, AI Feedback)
- ✅ Output capture and processing
- ✅ WebSocket integration and client management
- ✅ AI feedback and context handling
- ✅ Performance and error handling
- ✅ Statistics and monitoring

### Test Categories
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: End-to-end output workflows
3. **Performance Tests**: Speed and memory usage
4. **Error Tests**: Invalid input and failure handling
5. **Channel Tests**: WebSocket, API, Log, and AI feedback

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Issues
```
Issue: WebSocket clients not receiving outputs
Solutions:
- Check WebSocket client connection status
- Verify client is added to output handler
- Check network connectivity and firewall settings
- Review WebSocket message format and JSON parsing
```

#### 2. Output Formatting Problems
```
Issue: Outputs not displaying correctly in frontend
Solutions:
- Check output type and formatting logic
- Verify CSS classes and display types
- Review frontend rendering logic
- Test with different output types
```

#### 3. Performance Issues
```
Issue: Slow output processing
Solutions:
- Check channel configuration and limits
- Monitor processing times and bottlenecks
- Optimize formatting logic
- Review concurrent output handling
```

#### 4. AI Feedback Problems
```
Issue: AI callback not being called
Solutions:
- Verify AI callback is set correctly
- Check callback function implementation
- Review timeout and error handling
- Test callback with simple outputs
```

### Debug Mode
```python
# Enable debug logging
import logging
logging.getLogger("bridge.output").setLevel(logging.DEBUG)

# Test output processing
output_handler = BridgeOutputHandler()
result = await output_handler.capture_output("debug test", OutputType.PRINT)
print(f"Debug info: {result}")
```

### Performance Monitoring
```python
# Get performance statistics
stats = output_handler.get_output_statistics()
print(f"Average processing time: {stats['stats']['average_processing_time']:.2f}ms")
print(f"Success rate: {stats['stats']['success_count']/stats['stats']['total_outputs']:.1%}")
print(f"Channel status: {stats['channels']}")
```

## Security Considerations

### Output Sanitization
- Sanitize all output data before formatting
- Prevent injection attacks in WebSocket messages
- Validate output types and structures
- Limit output size and complexity

### Access Control
- Implement proper authentication for WebSocket connections
- Control access to REST API endpoints
- Monitor for abuse or excessive usage
- Implement rate limiting for output requests

### Data Privacy
- Avoid logging sensitive information
- Implement data filtering for AI feedback
- Control output retention and cleanup
- Monitor for data leaks in outputs

## Contributing

### Adding New Output Types
1. Define new output type in `OutputType` enum
2. Add formatter method in `OutputFormatter` class
3. Update channel handling for new type
4. Add tests for new output type
5. Update documentation

### Improving Channel Performance
1. Analyze channel bottlenecks and performance
2. Optimize formatting and dispatching logic
3. Implement caching and optimization
4. Add performance monitoring
5. Test with high-volume scenarios

### Enhancing AI Integration
1. Improve context handling and storage
2. Optimize callback performance
3. Add context analysis and insights
4. Implement context filtering
5. Test AI feedback scenarios

## License

This Bridge Output Handler module is part of the AI Vintage OS project and follows the same license terms as the main project.
