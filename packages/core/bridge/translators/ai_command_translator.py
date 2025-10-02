"""
AI Command Translator Module

This module provides translation services from AI-generated commands to executable
BASIC-M6502 commands. It handles parsing, validation, and optimization of AI responses
for reliable emulator execution.
"""

import re
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple, Union

from loguru import logger

from bridge.core.error_handler import (
    BridgeError,
    ErrorCategory,
    ErrorHandler,
    ErrorSeverity,
)
from bridge.core.settings import get_settings


class TranslationStrategy(ABC):
    """Abstract base class for translation strategies."""

    @abstractmethod
    def can_translate(self, ai_command: str) -> bool:
        """Check if this strategy can handle the AI command."""
        pass

    @abstractmethod
    def translate(
        self, ai_command: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Translate AI command to BASIC-M6502."""
        pass

    @abstractmethod
    def get_confidence(self, ai_command: str, translation: str) -> float:
        """Calculate confidence score for the translation."""
        pass


class PatternBasedTranslator(TranslationStrategy):
    """Pattern-based translation strategy using regex patterns."""

    def __init__(self):
        """Initialize pattern-based translator."""
        self.patterns = self._initialize_patterns()

    def _initialize_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize translation patterns."""
        return {
            "print_statement": {
                "pattern": r"(?:print|display|show|output|echo)\s+(?:['\"]?)([^'\"]+)(?:['\"]?)",
                "template": 'PRINT "{content}"',
                "confidence": 0.9,
            },
            "variable_assignment": {
                "pattern": r"(?:set|let|assign)\s+(\w+)\s+(?:to|equals?|=)\s+([^\s]+)",
                "template": "LET {variable} = {value}",
                "confidence": 0.85,
            },
            "simple_assignment": {
                "pattern": r"(\w+)\s*=\s*([^\s]+)",
                "template": "LET {variable} = {value}",
                "confidence": 0.8,
            },
            "for_loop": {
                "pattern": r"(?:loop|for)\s+(?:from\s+)?(\d+)\s+(?:to|until)\s+(\d+)",
                "template": "FOR I = {start} TO {end}\nPRINT I\nNEXT I",
                "confidence": 0.9,
            },
            "conditional_if": {
                "pattern": r"if\s+(\w+)\s+(equals?|==|=)\s+(\w+)\s+(?:then\s+)?(?:print|show)\s+(?:['\"]?)([^'\"]+)(?:['\"]?)",
                "template": 'IF {variable} = {value} THEN PRINT "{message}"',
                "confidence": 0.8,
            },
            "end_program": {
                "pattern": r"(?:end|stop|terminate|exit)\s+(?:program)?",
                "template": "END",
                "confidence": 0.95,
            },
            "comment": {
                "pattern": r"(?:comment|note|rem)\s+(.+)",
                "template": "REM {content}",
                "confidence": 0.9,
            },
            "calculation": {
                "pattern": r"(?:calculate|compute|add|subtract|multiply|divide)\s+(\d+)\s+(plus|minus|times|divided by)\s+(\d+)",
                "template": 'LET RESULT = {num1} {operator} {num2}\nPRINT "Result: "; RESULT',
                "confidence": 0.85,
            },
        }

    def can_translate(self, ai_command: str) -> bool:
        """Check if any pattern matches the command."""
        command_lower = ai_command.lower().strip()

        for pattern_name, pattern_info in self.patterns.items():
            if re.search(pattern_info["pattern"], command_lower, re.IGNORECASE):
                return True

        return False

    def translate(
        self, ai_command: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Translate using pattern matching."""
        command_lower = ai_command.lower().strip()

        for pattern_name, pattern_info in self.patterns.items():
            match = re.search(pattern_info["pattern"], command_lower, re.IGNORECASE)
            if match:
                try:
                    # Extract matched groups
                    groups = match.groups()

                    # Apply template
                    if pattern_name == "print_statement":
                        translation = f'PRINT "{groups[0]}"'
                    elif pattern_name == "variable_assignment":
                        translation = f"LET {groups[0].upper()} = {groups[1]}"
                    elif pattern_name == "simple_assignment":
                        translation = f"LET {groups[0].upper()} = {groups[1]}"
                    elif pattern_name == "for_loop":
                        translation = (
                            f"FOR I = {groups[0]} TO {groups[1]}\nPRINT I\nNEXT I"
                        )
                    elif pattern_name == "conditional_if":
                        translation = f'IF {groups[0].upper()} = {groups[2]} THEN PRINT "{groups[3]}"'
                    elif pattern_name == "end_program":
                        translation = "END"
                    elif pattern_name == "comment":
                        translation = f"REM {groups[0]}"
                    elif pattern_name == "calculation":
                        operator_map = {
                            "plus": "+",
                            "minus": "-",
                            "times": "*",
                            "divided by": "/",
                        }
                        op = operator_map.get(groups[1], "+")
                        translation = f'LET RESULT = {groups[0]} {op} {groups[2]}\nPRINT "Result: "; RESULT'
                    else:
                        # Generic template application
                        translation = pattern_info["template"].format(*groups)

                    confidence = pattern_info["confidence"]

                    return {
                        "success": True,
                        "translation": translation,
                        "confidence": confidence,
                        "strategy": "pattern_based",
                        "pattern_used": pattern_name,
                        "original_command": ai_command,
                    }

                except Exception as e:
                    logger.warning(
                        f"Pattern translation failed for {pattern_name}: {e}"
                    )
                    continue

        return {
            "success": False,
            "error": "No matching pattern found",
            "original_command": ai_command,
        }

    def get_confidence(self, ai_command: str, translation: str) -> float:
        """Calculate confidence based on pattern match."""
        command_lower = ai_command.lower().strip()

        for pattern_name, pattern_info in self.patterns.items():
            if re.search(pattern_info["pattern"], command_lower, re.IGNORECASE):
                return pattern_info["confidence"]

        return 0.0


class RuleBasedTranslator(TranslationStrategy):
    """Rule-based translation strategy using predefined rules."""

    def __init__(self):
        """Initialize rule-based translator."""
        self.rules = self._initialize_rules()

    def _initialize_rules(self) -> Dict[str, Dict[str, Any]]:
        """Initialize translation rules."""
        return {
            "basic_keywords": {
                "print": "PRINT",
                "let": "LET",
                "for": "FOR",
                "next": "NEXT",
                "if": "IF",
                "then": "THEN",
                "else": "ELSE",
                "goto": "GOTO",
                "end": "END",
                "rem": "REM",
            },
            "operators": {
                "equals": "=",
                "plus": "+",
                "minus": "-",
                "times": "*",
                "divided by": "/",
                "greater than": ">",
                "less than": "<",
                "not equal": "<>",
            },
            "control_structures": {
                "loop": {"start": "FOR", "end": "NEXT"},
                "conditional": {"start": "IF", "end": "THEN"},
                "subroutine": {"start": "GOSUB", "end": "RETURN"},
            },
        }

    def can_translate(self, ai_command: str) -> bool:
        """Check if command contains recognizable keywords."""
        command_lower = ai_command.lower().strip()

        # Check for basic keywords
        basic_keywords = self.rules["basic_keywords"].keys()
        if any(keyword in command_lower for keyword in basic_keywords):
            return True

        # Check for operator words
        operators = self.rules["operators"].keys()
        if any(op in command_lower for op in operators):
            return True

        return False

    def translate(
        self, ai_command: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Translate using rule-based approach."""
        command_lower = ai_command.lower().strip()
        words = command_lower.split()

        try:
            translation_parts = []
            i = 0

            while i < len(words):
                word = words[i]

                # Handle basic keywords
                if word in self.rules["basic_keywords"]:
                    basic_cmd = self.rules["basic_keywords"][word]
                    translation_parts.append(basic_cmd)

                    # Handle specific keyword logic
                    if word == "print":
                        # Look for text to print
                        if i + 1 < len(words):
                            next_word = words[i + 1]
                            if next_word.startswith('"') or next_word.startswith("'"):
                                # Find end quote
                                text_parts = [next_word]
                                i += 1
                                while i + 1 < len(words) and not (
                                    words[i + 1].endswith('"')
                                    or words[i + 1].endswith("'")
                                ):
                                    i += 1
                                    text_parts.append(words[i])
                                if i + 1 < len(words):
                                    i += 1
                                    text_parts.append(words[i])
                                text = " ".join(text_parts)
                                translation_parts.append(text)
                            else:
                                # Assume variable or expression
                                translation_parts.append(words[i + 1].upper())
                                i += 1

                    elif word == "let":
                        # Handle variable assignment
                        if i + 2 < len(words):
                            var_name = words[i + 1].upper()
                            operator = words[i + 2]
                            if operator in ["=", "equals"]:
                                if i + 3 < len(words):
                                    value = words[i + 3]
                                    translation_parts.extend([var_name, "=", value])
                                    i += 3

                    elif word == "for":
                        # Handle FOR loop
                        if i + 3 < len(words):
                            var_name = words[i + 1].upper()
                            if words[i + 2] in ["=", "equals"]:
                                start_val = words[i + 3]
                                translation_parts.extend([var_name, "=", start_val])
                                i += 3

                                # Look for TO
                                if i + 2 < len(words) and words[i + 1] == "to":
                                    end_val = words[i + 2]
                                    translation_parts.extend(["TO", end_val])
                                    i += 2

                i += 1

            if translation_parts:
                translation = " ".join(translation_parts)
                confidence = self._calculate_rule_confidence(command_lower, translation)

                return {
                    "success": True,
                    "translation": translation,
                    "confidence": confidence,
                    "strategy": "rule_based",
                    "original_command": ai_command,
                }
            else:
                return {
                    "success": False,
                    "error": "No recognizable patterns found",
                    "original_command": ai_command,
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"Rule-based translation failed: {str(e)}",
                "original_command": ai_command,
            }

    def get_confidence(self, ai_command: str, translation: str) -> float:
        """Calculate confidence based on rule application."""
        return self._calculate_rule_confidence(ai_command.lower(), translation)

    def _calculate_rule_confidence(self, command: str, translation: str) -> float:
        """Calculate confidence for rule-based translation."""
        confidence = 0.5  # Base confidence

        # Increase confidence for recognized keywords
        basic_keywords = self.rules["basic_keywords"].keys()
        keyword_count = sum(1 for keyword in basic_keywords if keyword in command)
        confidence += min(keyword_count * 0.1, 0.3)

        # Increase confidence for proper BASIC syntax
        basic_syntax = ["PRINT", "LET", "FOR", "NEXT", "IF", "THEN"]
        syntax_count = sum(1 for syntax in basic_syntax if syntax in translation)
        confidence += min(syntax_count * 0.1, 0.2)

        return min(confidence, 1.0)


class ContextualTranslator(TranslationStrategy):
    """Contextual translation strategy that considers previous commands."""

    def __init__(self):
        """Initialize contextual translator."""
        self.context_history = []
        self.max_history = 10

    def can_translate(self, ai_command: str) -> bool:
        """Contextual translator can handle most commands."""
        return True

    def translate(
        self, ai_command: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Translate considering context."""
        command_lower = ai_command.lower().strip()

        # Add to context history
        self.context_history.append(ai_command)
        if len(self.context_history) > self.max_history:
            self.context_history = self.context_history[-self.max_history :]

        try:
            # Handle context-dependent commands
            if "it" in command_lower or "that" in command_lower:
                # Reference to previous command
                if self.context_history:
                    last_command = (
                        self.context_history[-2]
                        if len(self.context_history) > 1
                        else ""
                    )
                    if "print" in last_command.lower():
                        translation = "PRINT IT"
                        confidence = 0.7
                    else:
                        translation = "REM Context reference not clear"
                        confidence = 0.3
                else:
                    translation = "REM No context available"
                    confidence = 0.2

            elif "again" in command_lower or "repeat" in command_lower:
                # Repeat previous command
                if self.context_history and len(self.context_history) > 1:
                    last_command = self.context_history[-2]
                    translation = last_command
                    confidence = 0.8
                else:
                    translation = "REM Nothing to repeat"
                    confidence = 0.2

            elif "now" in command_lower or "next" in command_lower:
                # Sequence command
                if context and "sequence" in context:
                    sequence = context["sequence"]
                    if isinstance(sequence, list) and sequence:
                        next_cmd = sequence[0]
                        translation = next_cmd
                        confidence = 0.9
                    else:
                        translation = "REM No sequence available"
                        confidence = 0.3
                else:
                    translation = "REM No context for sequence"
                    confidence = 0.2

            else:
                # Default contextual handling
                translation = f"REM {ai_command}"
                confidence = 0.4

            return {
                "success": True,
                "translation": translation,
                "confidence": confidence,
                "strategy": "contextual",
                "original_command": ai_command,
                "context_used": bool(context),
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Contextual translation failed: {str(e)}",
                "original_command": ai_command,
            }

    def get_confidence(self, ai_command: str, translation: str) -> float:
        """Calculate confidence for contextual translation."""
        confidence = 0.5  # Base confidence

        # Increase confidence if context was used
        if "context" in ai_command.lower():
            confidence += 0.2

        # Decrease confidence for ambiguous references
        if any(word in ai_command.lower() for word in ["it", "that", "this"]):
            confidence -= 0.1

        return max(min(confidence, 1.0), 0.0)


class AICommandTranslator:
    """Main AI command translator class."""

    def __init__(self):
        """Initialize the AI command translator."""
        self.settings = get_settings()
        self.error_handler = ErrorHandler()

        # Initialize translation strategies
        self.strategies = [
            PatternBasedTranslator(),
            RuleBasedTranslator(),
            ContextualTranslator(),
        ]

        # Translation tracking
        self.translation_history = []
        self.max_history_size = 1000

        # Performance tracking
        self.stats = {
            "total_translations": 0,
            "successful_translations": 0,
            "failed_translations": 0,
            "average_confidence": 0.0,
            "strategy_usage": {},
            "average_translation_time": 0.0,
            "total_translation_time": 0.0,
        }

        logger.info("AI Command Translator initialized")

    def translate_command(
        self, ai_command: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Translate an AI-generated command to BASIC-M6502.

        Args:
            ai_command: The AI-generated command to translate
            context: Optional context information

        Returns:
            Dictionary containing translation result and metadata
        """
        start_time = time.perf_counter()
        translation_id = f"trans_{int(time.time())}_{len(self.translation_history)}"

        try:
            logger.info(f"Translating AI command: {ai_command[:100]}...")

            # Try each strategy in order of preference
            best_result = None
            best_confidence = 0.0

            for strategy in self.strategies:
                if strategy.can_translate(ai_command):
                    try:
                        result = strategy.translate(ai_command, context)

                        if result["success"]:
                            confidence = result.get("confidence", 0.0)

                            if confidence > best_confidence:
                                best_result = result
                                best_confidence = confidence

                                # If we have high confidence, use this result
                                if confidence >= 0.8:
                                    break

                    except Exception as e:
                        logger.warning(
                            f"Strategy {strategy.__class__.__name__} failed: {e}"
                        )
                        continue

            # Calculate translation time
            translation_time = (time.perf_counter() - start_time) * 1000

            if best_result:
                # Validate the translation
                validation = self._validate_translation(best_result["translation"])

                # Create final result
                final_result = {
                    "translation_id": translation_id,
                    "success": True,
                    "original_command": ai_command,
                    "translation": best_result["translation"],
                    "confidence": best_confidence,
                    "strategy_used": best_result.get("strategy", "unknown"),
                    "validation": validation,
                    "translation_time": translation_time,
                    "timestamp": time.time(),
                    "context_used": bool(context),
                }

                # Update statistics
                self._update_stats(
                    translation_time, True, best_result.get("strategy", "unknown")
                )

                # Add to history
                self._add_to_history(final_result)

                logger.info(
                    f"✅ Translation successful (confidence: {best_confidence:.2f})"
                )
                logger.info(f"Strategy: {best_result.get('strategy', 'unknown')}")
                logger.info(f"Translation: {best_result['translation']}")

                return final_result

            else:
                # No strategy could handle the command
                error_result = {
                    "translation_id": translation_id,
                    "success": False,
                    "error": "No translation strategy could handle this command",
                    "original_command": ai_command,
                    "translation_time": translation_time,
                    "timestamp": time.time(),
                    "suggestions": self._generate_suggestions(ai_command),
                }

                self._update_stats(translation_time, False)
                self._add_to_history(error_result)

                logger.warning(f"⚠️ Translation failed: {error_result['error']}")
                return error_result

        except Exception as e:
            translation_time = (time.perf_counter() - start_time) * 1000

            # Log error
            error_id = self.error_handler.log_error(
                e,
                context={"command": ai_command, "translation_time": translation_time},
                operation="translate_command",
            )

            error_result = {
                "translation_id": translation_id,
                "success": False,
                "error": str(e),
                "error_id": error_id,
                "original_command": ai_command,
                "translation_time": translation_time,
                "timestamp": time.time(),
            }

            self._update_stats(translation_time, False)
            self._add_to_history(error_result)

            logger.error(f"❌ Translation failed with error: {e}")
            return error_result

    def _validate_translation(self, translation: str) -> Dict[str, Any]:
        """Validate a BASIC-M6502 translation."""
        validation = {
            "is_valid": True,
            "issues": [],
            "suggestions": [],
            "syntax_score": 0.0,
        }

        try:
            translation_upper = translation.upper().strip()

            # Check for empty translation
            if not translation.strip():
                validation["is_valid"] = False
                validation["issues"].append("Empty translation")
                return validation

            # Check for valid BASIC keywords
            valid_keywords = [
                "PRINT",
                "LET",
                "FOR",
                "NEXT",
                "IF",
                "THEN",
                "ELSE",
                "GOTO",
                "GOSUB",
                "RETURN",
                "END",
                "REM",
                "DATA",
                "READ",
                "RESTORE",
                "DIM",
                "INPUT",
                "CLS",
                "LIST",
                "RUN",
                "STOP",
                "CONT",
                "SAVE",
                "LOAD",
            ]

            has_valid_keyword = any(
                keyword in translation_upper for keyword in valid_keywords
            )
            if not has_valid_keyword:
                validation["issues"].append("No valid BASIC keywords found")
                validation["suggestions"].append(
                    "Consider using PRINT, LET, FOR, IF, or other BASIC commands"
                )

            # Check for proper PRINT syntax
            if "PRINT" in translation_upper:
                if (
                    '"' not in translation
                    and "'" not in translation
                    and ";" not in translation
                ):
                    validation["issues"].append(
                        "PRINT statement may be missing quotes or semicolons"
                    )
                    validation["suggestions"].append(
                        "PRINT statements should include quotes around text or semicolons for variables"
                    )

            # Check for proper variable assignment
            if "LET" in translation_upper:
                if "=" not in translation:
                    validation["issues"].append(
                        "LET statement missing assignment operator"
                    )
                    validation["suggestions"].append(
                        "LET statements should use = for assignment"
                    )

            # Check for balanced FOR/NEXT loops
            for_count = translation_upper.count("FOR")
            next_count = translation_upper.count("NEXT")
            if for_count != next_count:
                validation["issues"].append(
                    f"Unbalanced FOR/NEXT loops ({for_count} FOR, {next_count} NEXT)"
                )
                validation["suggestions"].append(
                    "Ensure each FOR statement has a corresponding NEXT statement"
                )

            # Check for balanced IF/THEN statements
            if_count = translation_upper.count("IF")
            then_count = translation_upper.count("THEN")
            if if_count != then_count:
                validation["issues"].append(
                    f"Unbalanced IF/THEN statements ({if_count} IF, {then_count} THEN)"
                )
                validation["suggestions"].append(
                    "Ensure each IF statement has a corresponding THEN clause"
                )

            # Calculate syntax score
            syntax_score = 1.0
            syntax_score -= len(validation["issues"]) * 0.2
            syntax_score = max(syntax_score, 0.0)
            validation["syntax_score"] = syntax_score

            # Determine overall validity
            validation["is_valid"] = len(validation["issues"]) == 0

        except Exception as e:
            validation["is_valid"] = False
            validation["issues"].append(f"Validation error: {str(e)}")
            validation["syntax_score"] = 0.0

        return validation

    def _generate_suggestions(self, ai_command: str) -> List[str]:
        """Generate suggestions for untranslatable commands."""
        suggestions = []
        command_lower = ai_command.lower()

        if "print" in command_lower:
            suggestions.append('Try: PRINT "your text here"')

        if "set" in command_lower or "let" in command_lower:
            suggestions.append("Try: LET VARIABLE = value")

        if "loop" in command_lower or "for" in command_lower:
            suggestions.append("Try: FOR I = 1 TO 10")

        if "if" in command_lower:
            suggestions.append("Try: IF condition THEN action")

        if "end" in command_lower:
            suggestions.append("Try: END")

        if not suggestions:
            suggestions.append(
                "Consider using basic BASIC commands like PRINT, LET, FOR, IF, or END"
            )
            suggestions.append("Be more specific about what you want the program to do")

        return suggestions

    def _update_stats(
        self, translation_time: float, success: bool, strategy: str = "unknown"
    ):
        """Update translation statistics."""
        self.stats["total_translations"] += 1
        self.stats["total_translation_time"] += translation_time

        if success:
            self.stats["successful_translations"] += 1
        else:
            self.stats["failed_translations"] += 1

        # Update average translation time
        self.stats["average_translation_time"] = (
            self.stats["total_translation_time"] / self.stats["total_translations"]
        )

        # Update strategy usage
        if strategy not in self.stats["strategy_usage"]:
            self.stats["strategy_usage"][strategy] = 0
        self.stats["strategy_usage"][strategy] += 1

    def _add_to_history(self, result: Dict[str, Any]):
        """Add result to translation history."""
        self.translation_history.append(result)

        # Trim history if too large
        if len(self.translation_history) > self.max_history_size:
            self.translation_history = self.translation_history[
                -self.max_history_size :
            ]

    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive translation statistics."""
        total = self.stats["total_translations"]

        return {
            "stats": self.stats,
            "success_rate": (
                self.stats["successful_translations"] / total if total > 0 else 0
            ),
            "average_confidence": self._calculate_average_confidence(),
            "most_used_strategy": self._get_most_used_strategy(),
            "history_size": len(self.translation_history),
        }

    def _calculate_average_confidence(self) -> float:
        """Calculate average confidence from recent translations."""
        recent_successful = [
            t
            for t in self.translation_history[-100:]
            if t.get("success", False) and "confidence" in t
        ]

        if not recent_successful:
            return 0.0

        total_confidence = sum(t["confidence"] for t in recent_successful)
        return total_confidence / len(recent_successful)

    def _get_most_used_strategy(self) -> str:
        """Get the most frequently used translation strategy."""
        if not self.stats["strategy_usage"]:
            return "none"

        return max(self.stats["strategy_usage"], key=self.stats["strategy_usage"].get)

    def get_recent_translations(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent translation history."""
        return self.translation_history[-limit:] if self.translation_history else []

    def clear_history(self):
        """Clear translation history."""
        self.translation_history.clear()
        logger.info("Translation history cleared")

    def test_translation(self, test_commands: List[str]) -> Dict[str, Any]:
        """Test translation with a list of commands."""
        results = []

        for command in test_commands:
            result = self.translate_command(command)
            results.append(result)

        # Analyze results
        successful = [r for r in results if r.get("success", False)]
        failed = [r for r in results if not r.get("success", False)]

        avg_confidence = 0.0
        if successful:
            avg_confidence = sum(r.get("confidence", 0) for r in successful) / len(
                successful
            )

        return {
            "total_commands": len(test_commands),
            "successful": len(successful),
            "failed": len(failed),
            "success_rate": (
                len(successful) / len(test_commands) if test_commands else 0
            ),
            "average_confidence": avg_confidence,
            "results": results,
        }


if __name__ == "__main__":
    # Test the AI command translator
    translator = AICommandTranslator()

    print("AI Command Translator Test")
    print("=" * 50)

    test_commands = [
        "Print hello world",
        "Set x to 42",
        "Let y equals 10",
        "Loop from 1 to 10",
        "If x equals 5 then print yes",
        "End program",
        "Comment this is a test",
        "Calculate 5 plus 3",
        "Invalid command that should fail",
        "Print the result",
    ]

    results = translator.test_translation(test_commands)

    print(f"\n📊 Test Results:")
    print(f"  Total Commands: {results['total_commands']}")
    print(f"  Successful: {results['successful']}")
    print(f"  Failed: {results['failed']}")
    print(f"  Success Rate: {results['success_rate']:.1%}")
    print(f"  Average Confidence: {results['average_confidence']:.2f}")

    print(f"\n📋 Detailed Results:")
    for i, result in enumerate(results["results"], 1):
        status = "✅" if result.get("success", False) else "❌"
        confidence = result.get("confidence", 0)
        translation = result.get("translation", result.get("error", "N/A"))

        print(f"  {i:2d}. {status} {result['original_command']}")
        print(f"      → {translation}")
        if result.get("success", False):
            print(
                f"      Confidence: {confidence:.2f}, Strategy: {result.get('strategy_used', 'unknown')}"
            )
        print()

    # Show statistics
    stats = translator.get_statistics()
    print(f"📊 Statistics:")
    print(f"  Total Translations: {stats['stats']['total_translations']}")
    print(f"  Success Rate: {stats['success_rate']:.1%}")
    print(f"  Average Confidence: {stats['average_confidence']:.2f}")
    print(f"  Most Used Strategy: {stats['most_used_strategy']}")
    print(f"  Strategy Usage: {stats['stats']['strategy_usage']}")

    print("\n✅ AI Command Translator test completed!")
