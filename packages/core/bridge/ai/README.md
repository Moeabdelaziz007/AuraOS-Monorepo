# AI Command Sender Module

The AI Command Sender module provides seamless communication with AI providers (OpenAI GPT, Google Gemini, Anthropic Claude) to process natural language commands and generate BASIC-M6502 instructions for the AI Vintage OS emulator.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Bridge Server │    │   AI Providers  │
│   Commands      │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ 1. Send Command      │                      │
          ├─────────────────────►│                      │
          │                      │ 2. Process & Route   │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 3. AI Response       │
          │                      │◄─────────────────────┤
          │                      │                      │
          │ 4. BASIC Commands    │                      │
          │◄─────────────────────┤                      │
          │                      │                      │
```

## Features

### 🤖 Multi-Provider Support
- **OpenAI GPT-4**: Advanced language understanding with excellent BASIC code generation
- **Google Gemini**: Fast response times with good command translation
- **Anthropic Claude**: High-quality reasoning for complex programming tasks
- **Automatic Fallback**: Seamless switching between providers on failures

### ⚡ Performance Optimizations
- **Response Caching**: Intelligent caching to reduce API costs and latency
- **Rate Limiting**: Built-in rate limiting to respect provider limits
- **Retry Logic**: Exponential backoff for failed requests
- **Async Processing**: Non-blocking operations for high throughput

### 🎯 Command Processing
- **Natural Language**: Convert human instructions to BASIC-M6502 commands
- **Context Awareness**: Maintain context across command sequences
- **Confidence Scoring**: Assess quality of AI-generated commands
- **Validation**: Ensure commands are valid BASIC-M6502 syntax

### 📊 Monitoring & Analytics
- **Performance Metrics**: Track response times and success rates
- **Usage Statistics**: Monitor API usage and costs
- **Error Tracking**: Comprehensive error logging and analysis
- **Health Monitoring**: Real-time provider status and availability

## Installation

### Prerequisites
```bash
# Install required dependencies
pip install httpx loguru pydantic

# Ensure AI provider API keys are configured in settings.json
```

### Configuration
Add your AI provider API keys to `settings.json`:

```json
{
  "ai": {
    "providers": {
      "openai": {
        "enabled": true,
        "api_key": "your-openai-api-key",
        "model": "gpt-4",
        "max_tokens": 4000,
        "temperature": 0.7,
        "timeout": 30,
        "retry_attempts": 3,
        "fallback_model": "gpt-3.5-turbo"
      },
      "google": {
        "enabled": true,
        "api_key": "your-google-api-key",
        "model": "gemini-pro",
        "max_tokens": 4000,
        "temperature": 0.7,
        "timeout": 30,
        "retry_attempts": 3,
        "fallback_model": "gemini-pro-vision"
      }
    },
    "default_provider": "openai",
    "fallback_provider": "google",
    "rate_limiting": {
      "requests_per_minute": 60,
      "requests_per_hour": 1000,
      "burst_limit": 10
    },
    "caching": {
      "enabled": true,
      "ttl_seconds": 3600,
      "max_cache_size": 1000
    }
  }
}
```

## Usage

### Basic Usage
```python
from bridge.ai.ai_command_sender import AICommandSender

# Initialize the AI command sender
sender = AICommandSender()

# Send a command to AI providers
result = await sender.send_command("Print hello world and calculate 5 plus 3")

if result["success"]:
    print(f"AI Response: {result['response']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Commands Generated: {result['validation']}")
else:
    print(f"Error: {result['error']}")
```

### Using Specific Providers
```python
# Use OpenAI specifically
result = await sender.send_command("Create a loop from 1 to 10", provider="openai")

# Use Google Gemini
result = await sender.send_command("Set variable x to 42", provider="google")
```

### With Context
```python
# Provide additional context for better results
context = {
    "session_id": "user123_session456",
    "previous_commands": ["LET X = 5", "PRINT X"],
    "user_preferences": {"style": "verbose"}
}

result = await sender.send_command(
    "Now double the value of x",
    context=context
)
```

## API Reference

### AICommandSender Class

#### Methods

##### `send_command(command: str, provider: Optional[str] = None, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]`

Send a command to AI providers for processing.

**Parameters:**
- `command`: Natural language command to process
- `provider`: Specific provider to use (optional)
- `context`: Additional context information (optional)

**Returns:**
```python
{
    "request_id": "req_1234567890_0",
    "success": True,
    "provider": "openai",
    "command": "Print hello world",
    "response": "10 PRINT \"Hello World\"\n20 END",
    "confidence": 0.85,
    "validation": {
        "is_valid": True,
        "issues": [],
        "suggestions": []
    },
    "response_time": 1250.5,
    "timestamp": 1703123456.789,
    "usage": {
        "prompt_tokens": 50,
        "completion_tokens": 15,
        "total_tokens": 65
    },
    "cached": False
}
```

##### `test_provider_connection(provider_name: str) -> Dict[str, Any]`

Test connection to a specific AI provider.

**Parameters:**
- `provider_name`: Name of the provider to test

**Returns:**
```python
{
    "success": True,
    "provider": "openai",
    "test_response": "10 PRINT \"Connection test successful\"",
    "response_time": 850.2,
    "error": None
}
```

##### `get_statistics() -> Dict[str, Any]`

Get comprehensive statistics about AI command processing.

**Returns:**
```python
{
    "stats": {
        "total_requests": 150,
        "successful_requests": 142,
        "failed_requests": 8,
        "average_response_time": 1200.5,
        "total_response_time": 180075.0,
        "provider_stats": {
            "openai": {
                "requests": 100,
                "successful": 95,
                "failed": 5,
                "average_time": 1100.0
            },
            "google": {
                "requests": 50,
                "successful": 47,
                "failed": 3,
                "average_time": 1350.0
            }
        }
    },
    "providers": ["openai", "google"],
    "cache_size": 45,
    "history_size": 150,
    "cache_enabled": True
}
```

##### `get_recent_requests(limit: int = 50) -> List[Dict[str, Any]]`

Get recent request history.

**Parameters:**
- `limit`: Maximum number of requests to return

**Returns:** List of recent request dictionaries

##### `clear_cache()`

Clear the response cache.

##### `clear_history()`

Clear the request history.

### Provider Classes

#### OpenAIProvider
- **Model**: GPT-4, GPT-3.5-turbo
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token
- **Rate Limits**: 60 requests/minute, 40,000 tokens/minute

#### GoogleProvider
- **Model**: Gemini Pro, Gemini Pro Vision
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Authentication**: API key parameter
- **Rate Limits**: 60 requests/minute, 1M tokens/day

## Command Examples

### Simple Commands
```python
# Print statements
await sender.send_command("Print hello world")
# Response: 10 PRINT "Hello World"

# Variable assignments
await sender.send_command("Set variable x to 42")
# Response: 10 LET X = 42

# Calculations
await sender.send_command("Calculate 10 plus 20")
# Response: 10 LET A = 10
#          20 LET B = 20
#          30 LET C = A + B
#          40 PRINT "10 + 20 = "; C
```

### Complex Commands
```python
# Loops
await sender.send_command("Create a loop from 1 to 10 that prints each number")
# Response: 10 FOR I = 1 TO 10
#          20 PRINT I
#          30 NEXT I

# Conditionals
await sender.send_command("If x equals 5 then print yes otherwise print no")
# Response: 10 IF X = 5 THEN PRINT "Yes" ELSE PRINT "No"

# Multiple operations
await sender.send_command("Create a program that calculates the sum of numbers 1 to 100")
# Response: 10 LET SUM = 0
#          20 FOR I = 1 TO 100
#          30 SUM = SUM + I
#          40 NEXT I
#          50 PRINT "Sum = "; SUM
```

## Error Handling

### Error Categories
- **COMMUNICATION**: Network or API errors
- **VALIDATION**: Invalid input or configuration
- **EXECUTION**: Command execution failures
- **SYSTEM**: General system errors

### Error Severity Levels
- **LOW**: Minor issues, system continues normally
- **MEDIUM**: Moderate issues, may affect performance
- **HIGH**: Serious issues, functionality may be limited
- **CRITICAL**: Fatal errors, system may be unstable

### Retry Logic
- **Exponential Backoff**: 1s, 2s, 4s delays between retries
- **Max Retries**: Configurable per provider (default: 3)
- **Timeout Handling**: Configurable timeout per request
- **Fallback Providers**: Automatic switching on failures

## Testing

### Run Test Suite
```bash
# Run comprehensive test suite
python bridge/test_ai_sender.py

# Run unit tests
python -m pytest tests/bridge/test_ai_command_sender.py -v

# Test specific provider
python bridge/test_ai_sender.py --provider openai
```

### Test Coverage
- ✅ Provider initialization and configuration
- ✅ Command sending and response handling
- ✅ Caching functionality
- ✅ Error handling and retry logic
- ✅ Statistics and monitoring
- ✅ Integration with bridge server

## Performance Optimization

### Caching Strategy
- **Cache Key**: MD5 hash of command + provider + context
- **TTL**: Configurable time-to-live (default: 1 hour)
- **Size Limit**: Maximum cache entries (default: 1000)
- **LRU Eviction**: Least recently used entries removed first

### Rate Limiting
- **Per Provider**: Individual rate limits per AI provider
- **Burst Protection**: Configurable burst limits
- **Queue Management**: Automatic request queuing when limits exceeded
- **Backoff Strategy**: Intelligent backoff on rate limit hits

### Response Optimization
- **Token Management**: Efficient prompt engineering for minimal tokens
- **Response Parsing**: Fast parsing of AI responses
- **Validation Caching**: Cache validation results for repeated patterns
- **Batch Processing**: Support for multiple commands in single request

## Monitoring and Debugging

### Logging
```python
# Enable debug logging
import logging
logging.getLogger("bridge.ai").setLevel(logging.DEBUG)

# View logs
tail -f logs/bridge.log | grep "AI"
```

### Health Checks
```python
# Check provider health
for provider in sender.providers.keys():
    health = sender.test_provider_connection(provider)
    print(f"{provider}: {'✅' if health['success'] else '❌'}")
```

### Performance Monitoring
```python
# Get performance metrics
stats = sender.get_statistics()
print(f"Average response time: {stats['stats']['average_response_time']:.2f}ms")
print(f"Success rate: {stats['stats']['successful_requests']/stats['stats']['total_requests']:.1%}")
```

## Troubleshooting

### Common Issues

#### 1. API Key Errors
```
Error: OpenAI API error: 401 - Unauthorized
Solution: Check API key in settings.json and ensure it's valid
```

#### 2. Rate Limit Exceeded
```
Error: Rate limit exceeded for OpenAI provider
Solution: Wait for rate limit reset or reduce request frequency
```

#### 3. Network Timeouts
```
Error: OpenAI API timeout
Solution: Increase timeout setting or check network connectivity
```

#### 4. Invalid Responses
```
Warning: No BASIC-M6502 keywords found
Solution: Improve prompt engineering or try different provider
```

### Debug Mode
```python
# Enable debug mode in settings.json
{
  "bridge": {
    "debug": true,
    "logging": {
      "level": "DEBUG"
    }
  }
}
```

### Provider-Specific Issues

#### OpenAI
- Check API key validity and billing status
- Verify model availability (GPT-4 may require special access)
- Monitor usage against rate limits

#### Google Gemini
- Ensure API key has proper permissions
- Check quota limits in Google Cloud Console
- Verify model name spelling (case-sensitive)

## Security Considerations

### API Key Management
- Store API keys securely in environment variables
- Use different keys for development and production
- Rotate keys regularly
- Monitor API key usage for anomalies

### Data Privacy
- AI providers may log requests and responses
- Avoid sending sensitive information in prompts
- Use context filtering for sensitive data
- Consider data retention policies

### Rate Limiting
- Implement application-level rate limiting
- Monitor for abuse or unusual patterns
- Set up alerts for excessive usage
- Use caching to reduce API calls

## Contributing

### Adding New Providers
1. Create new provider class inheriting from `AIProvider`
2. Implement required abstract methods
3. Add configuration to `settings.json`
4. Add tests for new provider
5. Update documentation

### Improving Command Translation
1. Analyze command patterns and success rates
2. Enhance prompt engineering
3. Improve validation logic
4. Add new BASIC-M6502 command support
5. Test with diverse command types

## License

This AI Command Sender module is part of the AI Vintage OS project and follows the same license terms as the main project.
