#!/usr/bin/env python3
"""
AI Vintage OS - Emulator Test Runner

This script runs comprehensive tests on the emulator to verify
initialization, command execution, memory management, error handling,
and performance benchmarks.
"""

import sys
import time
from pathlib import Path
from typing import Any, Dict, List

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engine.launch_emulator import EmulatorLauncher


class EmulatorTestRunner:
    """Comprehensive test runner for the emulator."""

    def __init__(self):
        """Initialize the test runner."""
        self.launcher = EmulatorLauncher()
        self.test_results = []
        self.performance_metrics = {}

        # Configure logging
        logger.remove()
        logger.add(
            sys.stderr,
            level="INFO",
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                "<level>{message}</level>"
            ),
        )

    def run_test(self, test_name: str, test_file: str, expected_output: List[str] = None) -> Dict[str, Any]:
        """Run a single test and return results."""
        logger.info(f"Running test: {test_name}")

        start_time = time.perf_counter()

        try:
            # Initialize emulator
            if not self.launcher.initialize():
                return {
                    "test_name": test_name,
                    "status": "FAILED",
                    "error": "Failed to initialize emulator",
                    "duration": 0
                }

            # Load test program
            if not self.launcher.load_program(test_file):
                return {
                    "test_name": test_name,
                    "status": "FAILED",
                    "error": "Failed to load test program",
                    "duration": 0
                }

            # Run program
            result = self.launcher.run_program()

            duration = time.perf_counter() - start_time

            # Check results
            if "error" in result:
                return {
                    "test_name": test_name,
                    "status": "FAILED",
                    "error": result["error"],
                    "duration": duration,
                    "commands_executed": result.get("commands_executed", 0)
                }

            # Validate output if expected output provided
            if expected_output:
                actual_output = result.get("output", [])
                if not self._validate_output(actual_output, expected_output):
                    return {
                        "test_name": test_name,
                        "status": "FAILED",
                        "error": "Output validation failed",
                        "duration": duration,
                        "expected": expected_output,
                        "actual": actual_output
                    }

            return {
                "test_name": test_name,
                "status": "PASSED",
                "duration": duration,
                "commands_executed": result.get("commands_executed", 0),
                "output": result.get("output", []),
                "errors": result.get("errors", [])
            }

        except Exception as e:
            duration = time.perf_counter() - start_time
            return {
                "test_name": test_name,
                "status": "FAILED",
                "error": str(e),
                "duration": duration
            }

    def _validate_output(self, actual: List[str], expected: List[str]) -> bool:
        """Validate that actual output contains expected strings."""
        actual_str = " ".join(actual).upper()
        for expected_str in expected:
            if expected_str.upper() not in actual_str:
                return False
        return True

    def test_initialization(self) -> Dict[str, Any]:
        """Test emulator initialization."""
        logger.info("Testing emulator initialization...")

        start_time = time.perf_counter()

        try:
            # Test basic initialization
            launcher = EmulatorLauncher()
            if not launcher.initialize():
                return {"status": "FAILED", "error": "Initialization failed"}

            # Test emulator info
            emulator_info = launcher.emulator.get_emulator_info()

            # Test CPU state
            cpu_state = launcher.emulator.get_cpu_state()

            # Test memory dump
            memory_dump = launcher.emulator.get_memory_dump(0x8000, 16)

            duration = time.perf_counter() - start_time

            return {
                "status": "PASSED",
                "duration": duration,
                "emulator_info": emulator_info,
                "cpu_state": cpu_state,
                "memory_dump_size": len(memory_dump)
            }

        except Exception as e:
            duration = time.perf_counter() - start_time
            return {"status": "FAILED", "error": str(e), "duration": duration}

    def test_basic_functionality(self) -> Dict[str, Any]:
        """Test basic BASIC functionality."""
        test_file = "engine/test_programs/basic_functionality.bas"
        expected_output = [
            "BASIC FUNCTIONALITY TEST",
            "Testing PRINT command",
            "Hello, AI Vintage OS!",
            "Testing LET command",
            "Testing END command"
        ]

        return self.run_test("Basic Functionality", test_file, expected_output)

    def test_memory_management(self) -> Dict[str, Any]:
        """Test memory management and variable operations."""
        test_file = "engine/test_programs/memory_management.bas"
        expected_output = [
            "MEMORY MANAGEMENT TEST",
            "Testing variable assignments",
            "Testing arithmetic operations",
            "Memory test completed successfully"
        ]

        return self.run_test("Memory Management", test_file, expected_output)

    def test_control_flow(self) -> Dict[str, Any]:
        """Test control flow structures."""
        test_file = "engine/test_programs/control_flow.bas"
        expected_output = [
            "CONTROL FLOW TEST",
            "Testing FOR loop",
            "Testing IF-THEN",
            "Testing nested operations",
            "Control flow test completed"
        ]

        return self.run_test("Control Flow", test_file, expected_output)

    def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling and recovery."""
        test_file = "engine/test_programs/error_handling.bas"
        expected_output = [
            "ERROR HANDLING TEST",
            "Testing invalid commands",
            "Testing empty commands",
            "Testing malformed commands",
            "Testing boundary conditions",
            "Error handling test completed"
        ]

        return self.run_test("Error Handling", test_file, expected_output)

    def test_performance(self) -> Dict[str, Any]:
        """Test performance with intensive operations."""
        test_file = "engine/test_programs/performance_test.bas"
        expected_output = [
            "PERFORMANCE TEST",
            "Testing rapid operations",
            "Testing string operations",
            "Performance test completed"
        ]

        return self.run_test("Performance", test_file, expected_output)

    def test_speed_control(self) -> Dict[str, Any]:
        """Test speed control functionality."""
        logger.info("Testing speed control...")

        try:
            # Test different speed multipliers
            speed_tests = [0.5, 1.0, 2.0, 5.0]
            results = {}

            for speed in speed_tests:
                logger.info(f"Testing speed multiplier: {speed}x")

                # Reset launcher
                self.launcher = EmulatorLauncher()
                self.launcher.initialize()

                # Set speed
                self.launcher.emulator.set_speed_multiplier(speed)

                # Load and run a simple program
                test_file = "engine/test_programs/basic_functionality.bas"
                self.launcher.load_program(test_file)

                start_time = time.perf_counter()
                result = self.launcher.run_program()
                duration = time.perf_counter() - start_time

                results[speed] = {
                    "duration": duration,
                    "commands_executed": result.get("commands_executed", 0),
                    "success": "error" not in result
                }

            return {"status": "PASSED", "speed_results": results}

        except Exception as e:
            return {"status": "FAILED", "error": str(e)}

    def test_logging_levels(self) -> Dict[str, Any]:
        """Test different logging levels."""
        logger.info("Testing logging levels...")

        try:
            logging_levels = ["DEBUG", "INFO", "WARNING", "ERROR"]
            results = {}

            for level in logging_levels:
                logger.info(f"Testing logging level: {level}")

                # Reset launcher
                self.launcher = EmulatorLauncher()
                self.launcher.initialize()

                # Set logging level
                self.launcher.emulator.set_logging_level(level)

                # Load and run a simple program
                test_file = "engine/test_programs/basic_functionality.bas"
                self.launcher.load_program(test_file)

                result = self.launcher.run_program()

                results[level] = {
                    "success": "error" not in result,
                    "commands_executed": result.get("commands_executed", 0)
                }

            return {"status": "PASSED", "logging_results": results}

        except Exception as e:
            return {"status": "FAILED", "error": str(e)}

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results."""
        logger.info("Starting comprehensive emulator testing...")

        start_time = time.perf_counter()

        # Run all tests
        tests = [
            ("Initialization", self.test_initialization),
            ("Basic Functionality", self.test_basic_functionality),
            ("Memory Management", self.test_memory_management),
            ("Control Flow", self.test_control_flow),
            ("Error Handling", self.test_error_handling),
            ("Performance", self.test_performance),
            ("Speed Control", self.test_speed_control),
            ("Logging Levels", self.test_logging_levels),
        ]

        results = {}
        passed = 0
        failed = 0

        for test_name, test_func in tests:
            logger.info(f"Running {test_name} test...")
            result = test_func()
            results[test_name] = result

            if result["status"] == "PASSED":
                passed += 1
                logger.info(f"✅ {test_name} test PASSED")
            else:
                failed += 1
                logger.error(f"❌ {test_name} test FAILED: {result.get('error', 'Unknown error')}")

        total_duration = time.perf_counter() - start_time

        # Generate summary
        summary = {
            "total_tests": len(tests),
            "passed": passed,
            "failed": failed,
            "success_rate": (passed / len(tests)) * 100,
            "total_duration": total_duration,
            "results": results
        }

        return summary

    def print_summary(self, summary: Dict[str, Any]):
        """Print a formatted test summary."""
        print("\n" + "="*80)
        print("AI VINTAGE OS - EMULATOR TEST SUMMARY")
        print("="*80)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed']}")
        print(f"Failed: {summary['failed']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Total Duration: {summary['total_duration']:.3f}s")
        print("="*80)

        print("\nDETAILED RESULTS:")
        print("-"*80)

        for test_name, result in summary["results"].items():
            status_icon = "✅" if result["status"] == "PASSED" else "❌"
            duration = result.get("duration", 0)

            print(f"{status_icon} {test_name}: {result['status']} ({duration:.3f}s)")

            if result["status"] == "FAILED" and "error" in result:
                print(f"   Error: {result['error']}")

            if "commands_executed" in result:
                print(f"   Commands Executed: {result['commands_executed']}")

        print("-"*80)

        # Performance metrics
        if "Performance" in summary["results"]:
            perf_result = summary["results"]["Performance"]
            if perf_result["status"] == "PASSED":
                print("\nPERFORMANCE METRICS:")
                print(f"Commands Executed: {perf_result.get('commands_executed', 0)}")
                print(f"Duration: {perf_result.get('duration', 0):.3f}s")

        print("="*80)


def main():
    """Main entry point for the test runner."""
    print("AI Vintage OS - Emulator Test Runner")
    print("="*50)

    # Create test runner
    runner = EmulatorTestRunner()

    # Run all tests
    summary = runner.run_all_tests()

    # Print summary
    runner.print_summary(summary)

    # Exit with appropriate code
    if summary["failed"] > 0:
        print(f"\n❌ {summary['failed']} test(s) failed!")
        sys.exit(1)
    else:
        print(f"\n✅ All {summary['passed']} tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
