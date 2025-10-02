"""
Error Handling and Logging Module

This module provides comprehensive error handling, logging, and monitoring
capabilities for the AI Vintage OS bridge layer. It handles exceptions,
performance monitoring, and system health checks.
"""

import asyncio
import functools
import sys
import time
import traceback
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Union

from loguru import logger

from bridge.core.settings import get_settings


class ErrorSeverity(Enum):
    """Error severity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(Enum):
    """Error categories for classification."""

    VALIDATION = "validation"
    TRANSLATION = "translation"
    EXECUTION = "execution"
    COMMUNICATION = "communication"
    SYSTEM = "system"
    PERFORMANCE = "performance"
    SECURITY = "security"


class BridgeError(Exception):
    """Custom exception class for bridge-related errors."""

    def __init__(
        self,
        message: str,
        category: ErrorCategory = ErrorCategory.SYSTEM,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.category = category
        self.severity = severity
        self.error_code = error_code
        self.context = context or {}
        self.timestamp = time.time()
        self.traceback = traceback.format_exc()


class ErrorHandler:
    """Main error handling and logging class."""

    def __init__(self):
        """Initialize the error handler."""
        self.settings = get_settings()

        # Error tracking
        self.error_log = []
        self.error_counts = {}
        self.recent_errors = []
        self.max_error_log_size = 1000
        self.max_recent_errors = 50

        # Performance monitoring
        self.performance_log = []
        self.slow_operations = []
        self.performance_thresholds = {
            "command_execution": 1000.0,  # 1 second
            "ai_translation": 2000.0,  # 2 seconds
            "emulator_operation": 500.0,  # 500ms
            "network_request": 3000.0,  # 3 seconds
        }

        # System health
        self.health_status = {
            "overall": "healthy",
            "components": {},
            "last_check": time.time(),
            "uptime": time.time(),
        }

        # Setup logging configuration
        self._setup_logging()

        logger.info("Error Handler initialized")

    def _setup_logging(self):
        """Setup logging configuration based on settings."""
        try:
            # Remove default logger
            logger.remove()

            # Configure console logging
            log_format = (
                "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                "<level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
                "<level>{message}</level>"
            )

            # Console output
            logger.add(
                sys.stderr,
                level=self.settings.bridge.logging.get("level", "INFO"),
                format=log_format,
                colorize=True,
            )

            # File logging
            log_file = Path(
                self.settings.bridge.logging.get("file_path", "logs/bridge.log")
            )
            log_file.parent.mkdir(parents=True, exist_ok=True)

            logger.add(
                log_file,
                level=self.settings.bridge.logging.get("level", "INFO"),
                format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
                rotation=self.settings.bridge.logging.get("max_file_size", "10MB"),
                retention=self.settings.bridge.logging.get("backup_count", 5),
                compression="gz",
            )

            logger.info("Logging configuration completed")

        except Exception as e:
            print(f"Failed to setup logging: {e}")
            sys.exit(1)

    def log_error(
        self,
        error: Union[Exception, BridgeError],
        context: Optional[Dict[str, Any]] = None,
        operation: Optional[str] = None,
    ) -> str:
        """
        Log an error with full context and tracking.

        Args:
            error: The exception or error to log
            context: Additional context information
            operation: The operation that caused the error

        Returns:
            Error ID for tracking
        """
        error_id = f"err_{int(time.time())}_{len(self.error_log)}"

        # Determine error properties
        if isinstance(error, BridgeError):
            category = error.category
            severity = error.severity
            error_code = error.error_code
            message = error.message
            error_context = error.context.copy()
        else:
            category = self._classify_error(error)
            severity = self._determine_severity(error, category)
            error_code = self._generate_error_code(error, category)
            message = str(error)
            error_context = {}

        # Merge contexts
        if context:
            error_context.update(context)

        # Create error record
        error_record = {
            "id": error_id,
            "timestamp": time.time(),
            "category": category.value,
            "severity": severity.value,
            "error_code": error_code,
            "message": message,
            "context": error_context,
            "operation": operation,
            "traceback": traceback.format_exc(),
        }

        # Add to error log
        self.error_log.append(error_record)
        self.recent_errors.append(error_record)

        # Update error counts
        error_key = f"{category.value}_{severity.value}"
        self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1

        # Trim logs if too large
        if len(self.error_log) > self.max_error_log_size:
            self.error_log = self.error_log[-self.max_error_log_size :]

        if len(self.recent_errors) > self.max_recent_errors:
            self.recent_errors = self.recent_errors[-self.max_recent_errors :]

        # Log based on severity
        log_message = f"[{error_code}] {message}"
        if error_context:
            log_message += f" | Context: {error_context}"

        if severity == ErrorSeverity.CRITICAL:
            logger.critical(log_message)
        elif severity == ErrorSeverity.HIGH:
            logger.error(log_message)
        elif severity == ErrorSeverity.MEDIUM:
            logger.warning(log_message)
        else:
            logger.info(log_message)

        # Update health status
        self._update_health_status(severity, category)

        return error_id

    def log_performance(
        self,
        operation: str,
        execution_time: float,
        success: bool,
        context: Optional[Dict[str, Any]] = None,
    ):
        """
        Log performance metrics for operations.

        Args:
            operation: The operation name
            execution_time: Execution time in milliseconds
            success: Whether the operation was successful
            context: Additional context information
        """
        performance_record = {
            "timestamp": time.time(),
            "operation": operation,
            "execution_time": execution_time,
            "success": success,
            "context": context or {},
        }

        self.performance_log.append(performance_record)

        # Check if operation was slow
        threshold = self.performance_thresholds.get(operation, 1000.0)
        if execution_time > threshold:
            slow_record = performance_record.copy()
            slow_record["threshold"] = threshold
            self.slow_operations.append(slow_record)

            logger.warning(
                f"Slow operation detected: {operation} took {execution_time:.2f}ms "
                f"(threshold: {threshold:.2f}ms)"
            )

        # Trim performance logs
        if len(self.performance_log) > 5000:
            self.performance_log = self.performance_log[-2500:]

        if len(self.slow_operations) > 500:
            self.slow_operations = self.slow_operations[-250:]

    def _classify_error(self, error: Exception) -> ErrorCategory:
        """Classify an error into a category."""
        error_type = type(error).__name__.lower()
        error_message = str(error).lower()

        if any(
            keyword in error_type or keyword in error_message
            for keyword in ["validation", "value", "type", "attribute"]
        ):
            return ErrorCategory.VALIDATION

        elif any(
            keyword in error_type or keyword in error_message
            for keyword in ["translation", "parse", "syntax", "command"]
        ):
            return ErrorCategory.TRANSLATION

        elif any(
            keyword in error_type or keyword in error_message
            for keyword in ["execution", "runtime", "timeout", "memory"]
        ):
            return ErrorCategory.EXECUTION

        elif any(
            keyword in error_type or keyword in error_message
            for keyword in [
                "connection",
                "network",
                "http",
                "websocket",
                "communication",
            ]
        ):
            return ErrorCategory.COMMUNICATION

        elif any(
            keyword in error_type or keyword in error_message
            for keyword in ["performance", "slow", "timeout", "resource"]
        ):
            return ErrorCategory.PERFORMANCE

        elif any(
            keyword in error_type or keyword in error_message
            for keyword in ["security", "permission", "access", "unauthorized"]
        ):
            return ErrorCategory.SECURITY

        else:
            return ErrorCategory.SYSTEM

    def _determine_severity(
        self, error: Exception, category: ErrorCategory
    ) -> ErrorSeverity:
        """Determine the severity of an error."""
        error_type = type(error).__name__.lower()
        error_message = str(error).lower()

        # Critical errors
        if any(
            keyword in error_message
            for keyword in ["fatal", "critical", "crash", "system", "memory", "disk"]
        ):
            return ErrorSeverity.CRITICAL

        # High severity errors
        elif any(
            keyword in error_type
            for keyword in ["timeout", "connection", "permission", "security"]
        ):
            return ErrorSeverity.HIGH

        # Medium severity errors
        elif category in [ErrorCategory.EXECUTION, ErrorCategory.TRANSLATION]:
            return ErrorSeverity.MEDIUM

        # Low severity errors
        else:
            return ErrorSeverity.LOW

    def _generate_error_code(self, error: Exception, category: ErrorCategory) -> str:
        """Generate a unique error code."""
        error_type = type(error).__name__.upper()
        category_code = category.value.upper()
        timestamp = int(time.time()) % 10000

        return f"{category_code}_{error_type}_{timestamp}"

    def _update_health_status(self, severity: ErrorSeverity, category: ErrorCategory):
        """Update system health status based on errors."""
        current_time = time.time()

        # Update component health
        component_name = category.value
        if component_name not in self.health_status["components"]:
            self.health_status["components"][component_name] = {
                "status": "healthy",
                "last_error": None,
                "error_count": 0,
            }

        component = self.health_status["components"][component_name]
        component["last_error"] = current_time
        component["error_count"] += 1

        # Determine component status
        if severity == ErrorSeverity.CRITICAL:
            component["status"] = "critical"
        elif severity == ErrorSeverity.HIGH and component["error_count"] > 5:
            component["status"] = "degraded"
        elif severity == ErrorSeverity.MEDIUM and component["error_count"] > 10:
            component["status"] = "warning"

        # Update overall health
        component_statuses = [
            comp["status"] for comp in self.health_status["components"].values()
        ]

        if "critical" in component_statuses:
            self.health_status["overall"] = "critical"
        elif "degraded" in component_statuses:
            self.health_status["overall"] = "degraded"
        elif "warning" in component_statuses:
            self.health_status["overall"] = "warning"
        else:
            self.health_status["overall"] = "healthy"

        self.health_status["last_check"] = current_time

    def get_error_statistics(self) -> Dict[str, Any]:
        """Get comprehensive error statistics."""
        current_time = time.time()
        recent_cutoff = current_time - 3600  # Last hour

        # Recent errors
        recent_errors = [
            e for e in self.recent_errors if e["timestamp"] > recent_cutoff
        ]

        # Error counts by category and severity
        category_counts = {}
        severity_counts = {}

        for error in recent_errors:
            category = error["category"]
            severity = error["severity"]

            category_counts[category] = category_counts.get(category, 0) + 1
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        return {
            "total_errors": len(self.error_log),
            "recent_errors": len(recent_errors),
            "error_counts": self.error_counts,
            "category_counts": category_counts,
            "severity_counts": severity_counts,
            "health_status": self.health_status,
            "performance_stats": {
                "total_operations": len(self.performance_log),
                "slow_operations": len(self.slow_operations),
                "average_execution_time": self._calculate_average_execution_time(),
            },
        }

    def _calculate_average_execution_time(self) -> float:
        """Calculate average execution time from performance log."""
        if not self.performance_log:
            return 0.0

        total_time = sum(record["execution_time"] for record in self.performance_log)
        return total_time / len(self.performance_log)

    def get_recent_errors(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent errors."""
        return self.recent_errors[-limit:] if self.recent_errors else []

    def get_slow_operations(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent slow operations."""
        return self.slow_operations[-limit:] if self.slow_operations else []

    def clear_error_logs(self):
        """Clear all error logs."""
        self.error_log.clear()
        self.recent_errors.clear()
        self.error_counts.clear()
        logger.info("Error logs cleared")

    def clear_performance_logs(self):
        """Clear all performance logs."""
        self.performance_log.clear()
        self.slow_operations.clear()
        logger.info("Performance logs cleared")

    def perform_health_check(self) -> Dict[str, Any]:
        """Perform a comprehensive health check."""
        current_time = time.time()
        uptime = current_time - self.health_status["uptime"]

        # Check recent error rate
        recent_errors = [
            e for e in self.recent_errors if e["timestamp"] > current_time - 300
        ]  # Last 5 minutes
        error_rate = len(recent_errors) / 5.0  # Errors per minute

        # Check performance
        recent_performance = [
            p for p in self.performance_log if p["timestamp"] > current_time - 300
        ]
        avg_performance = self._calculate_average_execution_time()

        health_status = {
            "overall": self.health_status["overall"],
            "uptime": uptime,
            "error_rate_per_minute": error_rate,
            "average_execution_time": avg_performance,
            "components": self.health_status["components"],
            "last_check": current_time,
            "recommendations": self._generate_health_recommendations(
                error_rate, avg_performance
            ),
        }

        return health_status

    def _generate_health_recommendations(
        self, error_rate: float, avg_performance: float
    ) -> List[str]:
        """Generate health recommendations based on metrics."""
        recommendations = []

        if error_rate > 10:
            recommendations.append(
                "High error rate detected. Check system logs and consider restart."
            )

        if avg_performance > 2000:
            recommendations.append(
                "Performance degradation detected. Consider optimizing operations."
            )

        if self.health_status["overall"] == "critical":
            recommendations.append(
                "Critical errors detected. Immediate attention required."
            )

        if len(self.slow_operations) > 50:
            recommendations.append(
                "Many slow operations detected. Consider performance tuning."
            )

        if not recommendations:
            recommendations.append("System is operating normally.")

        return recommendations


def error_handler(
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    operation: Optional[str] = None,
):
    """
    Decorator for automatic error handling and logging.

    Args:
        category: Error category for classification
        severity: Default severity level
        operation: Operation name for logging
    """

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            handler = ErrorHandler()
            start_time = time.perf_counter()

            try:
                result = await func(*args, **kwargs)
                execution_time = (time.perf_counter() - start_time) * 1000

                handler.log_performance(
                    operation or func.__name__,
                    execution_time,
                    True,
                    {"function": func.__name__, "args_count": len(args)},
                )

                return result

            except Exception as e:
                execution_time = (time.perf_counter() - start_time) * 1000

                # Log performance even for failed operations
                handler.log_performance(
                    operation or func.__name__,
                    execution_time,
                    False,
                    {"function": func.__name__, "error": str(e)},
                )

                # Log error
                error_id = handler.log_error(
                    e,
                    context={
                        "function": func.__name__,
                        "execution_time": execution_time,
                    },
                    operation=operation or func.__name__,
                )

                # Re-raise as BridgeError
                raise BridgeError(
                    message=f"Error in {func.__name__}: {str(e)}",
                    category=category,
                    severity=severity,
                    error_code=error_id,
                    context={"original_error": str(e), "function": func.__name__},
                )

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            handler = ErrorHandler()
            start_time = time.perf_counter()

            try:
                result = func(*args, **kwargs)
                execution_time = (time.perf_counter() - start_time) * 1000

                handler.log_performance(
                    operation or func.__name__,
                    execution_time,
                    True,
                    {"function": func.__name__, "args_count": len(args)},
                )

                return result

            except Exception as e:
                execution_time = (time.perf_counter() - start_time) * 1000

                # Log performance even for failed operations
                handler.log_performance(
                    operation or func.__name__,
                    execution_time,
                    False,
                    {"function": func.__name__, "error": str(e)},
                )

                # Log error
                error_id = handler.log_error(
                    e,
                    context={
                        "function": func.__name__,
                        "execution_time": execution_time,
                    },
                    operation=operation or func.__name__,
                )

                # Re-raise as BridgeError
                raise BridgeError(
                    message=f"Error in {func.__name__}: {str(e)}",
                    category=category,
                    severity=severity,
                    error_code=error_id,
                    context={"original_error": str(e), "function": func.__name__},
                )

        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


if __name__ == "__main__":
    # Test the error handler
    handler = ErrorHandler()

    print("Error Handler Test")
    print("=" * 50)

    # Test error logging
    try:
        raise ValueError("Test validation error")
    except Exception as e:
        error_id = handler.log_error(
            e, context={"test": True}, operation="test_operation"
        )
        print(f"Logged error with ID: {error_id}")

    # Test performance logging
    handler.log_performance("test_operation", 1500.0, True, {"test": True})
    handler.log_performance("slow_operation", 2500.0, False, {"test": True})

    # Test health check
    health = handler.perform_health_check()
    print(f"\nHealth Status: {health['overall']}")
    print(f"Error Rate: {health['error_rate_per_minute']:.2f} errors/minute")
    print(f"Recommendations: {health['recommendations']}")

    # Test statistics
    stats = handler.get_error_statistics()
    print(f"\nError Statistics:")
    print(f"  Total Errors: {stats['total_errors']}")
    print(f"  Recent Errors: {stats['recent_errors']}")
    print(f"  Health Status: {stats['health_status']['overall']}")

    print("\n✅ Error Handler test completed!")
