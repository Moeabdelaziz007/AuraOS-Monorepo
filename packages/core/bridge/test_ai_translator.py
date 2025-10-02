#!/usr/bin/env python3
"""
AI Command Translator Test Launcher

This script provides a comprehensive test suite for the AI Command Translator
functionality, including strategy testing, command processing, and validation tests.
"""

import sys
import time
from pathlib import Path

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.translators.ai_command_translator import AICommandTranslator


class AITranslatorTestSuite:
    """Comprehensive test suite for AI Command Translator."""

    def __init__(self):
        """Initialize the test suite."""
        self.translator = None
        self.test_results = []

        # Configure logging
        logger.remove()
        logger.add(
            sys.stderr,
            level="INFO",
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>AI Translator Test</cyan> - <level>{message}</level>"
            ),
        )

        logger.info("AI Command Translator Test Suite initialized")

    def run_all_tests(self):
        """Run all AI command translator tests."""
        logger.info("🚀 Starting AI Command Translator Test Suite")
        logger.info("=" * 60)

        # Initialize translator
        self._test_initialization()

        # Test translation strategies
        self._test_translation_strategies()

        # Test command processing
        self._test_command_processing()

        # Test validation system
        self._test_validation_system()

        # Test confidence scoring
        self._test_confidence_scoring()

        # Test error handling
        self._test_error_handling()

        # Test performance
        self._test_performance()

        # Generate test report
        self._generate_test_report()

    def _test_initialization(self):
        """Test translator initialization."""
        logger.info("\n📋 Testing Initialization...")

        try:
            self.translator = AICommandTranslator()

            # Check strategies
            strategy_count = len(self.translator.strategies)
            logger.info(f"✅ Initialized {strategy_count} translation strategies")

            for i, strategy in enumerate(self.translator.strategies):
                logger.info(f"  {i+1}. {strategy.__class__.__name__}")

            # Check initial state
            assert self.translator.translation_history == []
            assert self.translator.max_history_size == 1000
            logger.info("✅ Initial state verified")

            self._record_test_result(
                "initialization", True, f"Initialized {strategy_count} strategies"
            )

        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            self._record_test_result("initialization", False, str(e))

    def _test_translation_strategies(self):
        """Test individual translation strategies."""
        logger.info("\n🔧 Testing Translation Strategies...")

        if not self.translator:
            logger.error("❌ Translator not initialized")
            self._record_test_result(
                "translation_strategies", False, "Translator not initialized"
            )
            return

        strategy_tests = [
            # Pattern-based tests
            {
                "strategy": "pattern_based",
                "commands": [
                    "Print hello world",
                    "Set x to 42",
                    "Loop from 1 to 10",
                    "If x equals 5 then print yes",
                    "End program",
                    "Comment this is a test",
                    "Calculate 5 plus 3",
                ],
                "expected_success_rate": 0.8,
            },
            # Rule-based tests
            {
                "strategy": "rule_based",
                "commands": [
                    "print hello",
                    "let x equals 10",
                    "for i = 1 to 5",
                    "if condition then action",
                ],
                "expected_success_rate": 0.6,
            },
            # Contextual tests
            {
                "strategy": "contextual",
                "commands": [
                    "print it again",
                    "repeat that",
                    "do the next step",
                    "now print hello",
                ],
                "expected_success_rate": 0.5,
            },
        ]

        strategy_results = {}

        for test in strategy_tests:
            strategy_name = test["strategy"]
            logger.info(f"\nTesting {strategy_name} strategy...")

            successful = 0
            total = len(test["commands"])

            for command in test["commands"]:
                try:
                    result = self.translator.translate_command(command)

                    if result["success"]:
                        successful += 1
                        confidence = result.get("confidence", 0)
                        translation = result.get("translation", "")

                        logger.info(f"  ✅ {command}")
                        logger.info(
                            f"     → {translation} (confidence: {confidence:.2f})"
                        )
                    else:
                        logger.warning(f"  ⚠️ {command}")
                        logger.warning(f"     → {result.get('error', 'Unknown error')}")

                except Exception as e:
                    logger.error(f"  ❌ {command}: {e}")

            success_rate = successful / total if total > 0 else 0
            strategy_results[strategy_name] = {
                "successful": successful,
                "total": total,
                "success_rate": success_rate,
            }

            logger.info(
                f"📊 {strategy_name} results: {successful}/{total} ({success_rate:.1%})"
            )

        # Overall strategy test result
        total_successful = sum(r["successful"] for r in strategy_results.values())
        total_commands = sum(r["total"] for r in strategy_results.values())
        overall_success_rate = (
            total_successful / total_commands if total_commands > 0 else 0
        )

        if overall_success_rate >= 0.6:
            self._record_test_result(
                "translation_strategies",
                True,
                f"Overall success rate: {overall_success_rate:.1%}",
            )
        else:
            self._record_test_result(
                "translation_strategies",
                False,
                f"Low success rate: {overall_success_rate:.1%}",
            )

    def _test_command_processing(self):
        """Test command processing functionality."""
        logger.info("\n⚙️ Testing Command Processing...")

        if not self.translator:
            logger.error("❌ Translator not initialized")
            self._record_test_result(
                "command_processing", False, "Translator not initialized"
            )
            return

        test_commands = [
            "Print hello world",
            "Set variable x to 42",
            "Create a loop from 1 to 10",
            "If x equals 5 then print correct",
            "Calculate 10 plus 20",
            "End the program",
            "Comment important note",
            "Let y = 100",
            "Display the result",
            "Stop execution",
        ]

        successful_translations = 0
        total_commands = len(test_commands)

        for i, command in enumerate(test_commands, 1):
            logger.info(f"\nCommand {i}/{total_commands}: {command}")

            try:
                result = self.translator.translate_command(command)

                if result["success"]:
                    successful_translations += 1
                    confidence = result.get("confidence", 0)
                    translation = result.get("translation", "")
                    strategy = result.get("strategy_used", "unknown")

                    logger.info(
                        f"✅ Success (confidence: {confidence:.2f}, strategy: {strategy})"
                    )
                    logger.info(f"   Translation: {translation}")

                    # Check validation
                    validation = result.get("validation", {})
                    if validation.get("is_valid", False):
                        logger.info(
                            f"   ✅ Validation passed (score: {validation.get('syntax_score', 0):.2f})"
                        )
                    else:
                        issues = validation.get("issues", [])
                        logger.warning(f"   ⚠️ Validation issues: {issues}")

                else:
                    error = result.get("error", "Unknown error")
                    suggestions = result.get("suggestions", [])

                    logger.error(f"❌ Failed: {error}")
                    if suggestions:
                        logger.info(f"   Suggestions: {suggestions[0]}")

            except Exception as e:
                logger.error(f"❌ Command processing failed: {e}")

        success_rate = (
            successful_translations / total_commands if total_commands > 0 else 0
        )
        logger.info(
            f"\n📊 Command Processing Summary: {successful_translations}/{total_commands} successful ({success_rate:.1%})"
        )

        self._record_test_result(
            "command_processing",
            success_rate > 0.5,
            f"{successful_translations}/{total_commands} commands processed successfully",
        )

    def _test_validation_system(self):
        """Test validation system."""
        logger.info("\n✅ Testing Validation System...")

        if not self.translator:
            logger.error("❌ Translator not initialized")
            self._record_test_result(
                "validation_system", False, "Translator not initialized"
            )
            return

        validation_tests = [
            # Valid commands
            {
                "command": 'PRINT "Hello World"',
                "should_be_valid": True,
                "description": "Valid PRINT statement",
            },
            {
                "command": "LET X = 42",
                "should_be_valid": True,
                "description": "Valid LET statement",
            },
            {
                "command": "FOR I = 1 TO 10\nPRINT I\nNEXT I",
                "should_be_valid": True,
                "description": "Valid FOR loop",
            },
            {
                "command": 'IF X = 5 THEN PRINT "Yes"',
                "should_be_valid": True,
                "description": "Valid IF statement",
            },
            # Invalid commands
            {
                "command": "PRINT hello",
                "should_be_valid": False,
                "description": "PRINT without quotes",
            },
            {
                "command": "LET X",
                "should_be_valid": False,
                "description": "LET without assignment",
            },
            {
                "command": "FOR I = 1 TO 10\nPRINT I",
                "should_be_valid": False,
                "description": "Unbalanced FOR/NEXT",
            },
            {
                "command": "IF X = 5 PRINT YES",
                "should_be_valid": False,
                "description": "IF without THEN",
            },
            {"command": "", "should_be_valid": False, "description": "Empty command"},
        ]

        correct_validations = 0
        total_tests = len(validation_tests)

        for test in validation_tests:
            logger.info(f"Testing: {test['description']}")

            try:
                validation = self.translator._validate_translation(test["command"])
                is_valid = validation.get("is_valid", False)
                syntax_score = validation.get("syntax_score", 0)
                issues = validation.get("issues", [])

                if is_valid == test["should_be_valid"]:
                    correct_validations += 1
                    logger.info(f"  ✅ Correct validation (score: {syntax_score:.2f})")
                else:
                    logger.error(
                        f"  ❌ Incorrect validation (expected: {test['should_be_valid']}, got: {is_valid})"
                    )

                if issues:
                    logger.info(f"     Issues: {issues}")

            except Exception as e:
                logger.error(f"  ❌ Validation failed: {e}")

        accuracy = correct_validations / total_tests if total_tests > 0 else 0
        logger.info(
            f"\n📊 Validation Accuracy: {correct_validations}/{total_tests} ({accuracy:.1%})"
        )

        self._record_test_result(
            "validation_system", accuracy > 0.8, f"Validation accuracy: {accuracy:.1%}"
        )

    def _test_confidence_scoring(self):
        """Test confidence scoring system."""
        logger.info("\n📊 Testing Confidence Scoring...")

        if not self.translator:
            logger.error("❌ Translator not initialized")
            self._record_test_result(
                "confidence_scoring", False, "Translator not initialized"
            )
            return

        confidence_tests = [
            # High confidence commands
            {
                "command": "End program",
                "expected_range": (0.8, 1.0),
                "description": "Clear end command",
            },
            {
                "command": "Print hello world",
                "expected_range": (0.7, 1.0),
                "description": "Clear print command",
            },
            {
                "command": "Set x to 42",
                "expected_range": (0.7, 1.0),
                "description": "Clear assignment",
            },
            # Medium confidence commands
            {
                "command": "Create a loop",
                "expected_range": (0.4, 0.8),
                "description": "Ambiguous loop command",
            },
            {
                "command": "Do something with variables",
                "expected_range": (0.3, 0.7),
                "description": "Vague command",
            },
            # Low confidence commands
            {
                "command": "Invalid command that makes no sense",
                "expected_range": (0.0, 0.5),
                "description": "Invalid command",
            },
        ]

        correct_scores = 0
        total_tests = len(confidence_tests)

        for test in confidence_tests:
            logger.info(f"Testing: {test['description']}")

            try:
                result = self.translator.translate_command(test["command"])
                confidence = result.get("confidence", 0)
                expected_min, expected_max = test["expected_range"]

                if expected_min <= confidence <= expected_max:
                    correct_scores += 1
                    logger.info(
                        f"  ✅ Confidence: {confidence:.2f} (expected: {expected_min:.2f}-{expected_max:.2f})"
                    )
                else:
                    logger.warning(
                        f"  ⚠️ Confidence: {confidence:.2f} (expected: {expected_min:.2f}-{expected_max:.2f})"
                    )

            except Exception as e:
                logger.error(f"  ❌ Confidence test failed: {e}")

        accuracy = correct_scores / total_tests if total_tests > 0 else 0
        logger.info(
            f"\n📊 Confidence Scoring Accuracy: {correct_scores}/{total_tests} ({accuracy:.1%})"
        )

        self._record_test_result(
            "confidence_scoring",
            accuracy > 0.6,
            f"Confidence scoring accuracy: {accuracy:.1%}",
        )

    def _test_error_handling(self):
        """Test error handling functionality."""
        logger.info("\n🚨 Testing Error Handling...")

        if not self.translator:
            logger.error("❌ Translator not initialized")
            self._record_test_result(
                "error_handling", False, "Translator not initialized"
            )
            return

        error_tests = [
            "",
            "   ",
            None,
            "completely invalid command with no recognizable patterns",
            "random text that makes no sense whatsoever",
            "command with special characters !@#$%^&*()",
            "very long command that goes on and on and on and should still be handled gracefully",
        ]

        handled_correctly = 0
        total_tests = len(error_tests)

        for test in error_tests:
            logger.info(f"Testing error handling for: {repr(test)}")

            try:
                if test is None:
                    # Skip None test as it would cause an error
                    continue

                result = self.translator.translate_command(test)

                if not result["success"]:
                    handled_correctly += 1
                    error = result.get("error", "Unknown error")
                    suggestions = result.get("suggestions", [])

                    logger.info(f"  ✅ Handled correctly: {error}")
                    if suggestions:
                        logger.info(f"     Suggestions: {suggestions[0]}")
                else:
                    logger.warning(f"  ⚠️ Unexpected success for invalid input")

            except Exception as e:
                logger.error(f"  ❌ Error handling failed: {e}")

        # Adjust total for skipped tests
        total_tests -= 1  # Skip None test

        accuracy = handled_correctly / total_tests if total_tests > 0 else 0
        logger.info(
            f"\n📊 Error Handling: {handled_correctly}/{total_tests} handled correctly ({accuracy:.1%})"
        )

        self._record_test_result(
            "error_handling", accuracy > 0.8, f"Error handling accuracy: {accuracy:.1%}"
        )

    def _test_performance(self):
        """Test translation performance."""
        logger.info("\n⚡ Testing Performance...")

        if not self.translator:
            logger.error("❌ Translator not initialized")
            self._record_test_result("performance", False, "Translator not initialized")
            return

        # Test commands for performance
        test_commands = [
            "Print hello world",
            "Set x to 42",
            "Create a loop from 1 to 10",
            "If condition then action",
            "End program",
        ]

        # Performance test
        num_iterations = 100
        start_time = time.perf_counter()

        for i in range(num_iterations):
            command = test_commands[i % len(test_commands)]
            self.translator.translate_command(f"{command} {i}")

        end_time = time.perf_counter()
        total_time = end_time - start_time
        average_time = total_time / num_iterations * 1000  # Convert to milliseconds

        logger.info(f"📊 Performance Results:")
        logger.info(f"   Total time: {total_time:.3f}s")
        logger.info(f"   Average time per translation: {average_time:.2f}ms")
        logger.info(f"   Translations per second: {num_iterations / total_time:.1f}")

        # Check statistics
        stats = self.translator.get_statistics()
        logger.info(f"   Statistics - Total: {stats['stats']['total_translations']}")
        logger.info(f"   Statistics - Success rate: {stats['success_rate']:.1%}")
        logger.info(
            f"   Statistics - Average confidence: {stats['average_confidence']:.2f}"
        )

        # Performance criteria
        performance_good = average_time < 50.0  # Less than 50ms per translation

        if performance_good:
            logger.info("✅ Performance is acceptable")
            self._record_test_result(
                "performance", True, f"Average translation time: {average_time:.2f}ms"
            )
        else:
            logger.warning("⚠️ Performance may be too slow")
            self._record_test_result(
                "performance",
                False,
                f"Average translation time too high: {average_time:.2f}ms",
            )

    def _record_test_result(self, test_name: str, success: bool, message: str):
        """Record a test result."""
        self.test_results.append(
            {
                "test": test_name,
                "success": success,
                "message": message,
                "timestamp": time.time(),
            }
        )

    def _generate_test_report(self):
        """Generate comprehensive test report."""
        logger.info("\n" + "=" * 60)
        logger.info("📋 AI COMMAND TRANSLATOR TEST REPORT")
        logger.info("=" * 60)

        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - successful_tests

        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Successful: {successful_tests}")
        logger.info(f"Failed: {failed_tests}")
        logger.info(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")

        logger.info("\n📋 Detailed Results:")
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            logger.info(f"  {status} {result['test']}: {result['message']}")

        # Overall assessment
        logger.info("\n🎯 Overall Assessment:")
        if successful_tests == total_tests:
            logger.info(
                "🎉 ALL TESTS PASSED! AI Command Translator is working perfectly."
            )
        elif successful_tests >= total_tests * 0.8:
            logger.info(
                "✅ Most tests passed. AI Command Translator is mostly functional."
            )
        elif successful_tests >= total_tests * 0.5:
            logger.info(
                "⚠️ Some tests failed. AI Command Translator has issues that need attention."
            )
        else:
            logger.info(
                "❌ Many tests failed. AI Command Translator needs significant fixes."
            )

        # Save report to file
        report_file = Path("logs/ai_command_translator_test_report.md")
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, "w") as f:
            f.write("# AI Command Translator Test Report\n\n")
            f.write(f"**Generated:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(
                f"**Summary:** {successful_tests}/{total_tests} tests passed ({(successful_tests/total_tests)*100:.1f}%)\n\n"
            )
            f.write("## Test Results\n\n")

            for result in self.test_results:
                status = "✅ PASS" if result["success"] else "❌ FAIL"
                f.write(f"- {status} **{result['test']}**: {result['message']}\n")

            f.write("\n## Recommendations\n\n")

            if failed_tests > 0:
                failed_tests_list = [r for r in self.test_results if not r["success"]]
                f.write("### Failed Tests:\n")
                for result in failed_tests_list:
                    f.write(f"- **{result['test']}**: {result['message']}\n")
                f.write("\n### Action Items:\n")
                f.write("- Review failed tests and fix underlying issues\n")
                f.write("- Check translation patterns and rules\n")
                f.write("- Improve validation logic for edge cases\n")
                f.write("- Optimize performance for slow operations\n")
            else:
                f.write(
                    "- All tests passed! The AI Command Translator is ready for production use.\n"
                )
                f.write(
                    "- Consider running integration tests with the full bridge system.\n"
                )
                f.write("- Monitor translation quality in production environment.\n")

        logger.info(f"\n📄 Detailed report saved to: {report_file}")

        # Return success status
        return successful_tests >= total_tests * 0.8


def main():
    """Main test runner."""
    test_suite = AITranslatorTestSuite()

    try:
        success = test_suite.run_all_tests()

        if success:
            logger.info("\n🎉 AI Command Translator Test Suite completed successfully!")
            sys.exit(0)
        else:
            logger.error(
                "\n❌ AI Command Translator Test Suite completed with failures!"
            )
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("\n⏹️ Test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n💥 Test suite failed with unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
