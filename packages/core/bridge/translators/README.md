# AI Command Translator Module

The AI Command Translator module provides intelligent translation services from AI-generated commands to executable BASIC-M6502 commands. It uses multiple translation strategies to ensure reliable and accurate command conversion for the AI Vintage OS emulator.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Provider   │    │   Translator    │    │   BASIC-M6502   │
│   Response      │    │   Strategies    │    │   Commands      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ 1. AI Response       │                      │
          ├─────────────────────►│                      │
          │                      │ 2. Strategy Selection │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 3. Translation       │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │ 4. Validation        │
          │                      ├─────────────────────►│
          │                      │                      │
          │ 5. BASIC Commands    │                      │
          │◄─────────────────────┤                      │
```

## Translation Strategies

### 1. Pattern-Based Translator
Uses regex patterns to match common command structures and translate them to BASIC-M6502 syntax.

**Supported Patterns:**
- **Print Statements**: `"Print hello"` → `PRINT "hello"`
- **Variable Assignments**: `"Set x to 5"` → `LET X = 5`
- **For Loops**: `"Loop from 1 to 10"` → `FOR I = 1 TO 10...NEXT I`
- **Conditionals**: `"If x equals 5 then print yes"` → `IF X = 5 THEN PRINT "yes"`
- **End Commands**: `"End program"` → `END`
- **Comments**: `"Comment important note"` → `REM important note`
- **Calculations**: `"Calculate 5 plus 3"` → `LET RESULT = 5 + 3`

**Confidence Range**: 0.8 - 0.95 (High confidence for clear patterns)

### 2. Rule-Based Translator
Uses predefined rules and keyword mapping to translate commands based on BASIC syntax rules.

**Rule Categories:**
- **Basic Keywords**: print → PRINT, let → LET, for → FOR, etc.
- **Operators**: equals → =, plus → +, minus → -, etc.
- **Control Structures**: Loop → FOR/NEXT, conditional → IF/THEN

**Confidence Range**: 0.5 - 0.8 (Medium confidence for rule-based matching)

### 3. Contextual Translator
Considers previous commands and context to provide intelligent translations for ambiguous commands.

**Context Features:**
- **Reference Resolution**: `"Print it again"` → References previous print command
- **Sequence Handling**: `"Do the next step"` → Executes next command in sequence
- **Repeat Commands**: `"Repeat that"` → Repeats last command

**Confidence Range**: 0.3 - 0.8 (Variable confidence based on context clarity)

## Features

### 🎯 Intelligent Translation
- **Multi-Strategy Approach**: Uses pattern-based, rule-based, and contextual translation
- **Strategy Selection**: Automatically chooses best strategy based on command type
- **Confidence Scoring**: Provides confidence scores for translation quality
- **Fallback Handling**: Graceful degradation when primary strategies fail

### ✅ Validation System
- **Syntax Validation**: Ensures translated commands are valid BASIC-M6502
- **Balance Checking**: Validates FOR/NEXT and IF/THEN statement balance
- **Keyword Verification**: Confirms proper BASIC keyword usage
- **Suggestion Generation**: Provides helpful suggestions for invalid commands

### 📊 Performance Monitoring
- **Translation Statistics**: Tracks success rates and performance metrics
- **Strategy Usage**: Monitors which strategies are most effective
- **History Tracking**: Maintains translation history for analysis
- **Performance Metrics**: Measures translation speed and accuracy

### 🔧 Error Handling
- **Graceful Failures**: Handles invalid commands without crashing
- **Error Recovery**: Provides suggestions for failed translations
- **Logging**: Comprehensive logging for debugging and analysis
- **Exception Handling**: Robust error handling with detailed error messages

## Usage

### Basic Usage
```python
from bridge.translators.ai_command_translator import AICommandTranslator

# Initialize translator
translator = AICommandTranslator()

# Translate a command
result = translator.translate_command("Print hello world")

if result["success"]:
    print(f"Translation: {result['translation']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Strategy: {result['strategy_used']}")
else:
    print(f"Error: {result['error']}")
    print(f"Suggestions: {result['suggestions']}")
```

### With Context
```python
# Provide context for better translation
context = {
    "session_id": "user123_session456",
    "previous_commands": ["LET X = 5", "PRINT X"],
    "user_preferences": {"style": "verbose"}
}

result = translator.translate_command("Now double the value", context)

if result["success"]:
    print(f"Contextual translation: {result['translation']}")
    print(f"Context used: {result['context_used']}")
```

### Batch Translation
```python
# Test multiple commands
test_commands = [
    "Print hello world",
    "Set x to 42",
    "Create a loop from 1 to 10",
    "If x equals 5 then print correct",
    "End program"
]

results = translator.test_translation(test_commands)

print(f"Success rate: {results['success_rate']:.1%}")
print(f"Average confidence: {results['average_confidence']:.2f}")
```

## API Reference

### AICommandTranslator Class

#### Methods

##### `translate_command(ai_command: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]`

Translate an AI-generated command to BASIC-M6502.

**Parameters:**
- `ai_command`: The AI-generated command to translate
- `context`: Optional context information for better translation

**Returns:**
```python
{
    "translation_id": "trans_1703123456_0",
    "success": True,
    "original_command": "Print hello world",
    "translation": 'PRINT "hello world"',
    "confidence": 0.9,
    "strategy_used": "pattern_based",
    "validation": {
        "is_valid": True,
        "issues": [],
        "suggestions": [],
        "syntax_score": 0.95
    },
    "translation_time": 2.5,
    "timestamp": 1703123456.789,
    "context_used": False
}
```

##### `get_statistics() -> Dict[str, Any]`

Get comprehensive translation statistics.

**Returns:**
```python
{
    "stats": {
        "total_translations": 150,
        "successful_translations": 142,
        "failed_translations": 8,
        "average_translation_time": 3.2,
        "strategy_usage": {
            "pattern_based": 85,
            "rule_based": 45,
            "contextual": 20
        }
    },
    "success_rate": 0.947,
    "average_confidence": 0.82,
    "most_used_strategy": "pattern_based",
    "history_size": 150
}
```

##### `get_recent_translations(limit: int = 50) -> List[Dict[str, Any]]`

Get recent translation history.

**Parameters:**
- `limit`: Maximum number of translations to return

**Returns:** List of recent translation dictionaries

##### `test_translation(test_commands: List[str]) -> Dict[str, Any]`

Test translation with a list of commands.

**Parameters:**
- `test_commands`: List of commands to test

**Returns:**
```python
{
    "total_commands": 10,
    "successful": 8,
    "failed": 2,
    "success_rate": 0.8,
    "average_confidence": 0.75,
    "results": [...]  # List of individual results
}
```

##### `clear_history()`

Clear the translation history.

## Translation Examples

### Simple Commands
```python
# Print statements
"Print hello world" → 'PRINT "hello world"'
"Display the result" → 'PRINT "the result"'
"Show message" → 'PRINT "message"'

# Variable assignments
"Set x to 42" → "LET X = 42"
"Let y equals 10" → "LET Y = 10"
"Assign z = 100" → "LET Z = 100"

# Simple assignments
"x = 5" → "LET X = 5"
"y = 10" → "LET Y = 10"
```

### Complex Commands
```python
# For loops
"Loop from 1 to 10" → "FOR I = 1 TO 10\nPRINT I\nNEXT I"
"Create a loop from 5 to 15" → "FOR I = 5 TO 15\nPRINT I\nNEXT I"

# Conditionals
"If x equals 5 then print yes" → 'IF X = 5 THEN PRINT "yes"'
"If condition then action" → "IF CONDITION THEN ACTION"

# Calculations
"Calculate 5 plus 3" → "LET RESULT = 5 + 3\nPRINT \"Result: \"; RESULT"
"Add 10 and 20" → "LET RESULT = 10 + 20\nPRINT \"Result: \"; RESULT"

# End commands
"End program" → "END"
"Stop execution" → "END"
"Terminate" → "END"

# Comments
"Comment this is important" → "REM this is important"
"Note: remember this" → "REM remember this"
```

### Contextual Commands
```python
# With previous context
context = {"previous_commands": ["LET X = 5"]}
"Print it again" → "PRINT X"  # References previous variable

# Sequence commands
context = {"sequence": ["PRINT 'Step 1'", "PRINT 'Step 2'"]}
"Do the next step" → "PRINT 'Step 1'"

# Repeat commands
context = {"previous_commands": ["PRINT 'Hello'"]}
"Repeat that" → "PRINT 'Hello'"
```

## Validation System

### Validation Criteria
- **Empty Commands**: Rejected with "Empty translation" error
- **Basic Keywords**: Must contain valid BASIC keywords (PRINT, LET, FOR, etc.)
- **Syntax Validation**:
  - PRINT statements should include quotes or semicolons
  - LET statements must include assignment operator (=)
  - FOR loops must have matching NEXT statements
  - IF statements must have matching THEN clauses
- **Syntax Scoring**: 0.0 to 1.0 based on validation criteria

### Validation Results
```python
{
    "is_valid": True,
    "issues": [],
    "suggestions": [],
    "syntax_score": 0.95
}
```

### Common Issues and Suggestions
- **Missing Quotes**: `PRINT hello` → Suggestion: `PRINT "hello"`
- **Unbalanced Loops**: `FOR I = 1 TO 10` → Suggestion: Add `NEXT I`
- **Missing THEN**: `IF X = 5 PRINT YES` → Suggestion: Add `THEN`
- **No Keywords**: `random text` → Suggestion: Use basic BASIC commands

## Performance Optimization

### Translation Speed
- **Average Time**: 2-5ms per translation
- **Strategy Selection**: Early exit for high-confidence matches
- **Pattern Caching**: Compiled regex patterns for faster matching
- **Validation Caching**: Cached validation results for repeated patterns

### Memory Management
- **History Limit**: Maximum 1000 translations in history
- **Strategy Reuse**: Reuse strategy instances for efficiency
- **Garbage Collection**: Automatic cleanup of old translations

### Scalability
- **Concurrent Processing**: Thread-safe for multiple simultaneous translations
- **Resource Usage**: Minimal memory footprint
- **Error Isolation**: Failures don't affect other translations

## Testing

### Run Test Suite
```bash
# Run comprehensive test suite
python bridge/test_ai_translator.py

# Run unit tests
python -m pytest tests/bridge/test_ai_command_translator.py -v

# Test specific strategies
python bridge/test_ai_translator.py --strategy pattern_based
```

### Test Coverage
- ✅ All translation strategies (Pattern, Rule, Contextual)
- ✅ Command processing and validation
- ✅ Confidence scoring and error handling
- ✅ Performance and scalability tests
- ✅ Integration with bridge server
- ✅ Edge cases and error conditions

### Test Categories
1. **Unit Tests**: Individual strategy testing
2. **Integration Tests**: End-to-end translation workflows
3. **Performance Tests**: Speed and memory usage
4. **Error Tests**: Invalid input handling
5. **Validation Tests**: Syntax and correctness validation

## Configuration

### Settings
Translation behavior can be configured in `settings.json`:

```json
{
  "bridge": {
    "translation": {
      "strategies": ["pattern_based", "rule_based", "contextual"],
      "confidence_threshold": 0.5,
      "validation_enabled": true,
      "history_size": 1000,
      "performance_monitoring": true
    }
  }
}
```

### Strategy Configuration
```json
{
  "translation_strategies": {
    "pattern_based": {
      "enabled": true,
      "confidence_boost": 0.1,
      "early_exit_threshold": 0.8
    },
    "rule_based": {
      "enabled": true,
      "keyword_matching": true,
      "operator_expansion": true
    },
    "contextual": {
      "enabled": true,
      "max_history": 10,
      "context_weight": 0.2
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Low Translation Success Rate
```
Issue: Many commands fail to translate
Solutions:
- Check command patterns and add new ones
- Improve rule-based keyword matching
- Enhance contextual understanding
- Review validation criteria
```

#### 2. Poor Confidence Scores
```
Issue: Translations have low confidence
Solutions:
- Refine pattern matching accuracy
- Improve rule-based logic
- Add more context handling
- Validate translation quality
```

#### 3. Performance Issues
```
Issue: Slow translation times
Solutions:
- Optimize regex patterns
- Cache validation results
- Reduce strategy complexity
- Profile and optimize bottlenecks
```

#### 4. Validation Failures
```
Issue: Valid commands marked as invalid
Solutions:
- Review validation criteria
- Add new BASIC syntax patterns
- Improve error detection logic
- Update suggestion generation
```

### Debug Mode
```python
# Enable debug logging
import logging
logging.getLogger("bridge.translators").setLevel(logging.DEBUG)

# Test specific commands
translator = AICommandTranslator()
result = translator.translate_command("your command here")
print(f"Debug info: {result}")
```

### Performance Monitoring
```python
# Get performance statistics
stats = translator.get_statistics()
print(f"Success rate: {stats['success_rate']:.1%}")
print(f"Average confidence: {stats['average_confidence']:.2f}")
print(f"Strategy usage: {stats['stats']['strategy_usage']}")
```

## Contributing

### Adding New Translation Strategies
1. Create new strategy class inheriting from `TranslationStrategy`
2. Implement required abstract methods
3. Add strategy to `AICommandTranslator` initialization
4. Add tests for new strategy
5. Update documentation

### Improving Existing Strategies
1. Analyze translation patterns and success rates
2. Add new patterns or rules
3. Improve confidence scoring
4. Enhance validation logic
5. Test with diverse command types

### Adding New Command Patterns
1. Identify common command structures
2. Create regex patterns for matching
3. Define translation templates
4. Set confidence scores
5. Add validation rules

## Security Considerations

### Input Validation
- Sanitize all input commands
- Prevent injection attacks
- Validate translation outputs
- Limit command complexity

### Error Information
- Avoid exposing sensitive information in errors
- Log errors securely
- Provide safe error messages
- Handle edge cases gracefully

### Performance Security
- Prevent denial-of-service attacks
- Limit resource usage
- Implement rate limiting
- Monitor for abuse patterns

## License

This AI Command Translator module is part of the AI Vintage OS project and follows the same license terms as the main project.
