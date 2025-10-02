#!/usr/bin/env python3
"""
AI Vintage OS - Bridge Server

This module implements the core bridge functionality that connects the frontend UI,
AI layer, and 6502 emulator. It handles input processing, command translation,
and output capture for seamless communication between all system layers.
"""

import asyncio
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pydantic import BaseModel, Field

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.ai.ai_command_sender import AICommandSender  # noqa: E402
from bridge.ai.ai_layer_integration import AILayerIntegration  # noqa: E402
from bridge.core.settings import get_settings  # noqa: E402
from bridge.output.bridge_output_handler import (  # noqa: E402
    BridgeOutputHandler,
    OutputSeverity,
    OutputType,
)
from bridge.translators.ai_command_translator import AICommandTranslator  # noqa: E402
from engine.basic_m6502 import BASICM6502Engine  # noqa: E402
from engine.emulator.m6502_emulator import M6502Emulator  # noqa: E402


class CommandRequest(BaseModel):
    """Request model for command execution."""

    command: str = Field(..., description="The command to execute")
    source: str = Field(
        default="frontend", description="Source of the command (frontend, ai, manual)"
    )
    priority: int = Field(
        default=1, description="Command priority (1-10, higher = more priority)"
    )
    timeout: Optional[int] = Field(
        default=None, description="Custom timeout in seconds"
    )
    context: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional context data"
    )


class CommandResponse(BaseModel):
    """Response model for command execution."""

    success: bool = Field(..., description="Whether the command was successful")
    result: Optional[Any] = Field(default=None, description="Command execution result")
    output: Optional[str] = Field(
        default=None, description="Text output from the command"
    )
    error: Optional[str] = Field(
        default=None, description="Error message if command failed"
    )
    execution_time: float = Field(..., description="Execution time in milliseconds")
    timestamp: float = Field(..., description="Timestamp when command was executed")
    command_id: str = Field(
        ..., description="Unique identifier for this command execution"
    )


class AIRequest(BaseModel):
    """Request model for AI command processing."""

    prompt: str = Field(..., description="The AI prompt or command")
    model: Optional[str] = Field(default=None, description="Specific AI model to use")
    temperature: Optional[float] = Field(
        default=None, description="Temperature for AI response"
    )
    max_tokens: Optional[int] = Field(
        default=None, description="Maximum tokens in response"
    )
    context: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional context"
    )


class AIResponse(BaseModel):
    """Response model for AI command processing."""

    success: bool = Field(..., description="Whether the AI processing was successful")
    response: Optional[str] = Field(default=None, description="AI response text")
    commands: List[str] = Field(
        default_factory=list, description="Generated BASIC commands"
    )
    confidence: float = Field(default=0.0, description="Confidence score (0.0-1.0)")
    error: Optional[str] = Field(
        default=None, description="Error message if processing failed"
    )
    processing_time: float = Field(..., description="Processing time in milliseconds")


class BridgeServer:
    """Main bridge server class for AI Vintage OS communication layer."""

    def __init__(self):
        """Initialize the bridge server."""
        self.settings = get_settings()
        self.app = FastAPI(
            title="AI Vintage OS Bridge",
            description="Bridge server for AI Vintage OS communication layer",
            version="1.0.0",
        )

        # Initialize components
        self.emulator = M6502Emulator()
        self.basic_engine = BASICM6502Engine()
        self.ai_sender = AICommandSender()
        self.ai_translator = AICommandTranslator()
        self.output_handler = BridgeOutputHandler()
        self.ai_integration = AILayerIntegration()
        self.is_running = False
        self.connected_clients: List[WebSocket] = []

        # Command processing
        self.command_queue: List[CommandRequest] = []
        self.command_history: List[CommandResponse] = []
        self.current_command_id = 0

        # Performance tracking
        self.stats = {
            "commands_processed": 0,
            "ai_requests_processed": 0,
            "total_execution_time": 0.0,
            "average_execution_time": 0.0,
            "error_count": 0,
            "start_time": time.time(),
        }

        # Setup CORS and routes
        self._setup_cors()
        self._setup_routes()

        logger.info("Bridge server initialized")

    def _setup_cors(self):
        """Setup CORS middleware for cross-origin requests."""
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # In production, specify exact origins
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def _setup_routes(self):
        """Setup FastAPI routes."""

        @self.app.on_event("startup")
        async def startup_event():
            """Initialize components on startup."""
            await self.initialize()

        @self.app.on_event("shutdown")
        async def shutdown_event():
            """Cleanup on shutdown."""
            await self.shutdown()

        @self.app.get("/")
        async def root():
            """Root endpoint."""
            return {
                "message": "AI Vintage OS Bridge Server",
                "version": "1.0.0",
                "status": "running" if self.is_running else "stopped",
                "uptime": time.time() - self.stats["start_time"],
            }

        @self.app.get("/health")
        async def health_check():
            """Health check endpoint."""
            return {
                "status": "healthy",
                "components": {
                    "emulator": self.emulator is not None,
                    "basic_engine": self.basic_engine is not None,
                    "bridge_running": self.is_running,
                },
                "stats": self.stats,
            }

        @self.app.post("/command", response_model=CommandResponse)
        async def execute_command(request: CommandRequest):
            """Execute a command through the bridge."""
            return await self._execute_command(request)

        @self.app.post("/ai/process", response_model=AIResponse)
        async def process_ai_request(request: AIRequest):
            """Process an AI request and generate BASIC commands."""
            return await self._process_ai_request(request)

        @self.app.post("/ai/send-command")
        async def send_ai_command(request: AIRequest):
            """Send command directly to AI provider."""
            return await self._send_ai_command(request)

        @self.app.get("/emulator/status")
        async def get_emulator_status():
            """Get current emulator status."""
            if not self.emulator:
                raise HTTPException(status_code=500, detail="Emulator not initialized")

            return self.emulator.get_emulator_info()

        @self.app.get("/emulator/cpu")
        async def get_cpu_state():
            """Get current CPU state."""
            if not self.emulator:
                raise HTTPException(status_code=500, detail="Emulator not initialized")

            return self.emulator.get_cpu_state()

        @self.app.get("/emulator/memory")
        async def get_memory_dump(start_addr: int = 0x8000, length: int = 256):
            """Get memory dump from emulator."""
            if not self.emulator:
                raise HTTPException(status_code=500, detail="Emulator not initialized")

            return self.emulator.get_memory_dump(start_addr, length)

        @self.app.post("/emulator/reset")
        async def reset_emulator():
            """Reset the emulator."""
            if not self.emulator:
                raise HTTPException(status_code=500, detail="Emulator not initialized")

            success = self.emulator.reset_emulator()
            if success:
                return {"message": "Emulator reset successfully"}
            else:
                raise HTTPException(status_code=500, detail="Failed to reset emulator")

        @self.app.get("/history")
        async def get_command_history(limit: int = 100):
            """Get command execution history."""
            return {
                "history": self.command_history[-limit:],
                "total_commands": len(self.command_history),
            }

        @self.app.get("/stats")
        async def get_statistics():
            """Get bridge server statistics."""
            ai_stats = self.ai_sender.get_statistics()
            return {
                "stats": self.stats,
                "ai_stats": ai_stats,
                "uptime": time.time() - self.stats["start_time"],
                "connected_clients": len(self.connected_clients),
            }

        @self.app.get("/ai/providers")
        async def get_ai_providers():
            """Get available AI providers and their status."""
            providers_info = {}

            for provider_name in self.ai_sender.providers.keys():
                test_result = self.ai_sender.test_provider_connection(provider_name)
                providers_info[provider_name] = {
                    "available": True,
                    "test_result": test_result,
                }

            return {
                "providers": providers_info,
                "default_provider": self.settings.ai.default_provider,
                "fallback_provider": self.settings.ai.fallback_provider,
            }

        @self.app.get("/ai/history")
        async def get_ai_history(limit: int = 50):
            """Get AI request history."""
            return {
                "history": self.ai_sender.get_recent_requests(limit),
                "total_requests": len(self.ai_sender.request_history),
            }

        @self.app.post("/ai/translate")
        async def translate_ai_command(request: AIRequest):
            """Translate AI command to BASIC-M6502."""
            return await self._translate_ai_command(request)

        @self.app.get("/ai/translation/stats")
        async def get_translation_stats():
            """Get AI translation statistics."""
            return self.ai_translator.get_statistics()

        @self.app.get("/ai/translation/history")
        async def get_translation_history(limit: int = 50):
            """Get AI translation history."""
            return {
                "history": self.ai_translator.get_recent_translations(limit),
                "total_translations": len(self.ai_translator.translation_history),
            }

        @self.app.get("/output/recent")
        async def get_recent_outputs(limit: int = 50):
            """Get recent emulator outputs."""
            return {
                "outputs": self.output_handler.get_recent_outputs(limit),
                "total_outputs": len(self.output_handler.output_history),
            }

        @self.app.get("/output/stats")
        async def get_output_statistics():
            """Get output handler statistics."""
            return self.output_handler.get_output_statistics()

        @self.app.post("/output/test")
        async def test_output_processing(request: dict):
            """Test output processing with sample data."""
            return await self._test_output_processing(request)

        @self.app.post("/ai/interaction/create")
        async def create_ai_interaction(request: dict):
            """Create a new AI interaction."""
            return await self._create_ai_interaction(request)

        @self.app.get("/ai/interaction/{interaction_id}")
        async def get_ai_interaction(interaction_id: str):
            """Get AI interaction by ID."""
            return await self._get_ai_interaction(interaction_id)

        @self.app.post("/ai/interaction/{interaction_id}/execute")
        async def execute_ai_interaction(interaction_id: str):
            """Execute an AI interaction."""
            return await self._execute_ai_interaction(interaction_id)

        @self.app.get("/ai/integration/stats")
        async def get_ai_integration_stats():
            """Get AI integration statistics."""
            return self.ai_integration.get_statistics()

        @self.app.post("/ai/workflow/start")
        async def start_ai_workflow(request: dict):
            """Start an AI workflow."""
            return await self._start_ai_workflow(request)

        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            """WebSocket endpoint for real-time communication."""
            await websocket.accept()
            self.connected_clients.append(websocket)

            # Add to output handler for real-time output streaming
            self.output_handler.add_websocket_client(websocket)

            try:
                while True:
                    # Receive command from client
                    data = await websocket.receive_text()
                    command_data = json.loads(data)

                    # Process command
                    request = CommandRequest(**command_data)
                    response = await self._execute_command(request)

                    # Send response back
                    await websocket.send_text(response.json())

                    # Capture command output for real-time streaming
                    if response.success and response.output:
                        await self.output_handler.capture_output(
                            response.output,
                            OutputType.RESULT,
                            OutputSeverity.INFO,
                            {
                                "command": command_data.get("command", ""),
                                "response_id": response.response_id,
                            },
                        )

            except WebSocketDisconnect:
                self.connected_clients.remove(websocket)
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                if websocket in self.connected_clients:
                    self.connected_clients.remove(websocket)
            finally:
                self.output_handler.remove_websocket_client(websocket)

    async def initialize(self) -> bool:
        """Initialize the bridge server components."""
        try:
            logger.info("Initializing bridge server components...")

            # Initialize emulator
            if not self.emulator.initialize_emulator():
                logger.error("Failed to initialize emulator")
                return False

            logger.info("✅ Emulator initialized successfully")

            # Initialize BASIC engine
            if not self.basic_engine.initialize():
                logger.error("Failed to initialize BASIC engine")
                return False

            logger.info("✅ BASIC engine initialized successfully")

            # Initialize AI integration
            try:
                await self.ai_integration.start()
                logger.info("✅ AI integration initialized")
            except Exception as e:
                logger.warning(f"⚠️ AI integration initialization failed: {e}")
                # Continue without AI integration

            self.is_running = True
            logger.info("✅ Bridge server initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize bridge server: {e}")
            return False

    async def shutdown(self):
        """Shutdown the bridge server."""
        try:
            logger.info("Shutting down bridge server...")

            self.is_running = False

            # Close all WebSocket connections
            for client in self.connected_clients:
                await client.close()
            self.connected_clients.clear()

            # Reset emulator
            if self.emulator:
                self.emulator.reset_emulator()

            logger.info("✅ Bridge server shut down successfully")

        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

    async def _execute_command(self, request: CommandRequest) -> CommandResponse:
        """Execute a command through the bridge."""
        start_time = time.perf_counter()
        command_id = f"cmd_{self.current_command_id}_{int(time.time())}"
        self.current_command_id += 1

        try:
            logger.info(f"Executing command {command_id}: {request.command}")

            # Add to command queue
            self.command_queue.append(request)

            # Process the command based on source
            if request.source == "ai":
                result = await self._execute_ai_generated_command(request.command)
            else:
                result = await self._execute_direct_command(request.command)

            # Calculate execution time
            execution_time = (time.perf_counter() - start_time) * 1000

            # Create response
            response = CommandResponse(
                success=result.get("success", False),
                result=result.get("result"),
                output=result.get("output"),
                error=result.get("error"),
                execution_time=execution_time,
                timestamp=time.time(),
                command_id=command_id,
            )

            # Update statistics
            self._update_stats(execution_time, response.success)

            # Add to history
            self.command_history.append(response)

            # Remove from queue
            if request in self.command_queue:
                self.command_queue.remove(request)

            logger.info(f"✅ Command {command_id} executed in {execution_time:.2f}ms")
            return response

        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            error_response = CommandResponse(
                success=False,
                error=str(e),
                execution_time=execution_time,
                timestamp=time.time(),
                command_id=command_id,
            )

            self._update_stats(execution_time, False)
            self.command_history.append(error_response)

            logger.error(f"❌ Command {command_id} failed: {e}")
            return error_response

    async def _execute_direct_command(self, command: str) -> Dict[str, Any]:
        """Execute a direct command (from frontend or manual input)."""
        try:
            # Parse and execute the command through the emulator
            result = self.emulator.execute_basic_command(command)

            if result.get("success"):
                return {
                    "success": True,
                    "result": result,
                    "output": result.get("output", ""),
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Command execution failed"),
                }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_ai_generated_command(self, command: str) -> Dict[str, Any]:
        """Execute an AI-generated command with additional validation."""
        try:
            # AI commands might need additional processing
            # For now, treat them the same as direct commands
            return await self._execute_direct_command(command)

        except Exception as e:
            return {"success": False, "error": f"AI command execution failed: {e}"}

    async def _process_ai_request(self, request: AIRequest) -> AIResponse:
        """Process an AI request and generate BASIC commands."""
        start_time = time.perf_counter()

        try:
            logger.info(f"Processing AI request: {request.prompt[:100]}...")

            # Use the AI command sender for actual AI processing
            ai_result = await self.ai_sender.send_command(
                command=request.prompt, provider=request.model, context=request.context
            )

            # Calculate processing time
            processing_time = (time.perf_counter() - start_time) * 1000

            if ai_result["success"]:
                # Translate AI response to BASIC commands
                translation_result = self.ai_translator.translate_command(
                    ai_result["response"], context=request.context
                )

                if translation_result["success"]:
                    # Parse the translated response into individual commands
                    commands = self._parse_ai_response_to_commands(
                        translation_result["translation"]
                    )

                    response = AIResponse(
                        success=True,
                        response=f"Generated {len(commands)} BASIC command(s) from AI response",
                        commands=commands,
                        confidence=min(
                            ai_result.get("confidence", 0.5),
                            translation_result.get("confidence", 0.5),
                        ),
                        processing_time=processing_time,
                    )
                else:
                    # Fallback to simple parsing if translation fails
                    commands = self._parse_ai_response_to_commands(
                        ai_result["response"]
                    )

                    response = AIResponse(
                        success=True,
                        response=f"Fallback: Generated {len(commands)} BASIC command(s)",
                        commands=commands,
                        confidence=ai_result.get("confidence", 0.5)
                        * 0.7,  # Lower confidence for fallback
                        processing_time=processing_time,
                    )

                # Update statistics
                self.stats["ai_requests_processed"] += 1

                logger.info(f"✅ AI request processed in {processing_time:.2f}ms")
                logger.info(f"Confidence: {ai_result.get('confidence', 0.5):.2f}")

            else:
                # Fallback to simple translation if AI fails
                commands = self._translate_prompt_to_basic(request.prompt)

                response = AIResponse(
                    success=True,
                    response=f"Fallback: Generated {len(commands)} BASIC command(s)",
                    commands=commands,
                    confidence=0.3,  # Lower confidence for fallback
                    processing_time=processing_time,
                )

                logger.warning(f"⚠️ AI request failed, using fallback translation")

            return response

        except Exception as e:
            processing_time = (time.perf_counter() - start_time) * 1000

            logger.error(f"❌ AI request processing failed: {e}")
            return AIResponse(
                success=False, error=str(e), processing_time=processing_time
            )

    async def _send_ai_command(self, request: AIRequest) -> Dict[str, Any]:
        """Send command directly to AI provider."""
        try:
            logger.info(f"Sending direct AI command: {request.prompt[:100]}...")

            # Send command to AI provider
            result = await self.ai_sender.send_command(
                command=request.prompt, provider=request.model, context=request.context
            )

            # Update statistics
            self.stats["ai_requests_processed"] += 1

            logger.info(f"✅ Direct AI command sent successfully")
            return result

        except Exception as e:
            logger.error(f"❌ Direct AI command failed: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    def _parse_ai_response_to_commands(self, ai_response: str) -> List[str]:
        """Parse AI response into individual BASIC commands."""
        commands = []
        lines = ai_response.strip().split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if line looks like a BASIC command
            if any(
                keyword in line.upper()
                for keyword in [
                    "PRINT",
                    "LET",
                    "FOR",
                    "NEXT",
                    "IF",
                    "THEN",
                    "GOTO",
                    "END",
                    "REM",
                ]
            ):
                commands.append(line)
            elif line.isdigit() and len(lines) > 1:
                # Skip line numbers without commands
                continue
            else:
                # Try to interpret as a command
                if line:
                    commands.append(line)

        return commands

    async def _translate_ai_command(self, request: AIRequest) -> Dict[str, Any]:
        """Translate AI command to BASIC-M6502."""
        try:
            logger.info(f"Translating AI command: {request.prompt[:100]}...")

            # Use the AI translator directly
            result = self.ai_translator.translate_command(
                request.prompt, context=request.context
            )

            # Update statistics
            self.stats["ai_requests_processed"] += 1

            logger.info(f"✅ AI command translation completed")
            return result

        except Exception as e:
            logger.error(f"❌ AI command translation failed: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    async def _test_output_processing(self, request: dict) -> Dict[str, Any]:
        """Test output processing with sample data."""
        try:
            test_outputs = request.get("test_outputs", [])
            return await self.output_handler.test_output_processing(test_outputs)

        except Exception as e:
            logger.error(f"❌ Output processing test failed: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    async def _create_ai_interaction(self, request: dict) -> Dict[str, Any]:
        """Create a new AI interaction."""
        try:
            prompt = request.get("prompt", "")
            interaction_type = request.get("interaction_type", "command_execution")
            context = request.get("context", {})

            from bridge.ai.ai_layer_integration import AIInteractionType

            interaction_type_enum = AIInteractionType(interaction_type)

            interaction = await self.ai_integration.create_interaction(
                prompt, interaction_type_enum, context
            )

            return {
                "success": True,
                "interaction_id": interaction.interaction_id,
                "status": interaction.status.value,
                "timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"❌ Failed to create AI interaction: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    async def _get_ai_interaction(self, interaction_id: str) -> Dict[str, Any]:
        """Get AI interaction by ID."""
        try:
            interaction = self.ai_integration.get_interaction(interaction_id)

            if not interaction:
                return {
                    "success": False,
                    "error": "Interaction not found",
                    "timestamp": time.time(),
                }

            return {
                "success": True,
                "interaction": interaction.to_dict(),
                "timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"❌ Failed to get AI interaction: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    async def _execute_ai_interaction(self, interaction_id: str) -> Dict[str, Any]:
        """Execute an AI interaction."""
        try:
            interaction = self.ai_integration.get_interaction(interaction_id)

            if not interaction:
                return {
                    "success": False,
                    "error": "Interaction not found",
                    "timestamp": time.time(),
                }

            result = await self.ai_integration.execute_interaction(interaction)

            return {
                "success": True,
                "interaction": result.to_dict(),
                "timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"❌ Failed to execute AI interaction: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    async def _start_ai_workflow(self, request: dict) -> Dict[str, Any]:
        """Start an AI workflow."""
        try:
            workflow_type = request.get("workflow_type", "")
            session_id = request.get("session_id", "")
            initial_prompt = request.get("initial_prompt", "")
            parameters = request.get("parameters", {})

            # This would integrate with AI interaction manager
            # For now, return a placeholder response
            return {
                "success": True,
                "workflow_id": f"workflow_{workflow_type}_{int(time.time())}",
                "status": "started",
                "timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"❌ Failed to start AI workflow: {e}")
            return {"success": False, "error": str(e), "timestamp": time.time()}

    def _translate_prompt_to_basic(self, prompt: str) -> List[str]:
        """Translate a natural language prompt to BASIC commands."""
        prompt_lower = prompt.lower()
        commands = []

        # Simple keyword-based translation
        if (
            "print" in prompt_lower
            or "display" in prompt_lower
            or "show" in prompt_lower
        ):
            # Extract text to print
            if '"' in prompt:
                text = prompt.split('"')[1]
                commands.append(f'PRINT "{text}"')
            else:
                commands.append('PRINT "Hello from AI Vintage OS!"')

        elif (
            "calculate" in prompt_lower
            or "math" in prompt_lower
            or "add" in prompt_lower
        ):
            if "add" in prompt_lower:
                commands.append("LET A = 5")
                commands.append("LET B = 3")
                commands.append("LET C = A + B")
                commands.append('PRINT "A + B = "; C')

        elif "loop" in prompt_lower or "repeat" in prompt_lower:
            commands.append("FOR I = 1 TO 10")
            commands.append('PRINT "Iteration: "; I')
            commands.append("NEXT I")

        elif "variable" in prompt_lower or "assign" in prompt_lower:
            commands.append("LET X = 42")
            commands.append('PRINT "X = "; X')

        else:
            # Default response
            commands.append('PRINT "AI command received"')
            commands.append('PRINT "Executing default program"')

        return commands

    def _update_stats(self, execution_time: float, success: bool):
        """Update bridge server statistics."""
        self.stats["commands_processed"] += 1
        self.stats["total_execution_time"] += execution_time
        self.stats["average_execution_time"] = (
            self.stats["total_execution_time"] / self.stats["commands_processed"]
        )

        if not success:
            self.stats["error_count"] += 1

    async def broadcast_message(self, message: Dict[str, Any]):
        """Broadcast a message to all connected WebSocket clients."""
        if not self.connected_clients:
            return

        message_json = json.dumps(message)
        disconnected_clients = []

        for client in self.connected_clients:
            try:
                await client.send_text(message_json)
            except Exception as e:
                logger.warning(f"Failed to send message to client: {e}")
                disconnected_clients.append(client)

        # Remove disconnected clients
        for client in disconnected_clients:
            self.connected_clients.remove(client)

    def get_bridge_info(self) -> Dict[str, Any]:
        """Get comprehensive bridge server information."""
        return {
            "server": {
                "name": "AI Vintage OS Bridge Server",
                "version": "1.0.0",
                "is_running": self.is_running,
                "uptime": time.time() - self.stats["start_time"],
            },
            "components": {
                "emulator": (
                    self.emulator.get_emulator_info() if self.emulator else None
                ),
                "basic_engine": "initialized" if self.basic_engine else None,
            },
            "statistics": self.stats,
            "connections": {
                "websocket_clients": len(self.connected_clients),
                "command_queue_size": len(self.command_queue),
            },
        }


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    bridge_server = BridgeServer()
    return bridge_server.app


if __name__ == "__main__":
    import uvicorn

    # Load settings
    settings = get_settings()

    # Configure logging
    logger.remove()
    logger.add(
        sys.stderr,
        level=settings.bridge.logging.get("level", "INFO"),
        format=(
            "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
            "<cyan>Bridge</cyan> - <level>{message}</level>"
        ),
    )

    # Start server
    logger.info("Starting AI Vintage OS Bridge Server...")
    logger.info(f"Host: {settings.bridge.host}")
    logger.info(f"Port: {settings.bridge.port}")
    logger.info(f"Debug mode: {settings.bridge.debug}")

    uvicorn.run(
        "bridge_server:create_app",
        host=settings.bridge.host,
        port=settings.bridge.port,
        reload=settings.bridge.debug,
        log_level=settings.bridge.logging.get("level", "info").lower(),
    )
