#!/usr/bin/env python3
"""
Bridge Output Handler Test Launcher

This script provides a comprehensive test suite for the Bridge Output Handler
functionality, including output capture, formatting, dispatching, and integration tests.
"""

import asyncio
import json
import sys
import time
from pathlib import Path

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.output.bridge_output_handler import (
    BridgeOutputHandler,
    OutputSeverity,
    OutputType,
)


class OutputHandlerTestSuite:
    """Comprehensive test suite for Bridge Output Handler."""

    def __init__(self):
        """Initialize the test suite."""
        self.output_handler = None
        self.test_results = []

        # Configure logging
        logger.remove()
        logger.add(
            sys.stderr,
            level="INFO",
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>Output Handler Test</cyan> - <level>{message}</level>"
            ),
        )

        logger.info("Bridge Output Handler Test Suite initialized")

    async def run_all_tests(self):
        """Run all bridge output handler tests."""
        logger.info("🚀 Starting Bridge Output Handler Test Suite")
        logger.info("=" * 60)

        # Initialize output handler
        self._test_initialization()

        # Test output formatting
        await self._test_output_formatting()

        # Test output channels
        await self._test_output_channels()

        # Test output capture
        await self._test_output_capture()

        # Test WebSocket integration
        await self._test_websocket_integration()

        # Test AI feedback integration
        await self._test_ai_feedback_integration()

        # Test performance
        await self._test_performance()

        # Test error handling
        await self._test_error_handling()

        # Generate test report
        self._generate_test_report()

    def _test_initialization(self):
        """Test output handler initialization."""
        logger.info("\n📋 Testing Initialization...")

        try:
            self.output_handler = BridgeOutputHandler()

            # Check channels
            channel_count = len(self.output_handler.channels)
            logger.info(f"✅ Initialized {channel_count} output channels")

            for channel_name in self.output_handler.channels.keys():
                logger.info(f"  - {channel_name}")

            # Check formatter
            assert self.output_handler.formatter is not None
            logger.info("✅ Output formatter initialized")

            # Check initial state
            assert len(self.output_handler.output_history) == 0
            assert len(self.output_handler.active_outputs) == 0
            logger.info("✅ Initial state verified")

            self._record_test_result(
                "initialization", True, f"Initialized {channel_count} channels"
            )

        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            self._record_test_result("initialization", False, str(e))

    async def _test_output_formatting(self):
        """Test output formatting functionality."""
        logger.info("\n🎨 Testing Output Formatting...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "output_formatting", False, "Output handler not initialized"
            )
            return

        formatting_tests = [
            # Print outputs
            {
                "raw_output": "Hello World!",
                "output_type": OutputType.PRINT,
                "severity": OutputSeverity.INFO,
                "expected_type": "print",
                "description": "Simple print output",
            },
            {
                "raw_output": "Error: Invalid command",
                "output_type": OutputType.ERROR,
                "severity": OutputSeverity.ERROR,
                "expected_type": "error",
                "description": "Error output",
            },
            {
                "raw_output": {"result": "Operation successful", "success": True},
                "output_type": OutputType.RESULT,
                "severity": OutputSeverity.INFO,
                "expected_type": "result",
                "description": "Result output",
            },
            {
                "raw_output": {"pc": 0x8000, "a": 0x42, "x": 0x10, "y": 0x20},
                "output_type": OutputType.CPU_STATE,
                "severity": OutputSeverity.DEBUG,
                "expected_type": "cpu_state",
                "description": "CPU state output",
            },
            {
                "raw_output": {"0x8000": 0x42, "0x8001": 0x10, "0x8002": 0x20},
                "output_type": OutputType.MEMORY_DUMP,
                "severity": OutputSeverity.DEBUG,
                "expected_type": "memory_dump",
                "description": "Memory dump output",
            },
            {
                "raw_output": {"execution_time": 1.5, "memory_used": 1024},
                "output_type": OutputType.PERFORMANCE,
                "severity": OutputSeverity.INFO,
                "expected_type": "performance",
                "description": "Performance output",
            },
            {
                "raw_output": "Debug information",
                "output_type": OutputType.DEBUG,
                "severity": OutputSeverity.DEBUG,
                "expected_type": "debug",
                "description": "Debug output",
            },
            {
                "raw_output": "System status update",
                "output_type": OutputType.STATUS,
                "severity": OutputSeverity.INFO,
                "expected_type": "status",
                "description": "Status output",
            },
            {
                "raw_output": "Log message",
                "output_type": OutputType.LOG,
                "severity": OutputSeverity.INFO,
                "expected_type": "log",
                "description": "Log output",
            },
        ]

        successful_formats = 0
        total_tests = len(formatting_tests)

        for i, test in enumerate(formatting_tests, 1):
            logger.info(f"\nFormat Test {i}/{total_tests}: {test['description']}")

            try:
                result = await self.output_handler.capture_output(
                    test["raw_output"], test["output_type"], test["severity"]
                )

                if result["success"]:
                    successful_formats += 1
                    processing_time = result.get("processing_time", 0)
                    output_type = result.get("output_type", "unknown")

                    logger.info(
                        f"✅ Success (type: {output_type}, time: {processing_time:.2f}ms)"
                    )

                    # Check formatted outputs
                    formatted_outputs = result.get("formatted_outputs", {})
                    for channel_name, formatted_output in formatted_outputs.items():
                        if formatted_output:
                            logger.info(
                                f"   {channel_name}: {formatted_output.get('display_type', 'unknown')}"
                            )

                    # Check dispatch results
                    dispatch_results = result.get("dispatch_results", {})
                    successful_channels = sum(
                        1 for success in dispatch_results.values() if success
                    )
                    total_channels = len(dispatch_results)
                    logger.info(
                        f"   Channels: {successful_channels}/{total_channels} successful"
                    )

                else:
                    error = result.get("error", "Unknown error")
                    logger.error(f"❌ Failed: {error}")

            except Exception as e:
                logger.error(f"❌ Formatting test failed: {e}")

        success_rate = successful_formats / total_tests if total_tests > 0 else 0
        logger.info(
            f"\n📊 Output Formatting Summary: {successful_formats}/{total_tests} successful ({success_rate:.1%})"
        )

        self._record_test_result(
            "output_formatting",
            success_rate > 0.8,
            f"{successful_formats}/{total_tests} formats successful",
        )

    async def _test_output_channels(self):
        """Test output channel functionality."""
        logger.info("\n📡 Testing Output Channels...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "output_channels", False, "Output handler not initialized"
            )
            return

        channel_tests = [
            {"name": "WebSocket", "test": self._test_websocket_channel},
            {"name": "REST API", "test": self._test_rest_api_channel},
            {"name": "Log", "test": self._test_log_channel},
            {"name": "AI Feedback", "test": self._test_ai_feedback_channel},
        ]

        channel_results = {}

        for channel_test in channel_tests:
            channel_name = channel_test["name"]
            logger.info(f"\nTesting {channel_name} channel...")

            try:
                result = await channel_test["test"]()
                channel_results[channel_name] = result

                if result:
                    logger.info(f"✅ {channel_name} channel working correctly")
                else:
                    logger.error(f"❌ {channel_name} channel has issues")

            except Exception as e:
                logger.error(f"❌ {channel_name} channel test failed: {e}")
                channel_results[channel_name] = False

        # Overall channel test result
        working_channels = sum(1 for result in channel_results.values() if result)
        total_channels = len(channel_results)

        logger.info(
            f"\n📊 Channel Test Summary: {working_channels}/{total_channels} channels working"
        )

        self._record_test_result(
            "output_channels",
            working_channels >= total_channels * 0.75,
            f"{working_channels}/{total_channels} channels working",
        )

    async def _test_websocket_channel(self):
        """Test WebSocket channel functionality."""
        try:
            # Mock WebSocket client
            class MockWebSocket:
                def __init__(self):
                    self.messages = []

                async def send_text(self, message):
                    self.messages.append(json.loads(message))

            mock_ws = MockWebSocket()
            self.output_handler.add_websocket_client(mock_ws)

            # Send test output
            result = await self.output_handler.capture_output(
                "Test WebSocket message", OutputType.PRINT, OutputSeverity.INFO
            )

            # Check if message was sent
            websocket_channel = self.output_handler.channels["websocket"]
            return len(websocket_channel.connected_clients) > 0

        except Exception as e:
            logger.error(f"WebSocket channel test failed: {e}")
            return False

    async def _test_rest_api_channel(self):
        """Test REST API channel functionality."""
        try:
            # Send test output
            result = await self.output_handler.capture_output(
                "Test REST API message", OutputType.PRINT, OutputSeverity.INFO
            )

            # Check if output was stored
            recent_outputs = self.output_handler.get_recent_outputs(10)
            return len(recent_outputs) > 0

        except Exception as e:
            logger.error(f"REST API channel test failed: {e}")
            return False

    async def _test_log_channel(self):
        """Test log channel functionality."""
        try:
            # Send test output
            result = await self.output_handler.capture_output(
                "Test log message", OutputType.LOG, OutputSeverity.INFO
            )

            # Check channel info
            log_channel = self.output_handler.channels["log"]
            return log_channel.get_channel_info()["active"]

        except Exception as e:
            logger.error(f"Log channel test failed: {e}")
            return False

    async def _test_ai_feedback_channel(self):
        """Test AI feedback channel functionality."""
        try:
            # Set AI callback
            callback_called = False

            async def test_callback(output_data):
                nonlocal callback_called
                callback_called = True

            self.output_handler.set_ai_callback(test_callback)

            # Send test output
            result = await self.output_handler.capture_output(
                "Test AI feedback message", OutputType.RESULT, OutputSeverity.INFO
            )

            # Check if callback was called
            ai_channel = self.output_handler.channels["ai_feedback"]
            return (
                callback_called and ai_channel.get_channel_info()["callback_available"]
            )

        except Exception as e:
            logger.error(f"AI feedback channel test failed: {e}")
            return False

    async def _test_output_capture(self):
        """Test output capture functionality."""
        logger.info("\n📥 Testing Output Capture...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "output_capture", False, "Output handler not initialized"
            )
            return

        capture_tests = [
            {
                "output": "Simple text output",
                "type": OutputType.PRINT,
                "severity": OutputSeverity.INFO,
                "description": "Simple text capture",
            },
            {
                "output": {"message": "Structured output", "data": [1, 2, 3]},
                "type": OutputType.RESULT,
                "severity": OutputSeverity.INFO,
                "description": "Structured data capture",
            },
            {
                "output": "Error message",
                "type": OutputType.ERROR,
                "severity": OutputSeverity.ERROR,
                "description": "Error capture",
            },
            {
                "output": "",
                "type": OutputType.PRINT,
                "severity": OutputSeverity.INFO,
                "description": "Empty output capture",
            },
        ]

        successful_captures = 0
        total_tests = len(capture_tests)

        for i, test in enumerate(capture_tests, 1):
            logger.info(f"\nCapture Test {i}/{total_tests}: {test['description']}")

            try:
                result = await self.output_handler.capture_output(
                    test["output"],
                    test["type"],
                    test["severity"],
                    {"test_id": i, "description": test["description"]},
                )

                if result["success"]:
                    successful_captures += 1
                    processing_time = result.get("processing_time", 0)
                    output_id = result.get("output_id", "unknown")

                    logger.info(
                        f"✅ Captured successfully (ID: {output_id}, time: {processing_time:.2f}ms)"
                    )

                    # Check dispatch results
                    dispatch_results = result.get("dispatch_results", {})
                    successful_dispatches = sum(
                        1 for success in dispatch_results.values() if success
                    )
                    total_dispatches = len(dispatch_results)
                    logger.info(
                        f"   Dispatched to: {successful_dispatches}/{total_dispatches} channels"
                    )

                else:
                    error = result.get("error", "Unknown error")
                    logger.error(f"❌ Capture failed: {error}")

            except Exception as e:
                logger.error(f"❌ Capture test failed: {e}")

        success_rate = successful_captures / total_tests if total_tests > 0 else 0
        logger.info(
            f"\n📊 Output Capture Summary: {successful_captures}/{total_tests} successful ({success_rate:.1%})"
        )

        self._record_test_result(
            "output_capture",
            success_rate > 0.75,
            f"{successful_captures}/{total_tests} captures successful",
        )

    async def _test_websocket_integration(self):
        """Test WebSocket integration."""
        logger.info("\n🔌 Testing WebSocket Integration...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "websocket_integration", False, "Output handler not initialized"
            )
            return

        try:
            # Mock WebSocket client
            class MockWebSocket:
                def __init__(self):
                    self.messages = []
                    self.disconnected = False

                async def send_text(self, message):
                    if not self.disconnected:
                        self.messages.append(json.loads(message))

                def disconnect(self):
                    self.disconnected = True

            mock_ws = MockWebSocket()

            # Add client
            self.output_handler.add_websocket_client(mock_ws)
            websocket_channel = self.output_handler.channels["websocket"]

            assert len(websocket_channel.connected_clients) == 1
            logger.info("✅ WebSocket client added")

            # Send outputs
            test_outputs = [
                ("Hello World", OutputType.PRINT, OutputSeverity.INFO),
                ("Error occurred", OutputType.ERROR, OutputSeverity.ERROR),
                ({"result": "Success"}, OutputType.RESULT, OutputSeverity.INFO),
            ]

            for output, output_type, severity in test_outputs:
                await self.output_handler.capture_output(output, output_type, severity)

            # Check messages were sent
            assert len(mock_ws.messages) == 3
            logger.info(f"✅ {len(mock_ws.messages)} messages sent to WebSocket")

            # Test disconnection
            mock_ws.disconnect()

            # Send another output (should handle disconnect gracefully)
            result = await self.output_handler.capture_output(
                "Test after disconnect", OutputType.PRINT
            )

            # Client should be removed
            assert len(websocket_channel.connected_clients) == 0
            logger.info("✅ WebSocket disconnect handled gracefully")

            self._record_test_result(
                "websocket_integration", True, "WebSocket integration working correctly"
            )

        except Exception as e:
            logger.error(f"❌ WebSocket integration test failed: {e}")
            self._record_test_result("websocket_integration", False, str(e))

    async def _test_ai_feedback_integration(self):
        """Test AI feedback integration."""
        logger.info("\n🤖 Testing AI Feedback Integration...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "ai_feedback_integration", False, "Output handler not initialized"
            )
            return

        try:
            # Track callback calls
            callback_calls = []

            async def ai_callback(output_data):
                callback_calls.append(output_data)

            # Set callback
            self.output_handler.set_ai_callback(ai_callback)

            # Send outputs
            test_outputs = [
                ("AI feedback 1", OutputType.RESULT, OutputSeverity.INFO),
                ("AI feedback 2", OutputType.PRINT, OutputSeverity.INFO),
                ({"ai_data": "test"}, OutputType.RESULT, OutputSeverity.INFO),
            ]

            for output, output_type, severity in test_outputs:
                await self.output_handler.capture_output(output, output_type, severity)

            # Check callbacks were called
            assert len(callback_calls) == 3
            logger.info(f"✅ {len(callback_calls)} AI callbacks executed")

            # Check context history
            ai_channel = self.output_handler.channels["ai_feedback"]
            context_history = ai_channel.get_context_history(10)

            assert len(context_history) >= 3
            logger.info(f"✅ {len(context_history)} context entries stored")

            self._record_test_result(
                "ai_feedback_integration",
                True,
                "AI feedback integration working correctly",
            )

        except Exception as e:
            logger.error(f"❌ AI feedback integration test failed: {e}")
            self._record_test_result("ai_feedback_integration", False, str(e))

    async def _test_performance(self):
        """Test output handler performance."""
        logger.info("\n⚡ Testing Performance...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "performance", False, "Output handler not initialized"
            )
            return

        try:
            # Performance test
            num_outputs = 100
            start_time = time.perf_counter()

            for i in range(num_outputs):
                await self.output_handler.capture_output(
                    f"Performance test output {i}",
                    OutputType.PRINT,
                    OutputSeverity.INFO,
                )

            end_time = time.perf_counter()
            total_time = end_time - start_time
            average_time = total_time / num_outputs * 1000  # Convert to milliseconds

            logger.info(f"📊 Performance Results:")
            logger.info(f"   Total time: {total_time:.3f}s")
            logger.info(f"   Average time per output: {average_time:.2f}ms")
            logger.info(f"   Outputs per second: {num_outputs / total_time:.1f}")

            # Check statistics
            stats = self.output_handler.get_output_statistics()
            logger.info(
                f"   Statistics - Total outputs: {stats['stats']['total_outputs']}"
            )
            logger.info(
                f"   Statistics - Average processing time: {stats['stats']['average_processing_time']:.2f}ms"
            )

            # Performance criteria
            performance_good = average_time < 50.0  # Less than 50ms per output

            if performance_good:
                logger.info("✅ Performance is acceptable")
                self._record_test_result(
                    "performance",
                    True,
                    f"Average processing time: {average_time:.2f}ms",
                )
            else:
                logger.warning("⚠️ Performance may be too slow")
                self._record_test_result(
                    "performance",
                    False,
                    f"Average processing time too high: {average_time:.2f}ms",
                )

        except Exception as e:
            logger.error(f"❌ Performance test failed: {e}")
            self._record_test_result("performance", False, str(e))

    async def _test_error_handling(self):
        """Test error handling functionality."""
        logger.info("\n🚨 Testing Error Handling...")

        if not self.output_handler:
            logger.error("❌ Output handler not initialized")
            self._record_test_result(
                "error_handling", False, "Output handler not initialized"
            )
            return

        try:
            error_tests = [
                {
                    "output": None,
                    "type": OutputType.PRINT,
                    "severity": OutputSeverity.INFO,
                    "description": "None output",
                },
                {
                    "output": "",
                    "type": OutputType.PRINT,
                    "severity": OutputSeverity.INFO,
                    "description": "Empty output",
                },
                {
                    "output": "Very long output " * 1000,
                    "type": OutputType.PRINT,
                    "severity": OutputSeverity.INFO,
                    "description": "Very long output",
                },
                {
                    "output": {"complex": {"nested": {"data": [1, 2, 3]}}},
                    "type": OutputType.RESULT,
                    "severity": OutputSeverity.INFO,
                    "description": "Complex nested data",
                },
            ]

            handled_correctly = 0
            total_tests = len(error_tests)

            for i, test in enumerate(error_tests, 1):
                logger.info(f"\nError Test {i}/{total_tests}: {test['description']}")

                try:
                    result = await self.output_handler.capture_output(
                        test["output"], test["type"], test["severity"]
                    )

                    if result["success"]:
                        handled_correctly += 1
                        logger.info(f"✅ Handled correctly")
                    else:
                        error = result.get("error", "Unknown error")
                        logger.info(f"⚠️ Handled with error: {error}")
                        handled_correctly += 1  # Still counts as handled correctly

                except Exception as e:
                    logger.error(f"❌ Error handling failed: {e}")

            accuracy = handled_correctly / total_tests if total_tests > 0 else 0
            logger.info(
                f"\n📊 Error Handling: {handled_correctly}/{total_tests} handled correctly ({accuracy:.1%})"
            )

            self._record_test_result(
                "error_handling",
                accuracy > 0.8,
                f"Error handling accuracy: {accuracy:.1%}",
            )

        except Exception as e:
            logger.error(f"❌ Error handling test failed: {e}")
            self._record_test_result("error_handling", False, str(e))

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
        logger.info("📋 BRIDGE OUTPUT HANDLER TEST REPORT")
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
                "🎉 ALL TESTS PASSED! Bridge Output Handler is working perfectly."
            )
        elif successful_tests >= total_tests * 0.8:
            logger.info(
                "✅ Most tests passed. Bridge Output Handler is mostly functional."
            )
        elif successful_tests >= total_tests * 0.5:
            logger.info(
                "⚠️ Some tests failed. Bridge Output Handler has issues that need attention."
            )
        else:
            logger.info(
                "❌ Many tests failed. Bridge Output Handler needs significant fixes."
            )

        # Show final statistics
        if self.output_handler:
            stats = self.output_handler.get_output_statistics()
            logger.info(f"\n📊 Final Statistics:")
            logger.info(f"  Total Outputs Processed: {stats['stats']['total_outputs']}")
            logger.info(f"  Success Count: {stats['stats']['success_count']}")
            logger.info(f"  Error Count: {stats['stats']['error_count']}")
            logger.info(
                f"  Average Processing Time: {stats['stats']['average_processing_time']:.2f}ms"
            )
            logger.info(
                f"  Active Channels: {len([c for c in stats['channels'].values() if c.get('active', False)])}"
            )

        # Save report to file
        report_file = Path("logs/bridge_output_handler_test_report.md")
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, "w") as f:
            f.write("# Bridge Output Handler Test Report\n\n")
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
                f.write("- Check output formatting and channel configurations\n")
                f.write("- Verify WebSocket and AI feedback integrations\n")
                f.write("- Optimize performance for slow operations\n")
            else:
                f.write(
                    "- All tests passed! The Bridge Output Handler is ready for production use.\n"
                )
                f.write(
                    "- Consider running integration tests with the full bridge system.\n"
                )
                f.write(
                    "- Monitor output processing performance in production environment.\n"
                )

        logger.info(f"\n📄 Detailed report saved to: {report_file}")

        # Return success status
        return successful_tests >= total_tests * 0.8


async def main():
    """Main test runner."""
    test_suite = OutputHandlerTestSuite()

    try:
        success = await test_suite.run_all_tests()

        if success:
            logger.info("\n🎉 Bridge Output Handler Test Suite completed successfully!")
            sys.exit(0)
        else:
            logger.error(
                "\n❌ Bridge Output Handler Test Suite completed with failures!"
            )
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("\n⏹️ Test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n💥 Test suite failed with unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
