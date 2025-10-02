"""
Bridge Output Handler Module

This module provides comprehensive output handling for the AI Vintage OS bridge,
capturing emulator responses, formatting them appropriately, and dispatching them
to frontend and AI layers in real-time.
"""

import asyncio
import json
import time
from abc import ABC, abstractmethod
from collections import deque
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Union

from loguru import logger

from bridge.core.error_handler import (
    BridgeError,
    ErrorCategory,
    ErrorHandler,
    ErrorSeverity,
)
from bridge.core.settings import get_settings


class OutputType(Enum):
    """Types of emulator outputs."""

    PRINT = "print"
    ERROR = "error"
    RESULT = "result"
    DEBUG = "debug"
    STATUS = "status"
    CPU_STATE = "cpu_state"
    MEMORY_DUMP = "memory_dump"
    PERFORMANCE = "performance"
    LOG = "log"


class OutputSeverity(Enum):
    """Output severity levels."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
    DEBUG = "debug"


class OutputChannel(ABC):
    """Abstract base class for output channels."""

    @abstractmethod
    async def send_output(self, output_data: Dict[str, Any]) -> bool:
        """Send output data through this channel."""
        pass

    @abstractmethod
    def get_channel_info(self) -> Dict[str, Any]:
        """Get information about this channel."""
        pass


class WebSocketChannel(OutputChannel):
    """WebSocket output channel for real-time frontend communication."""

    def __init__(self, websocket=None):
        """Initialize WebSocket channel."""
        self.websocket = websocket
        self.connected_clients = []
        self.message_queue = deque(maxlen=1000)

    async def send_output(self, output_data: Dict[str, Any]) -> bool:
        """Send output to WebSocket clients."""
        try:
            if not self.websocket:
                return False

            # Format for WebSocket
            ws_message = {
                "type": "emulator_output",
                "timestamp": time.time(),
                "data": output_data,
            }

            message_json = json.dumps(ws_message)

            # Send to all connected clients
            disconnected_clients = []
            for client in self.connected_clients:
                try:
                    await client.send_text(message_json)
                except Exception as e:
                    logger.warning(f"Failed to send to WebSocket client: {e}")
                    disconnected_clients.append(client)

            # Remove disconnected clients
            for client in disconnected_clients:
                self.connected_clients.remove(client)

            # Store in queue for buffering
            self.message_queue.append(ws_message)

            return len(self.connected_clients) > 0

        except Exception as e:
            logger.error(f"WebSocket output failed: {e}")
            return False

    def get_channel_info(self) -> Dict[str, Any]:
        """Get WebSocket channel information."""
        return {
            "type": "websocket",
            "connected_clients": len(self.connected_clients),
            "queued_messages": len(self.message_queue),
            "active": len(self.connected_clients) > 0,
        }

    def add_client(self, websocket):
        """Add a WebSocket client."""
        self.connected_clients.append(websocket)
        logger.info(
            f"WebSocket client added. Total clients: {len(self.connected_clients)}"
        )

    def remove_client(self, websocket):
        """Remove a WebSocket client."""
        if websocket in self.connected_clients:
            self.connected_clients.remove(websocket)
            logger.info(
                f"WebSocket client removed. Total clients: {len(self.connected_clients)}"
            )


class APIRestChannel(OutputChannel):
    """REST API output channel for polling-based access."""

    def __init__(self):
        """Initialize REST API channel."""
        self.output_buffer = deque(maxlen=1000)
        self.last_output_id = 0

    async def send_output(self, output_data: Dict[str, Any]) -> bool:
        """Store output for REST API polling."""
        try:
            # Add unique ID and timestamp
            self.last_output_id += 1
            output_data["id"] = self.last_output_id
            output_data["timestamp"] = time.time()

            # Store in buffer
            self.output_buffer.append(output_data)

            return True

        except Exception as e:
            logger.error(f"REST API output failed: {e}")
            return False

    def get_channel_info(self) -> Dict[str, Any]:
        """Get REST API channel information."""
        return {
            "type": "rest_api",
            "buffered_outputs": len(self.output_buffer),
            "last_output_id": self.last_output_id,
            "active": True,
        }

    def get_recent_outputs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent outputs for API polling."""
        return list(self.output_buffer)[-limit:] if self.output_buffer else []

    def clear_buffer(self):
        """Clear the output buffer."""
        self.output_buffer.clear()
        logger.info("REST API output buffer cleared")


class LogChannel(OutputChannel):
    """Logging output channel for debugging and monitoring."""

    def __init__(self, log_level: str = "INFO"):
        """Initialize log channel."""
        self.log_level = log_level.upper()
        self.log_count = 0

    async def send_output(self, output_data: Dict[str, Any]) -> bool:
        """Log output data."""
        try:
            self.log_count += 1

            output_type = output_data.get("type", "unknown")
            message = output_data.get("message", "")
            severity = output_data.get("severity", "info")

            # Format log message
            log_message = f"[{output_type.upper()}] {message}"

            # Log based on severity
            if severity == "critical":
                logger.critical(log_message)
            elif severity == "error":
                logger.error(log_message)
            elif severity == "warning":
                logger.warning(log_message)
            elif severity == "debug":
                logger.debug(log_message)
            else:
                logger.info(log_message)

            return True

        except Exception as e:
            logger.error(f"Log output failed: {e}")
            return False

    def get_channel_info(self) -> Dict[str, Any]:
        """Get log channel information."""
        return {
            "type": "log",
            "log_level": self.log_level,
            "messages_logged": self.log_count,
            "active": True,
        }


class AIFeedbackChannel(OutputChannel):
    """AI feedback channel for providing context to AI layer."""

    def __init__(self, ai_callback: Optional[Callable] = None):
        """Initialize AI feedback channel."""
        self.ai_callback = ai_callback
        self.context_buffer = deque(maxlen=100)
        self.feedback_count = 0

    async def send_output(self, output_data: Dict[str, Any]) -> bool:
        """Send output to AI layer for context."""
        try:
            self.feedback_count += 1

            # Store in context buffer
            context_data = {
                "output": output_data,
                "timestamp": time.time(),
                "feedback_id": self.feedback_count,
            }
            self.context_buffer.append(context_data)

            # Call AI callback if provided
            if self.ai_callback:
                try:
                    await self.ai_callback(output_data)
                except Exception as e:
                    logger.warning(f"AI callback failed: {e}")

            return True

        except Exception as e:
            logger.error(f"AI feedback failed: {e}")
            return False

    def get_channel_info(self) -> Dict[str, Any]:
        """Get AI feedback channel information."""
        return {
            "type": "ai_feedback",
            "context_entries": len(self.context_buffer),
            "feedback_count": self.feedback_count,
            "callback_available": self.ai_callback is not None,
            "active": True,
        }

    def get_context_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get context history for AI layer."""
        return list(self.context_buffer)[-limit:] if self.context_buffer else []


class OutputFormatter:
    """Formats emulator outputs for different consumption types."""

    def __init__(self):
        """Initialize output formatter."""
        self.formatters = {
            OutputType.PRINT: self._format_print_output,
            OutputType.ERROR: self._format_error_output,
            OutputType.RESULT: self._format_result_output,
            OutputType.DEBUG: self._format_debug_output,
            OutputType.STATUS: self._format_status_output,
            OutputType.CPU_STATE: self._format_cpu_state_output,
            OutputType.MEMORY_DUMP: self._format_memory_dump_output,
            OutputType.PERFORMANCE: self._format_performance_output,
            OutputType.LOG: self._format_log_output,
        }

    def format_output(
        self,
        raw_output: Union[str, Dict[str, Any]],
        output_type: OutputType,
        target_channel: str = "frontend",
    ) -> Dict[str, Any]:
        """Format output for specific channel and type."""
        try:
            formatter = self.formatters.get(output_type, self._format_generic_output)
            return formatter(raw_output, target_channel)
        except Exception as e:
            logger.error(f"Output formatting failed: {e}")
            return self._format_error_output(f"Formatting error: {e}", target_channel)

    def _format_print_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format PRINT command output."""
        if isinstance(raw_output, dict):
            message = raw_output.get("output", str(raw_output))
        else:
            message = str(raw_output)

        return {
            "type": "print",
            "message": message.strip(),
            "severity": "info",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "text",
            "css_class": "emulator-output",
        }

    def _format_error_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format error output."""
        if isinstance(raw_output, dict):
            error_msg = raw_output.get("error", str(raw_output))
            error_code = raw_output.get("error_code", "UNKNOWN")
        else:
            error_msg = str(raw_output)
            error_code = "FORMAT_ERROR"

        return {
            "type": "error",
            "message": error_msg.strip(),
            "error_code": error_code,
            "severity": "error",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "error",
            "css_class": "emulator-error",
        }

    def _format_result_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format command result output."""
        if isinstance(raw_output, dict):
            result = raw_output.get("result", str(raw_output))
            success = raw_output.get("success", True)
        else:
            result = str(raw_output)
            success = True

        return {
            "type": "result",
            "message": result.strip(),
            "success": success,
            "severity": "info" if success else "warning",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "result",
            "css_class": "emulator-result",
        }

    def _format_debug_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format debug output."""
        if isinstance(raw_output, dict):
            debug_info = raw_output.get("debug_info", str(raw_output))
            debug_level = raw_output.get("debug_level", "DEBUG")
        else:
            debug_info = str(raw_output)
            debug_level = "DEBUG"

        return {
            "type": "debug",
            "message": debug_info.strip(),
            "debug_level": debug_level,
            "severity": "debug",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "debug",
            "css_class": "emulator-debug",
        }

    def _format_status_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format status output."""
        if isinstance(raw_output, dict):
            status = raw_output.get("status", str(raw_output))
            status_type = raw_output.get("status_type", "info")
        else:
            status = str(raw_output)
            status_type = "info"

        return {
            "type": "status",
            "message": status.strip(),
            "status_type": status_type,
            "severity": "info",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "status",
            "css_class": "emulator-status",
        }

    def _format_cpu_state_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format CPU state output."""
        if isinstance(raw_output, dict):
            cpu_state = raw_output
        else:
            cpu_state = {"raw": str(raw_output)}

        return {
            "type": "cpu_state",
            "cpu_state": cpu_state,
            "message": f"CPU State: PC=0x{cpu_state.get('pc', 0):04X}, A=0x{cpu_state.get('a', 0):02X}",
            "severity": "info",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "cpu_state",
            "css_class": "emulator-cpu-state",
        }

    def _format_memory_dump_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format memory dump output."""
        if isinstance(raw_output, dict):
            memory_dump = raw_output
        else:
            memory_dump = {"raw": str(raw_output)}

        return {
            "type": "memory_dump",
            "memory_dump": memory_dump,
            "message": f"Memory dump: {len(memory_dump)} bytes",
            "severity": "info",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "memory_dump",
            "css_class": "emulator-memory",
        }

    def _format_performance_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format performance output."""
        if isinstance(raw_output, dict):
            performance = raw_output
        else:
            performance = {"raw": str(raw_output)}

        return {
            "type": "performance",
            "performance": performance,
            "message": f"Performance: {performance.get('execution_time', 0):.2f}ms",
            "severity": "info",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "performance",
            "css_class": "emulator-performance",
        }

    def _format_log_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format log output."""
        if isinstance(raw_output, dict):
            log_message = raw_output.get("message", str(raw_output))
            log_level = raw_output.get("level", "INFO")
        else:
            log_message = str(raw_output)
            log_level = "INFO"

        return {
            "type": "log",
            "message": log_message.strip(),
            "log_level": log_level,
            "severity": log_level.lower(),
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "log",
            "css_class": "emulator-log",
        }

    def _format_generic_output(
        self, raw_output: Union[str, Dict[str, Any]], target_channel: str
    ) -> Dict[str, Any]:
        """Format generic output."""
        if isinstance(raw_output, dict):
            message = str(raw_output)
        else:
            message = str(raw_output)

        return {
            "type": "generic",
            "message": message.strip(),
            "severity": "info",
            "timestamp": time.time(),
            "formatted_for": target_channel,
            "display_type": "text",
            "css_class": "emulator-generic",
        }


class BridgeOutputHandler:
    """Main bridge output handler class."""

    def __init__(self):
        """Initialize the bridge output handler."""
        self.settings = get_settings()
        self.error_handler = ErrorHandler()

        # Initialize output channels
        self.channels = {
            "websocket": WebSocketChannel(),
            "rest_api": APIRestChannel(),
            "log": LogChannel(),
            "ai_feedback": AIFeedbackChannel(),
        }

        # Initialize formatter
        self.formatter = OutputFormatter()

        # Output tracking
        self.output_history = deque(maxlen=1000)
        self.active_outputs = {}

        # Performance tracking
        self.stats = {
            "total_outputs": 0,
            "outputs_by_type": {},
            "outputs_by_channel": {},
            "average_processing_time": 0.0,
            "total_processing_time": 0.0,
            "error_count": 0,
            "success_count": 0,
        }

        logger.info("Bridge Output Handler initialized")

    async def capture_output(
        self,
        raw_output: Union[str, Dict[str, Any]],
        output_type: OutputType = OutputType.PRINT,
        severity: OutputSeverity = OutputSeverity.INFO,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Capture and process emulator output.

        Args:
            raw_output: The raw output from emulator
            output_type: Type of output (print, error, result, etc.)
            severity: Severity level of the output
            metadata: Additional metadata

        Returns:
            Dictionary containing processing result
        """
        start_time = time.perf_counter()
        output_id = f"out_{int(time.time())}_{len(self.output_history)}"

        try:
            logger.debug(
                f"Capturing output: {output_type.value} - {str(raw_output)[:100]}..."
            )

            # Create base output data
            output_data = {
                "output_id": output_id,
                "type": output_type.value,
                "severity": severity.value,
                "timestamp": time.time(),
                "raw_output": raw_output,
                "metadata": metadata or {},
            }

            # Format output for different channels
            formatted_outputs = {}
            for channel_name, channel in self.channels.items():
                try:
                    formatted_output = self.formatter.format_output(
                        raw_output, output_type, channel_name
                    )
                    formatted_outputs[channel_name] = formatted_output
                except Exception as e:
                    logger.warning(f"Formatting failed for {channel_name}: {e}")
                    formatted_outputs[channel_name] = None

            # Dispatch to channels
            dispatch_results = {}
            for channel_name, channel in self.channels.items():
                try:
                    formatted_output = formatted_outputs.get(channel_name)
                    if formatted_output:
                        success = await channel.send_output(formatted_output)
                        dispatch_results[channel_name] = success
                    else:
                        dispatch_results[channel_name] = False
                except Exception as e:
                    logger.warning(f"Dispatch failed for {channel_name}: {e}")
                    dispatch_results[channel_name] = False

            # Calculate processing time
            processing_time = (time.perf_counter() - start_time) * 1000

            # Create result
            result = {
                "output_id": output_id,
                "success": any(dispatch_results.values()),
                "output_type": output_type.value,
                "severity": severity.value,
                "processing_time": processing_time,
                "dispatch_results": dispatch_results,
                "timestamp": time.time(),
                "formatted_outputs": formatted_outputs,
            }

            # Update statistics
            self._update_stats(
                processing_time, True, output_type.value, dispatch_results
            )

            # Add to history
            self._add_to_history(result)

            # Store active output
            self.active_outputs[output_id] = result

            logger.info(f"✅ Output captured successfully in {processing_time:.2f}ms")
            logger.info(
                f"Type: {output_type.value}, Channels: {sum(dispatch_results.values())}/{len(dispatch_results)}"
            )

            return result

        except Exception as e:
            processing_time = (time.perf_counter() - start_time) * 1000

            # Log error
            error_id = self.error_handler.log_error(
                e,
                context={
                    "raw_output": raw_output,
                    "output_type": output_type.value,
                    "processing_time": processing_time,
                },
                operation="capture_output",
            )

            error_result = {
                "output_id": output_id,
                "success": False,
                "error": str(e),
                "error_id": error_id,
                "output_type": output_type.value,
                "processing_time": processing_time,
                "timestamp": time.time(),
            }

            self._update_stats(processing_time, False, output_type.value)
            self._add_to_history(error_result)

            logger.error(f"❌ Output capture failed: {e}")
            return error_result

    def add_websocket_client(self, websocket):
        """Add a WebSocket client for real-time output."""
        if "websocket" in self.channels:
            self.channels["websocket"].add_client(websocket)
            logger.info("WebSocket client added to output handler")

    def remove_websocket_client(self, websocket):
        """Remove a WebSocket client."""
        if "websocket" in self.channels:
            self.channels["websocket"].remove_client(websocket)

    def set_ai_callback(self, callback: Callable):
        """Set AI callback for output feedback."""
        if "ai_feedback" in self.channels:
            self.channels["ai_feedback"].ai_callback = callback
            logger.info("AI callback set for output handler")

    def get_recent_outputs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent outputs for API polling."""
        if "rest_api" in self.channels:
            return self.channels["rest_api"].get_recent_outputs(limit)
        return []

    def get_output_statistics(self) -> Dict[str, Any]:
        """Get comprehensive output statistics."""
        return {
            "stats": self.stats,
            "channels": {
                name: channel.get_channel_info()
                for name, channel in self.channels.items()
            },
            "history_size": len(self.output_history),
            "active_outputs": len(self.active_outputs),
        }

    def get_output_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get output history."""
        return list(self.output_history)[-limit:] if self.output_history else []

    def clear_history(self):
        """Clear output history."""
        self.output_history.clear()
        self.active_outputs.clear()

        # Clear channel buffers
        if "rest_api" in self.channels:
            self.channels["rest_api"].clear_buffer()

        logger.info("Output history cleared")

    def _update_stats(
        self,
        processing_time: float,
        success: bool,
        output_type: str,
        dispatch_results: Optional[Dict[str, bool]] = None,
    ):
        """Update output statistics."""
        self.stats["total_outputs"] += 1
        self.stats["total_processing_time"] += processing_time

        if success:
            self.stats["success_count"] += 1
        else:
            self.stats["error_count"] += 1

        # Update average processing time
        self.stats["average_processing_time"] = (
            self.stats["total_processing_time"] / self.stats["total_outputs"]
        )

        # Update output type statistics
        if output_type not in self.stats["outputs_by_type"]:
            self.stats["outputs_by_type"][output_type] = 0
        self.stats["outputs_by_type"][output_type] += 1

        # Update channel statistics
        if dispatch_results:
            for channel_name, channel_success in dispatch_results.items():
                if channel_name not in self.stats["outputs_by_channel"]:
                    self.stats["outputs_by_channel"][channel_name] = {
                        "success": 0,
                        "failed": 0,
                    }

                if channel_success:
                    self.stats["outputs_by_channel"][channel_name]["success"] += 1
                else:
                    self.stats["outputs_by_channel"][channel_name]["failed"] += 1

    def _add_to_history(self, result: Dict[str, Any]):
        """Add result to output history."""
        self.output_history.append(result)

        # Clean up old active outputs
        if len(self.active_outputs) > 100:
            # Remove oldest active outputs
            oldest_keys = sorted(self.active_outputs.keys())[:20]
            for key in oldest_keys:
                del self.active_outputs[key]

    async def test_output_processing(
        self, test_outputs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Test output processing with sample outputs."""
        results = []

        for test_output in test_outputs:
            raw_output = test_output.get("output", "")
            output_type = OutputType(test_output.get("type", "print"))
            severity = OutputSeverity(test_output.get("severity", "info"))

            result = await self.capture_output(raw_output, output_type, severity)
            results.append(result)

        # Analyze results
        successful = [r for r in results if r.get("success", False)]
        failed = [r for r in results if not r.get("success", False)]

        avg_processing_time = 0.0
        if results:
            avg_processing_time = sum(
                r.get("processing_time", 0) for r in results
            ) / len(results)

        return {
            "total_outputs": len(test_outputs),
            "successful": len(successful),
            "failed": len(failed),
            "success_rate": len(successful) / len(test_outputs) if test_outputs else 0,
            "average_processing_time": avg_processing_time,
            "results": results,
        }


if __name__ == "__main__":
    # Test the bridge output handler
    import asyncio

    async def test_output_handler():
        handler = BridgeOutputHandler()

        print("Bridge Output Handler Test")
        print("=" * 50)

        # Test outputs
        test_outputs = [
            {"output": "Hello World!", "type": "print", "severity": "info"},
            {"output": "Error: Invalid command", "type": "error", "severity": "error"},
            {
                "output": {"result": "Success", "success": True},
                "type": "result",
                "severity": "info",
            },
            {
                "output": {"pc": 0x8000, "a": 0x42},
                "type": "cpu_state",
                "severity": "debug",
            },
        ]

        # Test output processing
        results = await handler.test_output_processing(test_outputs)

        print(f"\n📊 Test Results:")
        print(f"  Total Outputs: {results['total_outputs']}")
        print(f"  Successful: {results['successful']}")
        print(f"  Failed: {results['failed']}")
        print(f"  Success Rate: {results['success_rate']:.1%}")
        print(f"  Average Processing Time: {results['average_processing_time']:.2f}ms")

        # Show detailed results
        print(f"\n📋 Detailed Results:")
        for i, result in enumerate(results["results"], 1):
            status = "✅" if result.get("success", False) else "❌"
            output_type = result.get("output_type", "unknown")
            processing_time = result.get("processing_time", 0)

            print(f"  {i:2d}. {status} {output_type} ({processing_time:.2f}ms)")

        # Show statistics
        stats = handler.get_output_statistics()
        print(f"\n📊 Statistics:")
        print(f"  Total Outputs: {stats['stats']['total_outputs']}")
        print(f"  Success Count: {stats['stats']['success_count']}")
        print(f"  Error Count: {stats['stats']['error_count']}")
        print(
            f"  Average Processing Time: {stats['stats']['average_processing_time']:.2f}ms"
        )
        print(f"  Channels: {list(stats['channels'].keys())}")

        print("\n✅ Bridge Output Handler test completed!")

    # Run test
    asyncio.run(test_output_handler())
