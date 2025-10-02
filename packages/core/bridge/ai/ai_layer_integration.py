"""
AI Layer Integration Module

This module provides comprehensive integration between the AI layer and the bridge system,
enabling real-time interaction, context-aware command execution, and intelligent feedback loops.
"""

import asyncio
import json
import time
from abc import ABC, abstractmethod
from collections import deque
from dataclasses import asdict, dataclass
from enum import Enum
from typing import Any, AsyncGenerator, Callable, Dict, List, Optional, Union

import aiohttp
import websockets
from loguru import logger

from bridge.core.error_handler import (
    BridgeError,
    ErrorCategory,
    ErrorHandler,
    ErrorSeverity,
)
from bridge.core.settings import get_settings


class AIInteractionType(Enum):
    """Types of AI interactions."""

    COMMAND_EXECUTION = "command_execution"
    CODE_GENERATION = "code_generation"
    DEBUGGING = "debugging"
    EXPLANATION = "explanation"
    INTERACTIVE_SESSION = "interactive_session"
    BATCH_PROCESSING = "batch_processing"


class AIInteractionStatus(Enum):
    """Status of AI interactions."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AIInteraction:
    """Represents an AI interaction session."""

    interaction_id: str
    interaction_type: AIInteractionType
    status: AIInteractionStatus
    created_at: float
    updated_at: float

    # Core data
    prompt: str
    context: Dict[str, Any]

    # AI processing
    ai_response: Optional[str] = None
    translated_commands: Optional[List[str]] = None
    execution_results: Optional[List[Dict[str, Any]]] = None

    # Feedback and learning
    feedback: Optional[str] = None
    confidence_score: Optional[float] = None
    error_message: Optional[str] = None

    # Performance metrics
    ai_processing_time: Optional[float] = None
    translation_time: Optional[float] = None
    execution_time: Optional[float] = None
    total_time: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)

    def update_status(self, status: AIInteractionStatus, **kwargs):
        """Update interaction status and metadata."""
        self.status = status
        self.updated_at = time.time()

        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)


class AIContextManager:
    """Manages AI interaction context and history."""

    def __init__(self, max_context_size: int = 1000):
        """Initialize context manager."""
        self.max_context_size = max_context_size
        self.context_history = deque(maxlen=max_context_size)
        self.current_context = {}

        # Context templates
        self.context_templates = {
            "emulator_state": {
                "cpu_state": {},
                "memory_state": {},
                "program_state": {},
                "execution_history": [],
            },
            "ai_session": {
                "session_id": None,
                "conversation_history": [],
                "command_history": [],
                "error_history": [],
                "learning_feedback": [],
            },
            "user_preferences": {
                "preferred_ai_provider": "gpt-4",
                "explanation_depth": "detailed",
                "code_style": "readable",
                "debugging_level": "comprehensive",
            },
        }

    def update_context(self, context_type: str, data: Dict[str, Any]):
        """Update specific context type."""
        if context_type not in self.current_context:
            self.current_context[context_type] = {}

        self.current_context[context_type].update(data)

        # Store in history
        self.context_history.append(
            {"timestamp": time.time(), "context_type": context_type, "data": data}
        )

    def get_context(self, context_type: Optional[str] = None) -> Dict[str, Any]:
        """Get context data."""
        if context_type:
            return self.current_context.get(context_type, {})
        return self.current_context.copy()

    def get_context_summary(self, max_entries: int = 10) -> Dict[str, Any]:
        """Get context summary for AI consumption."""
        return {
            "current_context": self.current_context,
            "recent_history": list(self.context_history)[-max_entries:],
            "context_size": len(self.context_history),
        }

    def clear_context(self, context_type: Optional[str] = None):
        """Clear context data."""
        if context_type:
            self.current_context.pop(context_type, None)
        else:
            self.current_context.clear()


class AICommandExecutor:
    """Executes AI-generated commands through the bridge."""

    def __init__(self, bridge_url: str = "http://localhost:8000"):
        """Initialize command executor."""
        self.bridge_url = bridge_url
        self.session = None
        self.error_handler = ErrorHandler()

        # Command execution tracking
        self.execution_history = deque(maxlen=1000)
        self.active_executions = {}

        # Performance tracking
        self.stats = {
            "total_commands": 0,
            "successful_commands": 0,
            "failed_commands": 0,
            "average_execution_time": 0.0,
            "total_execution_time": 0.0,
        }

    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()

    async def execute_command(
        self, command: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a single command through the bridge."""
        start_time = time.perf_counter()
        execution_id = f"exec_{int(time.time())}_{len(self.execution_history)}"

        try:
            logger.info(f"Executing command: {command[:100]}...")

            # Prepare request
            request_data = {
                "command": command,
                "source": "ai_layer",
                "priority": context.get("priority", 5) if context else 5,
                "context": context or {},
            }

            # Execute command via bridge API
            async with self.session.post(
                f"{self.bridge_url}/command",
                json=request_data,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:

                if response.status == 200:
                    result = await response.json()

                    # Calculate execution time
                    execution_time = (time.perf_counter() - start_time) * 1000

                    # Create execution record
                    execution_record = {
                        "execution_id": execution_id,
                        "command": command,
                        "success": result.get("success", False),
                        "output": result.get("output", ""),
                        "execution_time": execution_time,
                        "timestamp": time.time(),
                        "context": context,
                    }

                    # Update statistics
                    self._update_stats(execution_time, result.get("success", False))

                    # Store in history
                    self.execution_history.append(execution_record)

                    logger.info(f"✅ Command executed in {execution_time:.2f}ms")
                    return execution_record

                else:
                    error_text = await response.text()
                    raise BridgeError(
                        message=f"Bridge API error: {response.status} - {error_text}",
                        category=ErrorCategory.COMMUNICATION,
                        severity=ErrorSeverity.MEDIUM,
                    )

        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000

            error_record = {
                "execution_id": execution_id,
                "command": command,
                "success": False,
                "error": str(e),
                "execution_time": execution_time,
                "timestamp": time.time(),
                "context": context,
            }

            self._update_stats(execution_time, False)
            self.execution_history.append(error_record)

            logger.error(f"❌ Command execution failed: {e}")
            return error_record

    async def execute_commands(
        self,
        commands: List[str],
        context: Optional[Dict[str, Any]] = None,
        sequential: bool = True,
    ) -> List[Dict[str, Any]]:
        """Execute multiple commands."""
        results = []

        if sequential:
            # Execute commands sequentially
            for command in commands:
                result = await self.execute_command(command, context)
                results.append(result)

                # Stop on failure if configured
                if not result["success"] and context.get("stop_on_error", True):
                    break
        else:
            # Execute commands concurrently
            tasks = [self.execute_command(command, context) for command in commands]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Convert exceptions to error records
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    results[i] = {
                        "execution_id": f"exec_error_{i}",
                        "command": commands[i],
                        "success": False,
                        "error": str(result),
                        "execution_time": 0.0,
                        "timestamp": time.time(),
                        "context": context,
                    }

        return results

    def get_execution_statistics(self) -> Dict[str, Any]:
        """Get execution statistics."""
        return {
            "stats": self.stats,
            "recent_executions": list(self.execution_history)[-10:],
            "history_size": len(self.execution_history),
        }

    def _update_stats(self, execution_time: float, success: bool):
        """Update execution statistics."""
        self.stats["total_commands"] += 1
        self.stats["total_execution_time"] += execution_time

        if success:
            self.stats["successful_commands"] += 1
        else:
            self.stats["failed_commands"] += 1

        # Update average
        self.stats["average_execution_time"] = (
            self.stats["total_execution_time"] / self.stats["total_commands"]
        )


class AIWebSocketClient:
    """WebSocket client for real-time AI interaction with bridge."""

    def __init__(self, bridge_ws_url: str = "ws://localhost:8000/ws"):
        """Initialize WebSocket client."""
        self.bridge_ws_url = bridge_ws_url
        self.websocket = None
        self.connected = False
        self.message_queue = deque(maxlen=1000)
        self.subscribers = []

        # Connection management
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self.reconnect_delay = 1.0

        # Message tracking
        self.message_id_counter = 0
        self.pending_responses = {}

        logger.info("AI WebSocket Client initialized")

    async def connect(self) -> bool:
        """Connect to bridge WebSocket."""
        try:
            logger.info(f"Connecting to bridge WebSocket: {self.bridge_ws_url}")

            self.websocket = await websockets.connect(
                self.bridge_ws_url, ping_interval=30, ping_timeout=10
            )

            self.connected = True
            self.reconnect_attempts = 0

            logger.info("✅ Connected to bridge WebSocket")

            # Start message handling
            asyncio.create_task(self._handle_messages())

            return True

        except Exception as e:
            logger.error(f"❌ WebSocket connection failed: {e}")
            await self._handle_reconnect()
            return False

    async def disconnect(self):
        """Disconnect from WebSocket."""
        self.connected = False

        if self.websocket:
            await self.websocket.close()
            self.websocket = None

        logger.info("Disconnected from bridge WebSocket")

    async def send_command(
        self,
        command: str,
        context: Optional[Dict[str, Any]] = None,
        wait_for_response: bool = True,
        timeout: float = 30.0,
    ) -> Optional[Dict[str, Any]]:
        """Send command via WebSocket."""
        if not self.connected or not self.websocket:
            raise BridgeError(
                message="WebSocket not connected",
                category=ErrorCategory.COMMUNICATION,
                severity=ErrorSeverity.MEDIUM,
            )

        try:
            # Generate message ID
            message_id = f"msg_{self.message_id_counter}"
            self.message_id_counter += 1

            # Prepare message
            message = {
                "command": command,
                "source": "ai_layer",
                "priority": context.get("priority", 5) if context else 5,
                "context": context or {},
                "message_id": message_id,
                "timestamp": time.time(),
            }

            # Send message
            await self.websocket.send(json.dumps(message))

            # Store in queue
            self.message_queue.append(
                {
                    "message_id": message_id,
                    "command": command,
                    "timestamp": time.time(),
                    "status": "sent",
                }
            )

            logger.debug(f"Sent command via WebSocket: {command[:50]}...")

            if wait_for_response:
                # Wait for response
                return await self._wait_for_response(message_id, timeout)
            else:
                return {"message_id": message_id, "status": "sent"}

        except Exception as e:
            logger.error(f"❌ WebSocket send failed: {e}")
            raise BridgeError(
                message=f"WebSocket send failed: {e}",
                category=ErrorCategory.COMMUNICATION,
                severity=ErrorSeverity.MEDIUM,
            )

    async def subscribe_to_outputs(self, callback: Callable[[Dict[str, Any]], None]):
        """Subscribe to real-time outputs."""
        self.subscribers.append(callback)
        logger.info(
            f"Added output subscriber. Total subscribers: {len(self.subscribers)}"
        )

    async def unsubscribe_from_outputs(
        self, callback: Callable[[Dict[str, Any]], None]
    ):
        """Unsubscribe from real-time outputs."""
        if callback in self.subscribers:
            self.subscribers.remove(callback)
            logger.info(
                f"Removed output subscriber. Total subscribers: {len(self.subscribers)}"
            )

    async def _handle_messages(self):
        """Handle incoming WebSocket messages."""
        try:
            async for message in self.websocket:
                try:
                    data = json.loads(message)
                    await self._process_message(data)
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON message: {e}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")

        except websockets.exceptions.ConnectionClosed:
            logger.warning("WebSocket connection closed")
            self.connected = False
            await self._handle_reconnect()
        except Exception as e:
            logger.error(f"WebSocket message handling error: {e}")
            self.connected = False

    async def _process_message(self, data: Dict[str, Any]):
        """Process incoming message."""
        message_type = data.get("type", "unknown")

        if message_type == "command_response":
            # Handle command response
            message_id = data.get("message_id")
            if message_id and message_id in self.pending_responses:
                future = self.pending_responses.pop(message_id)
                if not future.done():
                    future.set_result(data)

        elif message_type == "emulator_output":
            # Handle emulator output
            await self._notify_subscribers(data)

        else:
            logger.debug(f"Unknown message type: {message_type}")

    async def _wait_for_response(
        self, message_id: str, timeout: float
    ) -> Dict[str, Any]:
        """Wait for response to specific message."""
        future = asyncio.Future()
        self.pending_responses[message_id] = future

        try:
            response = await asyncio.wait_for(future, timeout=timeout)
            return response
        except asyncio.TimeoutError:
            self.pending_responses.pop(message_id, None)
            raise BridgeError(
                message=f"Response timeout for message {message_id}",
                category=ErrorCategory.TIMEOUT,
                severity=ErrorSeverity.MEDIUM,
            )

    async def _notify_subscribers(self, data: Dict[str, Any]):
        """Notify all subscribers of output data."""
        for callback in self.subscribers:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(data)
                else:
                    callback(data)
            except Exception as e:
                logger.error(f"Subscriber callback error: {e}")

    async def _handle_reconnect(self):
        """Handle WebSocket reconnection."""
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Max reconnection attempts reached")
            return

        self.reconnect_attempts += 1
        delay = self.reconnect_delay * (2 ** (self.reconnect_attempts - 1))

        logger.info(f"Reconnecting in {delay}s (attempt {self.reconnect_attempts})")
        await asyncio.sleep(delay)

        await self.connect()


class AILayerIntegration:
    """Main AI layer integration class."""

    def __init__(self):
        """Initialize AI layer integration."""
        self.settings = get_settings()
        self.error_handler = ErrorHandler()

        # Core components
        self.context_manager = AIContextManager()
        self.command_executor = AICommandExecutor()
        self.websocket_client = AIWebSocketClient()

        # Interaction management
        self.active_interactions = {}
        self.interaction_history = deque(maxlen=1000)

        # AI processing
        self.ai_session = None
        self.processing_queue = asyncio.Queue(maxsize=100)

        # Performance tracking
        self.stats = {
            "total_interactions": 0,
            "successful_interactions": 0,
            "failed_interactions": 0,
            "average_interaction_time": 0.0,
            "total_interaction_time": 0.0,
            "websocket_connected": False,
            "last_activity": None,
        }

        # Initialize AI session
        self._initialize_ai_session()

        logger.info("AI Layer Integration initialized")

    def _initialize_ai_session(self):
        """Initialize AI session configuration."""
        self.ai_session = {
            "session_id": f"ai_session_{int(time.time())}",
            "start_time": time.time(),
            "interaction_count": 0,
            "last_interaction": None,
            "preferences": self.settings.ai.get("preferences", {}),
        }

        # Update context with session info
        self.context_manager.update_context("ai_session", self.ai_session)

    async def start(self):
        """Start AI layer integration."""
        try:
            logger.info("Starting AI Layer Integration...")

            # Connect WebSocket
            ws_connected = await self.websocket_client.connect()
            self.stats["websocket_connected"] = ws_connected

            # Start processing queue
            asyncio.create_task(self._process_interaction_queue())

            # Subscribe to outputs
            await self.websocket_client.subscribe_to_outputs(self._handle_output)

            logger.info("✅ AI Layer Integration started successfully")

        except Exception as e:
            logger.error(f"❌ Failed to start AI Layer Integration: {e}")
            raise

    async def stop(self):
        """Stop AI layer integration."""
        try:
            logger.info("Stopping AI Layer Integration...")

            # Disconnect WebSocket
            await self.websocket_client.disconnect()

            # Close command executor session
            if (
                hasattr(self.command_executor, "session")
                and self.command_executor.session
            ):
                await self.command_executor.session.close()

            logger.info("✅ AI Layer Integration stopped")

        except Exception as e:
            logger.error(f"❌ Error stopping AI Layer Integration: {e}")

    async def create_interaction(
        self,
        prompt: str,
        interaction_type: AIInteractionType = AIInteractionType.COMMAND_EXECUTION,
        context: Optional[Dict[str, Any]] = None,
    ) -> AIInteraction:
        """Create a new AI interaction."""
        interaction_id = f"int_{int(time.time())}_{len(self.active_interactions)}"

        interaction = AIInteraction(
            interaction_id=interaction_id,
            interaction_type=interaction_type,
            status=AIInteractionStatus.PENDING,
            created_at=time.time(),
            updated_at=time.time(),
            prompt=prompt,
            context=context or {},
        )

        # Store interaction
        self.active_interactions[interaction_id] = interaction

        # Add to processing queue
        await self.processing_queue.put(interaction)

        logger.info(f"Created AI interaction: {interaction_id}")
        return interaction

    async def execute_interaction(self, interaction: AIInteraction) -> AIInteraction:
        """Execute an AI interaction."""
        start_time = time.perf_counter()

        try:
            logger.info(f"Executing interaction: {interaction.interaction_id}")

            # Update status
            interaction.update_status(AIInteractionStatus.IN_PROGRESS)

            # Step 1: Send to AI provider
            ai_start = time.perf_counter()
            ai_result = await self._send_to_ai_provider(interaction)
            ai_time = (time.perf_counter() - ai_start) * 1000

            if not ai_result["success"]:
                interaction.update_status(
                    AIInteractionStatus.FAILED,
                    error_message=ai_result.get("error", "AI provider failed"),
                    ai_processing_time=ai_time,
                )
                return interaction

            # Step 2: Translate commands
            translation_start = time.perf_counter()
            translation_result = await self._translate_commands(
                interaction, ai_result["response"]
            )
            translation_time = (time.perf_counter() - translation_start) * 1000

            if not translation_result["success"]:
                interaction.update_status(
                    AIInteractionStatus.FAILED,
                    error_message=translation_result.get("error", "Translation failed"),
                    ai_processing_time=ai_time,
                    translation_time=translation_time,
                )
                return interaction

            # Step 3: Execute commands
            execution_start = time.perf_counter()
            execution_results = await self._execute_commands(
                interaction, translation_result["commands"]
            )
            execution_time = (time.perf_counter() - execution_start) * 1000

            # Calculate total time
            total_time = (time.perf_counter() - start_time) * 1000

            # Update interaction
            interaction.update_status(
                AIInteractionStatus.COMPLETED,
                ai_response=ai_result["response"],
                translated_commands=translation_result["commands"],
                execution_results=execution_results,
                ai_processing_time=ai_time,
                translation_time=translation_time,
                execution_time=execution_time,
                total_time=total_time,
                confidence_score=ai_result.get("confidence", 0.5),
            )

            # Update statistics
            self._update_stats(total_time, True)

            logger.info(f"✅ Interaction completed in {total_time:.2f}ms")
            return interaction

        except Exception as e:
            total_time = (time.perf_counter() - start_time) * 1000

            interaction.update_status(
                AIInteractionStatus.FAILED, error_message=str(e), total_time=total_time
            )

            self._update_stats(total_time, False)

            logger.error(f"❌ Interaction failed: {e}")
            return interaction

        finally:
            # Move to history
            if interaction.interaction_id in self.active_interactions:
                del self.active_interactions[interaction.interaction_id]

            self.interaction_history.append(interaction)

    async def _send_to_ai_provider(self, interaction: AIInteraction) -> Dict[str, Any]:
        """Send prompt to AI provider."""
        try:
            # Prepare context for AI
            context = self.context_manager.get_context_summary()
            context.update(interaction.context)

            # Use bridge AI processing
            async with aiohttp.ClientSession() as session:
                request_data = {
                    "prompt": interaction.prompt,
                    "model": "gpt-4",
                    "context": context,
                }

                async with session.post(
                    "http://localhost:8000/ai/process",
                    json=request_data,
                    timeout=aiohttp.ClientTimeout(total=60),
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        return result
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"AI provider error: {response.status} - {error_text}",
                        }

        except Exception as e:
            return {"success": False, "error": f"AI provider communication failed: {e}"}

    async def _translate_commands(
        self, interaction: AIInteraction, ai_response: str
    ) -> Dict[str, Any]:
        """Translate AI response to commands."""
        try:
            # Use bridge translation
            async with aiohttp.ClientSession() as session:
                request_data = {
                    "ai_command": ai_response,
                    "context": interaction.context,
                }

                async with session.post(
                    "http://localhost:8000/ai/translate",
                    json=request_data,
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        return result
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"Translation error: {response.status} - {error_text}",
                        }

        except Exception as e:
            return {"success": False, "error": f"Translation communication failed: {e}"}

    async def _execute_commands(
        self, interaction: AIInteraction, commands: List[str]
    ) -> List[Dict[str, Any]]:
        """Execute translated commands."""
        results = []

        async with self.command_executor as executor:
            for command in commands:
                result = await executor.execute_command(command, interaction.context)
                results.append(result)

                # Update context with execution result
                if result["success"]:
                    self.context_manager.update_context(
                        "emulator_state",
                        {
                            "last_command": command,
                            "last_output": result["output"],
                            "execution_time": result["execution_time"],
                        },
                    )

        return results

    async def _process_interaction_queue(self):
        """Process interaction queue."""
        while True:
            try:
                interaction = await self.processing_queue.get()
                await self.execute_interaction(interaction)
                self.processing_queue.task_done()
            except Exception as e:
                logger.error(f"Error processing interaction: {e}")

    async def _handle_output(self, output_data: Dict[str, Any]):
        """Handle real-time output from bridge."""
        try:
            # Update context with output
            self.context_manager.update_context(
                "emulator_state",
                {"last_output": output_data, "output_timestamp": time.time()},
            )

            # Update statistics
            self.stats["last_activity"] = time.time()

            logger.debug(f"Received output: {output_data.get('type', 'unknown')}")

        except Exception as e:
            logger.error(f"Error handling output: {e}")

    def get_interaction(self, interaction_id: str) -> Optional[AIInteraction]:
        """Get interaction by ID."""
        return self.active_interactions.get(interaction_id)

    def get_interaction_history(self, limit: int = 50) -> List[AIInteraction]:
        """Get interaction history."""
        return list(self.interaction_history)[-limit:]

    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics."""
        return {
            "stats": self.stats,
            "active_interactions": len(self.active_interactions),
            "interaction_history_size": len(self.interaction_history),
            "context_summary": self.context_manager.get_context_summary(),
            "websocket_status": {
                "connected": self.websocket_client.connected,
                "message_queue_size": len(self.websocket_client.message_queue),
                "subscribers": len(self.websocket_client.subscribers),
            },
            "command_executor_stats": self.command_executor.get_execution_statistics(),
        }

    def _update_stats(self, interaction_time: float, success: bool):
        """Update interaction statistics."""
        self.stats["total_interactions"] += 1
        self.stats["total_interaction_time"] += interaction_time
        self.stats["last_activity"] = time.time()

        if success:
            self.stats["successful_interactions"] += 1
        else:
            self.stats["failed_interactions"] += 1

        # Update average
        self.stats["average_interaction_time"] = (
            self.stats["total_interaction_time"] / self.stats["total_interactions"]
        )


if __name__ == "__main__":
    # Test the AI layer integration
    import asyncio

    async def test_ai_integration():
        integration = AILayerIntegration()

        try:
            await integration.start()

            # Create test interaction
            interaction = await integration.create_interaction(
                "Print hello world and calculate 5 + 3",
                AIInteractionType.COMMAND_EXECUTION,
            )

            # Execute interaction
            result = await integration.execute_interaction(interaction)

            print(f"Interaction result: {result.status.value}")
            print(f"Total time: {result.total_time:.2f}ms")

            # Get statistics
            stats = integration.get_statistics()
            print(f"Statistics: {stats}")

        finally:
            await integration.stop()

    # Run test
    asyncio.run(test_ai_integration())
