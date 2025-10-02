"""
AI Command Translator Module

This module provides translation services between natural language AI prompts
and BASIC-M6502 commands. It handles command parsing, validation, and conversion
for seamless integration between the AI layer and the emulator engine.
"""

import re
import time
from typing import Any, Dict, List, Optional, Tuple

from loguru import logger

from bridge.core.settings import get_settings


class AITranslator:
    """Main translator class for converting AI prompts to BASIC-M6502 commands."""

    def __init__(self):
        """Initialize the AI translator."""
        self.settings = get_settings()
        self.command_patterns = self._initialize_command_patterns()
        self.variable_registry = {}  # Track variables used in programs
        self.line_number = 10  # Current BASIC line number

        # Performance tracking
        self.stats = {
            "translations_processed": 0,
            "average_translation_time": 0.0,
            "success_rate": 0.0,
            "commands_generated": 0,
        }

        logger.info("AI Translator initialized")

    def _initialize_command_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize command recognition patterns."""
        return {
            "print": {
                "patterns": [
                    r"print\s+(.+)",
                    r"display\s+(.+)",
                    r"show\s+(.+)",
                    r"output\s+(.+)",
                    r"echo\s+(.+)",
                ],
                "handler": self._handle_print_command,
                "description": "Print text or variables to output",
            },
            "assignment": {
                "patterns": [
                    r"set\s+(\w+)\s*=\s*(.+)",
                    r"let\s+(\w+)\s*=\s*(.+)",
                    r"assign\s+(\w+)\s*=\s*(.+)",
                    r"(\w+)\s*=\s*(.+)",
                ],
                "handler": self._handle_assignment_command,
                "description": "Assign values to variables",
            },
            "loop": {
                "patterns": [
                    r"loop\s+from\s+(\d+)\s+to\s+(\d+)",
                    r"repeat\s+(\d+)\s+times",
                    r"for\s+(\w+)\s+from\s+(\d+)\s+to\s+(\d+)",
                    r"iterate\s+(\d+)\s+times",
                ],
                "handler": self._handle_loop_command,
                "description": "Create loops for repetitive operations",
            },
            "conditional": {
                "patterns": [r"if\s+(.+)", r"when\s+(.+)", r"condition\s+(.+)"],
                "handler": self._handle_conditional_command,
                "description": "Create conditional statements",
            },
            "calculation": {
                "patterns": [
                    r"calculate\s+(.+)",
                    r"compute\s+(.+)",
                    r"add\s+(\d+)\s+and\s+(\d+)",
                    r"subtract\s+(\d+)\s+from\s+(\d+)",
                    r"multiply\s+(\d+)\s+by\s+(\d+)",
                    r"divide\s+(\d+)\s+by\s+(\d+)",
                ],
                "handler": self._handle_calculation_command,
                "description": "Perform mathematical calculations",
            },
            "end": {
                "patterns": [
                    r"end\s+program",
                    r"stop\s+program",
                    r"terminate",
                    r"exit",
                ],
                "handler": self._handle_end_command,
                "description": "End program execution",
            },
            "comment": {
                "patterns": [r"comment\s+(.+)", r"note\s+(.+)", r"rem\s+(.+)"],
                "handler": self._handle_comment_command,
                "description": "Add comments to the program",
            },
        }

    def translate_prompt(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Translate a natural language prompt to BASIC-M6502 commands.

        Args:
            prompt: The natural language prompt to translate
            context: Optional context information for translation

        Returns:
            Dictionary containing translated commands and metadata
        """
        start_time = time.perf_counter()

        try:
            logger.info(f"Translating prompt: {prompt[:100]}...")

            # Reset line number for new translation
            self.line_number = 10

            # Parse the prompt into commands
            commands = []
            prompt_lower = prompt.lower().strip()

            # Split complex prompts into individual commands
            command_parts = self._split_prompt_into_commands(prompt_lower)

            for part in command_parts:
                translated = self._translate_single_command(part.strip())
                if translated:
                    commands.extend(translated)

            # If no specific commands were found, generate a default response
            if not commands:
                commands = self._generate_default_commands(prompt)

            # Calculate translation time
            translation_time = (time.perf_counter() - start_time) * 1000

            # Update statistics
            self._update_translation_stats(translation_time, True)

            result = {
                "success": True,
                "commands": commands,
                "line_count": len(commands),
                "translation_time": translation_time,
                "confidence": self._calculate_confidence(prompt, commands),
                "variables_used": list(self.variable_registry.keys()),
                "original_prompt": prompt,
            }

            logger.info(f"✅ Translation completed in {translation_time:.2f}ms")
            logger.info(f"Generated {len(commands)} BASIC command(s)")

            return result

        except Exception as e:
            translation_time = (time.perf_counter() - start_time) * 1000
            self._update_translation_stats(translation_time, False)

            logger.error(f"❌ Translation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "translation_time": translation_time,
                "commands": [],
                "confidence": 0.0,
            }

    def _split_prompt_into_commands(self, prompt: str) -> List[str]:
        """Split a complex prompt into individual command parts."""
        # Common separators for multiple commands
        separators = [
            " then ",
            " and ",
            " also ",
            " next ",
            " after that ",
            ". ",
            "; ",
            "\n",
        ]

        commands = [prompt]

        for separator in separators:
            new_commands = []
            for cmd in commands:
                new_commands.extend(
                    [c.strip() for c in cmd.split(separator) if c.strip()]
                )
            commands = new_commands

        return commands

    def _translate_single_command(self, command: str) -> List[str]:
        """Translate a single command to BASIC-M6502."""
        for command_type, pattern_info in self.command_patterns.items():
            for pattern in pattern_info["patterns"]:
                match = re.search(pattern, command, re.IGNORECASE)
                if match:
                    try:
                        result = pattern_info["handler"](match, command)
                        if result:
                            return result
                    except Exception as e:
                        logger.warning(f"Error in {command_type} handler: {e}")
                        continue

        # If no pattern matches, try to infer the command type
        return self._infer_command_type(command)

    def _handle_print_command(self, match: re.Match, command: str) -> List[str]:
        """Handle PRINT command translation."""
        content = match.group(1).strip()

        # Clean up the content
        if content.startswith('"') and content.endswith('"'):
            content = content[1:-1]
        elif not content.startswith('"'):
            content = f'"{content}"'

        basic_cmd = f"{self.line_number} PRINT {content}"
        self.line_number += 10

        return [basic_cmd]

    def _handle_assignment_command(self, match: re.Match, command: str) -> List[str]:
        """Handle variable assignment translation."""
        variable = match.group(1).upper()
        value = match.group(2).strip()

        # Register the variable
        self.variable_registry[variable] = value

        # Parse the value
        try:
            # Try to evaluate as a mathematical expression
            if any(op in value for op in ["+", "-", "*", "/"]):
                # Simple math expression
                value = self._evaluate_expression(value)
            else:
                # Try to convert to number
                float(value)
        except:
            # Treat as string if not a valid number
            if not value.startswith('"'):
                value = f'"{value}"'

        basic_cmd = f"{self.line_number} LET {variable} = {value}"
        self.line_number += 10

        return [basic_cmd]

    def _handle_loop_command(self, match: re.Match, command: str) -> List[str]:
        """Handle loop command translation."""
        commands = []

        if "loop from" in command or "for" in command:
            # FOR loop
            if len(match.groups()) >= 3:
                var = match.group(1).upper()
                start = match.group(2)
                end = match.group(3)
            else:
                var = "I"
                start = match.group(1)
                end = match.group(2)

            commands.append(f"{self.line_number} FOR {var} = {start} TO {end}")
            self.line_number += 10

            # Add a simple print statement inside the loop
            commands.append(f'{self.line_number} PRINT "Iteration: "; {var}')
            self.line_number += 10

            commands.append(f"{self.line_number} NEXT {var}")
            self.line_number += 10

        elif "repeat" in command or "iterate" in command:
            # REPEAT loop
            count = match.group(1)
            var = "I"

            commands.append(f"{self.line_number} FOR {var} = 1 TO {count}")
            self.line_number += 10

            commands.append(f'{self.line_number} PRINT "Repeat: "; {var}')
            self.line_number += 10

            commands.append(f"{self.line_number} NEXT {var}")
            self.line_number += 10

        return commands

    def _handle_conditional_command(self, match: re.Match, command: str) -> List[str]:
        """Handle conditional command translation."""
        condition = match.group(1).strip()

        # Simple condition parsing
        if "=" in condition:
            parts = condition.split("=")
            if len(parts) == 2:
                left = parts[0].strip()
                right = parts[1].strip()
                condition = f"{left} = {right}"

        basic_cmd = (
            f"{self.line_number} IF {condition} THEN GOTO {self.line_number + 20}"
        )
        self.line_number += 10

        return [basic_cmd]

    def _handle_calculation_command(self, match: re.Match, command: str) -> List[str]:
        """Handle calculation command translation."""
        commands = []

        if len(match.groups()) >= 2:
            # Binary operation
            if "add" in command:
                a, b = match.group(1), match.group(2)
                commands.append(f"{self.line_number} LET A = {a}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET B = {b}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET C = A + B")
                self.line_number += 10
                commands.append(f'{self.line_number} PRINT "{a} + {b} = "; C')
                self.line_number += 10

            elif "subtract" in command:
                a, b = match.group(1), match.group(2)
                commands.append(f"{self.line_number} LET A = {a}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET B = {b}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET C = A - B")
                self.line_number += 10
                commands.append(f'{self.line_number} PRINT "{a} - {b} = "; C')
                self.line_number += 10

            elif "multiply" in command:
                a, b = match.group(1), match.group(2)
                commands.append(f"{self.line_number} LET A = {a}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET B = {b}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET C = A * B")
                self.line_number += 10
                commands.append(f'{self.line_number} PRINT "{a} * {b} = "; C')
                self.line_number += 10

            elif "divide" in command:
                a, b = match.group(1), match.group(2)
                commands.append(f"{self.line_number} LET A = {a}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET B = {b}")
                self.line_number += 10
                commands.append(f"{self.line_number} LET C = A / B")
                self.line_number += 10
                commands.append(f'{self.line_number} PRINT "{a} / {b} = "; C')
                self.line_number += 10
        else:
            # General calculation
            expression = match.group(1).strip()
            result_var = "RESULT"
            commands.append(f"{self.line_number} LET {result_var} = {expression}")
            self.line_number += 10
            commands.append(f'{self.line_number} PRINT "Result: "; {result_var}')
            self.line_number += 10

        return commands

    def _handle_end_command(self, match: re.Match, command: str) -> List[str]:
        """Handle END command translation."""
        return [f"{self.line_number} END"]

    def _handle_comment_command(self, match: re.Match, command: str) -> List[str]:
        """Handle comment command translation."""
        comment_text = match.group(1).strip()
        return [f"{self.line_number} REM {comment_text}"]

    def _infer_command_type(self, command: str) -> List[str]:
        """Infer command type when no pattern matches."""
        command_lower = command.lower()

        # Check for common keywords
        if any(word in command_lower for word in ["hello", "hi", "greeting"]):
            return [f'{self.line_number} PRINT "Hello from AI Vintage OS!"']

        elif any(word in command_lower for word in ["time", "date", "clock"]):
            return [f'{self.line_number} PRINT "Time: "; TIME$']

        elif any(word in command_lower for word in ["random", "randomize"]):
            return [
                f"{self.line_number} RANDOMIZE",
                f'{self.line_number} PRINT "Random number: "; RND(1)',
            ]

        elif any(word in command_lower for word in ["clear", "cls", "reset"]):
            return [f"{self.line_number} CLS"]

        else:
            # Default response
            return [
                f'{self.line_number} PRINT "Command received: {command}"',
                f'{self.line_number + 10} PRINT "Processing..."',
            ]

    def _generate_default_commands(self, prompt: str) -> List[str]:
        """Generate default commands when no specific pattern matches."""
        return [
            f'{self.line_number} PRINT "AI Command: {prompt[:50]}..."',
            f'{self.line_number + 10} PRINT "Executing default program"',
            f'{self.line_number + 20} PRINT "Hello from AI Vintage OS!"',
        ]

    def _evaluate_expression(self, expression: str) -> str:
        """Safely evaluate a mathematical expression."""
        try:
            # Simple expression evaluation
            # In a real implementation, this would be more sophisticated
            expression = expression.replace(" ", "")

            # Handle basic operations
            if "+" in expression:
                parts = expression.split("+", 1)
                if parts[0].isdigit() and parts[1].isdigit():
                    return str(int(parts[0]) + int(parts[1]))

            elif "-" in expression:
                parts = expression.split("-", 1)
                if parts[0].isdigit() and parts[1].isdigit():
                    return str(int(parts[0]) - int(parts[1]))

            elif "*" in expression:
                parts = expression.split("*", 1)
                if parts[0].isdigit() and parts[1].isdigit():
                    return str(int(parts[0]) * int(parts[1]))

            elif "/" in expression:
                parts = expression.split("/", 1)
                if parts[0].isdigit() and parts[1].isdigit():
                    return str(int(parts[0]) / int(parts[1]))

            return expression

        except Exception:
            return expression

    def _calculate_confidence(self, prompt: str, commands: List[str]) -> float:
        """Calculate confidence score for the translation."""
        if not commands:
            return 0.0

        # Base confidence
        confidence = 0.5

        # Increase confidence based on command complexity
        if len(commands) > 1:
            confidence += 0.2

        # Increase confidence for specific command types
        command_text = " ".join(commands).lower()
        if any(cmd in command_text for cmd in ["print", "let", "for", "if"]):
            confidence += 0.2

        # Increase confidence for proper BASIC syntax
        if all(
            " " in cmd
            and cmd.split()[1].upper() in ["PRINT", "LET", "FOR", "IF", "NEXT", "END"]
            for cmd in commands
        ):
            confidence += 0.1

        return min(confidence, 1.0)

    def _update_translation_stats(self, translation_time: float, success: bool):
        """Update translation statistics."""
        self.stats["translations_processed"] += 1

        # Update average translation time
        total_time = self.stats["average_translation_time"] * (
            self.stats["translations_processed"] - 1
        )
        self.stats["average_translation_time"] = (
            total_time + translation_time
        ) / self.stats["translations_processed"]

        # Update success rate
        if success:
            success_count = (
                self.stats["success_rate"] * (self.stats["translations_processed"] - 1)
                + 1
            )
        else:
            success_count = self.stats["success_rate"] * (
                self.stats["translations_processed"] - 1
            )

        self.stats["success_rate"] = (
            success_count / self.stats["translations_processed"]
        )

    def get_translation_stats(self) -> Dict[str, Any]:
        """Get translation statistics."""
        return {
            "translator_stats": self.stats,
            "variable_registry": self.variable_registry.copy(),
            "supported_commands": list(self.command_patterns.keys()),
        }

    def reset_translator(self):
        """Reset the translator state."""
        self.variable_registry.clear()
        self.line_number = 10
        logger.info("AI Translator reset")


if __name__ == "__main__":
    # Test the AI translator
    translator = AITranslator()

    test_prompts = [
        "Print hello world",
        "Set x equals 5",
        "Add 3 and 4",
        "Loop from 1 to 10",
        "If x equals 5 then print yes",
        "Calculate 10 plus 20",
        "End program",
    ]

    print("AI Translator Test")
    print("=" * 50)

    for prompt in test_prompts:
        print(f"\nPrompt: {prompt}")
        result = translator.translate_prompt(prompt)

        if result["success"]:
            print(f"✅ Translation successful (confidence: {result['confidence']:.2f})")
            for cmd in result["commands"]:
                print(f"  {cmd}")
        else:
            print(f"❌ Translation failed: {result['error']}")

    print(f"\n📊 Translation Statistics:")
    stats = translator.get_translation_stats()
    print(
        f"  Translations processed: {stats['translator_stats']['translations_processed']}"
    )
    print(
        f"  Average time: {stats['translator_stats']['average_translation_time']:.2f}ms"
    )
    print(f"  Success rate: {stats['translator_stats']['success_rate']:.2%}")
    print(f"  Variables used: {list(stats['variable_registry'].keys())}")

    print("\n✅ AI Translator test completed!")
