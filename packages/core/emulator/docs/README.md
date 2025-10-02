# BASIC-M6502 Engine Documentation

## Overview

The BASIC-M6502 engine is the core component of the AI Vintage OS that provides a legacy Microsoft BASIC interpreter running on a 6502 microprocessor emulator.

## Architecture

### Source Files

- **`src/m6502.asm`**: The main 6502 assembly language source code for the BASIC interpreter
  - Size: ~162KB (6,954 lines)
  - Version: 1.1 by Micro-Soft

### Directory Structure

```
engine/
├── src/                    # Source code files
│   └── m6502.asm          # Main BASIC-M6502 assembly source
├── libs/                   # Library files and utilities
├── tests/                  # Test files and validation
├── docs/                   # Documentation
├── emulator/              # Emulator configuration
├── __init__.py            # Engine package initialization
└── basic_m6502.py         # Python integration module
```

## Features

### Supported BASIC Commands

- **PRINT**: Output text and variables
- **LET**: Variable assignment
- **FOR/NEXT**: Loop constructs
- **IF/THEN**: Conditional statements
- **GOTO**: Unconditional branching
- **GOSUB/RETURN**: Subroutine calls
- **END**: Program termination

### Engine Configuration

- **Memory Size**: 65,536 bytes (64KB)
- **Version**: 1.1
- **Timeout**: 60 seconds

## Integration

### Python Interface

```python
from engine.basic_m6502 import BASICM6502Engine

engine = BASICM6502Engine()
parsed = engine.parse_basic_command("PRINT \"Hello World\"")
is_valid = engine.validate_command("LET X = 10")
info = engine.get_engine_info()
```

## Testing

Run the test suite:

```bash
pytest engine/tests/test_basic_m6502.py -v
```

## Usage Examples

### Basic Command Execution

```python
engine = BASICM6502Engine()

commands = [
    "PRINT \"Hello World\"",
    "LET X = 10",
    "FOR I = 1 TO 5",
    "NEXT I",
    "END"
]

for cmd in commands:
    if engine.validate_command(cmd):
        parsed = engine.parse_basic_command(cmd)
        print(f"✓ {cmd} -> {parsed['type']}")
```
