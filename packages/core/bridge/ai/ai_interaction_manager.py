"""
AI Interaction Manager

This module provides advanced interaction management for the AI layer,
including conversation flow, context awareness, and intelligent follow-up handling.
"""

import asyncio
import json
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncGenerator, Dict, List, Optional, Union

from loguru import logger

from bridge.core.error_handler import (
    BridgeError,
    ErrorCategory,
    ErrorHandler,
    ErrorSeverity,
)
from bridge.core.settings import get_settings


class ConversationState(Enum):
    """Conversation states."""

    INITIAL = "initial"
    ACTIVE = "active"
    WAITING_FOR_INPUT = "waiting_for_input"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"
    PAUSED = "paused"


class InteractionPriority(Enum):
    """Interaction priorities."""

    LOW = 1
    NORMAL = 5
    HIGH = 8
    CRITICAL = 10


@dataclass
class ConversationTurn:
    """Represents a single turn in a conversation."""

    turn_id: str
    user_input: str
    ai_response: str
    commands_generated: List[str]
    execution_results: List[Dict[str, Any]]
    timestamp: float
    processing_time: float
    confidence_score: float
    context_updates: Dict[str, Any] = field(default_factory=dict)
    error_message: Optional[str] = None


@dataclass
class ConversationSession:
    """Represents a conversation session."""

    session_id: str
    start_time: float
    last_activity: float
    state: ConversationState
    turns: List[ConversationTurn] = field(default_factory=list)
    context: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_turn(self, turn: ConversationTurn):
        """Add a turn to the conversation."""
        self.turns.append(turn)
        self.last_activity = time.time()

        # Update context
        self.context.update(turn.context_updates)

    def get_recent_context(self, max_turns: int = 5) -> Dict[str, Any]:
        """Get recent conversation context."""
        recent_turns = self.turns[-max_turns:] if self.turns else []

        return {
            "session_id": self.session_id,
            "turn_count": len(self.turns),
            "recent_turns": [
                {
                    "turn_id": turn.turn_id,
                    "user_input": turn.user_input,
                    "ai_response": turn.ai_response,
                    "commands_generated": turn.commands_generated,
                    "confidence_score": turn.confidence_score,
                    "timestamp": turn.timestamp,
                }
                for turn in recent_turns
            ],
            "current_state": self.state.value,
            "context": self.context,
        }


class AIConversationManager:
    """Manages AI conversations and context flow."""

    def __init__(self, max_conversations: int = 100):
        """Initialize conversation manager."""
        self.max_conversations = max_conversations
        self.active_conversations: Dict[str, ConversationSession] = {}
        self.conversation_history: deque = deque(maxlen=max_conversations)

        # Context templates
        self.context_templates = {
            "user_preferences": {
                "explanation_level": "detailed",
                "code_style": "readable",
                "debugging_help": True,
                "interactive_mode": True,
            },
            "session_context": {
                "current_program": None,
                "debugging_session": False,
                "learning_mode": False,
                "automation_level": "assisted",
            },
            "technical_context": {
                "last_commands": [],
                "error_patterns": [],
                "success_patterns": [],
                "performance_metrics": {},
            },
        }

        # Conversation patterns
        self.conversation_patterns = {
            "debugging": {
                "keywords": ["error", "debug", "fix", "problem", "issue"],
                "follow_up_patterns": [
                    "What's the error?",
                    "Show me the code",
                    "Try this fix",
                ],
            },
            "code_generation": {
                "keywords": ["create", "write", "generate", "code", "program"],
                "follow_up_patterns": [
                    "Explain this code",
                    "How does it work?",
                    "Can you optimize it?",
                ],
            },
            "explanation": {
                "keywords": ["explain", "how", "why", "what", "understand"],
                "follow_up_patterns": [
                    "Give me an example",
                    "Show me step by step",
                    "What are the alternatives?",
                ],
            },
        }

        logger.info("AI Conversation Manager initialized")

    def create_conversation(
        self,
        session_id: Optional[str] = None,
        initial_context: Optional[Dict[str, Any]] = None,
    ) -> ConversationSession:
        """Create a new conversation session."""
        if not session_id:
            session_id = f"conv_{int(time.time())}_{len(self.active_conversations)}"

        # Initialize context
        context = {}
        for template_name, template_data in self.context_templates.items():
            context[template_name] = template_data.copy()

        # Apply initial context
        if initial_context:
            context.update(initial_context)

        conversation = ConversationSession(
            session_id=session_id,
            start_time=time.time(),
            last_activity=time.time(),
            state=ConversationState.INITIAL,
            context=context,
        )

        self.active_conversations[session_id] = conversation

        logger.info(f"Created conversation session: {session_id}")
        return conversation

    def get_conversation(self, session_id: str) -> Optional[ConversationSession]:
        """Get conversation by session ID."""
        return self.active_conversations.get(session_id)

    def add_turn_to_conversation(self, session_id: str, turn: ConversationTurn) -> bool:
        """Add a turn to a conversation."""
        conversation = self.get_conversation(session_id)
        if not conversation:
            logger.warning(f"Conversation not found: {session_id}")
            return False

        conversation.add_turn(turn)

        # Update conversation state based on turn
        if turn.error_message:
            conversation.state = ConversationState.ERROR
        elif conversation.state == ConversationState.INITIAL:
            conversation.state = ConversationState.ACTIVE

        logger.debug(f"Added turn to conversation {session_id}")
        return True

    def get_conversation_context(
        self, session_id: str, max_turns: int = 5
    ) -> Optional[Dict[str, Any]]:
        """Get conversation context for AI processing."""
        conversation = self.get_conversation(session_id)
        if not conversation:
            return None

        return conversation.get_recent_context(max_turns)

    def update_conversation_state(self, session_id: str, state: ConversationState):
        """Update conversation state."""
        conversation = self.get_conversation(session_id)
        if conversation:
            conversation.state = state
            logger.debug(f"Updated conversation {session_id} state to {state.value}")

    def close_conversation(self, session_id: str):
        """Close a conversation session."""
        conversation = self.active_conversations.pop(session_id, None)
        if conversation:
            conversation.state = ConversationState.COMPLETED
            self.conversation_history.append(conversation)
            logger.info(f"Closed conversation session: {session_id}")

    def get_active_conversations(self) -> List[str]:
        """Get list of active conversation IDs."""
        return list(self.active_conversations.keys())

    def analyze_conversation_pattern(
        self, conversation: ConversationSession
    ) -> Dict[str, Any]:
        """Analyze conversation pattern and suggest improvements."""
        if not conversation.turns:
            return {"pattern": "empty", "suggestions": []}

        # Analyze recent turns
        recent_turns = (
            conversation.turns[-3:]
            if len(conversation.turns) >= 3
            else conversation.turns
        )

        # Pattern detection
        detected_patterns = []
        for turn in recent_turns:
            user_input_lower = turn.user_input.lower()
            for pattern_name, pattern_data in self.conversation_patterns.items():
                if any(
                    keyword in user_input_lower for keyword in pattern_data["keywords"]
                ):
                    detected_patterns.append(pattern_name)

        # Generate suggestions
        suggestions = []
        if "debugging" in detected_patterns:
            suggestions.append("Consider providing more specific error details")
            suggestions.append("Ask for step-by-step debugging approach")

        if "code_generation" in detected_patterns:
            suggestions.append("Request code explanation and documentation")
            suggestions.append("Ask about testing and validation")

        if "explanation" in detected_patterns:
            suggestions.append("Request practical examples")
            suggestions.append("Ask for alternative approaches")

        return {
            "detected_patterns": list(set(detected_patterns)),
            "suggestions": suggestions,
            "conversation_quality": self._assess_conversation_quality(conversation),
        }

    def _assess_conversation_quality(
        self, conversation: ConversationSession
    ) -> Dict[str, Any]:
        """Assess conversation quality metrics."""
        if not conversation.turns:
            return {"score": 0, "metrics": {}}

        # Calculate metrics
        total_turns = len(conversation.turns)
        successful_executions = sum(
            1
            for turn in conversation.turns
            if turn.execution_results
            and all(r.get("success", False) for r in turn.execution_results)
        )
        average_confidence = (
            sum(turn.confidence_score for turn in conversation.turns) / total_turns
        )
        average_processing_time = (
            sum(turn.processing_time for turn in conversation.turns) / total_turns
        )

        # Calculate quality score
        success_rate = successful_executions / total_turns
        confidence_score = average_confidence
        efficiency_score = max(
            0, 1 - (average_processing_time / 5000)
        )  # Penalize slow processing

        overall_score = (
            success_rate * 0.4 + confidence_score * 0.3 + efficiency_score * 0.3
        )

        return {
            "score": overall_score,
            "metrics": {
                "total_turns": total_turns,
                "success_rate": success_rate,
                "average_confidence": average_confidence,
                "average_processing_time": average_processing_time,
                "successful_executions": successful_executions,
            },
        }


class AIInteractionOrchestrator:
    """Orchestrates complex AI interactions and workflows."""

    def __init__(self, conversation_manager: AIConversationManager):
        """Initialize interaction orchestrator."""
        self.conversation_manager = conversation_manager
        self.error_handler = ErrorHandler()

        # Workflow definitions
        self.workflows = {
            "debugging_session": self._debugging_workflow,
            "code_generation": self._code_generation_workflow,
            "interactive_learning": self._interactive_learning_workflow,
            "automated_testing": self._automated_testing_workflow,
        }

        # Active workflows
        self.active_workflows: Dict[str, Dict[str, Any]] = {}

        logger.info("AI Interaction Orchestrator initialized")

    async def start_workflow(
        self,
        workflow_type: str,
        session_id: str,
        initial_prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Start a workflow for complex interactions."""
        if workflow_type not in self.workflows:
            raise BridgeError(
                message=f"Unknown workflow type: {workflow_type}",
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.MEDIUM,
            )

        # Create conversation if it doesn't exist
        conversation = self.conversation_manager.get_conversation(session_id)
        if not conversation:
            conversation = self.conversation_manager.create_conversation(session_id)

        # Start workflow
        workflow_id = f"workflow_{workflow_type}_{int(time.time())}"
        self.active_workflows[workflow_id] = {
            "workflow_type": workflow_type,
            "session_id": session_id,
            "status": "running",
            "start_time": time.time(),
            "parameters": parameters or {},
        }

        try:
            # Execute workflow
            workflow_func = self.workflows[workflow_type]
            result = await workflow_func(conversation, initial_prompt, parameters or {})

            self.active_workflows[workflow_id]["status"] = "completed"
            self.active_workflows[workflow_id]["end_time"] = time.time()

            return {"workflow_id": workflow_id, "status": "completed", "result": result}

        except Exception as e:
            self.active_workflows[workflow_id]["status"] = "failed"
            self.active_workflows[workflow_id]["error"] = str(e)

            logger.error(f"Workflow {workflow_id} failed: {e}")
            return {"workflow_id": workflow_id, "status": "failed", "error": str(e)}

    async def _debugging_workflow(
        self,
        conversation: ConversationSession,
        initial_prompt: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Debugging workflow for systematic problem solving."""
        logger.info(
            f"Starting debugging workflow for session {conversation.session_id}"
        )

        steps = [
            "Analyze the error or problem",
            "Identify the root cause",
            "Generate a fix",
            "Test the fix",
            "Verify the solution",
        ]

        results = []
        current_step = 0

        for step in steps:
            current_step += 1

            # Create turn for this step
            turn_prompt = f"Step {current_step}: {step}. {initial_prompt if current_step == 1 else ''}"

            turn_id = f"debug_step_{current_step}_{int(time.time())}"
            turn = ConversationTurn(
                turn_id=turn_id,
                user_input=turn_prompt,
                ai_response="",  # Will be filled by AI processing
                commands_generated=[],
                execution_results=[],
                timestamp=time.time(),
                processing_time=0.0,
                confidence_score=0.0,
            )

            # Process this step (would integrate with AI layer)
            # For now, simulate the response
            turn.ai_response = f"Processing step {current_step}: {step}"
            turn.processing_time = 100.0 + (current_step * 50)
            turn.confidence_score = 0.8 - (current_step * 0.1)

            # Add to conversation
            self.conversation_manager.add_turn_to_conversation(
                conversation.session_id, turn
            )
            results.append(turn)

        return {
            "workflow_type": "debugging_session",
            "steps_completed": len(steps),
            "turns": [turn.to_dict() for turn in results],
            "conversation_context": self.conversation_manager.get_conversation_context(
                conversation.session_id
            ),
        }

    async def _code_generation_workflow(
        self,
        conversation: ConversationSession,
        initial_prompt: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Code generation workflow for systematic program creation."""
        logger.info(
            f"Starting code generation workflow for session {conversation.session_id}"
        )

        steps = [
            "Understand requirements",
            "Design program structure",
            "Generate initial code",
            "Add error handling",
            "Create test cases",
            "Optimize and document",
        ]

        results = []
        current_step = 0

        for step in steps:
            current_step += 1

            turn_prompt = f"Step {current_step}: {step}. {initial_prompt if current_step == 1 else ''}"

            turn_id = f"code_step_{current_step}_{int(time.time())}"
            turn = ConversationTurn(
                turn_id=turn_id,
                user_input=turn_prompt,
                ai_response=f"Generated code for step {current_step}",
                commands_generated=[f"REM Step {current_step}: {step}"],
                execution_results=[],
                timestamp=time.time(),
                processing_time=200.0 + (current_step * 100),
                confidence_score=0.9 - (current_step * 0.05),
            )

            self.conversation_manager.add_turn_to_conversation(
                conversation.session_id, turn
            )
            results.append(turn)

        return {
            "workflow_type": "code_generation",
            "steps_completed": len(steps),
            "turns": [turn.to_dict() for turn in results],
            "generated_code_steps": len(steps),
        }

    async def _interactive_learning_workflow(
        self,
        conversation: ConversationSession,
        initial_prompt: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Interactive learning workflow for educational interactions."""
        logger.info(
            f"Starting interactive learning workflow for session {conversation.session_id}"
        )

        # Learning phases
        phases = [
            {"name": "Introduction", "description": "Explain the concept"},
            {"name": "Example", "description": "Show practical example"},
            {"name": "Practice", "description": "Guide through practice"},
            {"name": "Assessment", "description": "Test understanding"},
            {"name": "Review", "description": "Review and reinforce"},
        ]

        results = []

        for i, phase in enumerate(phases, 1):
            turn_prompt = f"Learning Phase {i}: {phase['name']} - {phase['description']}. Topic: {initial_prompt}"

            turn_id = f"learn_phase_{i}_{int(time.time())}"
            turn = ConversationTurn(
                turn_id=turn_id,
                user_input=turn_prompt,
                ai_response=f"Educational content for {phase['name']} phase",
                commands_generated=[],
                execution_results=[],
                timestamp=time.time(),
                processing_time=150.0 + (i * 75),
                confidence_score=0.85,
            )

            self.conversation_manager.add_turn_to_conversation(
                conversation.session_id, turn
            )
            results.append(turn)

        return {
            "workflow_type": "interactive_learning",
            "phases_completed": len(phases),
            "turns": [turn.to_dict() for turn in results],
            "learning_progress": 1.0,
        }

    async def _automated_testing_workflow(
        self,
        conversation: ConversationSession,
        initial_prompt: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Automated testing workflow for systematic testing."""
        logger.info(
            f"Starting automated testing workflow for session {conversation.session_id}"
        )

        test_phases = [
            "Unit test generation",
            "Integration test creation",
            "Edge case testing",
            "Performance testing",
            "Regression testing",
        ]

        results = []

        for i, phase in enumerate(test_phases, 1):
            turn_prompt = f"Testing Phase {i}: {phase}. Target: {initial_prompt}"

            turn_id = f"test_phase_{i}_{int(time.time())}"
            turn = ConversationTurn(
                turn_id=turn_id,
                user_input=turn_prompt,
                ai_response=f"Generated tests for {phase}",
                commands_generated=[f"REM {phase}"],
                execution_results=[],
                timestamp=time.time(),
                processing_time=300.0 + (i * 50),
                confidence_score=0.75,
            )

            self.conversation_manager.add_turn_to_conversation(
                conversation.session_id, turn
            )
            results.append(turn)

        return {
            "workflow_type": "automated_testing",
            "test_phases_completed": len(test_phases),
            "turns": [turn.to_dict() for turn in results],
            "test_coverage": 0.8,
        }

    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow status."""
        return self.active_workflows.get(workflow_id)

    def get_active_workflows(self) -> List[Dict[str, Any]]:
        """Get list of active workflows."""
        return [
            {"workflow_id": workflow_id, **workflow_data}
            for workflow_id, workflow_data in self.active_workflows.items()
        ]


if __name__ == "__main__":
    # Test the conversation manager
    async def test_conversation_manager():
        manager = AIConversationManager()
        orchestrator = AIInteractionOrchestrator(manager)

        # Create conversation
        conversation = manager.create_conversation("test_session")

        # Add some turns
        for i in range(3):
            turn = ConversationTurn(
                turn_id=f"turn_{i}",
                user_input=f"Test input {i}",
                ai_response=f"Test response {i}",
                commands_generated=[f"PRINT 'Test {i}'"],
                execution_results=[{"success": True, "output": f"Test {i}"}],
                timestamp=time.time(),
                processing_time=100.0 + i * 50,
                confidence_score=0.8 - i * 0.1,
            )

            manager.add_turn_to_conversation(conversation.session_id, turn)

        # Analyze conversation
        analysis = manager.analyze_conversation_pattern(conversation)
        print(f"Conversation analysis: {analysis}")

        # Test workflow
        workflow_result = await orchestrator.start_workflow(
            "debugging_session", conversation.session_id, "Fix this error in my code"
        )

        print(f"Workflow result: {workflow_result}")

        # Get statistics
        stats = manager.get_active_conversations()
        print(f"Active conversations: {stats}")

    # Run test
    asyncio.run(test_conversation_manager())
