"""
Emulator Logging and Performance Monitoring Module

This module provides comprehensive logging and performance monitoring
for the 6502 emulator with configurable speed controls.
"""

import time
from contextlib import contextmanager
from functools import wraps
from pathlib import Path
from typing import Any, Dict, Optional

from loguru import logger


class EmulatorLogger:
    """Enhanced logging system for the emulator."""

    def __init__(self, settings: Dict[str, Any]):
        """Initialize the emulator logger."""
        self.settings = settings
        self.logging_config = settings.get("logging", {})
        self.performance_config = settings.get("performance", {})

        # Setup logging
        self._setup_logging()

        # Performance tracking
        self.instruction_times = []
        self.memory_access_times = []
        self.basic_command_times = []

        logger.info("Emulator logger initialized")

    def _setup_logging(self):
        """Setup logging configuration."""
        try:
            # Remove default logger
            logger.remove()

            # Create logs directory
            log_file = self.logging_config.get("file", "logs/emulator.log")
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)

            # Configure file logging with rotation
            logger.add(
                log_file,
                level=self.logging_config.get("level", "INFO"),
                rotation=self.logging_config.get("rotation", "10 MB"),
                retention=self.logging_config.get("retention", "7 days"),
                format=self.logging_config.get(
                    "format",
                    "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
                ),
                backtrace=True,
                diagnose=True,
            )

            # Configure console logging if enabled
            if self.logging_config.get("console_output", True):
                logger.add(
                    lambda msg: print(msg, end=""),
                    level=self.logging_config.get("level", "INFO"),
                    format=(
                        "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                        "<level>{message}</level>"
                    ),
                )

            logger.info("Logging system configured successfully")

        except Exception as e:
            logger.error(f"Failed to setup logging: {e}")

    def log_cpu_state(self, cpu_state: Dict[str, Any], context: str = ""):
        """Log CPU state information."""
        if not self.logging_config.get("log_cpu_state", True):
            return

        context_str = f" [{context}]" if context else ""
        logger.debug(
            f"CPU State{context_str}: PC=0x{cpu_state.get('pc', 0):04X}, "
            f"A=0x{cpu_state.get('a', 0):02X}, X=0x{cpu_state.get('x', 0):02X}, "
            f"Y=0x{cpu_state.get('y', 0):02X}, SP=0x{cpu_state.get('sp', 0):02X}, "
            f"P=0x{cpu_state.get('status', 0):02X}"
        )

    def log_memory_access(self, address: int, value: int, operation: str = "read"):
        """Log memory access operations."""
        if not self.logging_config.get("log_memory_access", False):
            return

        logger.debug(f"Memory {operation}: 0x{address:04X} = 0x{value:02X}")

    def log_basic_command(
        self, command: str, result: Dict[str, Any], execution_time: float = 0.0
    ):
        """Log BASIC command execution."""
        if not self.logging_config.get("log_basic_commands", True):
            return

        time_str = f" ({execution_time:.3f}ms)" if execution_time > 0 else ""
        status = "✅" if result.get("success", False) else "❌"

        logger.info(f"{status} BASIC Command: {command}{time_str}")

        if "output" in result:
            logger.info(f"  Output: {result['output']}")
        if "error" in result:
            logger.error(f"  Error: {result['error']}")

    def log_performance(
        self, operation: str, duration: float, details: Optional[Dict[str, Any]] = None
    ):
        """Log performance metrics."""
        if not self.logging_config.get("log_performance", True):
            return

        threshold = self.performance_config.get("profile_threshold_ms", 1.0)

        if duration >= threshold:
            details_str = f" | {details}" if details else ""
            logger.warning(
                f"Slow operation: {operation} took {duration:.3f}ms{details_str}"
            )

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics."""
        stats = {
            "instruction_count": len(self.instruction_times),
            "memory_access_count": len(self.memory_access_times),
            "basic_command_count": len(self.basic_command_times),
        }

        if self.instruction_times:
            stats["avg_instruction_time_ms"] = sum(self.instruction_times) / len(
                self.instruction_times
            )
            stats["max_instruction_time_ms"] = max(self.instruction_times)
            stats["min_instruction_time_ms"] = min(self.instruction_times)

        if self.memory_access_times:
            stats["avg_memory_access_time_ms"] = sum(self.memory_access_times) / len(
                self.memory_access_times
            )

        if self.basic_command_times:
            stats["avg_basic_command_time_ms"] = sum(self.basic_command_times) / len(
                self.basic_command_times
            )

        return stats

    def reset_performance_stats(self):
        """Reset performance statistics."""
        self.instruction_times.clear()
        self.memory_access_times.clear()
        self.basic_command_times.clear()
        logger.info("Performance statistics reset")


class SpeedController:
    """CPU speed control for the emulator."""

    def __init__(self, settings: Dict[str, Any]):
        """Initialize the speed controller."""
        self.settings = settings
        self.speed_config = settings.get("speed_control", {})
        self.enabled = self.speed_config.get("enabled", True)
        self.cycle_delay_ms = self.speed_config.get("cycle_delay_ms", 0.001)
        self.step_delay_ms = self.speed_config.get("step_delay_ms", 0.1)
        self.max_multiplier = self.speed_config.get("max_speed_multiplier", 10.0)
        self.min_multiplier = self.speed_config.get("min_speed_multiplier", 0.1)
        self.current_multiplier = 1.0

        logger.info(f"Speed controller initialized (enabled: {self.enabled})")

    def set_speed_multiplier(self, multiplier: float):
        """Set the speed multiplier."""
        multiplier = max(self.min_multiplier, min(multiplier, self.max_multiplier))
        self.current_multiplier = multiplier

        if self.enabled:
            logger.info(f"Speed multiplier set to {multiplier:.2f}x")
        else:
            logger.info("Speed control disabled")

    def get_cycle_delay(self) -> float:
        """Get the current cycle delay in seconds."""
        if not self.enabled:
            return 0.0
        return self.cycle_delay_ms * (1.0 / self.current_multiplier) / 1000.0

    def get_step_delay(self) -> float:
        """Get the current step delay in seconds."""
        if not self.enabled:
            return 0.0
        return self.step_delay_ms * (1.0 / self.current_multiplier) / 1000.0

    def delay_cycle(self):
        """Apply cycle delay."""
        if self.enabled:
            delay = self.get_cycle_delay()
            if delay > 0:
                time.sleep(delay)

    def delay_step(self):
        """Apply step delay."""
        if self.enabled:
            delay = self.get_step_delay()
            if delay > 0:
                time.sleep(delay)


class PerformanceMonitor:
    """Performance monitoring for the emulator."""

    def __init__(self, settings: Dict[str, Any]):
        """Initialize the performance monitor."""
        self.settings = settings
        self.performance_config = settings.get("performance", {})
        self.monitoring_enabled = self.performance_config.get(
            "monitoring_enabled", True
        )
        self.instruction_timing = self.performance_config.get(
            "instruction_timing", True
        )
        self.memory_access_timing = self.performance_config.get(
            "memory_access_timing", False
        )

        # Performance tracking
        self.start_times = {}
        self.total_times = {}

        logger.info(
            f"Performance monitor initialized (enabled: {self.monitoring_enabled})"
        )

    @contextmanager
    def time_operation(self, operation_name: str):
        """Context manager for timing operations."""
        if not self.monitoring_enabled:
            yield
            return

        start_time = time.perf_counter()
        try:
            yield
        finally:
            duration = (
                time.perf_counter() - start_time
            ) * 1000  # Convert to milliseconds
            self.total_times[operation_name] = (
                self.total_times.get(operation_name, 0) + duration
            )

    def time_function(self, operation_name: str):
        """Decorator for timing functions."""

        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not self.monitoring_enabled:
                    return func(*args, **kwargs)

                with self.time_operation(operation_name):
                    return func(*args, **kwargs)

            return wrapper

        return decorator

    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary."""
        if not self.monitoring_enabled:
            return {"monitoring_enabled": False}

        summary = {
            "monitoring_enabled": True,
            "total_operations": len(self.total_times),
            "operation_times": dict(self.total_times),
        }

        if self.total_times:
            total_time = sum(self.total_times.values())
            summary["total_time_ms"] = total_time
            summary["average_time_ms"] = total_time / len(self.total_times)

        return summary

    def reset_performance_data(self):
        """Reset performance data."""
        self.start_times.clear()
        self.total_times.clear()
        logger.info("Performance data reset")


def create_emulator_logger(settings: Dict[str, Any]) -> EmulatorLogger:
    """Create an emulator logger instance."""
    return EmulatorLogger(settings)


def create_speed_controller(settings: Dict[str, Any]) -> SpeedController:
    """Create a speed controller instance."""
    return SpeedController(settings)


def create_performance_monitor(settings: Dict[str, Any]) -> PerformanceMonitor:
    """Create a performance monitor instance."""
    return PerformanceMonitor(settings)


if __name__ == "__main__":
    # Test the logging and performance monitoring
    test_settings = {
        "logging": {
            "level": "DEBUG",
            "file": "logs/test_emulator.log",
            "console_output": True,
            "log_cpu_state": True,
            "log_memory_access": True,
            "log_basic_commands": True,
            "log_performance": True,
        },
        "speed_control": {
            "enabled": True,
            "cycle_delay_ms": 0.001,
            "step_delay_ms": 0.1,
            "max_speed_multiplier": 10.0,
            "min_speed_multiplier": 0.1,
        },
        "performance": {
            "monitoring_enabled": True,
            "instruction_timing": True,
            "memory_access_timing": True,
            "profile_threshold_ms": 0.1,
        },
    }

    # Create instances
    emulator_logger = create_emulator_logger(test_settings)
    speed_controller = create_speed_controller(test_settings)
    performance_monitor = create_performance_monitor(test_settings)

    # Test logging
    cpu_state = {
        "pc": 0x8000,
        "a": 0x42,
        "x": 0x10,
        "y": 0x20,
        "sp": 0xFF,
        "status": 0x34,
    }
    emulator_logger.log_cpu_state(cpu_state, "test")
    emulator_logger.log_memory_access(0x8000, 0xA9, "write")
    emulator_logger.log_basic_command(
        'PRINT "Hello"', {"success": True, "output": "Hello"}, 1.5
    )

    # Test speed control
    speed_controller.set_speed_multiplier(2.0)
    print(f"Cycle delay: {speed_controller.get_cycle_delay():.6f}s")
    print(f"Step delay: {speed_controller.get_step_delay():.6f}s")

    # Test performance monitoring
    with performance_monitor.time_operation("test_operation"):
        time.sleep(0.001)  # Simulate work

    print("Performance summary:", performance_monitor.get_performance_summary())
    print("Emulator logger stats:", emulator_logger.get_performance_stats())

    print("✅ Logging and performance monitoring test completed!")
