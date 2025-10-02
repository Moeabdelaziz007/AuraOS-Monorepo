#!/usr/bin/env python3
"""
AI Command Sender Test Launcher

This script provides a comprehensive test suite for the AI Command Sender
functionality, including provider testing, command processing, and integration tests.
"""

import asyncio
import json
import sys
import time
from pathlib import Path

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.ai.ai_command_sender import AICommandSender
from bridge.core.settings import get_settings


class AITestSuite:
    """Comprehensive test suite for AI Command Sender."""

    def __init__(self):
        """Initialize the test suite."""
        self.settings = get_settings()
        self.ai_sender = None
        self.test_results = []

        # Configure logging
        logger.remove()
        logger.add(
            sys.stderr,
            level="INFO",
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>AI Test</cyan> - <level>{message}</level>"
            ),
        )

        logger.info("AI Command Sender Test Suite initialized")

    async def run_all_tests(self):
        """Run all AI command sender tests."""
        logger.info("🚀 Starting AI Command Sender Test Suite")
        logger.info("=" * 60)

        # Initialize AI sender
        await self._test_initialization()

        # Test provider connections
        await self._test_provider_connections()

        # Test command processing
        await self._test_command_processing()

        # Test caching
        await self._test_caching()

        # Test error handling
        await self._test_error_handling()

        # Test statistics and monitoring
        await self._test_statistics()

        # Generate test report
        self._generate_test_report()

    async def _test_initialization(self):
        """Test AI sender initialization."""
        logger.info("\n📋 Testing Initialization...")

        try:
            self.ai_sender = AICommandSender()

            # Check providers
            provider_count = len(self.ai_sender.providers)
            logger.info(f"✅ Initialized {provider_count} AI providers")

            for provider_name in self.ai_sender.providers.keys():
                logger.info(f"  - {provider_name}")

            # Check settings
            assert self.ai_sender.cache_enabled == self.settings.ai.caching.get(
                "enabled", True
            )
            logger.info(f"✅ Cache enabled: {self.ai_sender.cache_enabled}")

            self._record_test_result(
                "initialization", True, f"Initialized {provider_count} providers"
            )

        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            self._record_test_result("initialization", False, str(e))

    async def _test_provider_connections(self):
        """Test AI provider connections."""
        logger.info("\n🔌 Testing Provider Connections...")

        if not self.ai_sender or not self.ai_sender.providers:
            logger.warning("⚠️ No providers available for testing")
            self._record_test_result(
                "provider_connections", False, "No providers available"
            )
            return

        connection_results = {}

        for provider_name in self.ai_sender.providers.keys():
            logger.info(f"\nTesting {provider_name} provider...")

            try:
                result = self.ai_sender.test_provider_connection(provider_name)
                connection_results[provider_name] = result

                if result["success"]:
                    logger.info(f"✅ {provider_name} connection successful")
                    logger.info(
                        f"   Response time: {result.get('response_time', 0):.2f}ms"
                    )
                    if result.get("test_response"):
                        logger.info(
                            f"   Test response: {result['test_response'][:50]}..."
                        )
                else:
                    logger.error(
                        f"❌ {provider_name} connection failed: {result.get('error', 'Unknown error')}"
                    )

            except Exception as e:
                logger.error(f"❌ {provider_name} test failed: {e}")
                connection_results[provider_name] = {"success": False, "error": str(e)}

        # Overall result
        successful_connections = sum(
            1 for r in connection_results.values() if r["success"]
        )
        total_connections = len(connection_results)

        if successful_connections > 0:
            self._record_test_result(
                "provider_connections",
                True,
                f"{successful_connections}/{total_connections} providers connected",
            )
        else:
            self._record_test_result(
                "provider_connections", False, "No providers could be connected"
            )

    async def _test_command_processing(self):
        """Test command processing functionality."""
        logger.info("\n⚙️ Testing Command Processing...")

        if not self.ai_sender:
            logger.error("❌ AI sender not initialized")
            self._record_test_result(
                "command_processing", False, "AI sender not initialized"
            )
            return

        test_commands = [
            "Print hello world",
            "Set variable x to 42",
            "Create a loop from 1 to 10 that prints each number",
            "Calculate 10 plus 20 and store in variable result",
            "Create a conditional statement that checks if x equals 5",
            "End the program",
        ]

        successful_commands = 0
        total_commands = len(test_commands)

        for i, command in enumerate(test_commands, 1):
            logger.info(f"\nCommand {i}/{total_commands}: {command}")

            try:
                result = await self.ai_sender.send_command(command)

                if result["success"]:
                    successful_commands += 1
                    confidence = result.get("confidence", 0)
                    response_time = result.get("response_time", 0)

                    logger.info(
                        f"✅ Success (confidence: {confidence:.2f}, time: {response_time:.2f}ms)"
                    )
                    logger.info(f"   Response: {result['response'][:100]}...")

                    # Check validation
                    validation = result.get("validation", {})
                    if not validation.get("is_valid", True):
                        logger.warning(
                            f"⚠️ Validation issues: {validation.get('issues', [])}"
                        )

                else:
                    logger.error(f"❌ Failed: {result.get('error', 'Unknown error')}")

            except Exception as e:
                logger.error(f"❌ Command processing failed: {e}")

        success_rate = successful_commands / total_commands if total_commands > 0 else 0
        logger.info(
            f"\n📊 Command Processing Summary: {successful_commands}/{total_commands} successful ({success_rate:.1%})"
        )

        self._record_test_result(
            "command_processing",
            success_rate > 0.5,
            f"{successful_commands}/{total_commands} commands successful",
        )

    async def _test_caching(self):
        """Test caching functionality."""
        logger.info("\n💾 Testing Caching...")

        if not self.ai_sender:
            logger.error("❌ AI sender not initialized")
            self._record_test_result("caching", False, "AI sender not initialized")
            return

        try:
            # Test cache operations
            test_command = "Print cache test"

            # First request (should not be cached)
            logger.info("First request (not cached)...")
            start_time = time.perf_counter()
            result1 = await self.ai_sender.send_command(test_command)
            first_time = time.perf_counter() - start_time

            # Second request (should be cached if caching works)
            logger.info("Second request (should be cached)...")
            start_time = time.perf_counter()
            result2 = await self.ai_sender.send_command(test_command)
            second_time = time.perf_counter() - start_time

            if result1["success"] and result2["success"]:
                if result2.get("cached", False):
                    logger.info("✅ Caching working correctly")
                    logger.info(f"   First request: {first_time:.3f}s")
                    logger.info(f"   Second request: {second_time:.3f}s (cached)")
                    self._record_test_result(
                        "caching", True, "Caching working correctly"
                    )
                else:
                    logger.warning(
                        "⚠️ Caching may not be working (response not marked as cached)"
                    )
                    self._record_test_result("caching", False, "Caching not working")
            else:
                logger.error("❌ Commands failed, cannot test caching")
                self._record_test_result("caching", False, "Commands failed")

            # Test cache statistics
            stats = self.ai_sender.get_statistics()
            cache_size = stats.get("cache_size", 0)
            logger.info(f"📊 Cache size: {cache_size} entries")

        except Exception as e:
            logger.error(f"❌ Caching test failed: {e}")
            self._record_test_result("caching", False, str(e))

    async def _test_error_handling(self):
        """Test error handling functionality."""
        logger.info("\n🚨 Testing Error Handling...")

        if not self.ai_sender:
            logger.error("❌ AI sender not initialized")
            self._record_test_result(
                "error_handling", False, "AI sender not initialized"
            )
            return

        try:
            # Test with invalid provider
            logger.info("Testing invalid provider...")
            result = await self.ai_sender.send_command(
                "Test command", "invalid_provider"
            )

            if not result["success"]:
                logger.info("✅ Invalid provider handled correctly")
            else:
                logger.warning("⚠️ Invalid provider should have failed")

            # Test with empty command
            logger.info("Testing empty command...")
            result = await self.ai_sender.send_command("")

            if not result["success"] or result.get("confidence", 0) < 0.3:
                logger.info("✅ Empty command handled correctly")
            else:
                logger.warning("⚠️ Empty command should have lower confidence")

            # Test error recovery
            logger.info("Testing error recovery...")
            result = await self.ai_sender.send_command("Valid command after errors")

            if result["success"]:
                logger.info("✅ Error recovery working correctly")
            else:
                logger.warning("⚠️ Error recovery may not be working")

            self._record_test_result(
                "error_handling", True, "Error handling tests completed"
            )

        except Exception as e:
            logger.error(f"❌ Error handling test failed: {e}")
            self._record_test_result("error_handling", False, str(e))

    async def _test_statistics(self):
        """Test statistics and monitoring."""
        logger.info("\n📊 Testing Statistics...")

        if not self.ai_sender:
            logger.error("❌ AI sender not initialized")
            self._record_test_result("statistics", False, "AI sender not initialized")
            return

        try:
            # Get statistics
            stats = self.ai_sender.get_statistics()

            logger.info("✅ Statistics retrieved successfully")
            logger.info(f"   Total requests: {stats['stats']['total_requests']}")
            logger.info(f"   Successful: {stats['stats']['successful_requests']}")
            logger.info(f"   Failed: {stats['stats']['failed_requests']}")
            logger.info(
                f"   Average response time: {stats['stats']['average_response_time']:.2f}ms"
            )

            # Test history
            history = self.ai_sender.get_recent_requests(10)
            logger.info(f"   Recent requests: {len(history)}")

            # Test provider stats
            provider_stats = stats["stats"].get("provider_stats", {})
            for provider, provider_stat in provider_stats.items():
                logger.info(
                    f"   {provider}: {provider_stat['successful']}/{provider_stat['requests']} successful"
                )

            self._record_test_result("statistics", True, "Statistics working correctly")

        except Exception as e:
            logger.error(f"❌ Statistics test failed: {e}")
            self._record_test_result("statistics", False, str(e))

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
        logger.info("📋 AI COMMAND SENDER TEST REPORT")
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
            logger.info("🎉 ALL TESTS PASSED! AI Command Sender is working perfectly.")
        elif successful_tests >= total_tests * 0.8:
            logger.info("✅ Most tests passed. AI Command Sender is mostly functional.")
        elif successful_tests >= total_tests * 0.5:
            logger.info(
                "⚠️ Some tests failed. AI Command Sender has issues that need attention."
            )
        else:
            logger.info(
                "❌ Many tests failed. AI Command Sender needs significant fixes."
            )

        # Save report to file
        report_file = Path("logs/ai_command_sender_test_report.md")
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, "w") as f:
            f.write("# AI Command Sender Test Report\n\n")
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
                f.write("- Check AI provider API keys and configurations\n")
                f.write("- Verify network connectivity to AI providers\n")
                f.write("- Review error logs for detailed failure information\n")
            else:
                f.write(
                    "- All tests passed! The AI Command Sender is ready for production use.\n"
                )
                f.write(
                    "- Consider running integration tests with the full bridge system.\n"
                )
                f.write("- Monitor performance metrics in production environment.\n")

        logger.info(f"\n📄 Detailed report saved to: {report_file}")

        # Return success status
        return successful_tests >= total_tests * 0.8


async def main():
    """Main test runner."""
    test_suite = AITestSuite()

    try:
        success = await test_suite.run_all_tests()

        if success:
            logger.info("\n🎉 AI Command Sender Test Suite completed successfully!")
            sys.exit(0)
        else:
            logger.error("\n❌ AI Command Sender Test Suite completed with failures!")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("\n⏹️ Test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n💥 Test suite failed with unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
