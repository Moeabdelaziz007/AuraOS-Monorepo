"""
Tests for Emulator Logging and Performance Monitoring

Test suite for the logging and performance monitoring functionality.
"""

import time
from unittest.mock import patch

import pytest

from engine.emulator.logging_monitor import (
    EmulatorLogger,
    PerformanceMonitor,
    SpeedController,
    create_emulator_logger,
    create_performance_monitor,
    create_speed_controller,
)


class TestEmulatorLogger:
    """Test emulator logger functionality."""

    def test_logger_initialization(self):
        """Test logger initialization."""
        settings = {
            "logging": {
                "level": "INFO",
                "file": "logs/test.log",
                "console_output": False,
                "log_cpu_state": True,
                "log_memory_access": True,
                "log_basic_commands": True,
                "log_performance": True,
            }
        }

        logger = EmulatorLogger(settings)

        assert logger.settings == settings
        assert logger.logging_config == settings["logging"]
        assert logger.performance_config == {}

    def test_log_cpu_state(self):
        """Test CPU state logging."""
        settings = {"logging": {"log_cpu_state": True}}
        logger = EmulatorLogger(settings)

        cpu_state = {
            "pc": 0x8000,
            "a": 0x42,
            "x": 0x10,
            "y": 0x20,
            "sp": 0xFF,
            "status": 0x34,
        }

        with patch("loguru.logger.debug") as mock_debug:
            logger.log_cpu_state(cpu_state, "test")
            mock_debug.assert_called_once()

    def test_log_cpu_state_disabled(self):
        """Test CPU state logging when disabled."""
        settings = {"logging": {"log_cpu_state": False}}
        logger = EmulatorLogger(settings)

        cpu_state = {"pc": 0x8000, "a": 0x42}

        with patch("loguru.logger.debug") as mock_debug:
            logger.log_cpu_state(cpu_state)
            mock_debug.assert_not_called()

    def test_log_memory_access(self):
        """Test memory access logging."""
        settings = {"logging": {"log_memory_access": True}}
        logger = EmulatorLogger(settings)

        with patch("loguru.logger.debug") as mock_debug:
            logger.log_memory_access(0x8000, 0xA9, "write")
            mock_debug.assert_called_once()

    def test_log_memory_access_disabled(self):
        """Test memory access logging when disabled."""
        settings = {"logging": {"log_memory_access": False}}
        logger = EmulatorLogger(settings)

        with patch("loguru.logger.debug") as mock_debug:
            logger.log_memory_access(0x8000, 0xA9, "write")
            mock_debug.assert_not_called()

    def test_log_basic_command(self):
        """Test BASIC command logging."""
        settings = {"logging": {"log_basic_commands": True}}
        logger = EmulatorLogger(settings)

        result = {"success": True, "output": "Hello"}

        with patch("loguru.logger.info") as mock_info:
            logger.log_basic_command('PRINT "Hello"', result, 1.5)
            assert mock_info.call_count == 2  # Command and output

    def test_log_basic_command_error(self):
        """Test BASIC command logging with error."""
        settings = {"logging": {"log_basic_commands": True}}
        logger = EmulatorLogger(settings)

        result = {"success": False, "error": "Syntax error"}

        with patch("loguru.logger.info") as mock_info:
            with patch("loguru.logger.error") as mock_error:
                logger.log_basic_command("INVALID", result, 0.5)
                mock_info.assert_called_once()
                mock_error.assert_called_once()

    def test_log_performance(self):
        """Test performance logging."""
        settings = {
            "logging": {"log_performance": True},
            "performance": {"profile_threshold_ms": 1.0},
        }
        logger = EmulatorLogger(settings)

        with patch("loguru.logger.warning") as mock_warning:
            logger.log_performance("slow_operation", 2.5, {"details": "test"})
            mock_warning.assert_called_once()

    def test_log_performance_below_threshold(self):
        """Test performance logging below threshold."""
        settings = {
            "logging": {"log_performance": True},
            "performance": {"profile_threshold_ms": 5.0},
        }
        logger = EmulatorLogger(settings)

        with patch("loguru.logger.warning") as mock_warning:
            logger.log_performance("fast_operation", 0.5)
            mock_warning.assert_not_called()

    def test_get_performance_stats(self):
        """Test getting performance statistics."""
        settings = {"logging": {"log_performance": True}}
        logger = EmulatorLogger(settings)

        # Add some test data
        logger.instruction_times = [1.0, 2.0, 3.0]
        logger.memory_access_times = [0.5, 1.5]
        logger.basic_command_times = [2.5, 3.5, 4.5]

        stats = logger.get_performance_stats()

        assert stats["instruction_count"] == 3
        assert stats["memory_access_count"] == 2
        assert stats["basic_command_count"] == 3
        assert stats["avg_instruction_time_ms"] == 2.0
        assert stats["max_instruction_time_ms"] == 3.0
        assert stats["min_instruction_time_ms"] == 1.0

    def test_reset_performance_stats(self):
        """Test resetting performance statistics."""
        settings = {"logging": {"log_performance": True}}
        logger = EmulatorLogger(settings)

        # Add some test data
        logger.instruction_times = [1.0, 2.0]
        logger.memory_access_times = [0.5]
        logger.basic_command_times = [2.5]

        logger.reset_performance_stats()

        assert len(logger.instruction_times) == 0
        assert len(logger.memory_access_times) == 0
        assert len(logger.basic_command_times) == 0


class TestSpeedController:
    """Test speed controller functionality."""

    def test_speed_controller_initialization(self):
        """Test speed controller initialization."""
        settings = {
            "speed_control": {
                "enabled": True,
                "cycle_delay_ms": 0.001,
                "step_delay_ms": 0.1,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.1,
            }
        }

        controller = SpeedController(settings)

        assert controller.enabled is True
        assert controller.cycle_delay_ms == 0.001
        assert controller.step_delay_ms == 0.1
        assert controller.max_multiplier == 10.0
        assert controller.min_multiplier == 0.1
        assert controller.current_multiplier == 1.0

    def test_set_speed_multiplier_valid(self):
        """Test setting valid speed multiplier."""
        settings = {
            "speed_control": {
                "enabled": True,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.1,
            }
        }
        controller = SpeedController(settings)

        controller.set_speed_multiplier(2.5)
        assert controller.current_multiplier == 2.5

    def test_set_speed_multiplier_above_max(self):
        """Test setting speed multiplier above maximum."""
        settings = {
            "speed_control": {
                "enabled": True,
                "max_speed_multiplier": 5.0,
                "min_speed_multiplier": 0.1,
            }
        }
        controller = SpeedController(settings)

        controller.set_speed_multiplier(10.0)
        assert controller.current_multiplier == 5.0

    def test_set_speed_multiplier_below_min(self):
        """Test setting speed multiplier below minimum."""
        settings = {
            "speed_control": {
                "enabled": True,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.5,
            }
        }
        controller = SpeedController(settings)

        controller.set_speed_multiplier(0.1)
        assert controller.current_multiplier == 0.5

    def test_get_cycle_delay_enabled(self):
        """Test getting cycle delay when enabled."""
        settings = {
            "speed_control": {
                "enabled": True,
                "cycle_delay_ms": 0.001,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.1,
            }
        }
        controller = SpeedController(settings)
        controller.current_multiplier = 2.0

        delay = controller.get_cycle_delay()
        assert delay == 5e-07  # 0.001 / 2.0 / 1000

    def test_get_cycle_delay_disabled(self):
        """Test getting cycle delay when disabled."""
        settings = {"speed_control": {"enabled": False}}
        controller = SpeedController(settings)

        delay = controller.get_cycle_delay()
        assert delay == 0.0

    def test_get_step_delay_enabled(self):
        """Test getting step delay when enabled."""
        settings = {
            "speed_control": {
                "enabled": True,
                "step_delay_ms": 0.1,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.1,
            }
        }
        controller = SpeedController(settings)
        controller.current_multiplier = 4.0

        delay = controller.get_step_delay()
        assert delay == 2.5e-05  # 0.1 / 4.0 / 1000

    def test_get_step_delay_disabled(self):
        """Test getting step delay when disabled."""
        settings = {"speed_control": {"enabled": False}}
        controller = SpeedController(settings)

        delay = controller.get_step_delay()
        assert delay == 0.0

    def test_delay_cycle_enabled(self):
        """Test cycle delay when enabled."""
        settings = {
            "speed_control": {
                "enabled": True,
                "cycle_delay_ms": 0.001,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.1,
            }
        }
        controller = SpeedController(settings)
        controller.current_multiplier = 1.0

        with patch("time.sleep") as mock_sleep:
            controller.delay_cycle()
            mock_sleep.assert_called_once_with(0.000001)

    def test_delay_cycle_disabled(self):
        """Test cycle delay when disabled."""
        settings = {"speed_control": {"enabled": False}}
        controller = SpeedController(settings)

        with patch("time.sleep") as mock_sleep:
            controller.delay_cycle()
            mock_sleep.assert_not_called()

    def test_delay_step_enabled(self):
        """Test step delay when enabled."""
        settings = {
            "speed_control": {
                "enabled": True,
                "step_delay_ms": 0.1,
                "max_speed_multiplier": 10.0,
                "min_speed_multiplier": 0.1,
            }
        }
        controller = SpeedController(settings)
        controller.current_multiplier = 2.0

        with patch("time.sleep") as mock_sleep:
            controller.delay_step()
            mock_sleep.assert_called_once_with(0.00005)  # 0.1 / 2.0 / 1000

    def test_delay_step_disabled(self):
        """Test step delay when disabled."""
        settings = {"speed_control": {"enabled": False}}
        controller = SpeedController(settings)

        with patch("time.sleep") as mock_sleep:
            controller.delay_step()
            mock_sleep.assert_not_called()


class TestPerformanceMonitor:
    """Test performance monitor functionality."""

    def test_performance_monitor_initialization(self):
        """Test performance monitor initialization."""
        settings = {
            "performance": {
                "monitoring_enabled": True,
                "instruction_timing": True,
                "memory_access_timing": False,
            }
        }

        monitor = PerformanceMonitor(settings)

        assert monitor.monitoring_enabled is True
        assert monitor.instruction_timing is True
        assert monitor.memory_access_timing is False
        assert len(monitor.start_times) == 0
        assert len(monitor.total_times) == 0

    def test_time_operation_enabled(self):
        """Test timing operation when enabled."""
        settings = {"performance": {"monitoring_enabled": True}}
        monitor = PerformanceMonitor(settings)

        with monitor.time_operation("test_operation"):
            time.sleep(0.001)  # Simulate work

        assert "test_operation" in monitor.total_times
        assert monitor.total_times["test_operation"] > 0

    def test_time_operation_disabled(self):
        """Test timing operation when disabled."""
        settings = {"performance": {"monitoring_enabled": False}}
        monitor = PerformanceMonitor(settings)

        with monitor.time_operation("test_operation"):
            time.sleep(0.001)  # Simulate work

        assert len(monitor.total_times) == 0

    def test_time_function_decorator(self):
        """Test function timing decorator."""
        settings = {"performance": {"monitoring_enabled": True}}
        monitor = PerformanceMonitor(settings)

        @monitor.time_function("decorated_function")
        def test_function():
            time.sleep(0.001)
            return "result"

        result = test_function()

        assert result == "result"
        assert "decorated_function" in monitor.total_times

    def test_time_function_decorator_disabled(self):
        """Test function timing decorator when disabled."""
        settings = {"performance": {"monitoring_enabled": False}}
        monitor = PerformanceMonitor(settings)

        @monitor.time_function("decorated_function")
        def test_function():
            time.sleep(0.001)
            return "result"

        result = test_function()

        assert result == "result"
        assert len(monitor.total_times) == 0

    def test_get_performance_summary_enabled(self):
        """Test getting performance summary when enabled."""
        settings = {"performance": {"monitoring_enabled": True}}
        monitor = PerformanceMonitor(settings)

        # Add some test data
        monitor.total_times = {"op1": 10.0, "op2": 20.0}

        summary = monitor.get_performance_summary()

        assert summary["monitoring_enabled"] is True
        assert summary["total_operations"] == 2
        assert summary["total_time_ms"] == 30.0
        assert summary["average_time_ms"] == 15.0
        assert summary["operation_times"]["op1"] == 10.0
        assert summary["operation_times"]["op2"] == 20.0

    def test_get_performance_summary_disabled(self):
        """Test getting performance summary when disabled."""
        settings = {"performance": {"monitoring_enabled": False}}
        monitor = PerformanceMonitor(settings)

        summary = monitor.get_performance_summary()

        assert summary["monitoring_enabled"] is False

    def test_reset_performance_data(self):
        """Test resetting performance data."""
        settings = {"performance": {"monitoring_enabled": True}}
        monitor = PerformanceMonitor(settings)

        # Add some test data
        monitor.start_times = {"op1": 1000.0}
        monitor.total_times = {"op1": 10.0, "op2": 20.0}

        monitor.reset_performance_data()

        assert len(monitor.start_times) == 0
        assert len(monitor.total_times) == 0


class TestFactoryFunctions:
    """Test factory functions."""

    def test_create_emulator_logger(self):
        """Test creating emulator logger."""
        settings = {"logging": {"level": "DEBUG"}}

        logger = create_emulator_logger(settings)

        assert isinstance(logger, EmulatorLogger)
        assert logger.settings == settings

    def test_create_speed_controller(self):
        """Test creating speed controller."""
        settings = {"speed_control": {"enabled": True}}

        controller = create_speed_controller(settings)

        assert isinstance(controller, SpeedController)
        assert controller.enabled is True

    def test_create_performance_monitor(self):
        """Test creating performance monitor."""
        settings = {"performance": {"monitoring_enabled": True}}

        monitor = create_performance_monitor(settings)

        assert isinstance(monitor, PerformanceMonitor)
        assert monitor.monitoring_enabled is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
