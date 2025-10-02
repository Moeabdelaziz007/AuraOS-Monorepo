"""
Emulator Integration Module

This module provides integration between the bridge server and the 6502 emulator.
It handles command execution, output capture, and state management for seamless
communication between the AI layer and the emulator engine.
"""

import asyncio
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from loguru import logger

from bridge.core.settings import get_settings


class EmulatorIntegration:
    """Integration class for emulator communication and output capture."""

    def __init__(self, emulator_instance=None):
        """Initialize the emulator integration."""
        self.settings = get_settings()
        self.emulator = emulator_instance

        # Output capture settings
        self.output_buffer = []
        self.max_buffer_size = 1000
        self.capture_enabled = True

        # Execution tracking
        self.execution_history = []
        self.current_execution_id = None
        self.execution_start_time = None

        # Performance monitoring
        self.performance_stats = {
            "total_executions": 0,
            "successful_executions": 0,
            "failed_executions": 0,
            "average_execution_time": 0.0,
            "total_execution_time": 0.0,
            "last_execution_time": 0.0,
        }

        # State management
        self.last_cpu_state = {}
        self.last_memory_state = {}
        self.state_history = []

        logger.info("Emulator Integration initialized")

    async def execute_command_sequence(
        self, commands: List[str], execution_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a sequence of BASIC commands through the emulator.

        Args:
            commands: List of BASIC commands to execute
            execution_context: Optional context information for execution

        Returns:
            Dictionary containing execution results and metadata
        """
        execution_id = f"exec_{int(time.time())}_{len(self.execution_history)}"
        self.current_execution_id = execution_id
        self.execution_start_time = time.perf_counter()

        try:
            logger.info(f"Starting command sequence execution: {execution_id}")
            logger.info(f"Commands to execute: {len(commands)}")

            # Clear output buffer for new execution
            self.output_buffer.clear()

            # Initialize execution result
            execution_result = {
                "execution_id": execution_id,
                "success": True,
                "commands_executed": 0,
                "commands_failed": 0,
                "output": [],
                "errors": [],
                "cpu_states": [],
                "execution_time": 0.0,
                "timestamp": time.time(),
                "context": execution_context or {},
            }

            # Execute each command
            for i, command in enumerate(commands):
                command_result = await self._execute_single_command(command, i + 1)

                if command_result["success"]:
                    execution_result["commands_executed"] += 1

                    # Capture output
                    if command_result.get("output"):
                        execution_result["output"].append(
                            {
                                "command_index": i + 1,
                                "command": command,
                                "output": command_result["output"],
                            }
                        )
                        self.output_buffer.append(command_result["output"])

                    # Capture CPU state
                    if command_result.get("cpu_state"):
                        execution_result["cpu_states"].append(
                            command_result["cpu_state"]
                        )

                else:
                    execution_result["commands_failed"] += 1
                    execution_result["errors"].append(
                        {
                            "command_index": i + 1,
                            "command": command,
                            "error": command_result.get("error", "Unknown error"),
                        }
                    )

                    # Stop execution on critical errors
                    if command_result.get("critical", False):
                        logger.error(
                            f"Critical error in command {i + 1}, stopping execution"
                        )
                        execution_result["success"] = False
                        break

            # Calculate total execution time
            execution_result["execution_time"] = (
                time.perf_counter() - self.execution_start_time
            ) * 1000

            # Update performance statistics
            self._update_performance_stats(execution_result)

            # Store execution in history
            self.execution_history.append(execution_result)

            # Trim history if too large
            if len(self.execution_history) > 100:
                self.execution_history = self.execution_history[-50:]

            logger.info(f"✅ Command sequence execution completed: {execution_id}")
            logger.info(f"Commands executed: {execution_result['commands_executed']}")
            logger.info(f"Execution time: {execution_result['execution_time']:.2f}ms")

            return execution_result

        except Exception as e:
            execution_time = (time.perf_counter() - self.execution_start_time) * 1000

            error_result = {
                "execution_id": execution_id,
                "success": False,
                "error": str(e),
                "execution_time": execution_time,
                "timestamp": time.time(),
            }

            self._update_performance_stats(error_result)
            self.execution_history.append(error_result)

            logger.error(f"❌ Command sequence execution failed: {e}")
            return error_result

    async def _execute_single_command(
        self, command: str, command_index: int
    ) -> Dict[str, Any]:
        """Execute a single BASIC command through the emulator."""
        try:
            if not self.emulator:
                return {
                    "success": False,
                    "error": "Emulator not initialized",
                    "critical": True,
                }

            # Execute the command
            result = self.emulator.execute_basic_command(command)

            # Capture CPU state
            cpu_state = None
            if result.get("success"):
                cpu_state = self.emulator.get_cpu_state()
                self.last_cpu_state = cpu_state

            # Determine if this is a critical error
            critical = False
            if not result.get("success"):
                error_msg = result.get("error", "").lower()
                critical = any(
                    keyword in error_msg
                    for keyword in ["fatal", "crash", "memory", "stack"]
                )

            return {
                "success": result.get("success", False),
                "output": result.get("output"),
                "error": result.get("error"),
                "cpu_state": cpu_state,
                "critical": critical,
                "command_index": command_index,
            }

        except Exception as e:
            logger.error(f"Error executing command {command_index}: {e}")
            return {
                "success": False,
                "error": str(e),
                "critical": True,
                "command_index": command_index,
            }

    async def capture_emulator_output(self, duration: float = 1.0) -> List[str]:
        """
        Capture emulator output for a specified duration.

        Args:
            duration: Duration to capture output in seconds

        Returns:
            List of captured output strings
        """
        if not self.capture_enabled or not self.emulator:
            return []

        captured_output = []
        start_time = time.perf_counter()

        try:
            while (time.perf_counter() - start_time) < duration:
                # Get current CPU state for output detection
                cpu_state = self.emulator.get_cpu_state()

                # Check for output in display memory (0x2000-0x20FF)
                memory_dump = self.emulator.get_memory_dump(0x2000, 256)

                for addr, value in memory_dump.items():
                    if isinstance(value, int) and 32 <= value <= 126:  # Printable ASCII
                        char = chr(value)
                        if char not in captured_output:
                            captured_output.append(char)

                # Small delay to prevent excessive CPU usage
                await asyncio.sleep(0.01)

            # Add captured output to buffer
            if captured_output:
                output_string = "".join(captured_output)
                self.output_buffer.append(output_string)

                # Trim buffer if too large
                if len(self.output_buffer) > self.max_buffer_size:
                    self.output_buffer = self.output_buffer[-self.max_buffer_size :]

            return captured_output

        except Exception as e:
            logger.error(f"Error capturing emulator output: {e}")
            return []

    def get_emulator_state(self) -> Dict[str, Any]:
        """Get comprehensive emulator state information."""
        if not self.emulator:
            return {"error": "Emulator not initialized"}

        try:
            cpu_state = self.emulator.get_cpu_state()
            memory_info = self.emulator.get_memory_dump(
                0x8000, 256
            )  # BASIC program area
            emulator_info = self.emulator.get_emulator_info()
            performance_stats = self.emulator.get_performance_stats()

            return {
                "cpu_state": cpu_state,
                "memory_info": memory_info,
                "emulator_info": emulator_info,
                "performance_stats": performance_stats,
                "integration_stats": self.performance_stats,
                "output_buffer_size": len(self.output_buffer),
                "execution_history_size": len(self.execution_history),
                "capture_enabled": self.capture_enabled,
            }

        except Exception as e:
            logger.error(f"Error getting emulator state: {e}")
            return {"error": str(e)}

    def get_execution_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent execution history."""
        return self.execution_history[-limit:] if self.execution_history else []

    def get_output_buffer(self, limit: int = 100) -> List[str]:
        """Get recent output from the buffer."""
        return self.output_buffer[-limit:] if self.output_buffer else []

    def clear_output_buffer(self):
        """Clear the output buffer."""
        self.output_buffer.clear()
        logger.info("Output buffer cleared")

    def enable_output_capture(self):
        """Enable output capture."""
        self.capture_enabled = True
        logger.info("Output capture enabled")

    def disable_output_capture(self):
        """Disable output capture."""
        self.capture_enabled = False
        logger.info("Output capture disabled")

    def _update_performance_stats(self, execution_result: Dict[str, Any]):
        """Update performance statistics."""
        self.performance_stats["total_executions"] += 1

        if execution_result.get("success", False):
            self.performance_stats["successful_executions"] += 1
        else:
            self.performance_stats["failed_executions"] += 1

        execution_time = execution_result.get("execution_time", 0.0)
        self.performance_stats["last_execution_time"] = execution_time

        # Update average execution time
        total_time = self.performance_stats["average_execution_time"] * (
            self.performance_stats["total_executions"] - 1
        )
        self.performance_stats["average_execution_time"] = (
            total_time + execution_time
        ) / self.performance_stats["total_executions"]
        self.performance_stats["total_execution_time"] += execution_time

    async def reset_emulator_state(self) -> bool:
        """Reset the emulator to initial state."""
        try:
            if not self.emulator:
                return False

            success = self.emulator.reset_emulator()

            if success:
                # Clear integration state
                self.output_buffer.clear()
                self.last_cpu_state = {}
                self.last_memory_state = {}

                logger.info("✅ Emulator state reset successfully")
            else:
                logger.error("❌ Failed to reset emulator state")

            return success

        except Exception as e:
            logger.error(f"Error resetting emulator state: {e}")
            return False

    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary statistics."""
        total_executions = self.performance_stats["total_executions"]

        if total_executions == 0:
            return {
                "total_executions": 0,
                "success_rate": 0.0,
                "average_execution_time": 0.0,
                "total_time": 0.0,
            }

        success_rate = (
            self.performance_stats["successful_executions"] / total_executions
        )

        return {
            "total_executions": total_executions,
            "successful_executions": self.performance_stats["successful_executions"],
            "failed_executions": self.performance_stats["failed_executions"],
            "success_rate": success_rate,
            "average_execution_time": self.performance_stats["average_execution_time"],
            "last_execution_time": self.performance_stats["last_execution_time"],
            "total_execution_time": self.performance_stats["total_execution_time"],
        }

    async def validate_emulator_connection(self) -> Dict[str, Any]:
        """Validate the emulator connection and functionality."""
        try:
            if not self.emulator:
                return {"connected": False, "error": "Emulator instance not provided"}

            # Test basic emulator functionality
            test_result = self.emulator.execute_basic_command('PRINT "Connection test"')

            if test_result.get("success"):
                return {
                    "connected": True,
                    "status": "healthy",
                    "test_result": test_result,
                    "emulator_info": self.emulator.get_emulator_info(),
                }
            else:
                return {
                    "connected": True,
                    "status": "unhealthy",
                    "error": test_result.get("error", "Test command failed"),
                }

        except Exception as e:
            return {"connected": False, "error": str(e)}

    def set_emulator_instance(self, emulator_instance):
        """Set the emulator instance for integration."""
        self.emulator = emulator_instance
        logger.info("Emulator instance set for integration")

    def get_integration_info(self) -> Dict[str, Any]:
        """Get comprehensive integration information."""
        return {
            "integration_stats": self.performance_stats,
            "output_buffer_size": len(self.output_buffer),
            "execution_history_size": len(self.execution_history),
            "capture_enabled": self.capture_enabled,
            "max_buffer_size": self.max_buffer_size,
            "emulator_connected": self.emulator is not None,
            "current_execution_id": self.current_execution_id,
            "last_execution_time": self.performance_stats["last_execution_time"],
        }


if __name__ == "__main__":
    # Test the emulator integration
    integration = EmulatorIntegration()

    print("Emulator Integration Test")
    print("=" * 50)

    # Test without emulator instance
    test_commands = ['PRINT "Hello World"', "LET X = 42", 'PRINT "X = "; X']

    async def test_integration():
        print("Testing command sequence execution...")
        result = await integration.execute_command_sequence(test_commands)

        print(f"Execution ID: {result['execution_id']}")
        print(f"Success: {result['success']}")
        print(f"Commands executed: {result['commands_executed']}")
        print(f"Commands failed: {result['commands_failed']}")
        print(f"Execution time: {result['execution_time']:.2f}ms")

        if result["errors"]:
            print("Errors:")
            for error in result["errors"]:
                print(f"  - {error['command']}: {error['error']}")

        # Test performance summary
        print(f"\n📊 Performance Summary:")
        perf_summary = integration.get_performance_summary()
        for key, value in perf_summary.items():
            print(f"  {key}: {value}")

        # Test integration info
        print(f"\n🔧 Integration Info:")
        integration_info = integration.get_integration_info()
        for key, value in integration_info.items():
            print(f"  {key}: {value}")

    # Run the test
    asyncio.run(test_integration())

    print("\n✅ Emulator Integration test completed!")
