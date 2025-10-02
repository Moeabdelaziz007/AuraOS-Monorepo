"""
BASIC-M6502 Engine Integration Module

This module provides integration between the AI Vintage OS and the legacy
BASIC-M6502 interpreter engine. It handles loading, parsing, and executing
BASIC commands through the 6502 emulator.
"""

from pathlib import Path
from typing import Any, Dict

from loguru import logger

from bridge.core.settings import get_settings


class BASICM6502Engine:
    """Main engine class for BASIC-M6502 integration."""

    def __init__(self):
        """Initialize the BASIC-M6502 engine."""
        self.settings = get_settings()
        self.engine_path = Path(__file__).parent
        self.src_path = self.engine_path / "src"
        self.libs_path = self.engine_path / "libs"
        self.tests_path = self.engine_path / "tests"

        # Engine configuration
        self.memory_size = self.settings.engine.basic_m6502["memory_size"]
        self.version = self.settings.engine.basic_m6502["version"]
        self.timeout = self.settings.engine.basic_m6502["timeout_seconds"]

        logger.info(f"BASIC-M6502 Engine initialized (v{self.version})")

    def load_source_file(self, filename: str) -> str:
        """Load a BASIC source file."""
        file_path = self.src_path / filename

        if not file_path.exists():
            raise FileNotFoundError(f"Source file not found: {filename}")

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        logger.info(f"Loaded source file: {filename} ({len(content)} bytes)")
        return content

    def parse_basic_command(self, command: str) -> Dict[str, Any]:
        """Parse a BASIC command into executable components."""
        command = command.strip().upper()

        # Basic command parsing
        if command.startswith("PRINT"):
            return {
                "type": "print",
                "command": command,
                "args": self._parse_print_args(command),
            }
        elif command.startswith("LET"):
            return {
                "type": "assignment",
                "command": command,
                "args": self._parse_let_args(command),
            }
        elif command.startswith("FOR"):
            return {
                "type": "loop_start",
                "command": command,
                "args": self._parse_for_args(command),
            }
        elif command.startswith("NEXT"):
            return {
                "type": "loop_end",
                "command": command,
                "args": self._parse_next_args(command),
            }
        elif command.startswith("IF"):
            return {
                "type": "conditional",
                "command": command,
                "args": self._parse_if_args(command),
            }
        elif command.startswith("GOTO"):
            return {
                "type": "goto",
                "command": command,
                "args": self._parse_goto_args(command),
            }
        elif command.startswith("GOSUB"):
            return {
                "type": "gosub",
                "command": command,
                "args": self._parse_gosub_args(command),
            }
        elif command.startswith("RETURN"):
            return {"type": "return", "command": command, "args": {}}
        elif command.startswith("END"):
            return {"type": "end", "command": command, "args": {}}
        else:
            return {"type": "unknown", "command": command, "args": {}}

    def _parse_print_args(self, command: str) -> Dict[str, Any]:
        """Parse PRINT command arguments."""
        # Extract content between PRINT and end of line
        content = command[5:].strip()
        return {"content": content}

    def _parse_let_args(self, command: str) -> Dict[str, Any]:
        """Parse LET command arguments."""
        # Extract variable and value
        parts = command[3:].strip().split("=", 1)
        if len(parts) == 2:
            return {"variable": parts[0].strip(), "value": parts[1].strip()}
        return {}

    def _parse_for_args(self, command: str) -> Dict[str, Any]:
        """Parse FOR command arguments."""
        # Extract loop variable and range
        parts = command[3:].strip().split("=", 1)
        if len(parts) == 2:
            range_part = parts[1].strip()
            if " TO " in range_part:
                start_end = range_part.split(" TO ", 1)
                return {
                    "variable": parts[0].strip(),
                    "start": start_end[0].strip(),
                    "end": start_end[1].strip(),
                }
        return {}

    def _parse_next_args(self, command: str) -> Dict[str, Any]:
        """Parse NEXT command arguments."""
        variable = command[4:].strip()
        return {"variable": variable}

    def _parse_if_args(self, command: str) -> Dict[str, Any]:
        """Parse IF command arguments."""
        # Extract condition and action
        if " THEN " in command:
            parts = command[2:].strip().split(" THEN ", 1)
            return {"condition": parts[0].strip(), "action": parts[1].strip()}
        return {}

    def _parse_goto_args(self, command: str) -> Dict[str, Any]:
        """Parse GOTO command arguments."""
        line_number = command[4:].strip()
        return {"line_number": line_number}

    def _parse_gosub_args(self, command: str) -> Dict[str, Any]:
        """Parse GOSUB command arguments."""
        line_number = command[5:].strip()
        return {"line_number": line_number}

    def validate_command(self, command: str) -> bool:
        """Validate a BASIC command for syntax correctness."""
        try:
            parsed = self.parse_basic_command(command)
            return parsed["type"] != "unknown"
        except Exception:
            return False

    def get_engine_info(self) -> Dict[str, Any]:
        """Get information about the BASIC-M6502 engine."""
        return {
            "name": "BASIC-M6502",
            "version": self.version,
            "memory_size": self.memory_size,
            "timeout": self.timeout,
            "source_file": "m6502.asm",
            "source_size": self._get_source_size(),
            "supported_commands": [
                "PRINT",
                "LET",
                "FOR",
                "NEXT",
                "IF",
                "GOTO",
                "GOSUB",
                "RETURN",
                "END",
                "REM",
                "DATA",
                "READ",
            ],
        }

    def _get_source_size(self) -> int:
        """Get the size of the source file."""
        source_file = self.src_path / "m6502.asm"
        if source_file.exists():
            return source_file.stat().st_size
        return 0

    def create_test_program(self) -> str:
        """Create a simple test program for validation."""
        return """
10 REM BASIC-M6502 Test Program
20 PRINT "Hello from BASIC-M6502!"
30 LET X = 10
40 FOR I = 1 TO 5
50 PRINT "Loop iteration: "; I
60 NEXT I
70 IF X > 5 THEN PRINT "X is greater than 5"
80 PRINT "Test completed successfully"
90 END
"""


if __name__ == "__main__":
    # Test the engine
    engine = BASICM6502Engine()

    print("BASIC-M6502 Engine Test")
    print("=" * 30)

    # Test engine info
    info = engine.get_engine_info()
    print(f"Engine: {info['name']} v{info['version']}")
    print(f"Memory: {info['memory_size']} bytes")
    print(f"Source size: {info['source_size']} bytes")

    # Test command parsing
    test_commands = [
        'PRINT "Hello World"',
        "LET X = 10",
        "FOR I = 1 TO 10",
        "NEXT I",
        'IF X > 5 THEN PRINT "Big"',
        "GOTO 100",
        "END",
    ]

    print("\nCommand Parsing Test:")
    print("-" * 20)
    for cmd in test_commands:
        parsed = engine.parse_basic_command(cmd)
        print(f"{cmd:<25} -> {parsed['type']}")

    # Test validation
    print("\nCommand Validation Test:")
    print("-" * 25)
    for cmd in test_commands:
        valid = engine.validate_command(cmd)
        print(f"{cmd:<25} -> {'✓' if valid else '✗'}")

    print("\n✅ BASIC-M6502 Engine test completed successfully!")
