#!/usr/bin/env python3
"""
AI Layer Integration Test Launcher

This script provides a comprehensive test suite for the AI Layer Integration
functionality, including real-time communication, context management, and interaction orchestration.
"""

import asyncio
import json
import sys
import time
from pathlib import Path

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.ai.ai_interaction_manager import (
    AIConversationManager,
    AIInteractionOrchestrator,
)
from bridge.ai.ai_layer_integration import (
    AIInteractionStatus,
    AIInteractionType,
    AILayerIntegration,
)


class AIIntegrationTestSuite:
    """Comprehensive test suite for AI Layer Integration."""

    def __init__(self):
        """Initialize the test suite."""
        self.ai_integration = None
        self.conversation_manager = None
        self.orchestrator = None
        self.test_results = []

        # Configure logging
        logger.remove()
        logger.add(
            sys.stderr,
            level="INFO",
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>AI Integration Test</cyan> - <level>{message}</level>"
            ),
        )

        logger.info("AI Layer Integration Test Suite initialized")

    async def run_all_tests(self):
        """Run all AI integration tests."""
        logger.info("🚀 Starting AI Layer Integration Test Suite")
        logger.info("=" * 60)

        # Initialize components
        self._test_initialization()

        # Test AI integration core functionality
        await self._test_ai_integration_core()

        # Test context management
        await self._test_context_management()

        # Test command execution
        await self._test_command_execution()

        # Test WebSocket communication
        await self._test_websocket_communication()

        # Test interaction orchestration
        await self._test_interaction_orchestration()

        # Test conversation management
        await self._test_conversation_management()

        # Test workflow execution
        await self._test_workflow_execution()

        # Test error handling
        await self._test_error_handling()

        # Test performance
        await self._test_performance()

        # Generate test report
        self._generate_test_report()

    def _test_initialization(self):
        """Test AI integration initialization."""
        logger.info("\n📋 Testing Initialization...")

        try:
            # Initialize AI integration
            self.ai_integration = AILayerIntegration()
            logger.info("✅ AI Layer Integration initialized")

            # Initialize conversation manager
            self.conversation_manager = AIConversationManager()
            logger.info("✅ Conversation Manager initialized")

            # Initialize orchestrator
            self.orchestrator = AIInteractionOrchestrator(self.conversation_manager)
            logger.info("✅ Interaction Orchestrator initialized")

            # Check components
            assert self.ai_integration.context_manager is not None
            assert self.ai_integration.command_executor is not None
            assert self.ai_integration.websocket_client is not None
            logger.info("✅ All components initialized correctly")

            self._record_test_result(
                "initialization", True, "All components initialized successfully"
            )

        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            self._record_test_result("initialization", False, str(e))

    async def _test_ai_integration_core(self):
        """Test AI integration core functionality."""
        logger.info("\n🤖 Testing AI Integration Core...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "ai_integration_core", False, "AI integration not initialized"
            )
            return

        core_tests = [
            {
                "name": "Create Interaction",
                "test": self._test_create_interaction,
                "description": "Test creating AI interactions",
            },
            {
                "name": "Get Interaction",
                "test": self._test_get_interaction,
                "description": "Test retrieving interactions by ID",
            },
            {
                "name": "Interaction Status",
                "test": self._test_interaction_status,
                "description": "Test interaction status management",
            },
            {
                "name": "Statistics",
                "test": self._test_integration_statistics,
                "description": "Test integration statistics",
            },
        ]

        successful_tests = 0
        total_tests = len(core_tests)

        for i, test in enumerate(core_tests, 1):
            logger.info(f"\nCore Test {i}/{total_tests}: {test['description']}")

            try:
                result = await test["test"]()
                if result:
                    successful_tests += 1
                    logger.info(f"✅ {test['name']} test passed")
                else:
                    logger.error(f"❌ {test['name']} test failed")

            except Exception as e:
                logger.error(f"❌ {test['name']} test error: {e}")

        success_rate = successful_tests / total_tests if total_tests > 0 else 0
        logger.info(
            f"\n📊 AI Integration Core: {successful_tests}/{total_tests} tests passed ({success_rate:.1%})"
        )

        self._record_test_result(
            "ai_integration_core",
            success_rate > 0.75,
            f"{successful_tests}/{total_tests} core tests passed",
        )

    async def _test_create_interaction(self):
        """Test creating AI interactions."""
        try:
            # Test different interaction types
            interaction_types = [
                AIInteractionType.COMMAND_EXECUTION,
                AIInteractionType.CODE_GENERATION,
                AIInteractionType.DEBUGGING,
                AIInteractionType.EXPLANATION,
            ]

            created_interactions = []

            for interaction_type in interaction_types:
                interaction = await self.ai_integration.create_interaction(
                    f"Test {interaction_type.value} interaction",
                    interaction_type,
                    {"test": True, "priority": 5},
                )

                assert interaction is not None
                assert interaction.interaction_type == interaction_type
                assert interaction.status == AIInteractionStatus.PENDING
                assert (
                    interaction.prompt == f"Test {interaction_type.value} interaction"
                )

                created_interactions.append(interaction)
                logger.info(
                    f"  ✅ Created {interaction_type.value} interaction: {interaction.interaction_id}"
                )

            # Verify interactions are stored
            assert len(self.ai_integration.active_interactions) == len(
                interaction_types
            )

            return True

        except Exception as e:
            logger.error(f"Create interaction test failed: {e}")
            return False

    async def _test_get_interaction(self):
        """Test getting interactions by ID."""
        try:
            # Create a test interaction
            interaction = await self.ai_integration.create_interaction(
                "Test get interaction", AIInteractionType.COMMAND_EXECUTION
            )

            # Retrieve the interaction
            retrieved = self.ai_integration.get_interaction(interaction.interaction_id)

            assert retrieved is not None
            assert retrieved.interaction_id == interaction.interaction_id
            assert retrieved.prompt == "Test get interaction"

            # Test non-existent interaction
            not_found = self.ai_integration.get_interaction("non_existent_id")
            assert not_found is None

            logger.info("  ✅ Get interaction test passed")
            return True

        except Exception as e:
            logger.error(f"Get interaction test failed: {e}")
            return False

    async def _test_interaction_status(self):
        """Test interaction status management."""
        try:
            # Create interaction
            interaction = await self.ai_integration.create_interaction(
                "Test status management", AIInteractionType.COMMAND_EXECUTION
            )

            # Test status updates
            assert interaction.status == AIInteractionStatus.PENDING

            interaction.update_status(AIInteractionStatus.IN_PROGRESS)
            assert interaction.status == AIInteractionStatus.IN_PROGRESS

            interaction.update_status(
                AIInteractionStatus.COMPLETED,
                ai_response="Test response",
                confidence_score=0.9,
            )
            assert interaction.status == AIInteractionStatus.COMPLETED
            assert interaction.ai_response == "Test response"
            assert interaction.confidence_score == 0.9

            logger.info("  ✅ Interaction status test passed")
            return True

        except Exception as e:
            logger.error(f"Interaction status test failed: {e}")
            return False

    async def _test_integration_statistics(self):
        """Test integration statistics."""
        try:
            stats = self.ai_integration.get_statistics()

            # Check required statistics fields
            assert "stats" in stats
            assert "active_interactions" in stats
            assert "interaction_history_size" in stats
            assert "context_summary" in stats
            assert "websocket_status" in stats
            assert "command_executor_stats" in stats

            # Check stats structure
            stats_data = stats["stats"]
            assert "total_interactions" in stats_data
            assert "successful_interactions" in stats_data
            assert "failed_interactions" in stats_data
            assert "average_interaction_time" in stats_data

            logger.info(
                f"  ✅ Statistics test passed - {stats_data['total_interactions']} total interactions"
            )
            return True

        except Exception as e:
            logger.error(f"Integration statistics test failed: {e}")
            return False

    async def _test_context_management(self):
        """Test context management functionality."""
        logger.info("\n🧠 Testing Context Management...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "context_management", False, "AI integration not initialized"
            )
            return

        try:
            context_manager = self.ai_integration.context_manager

            # Test context updates
            context_manager.update_context(
                "emulator_state",
                {
                    "cpu_state": {"pc": 0x8000, "a": 0x42, "x": 0x10, "y": 0x20},
                    "last_command": "PRINT 'Hello'",
                    "execution_time": 15.5,
                },
            )

            context_manager.update_context(
                "ai_session",
                {
                    "session_id": "test_session_123",
                    "interaction_count": 10,
                    "last_interaction": time.time(),
                },
            )

            # Test context retrieval
            emulator_context = context_manager.get_context("emulator_state")
            assert emulator_context["cpu_state"]["pc"] == 0x8000
            assert emulator_context["last_command"] == "PRINT 'Hello'"

            ai_context = context_manager.get_context("ai_session")
            assert ai_context["session_id"] == "test_session_123"
            assert ai_context["interaction_count"] == 10

            # Test context summary
            summary = context_manager.get_context_summary(max_entries=5)
            assert "current_context" in summary
            assert "recent_history" in summary
            assert "context_size" in summary

            # Test context clearing
            context_manager.clear_context("emulator_state")
            assert "emulator_state" not in context_manager.current_context

            logger.info("✅ Context management test passed")
            self._record_test_result(
                "context_management", True, "Context management working correctly"
            )

        except Exception as e:
            logger.error(f"❌ Context management test failed: {e}")
            self._record_test_result("context_management", False, str(e))

    async def _test_command_execution(self):
        """Test command execution functionality."""
        logger.info("\n⚡ Testing Command Execution...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "command_execution", False, "AI integration not initialized"
            )
            return

        try:
            command_executor = self.ai_integration.command_executor

            # Test command executor initialization
            assert command_executor.bridge_url == "http://localhost:8000"
            assert len(command_executor.execution_history) == 0

            # Test statistics before execution
            initial_stats = command_executor.get_execution_statistics()
            assert initial_stats["stats"]["total_commands"] == 0

            # Note: Actual command execution would require bridge server to be running
            # For testing purposes, we'll test the structure and mock the execution
            logger.info("  ✅ Command executor initialized correctly")
            logger.info("  ⚠️ Actual command execution requires bridge server")

            self._record_test_result(
                "command_execution", True, "Command executor structure validated"
            )

        except Exception as e:
            logger.error(f"❌ Command execution test failed: {e}")
            self._record_test_result("command_execution", False, str(e))

    async def _test_websocket_communication(self):
        """Test WebSocket communication functionality."""
        logger.info("\n🔌 Testing WebSocket Communication...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "websocket_communication", False, "AI integration not initialized"
            )
            return

        try:
            websocket_client = self.ai_integration.websocket_client

            # Test WebSocket client initialization
            assert websocket_client.bridge_ws_url == "ws://localhost:8000/ws"
            assert websocket_client.connected is False
            assert len(websocket_client.message_queue) == 0
            assert len(websocket_client.subscribers) == 0

            # Test subscriber management
            callback_called = False

            async def test_callback(data):
                nonlocal callback_called
                callback_called = True

            await websocket_client.subscribe_to_outputs(test_callback)
            assert len(websocket_client.subscribers) == 1

            # Test message queue
            assert websocket_client.message_queue.maxlen == 1000

            logger.info("  ✅ WebSocket client initialized correctly")
            logger.info("  ⚠️ Actual WebSocket connection requires bridge server")

            self._record_test_result(
                "websocket_communication", True, "WebSocket client structure validated"
            )

        except Exception as e:
            logger.error(f"❌ WebSocket communication test failed: {e}")
            self._record_test_result("websocket_communication", False, str(e))

    async def _test_interaction_orchestration(self):
        """Test interaction orchestration."""
        logger.info("\n🎭 Testing Interaction Orchestration...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "interaction_orchestration", False, "AI integration not initialized"
            )
            return

        try:
            # Test interaction lifecycle
            interaction = await self.ai_integration.create_interaction(
                "Test orchestration",
                AIInteractionType.COMMAND_EXECUTION,
                {"priority": 8},
            )

            # Verify interaction creation
            assert interaction.interaction_id in self.ai_integration.active_interactions
            assert interaction.status == AIInteractionStatus.PENDING

            # Test interaction retrieval
            retrieved = self.ai_integration.get_interaction(interaction.interaction_id)
            assert retrieved == interaction

            # Test interaction history
            history = self.ai_integration.get_interaction_history(limit=10)
            assert isinstance(history, list)

            logger.info("  ✅ Interaction orchestration test passed")
            self._record_test_result(
                "interaction_orchestration",
                True,
                "Interaction orchestration working correctly",
            )

        except Exception as e:
            logger.error(f"❌ Interaction orchestration test failed: {e}")
            self._record_test_result("interaction_orchestration", False, str(e))

    async def _test_conversation_management(self):
        """Test conversation management functionality."""
        logger.info("\n💬 Testing Conversation Management...")

        if not self.conversation_manager:
            logger.error("❌ Conversation manager not initialized")
            self._record_test_result(
                "conversation_management", False, "Conversation manager not initialized"
            )
            return

        try:
            # Create conversation
            conversation = self.conversation_manager.create_conversation(
                "test_conversation"
            )
            assert conversation.session_id == "test_conversation"
            assert conversation.state.value == "initial"

            # Add turns to conversation
            from bridge.ai.ai_interaction_manager import ConversationTurn

            for i in range(3):
                turn = ConversationTurn(
                    turn_id=f"turn_{i}",
                    user_input=f"Test input {i}",
                    ai_response=f"Test response {i}",
                    commands_generated=[f"PRINT 'Test {i}'"],
                    execution_results=[{"success": True, "output": f"Test {i}"}],
                    timestamp=time.time(),
                    processing_time=100.0 + i * 50,
                    confidence_score=0.8 + i * 0.05,
                )

                self.conversation_manager.add_turn_to_conversation(
                    conversation.session_id, turn
                )

            # Verify conversation state
            assert len(conversation.turns) == 3
            assert conversation.state.value == "active"

            # Test conversation context
            context = self.conversation_manager.get_conversation_context(
                conversation.session_id, max_turns=2
            )
            assert context is not None
            assert context["session_id"] == "test_conversation"
            assert context["turn_count"] == 3
            assert len(context["recent_turns"]) == 2

            # Test conversation analysis
            analysis = self.conversation_manager.analyze_conversation_pattern(
                conversation
            )
            assert "detected_patterns" in analysis
            assert "suggestions" in analysis
            assert "conversation_quality" in analysis

            # Test conversation closing
            self.conversation_manager.close_conversation(conversation.session_id)
            assert (
                conversation.session_id
                not in self.conversation_manager.active_conversations
            )
            assert conversation.state.value == "completed"

            logger.info("✅ Conversation management test passed")
            self._record_test_result(
                "conversation_management",
                True,
                "Conversation management working correctly",
            )

        except Exception as e:
            logger.error(f"❌ Conversation management test failed: {e}")
            self._record_test_result("conversation_management", False, str(e))

    async def _test_workflow_execution(self):
        """Test workflow execution functionality."""
        logger.info("\n🔄 Testing Workflow Execution...")

        if not self.orchestrator:
            logger.error("❌ Orchestrator not initialized")
            self._record_test_result(
                "workflow_execution", False, "Orchestrator not initialized"
            )
            return

        try:
            # Test available workflows
            assert "debugging_session" in self.orchestrator.workflows
            assert "code_generation" in self.orchestrator.workflows
            assert "interactive_learning" in self.orchestrator.workflows
            assert "automated_testing" in self.orchestrator.workflows

            # Test debugging workflow
            result = await self.orchestrator.start_workflow(
                "debugging_session", "test_session", "Fix this error in my code"
            )

            assert result["status"] == "completed"
            assert "workflow_id" in result
            assert result["result"]["workflow_type"] == "debugging_session"
            assert result["result"]["steps_completed"] == 5

            # Test code generation workflow
            result = await self.orchestrator.start_workflow(
                "code_generation", "test_session_2", "Create a simple calculator"
            )

            assert result["status"] == "completed"
            assert result["result"]["workflow_type"] == "code_generation"
            assert result["result"]["steps_completed"] == 6

            # Test workflow status
            workflow_status = self.orchestrator.get_workflow_status(
                result["workflow_id"]
            )
            assert workflow_status is not None

            # Test active workflows
            active_workflows = self.orchestrator.get_active_workflows()
            assert isinstance(active_workflows, list)

            logger.info("✅ Workflow execution test passed")
            self._record_test_result(
                "workflow_execution", True, "Workflow execution working correctly"
            )

        except Exception as e:
            logger.error(f"❌ Workflow execution test failed: {e}")
            self._record_test_result("workflow_execution", False, str(e))

    async def _test_error_handling(self):
        """Test error handling functionality."""
        logger.info("\n🚨 Testing Error Handling...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "error_handling", False, "AI integration not initialized"
            )
            return

        try:
            # Test invalid interaction type
            try:
                # This should work with proper enum
                interaction = await self.ai_integration.create_interaction(
                    "Test error handling", AIInteractionType.COMMAND_EXECUTION
                )
                assert interaction is not None
                logger.info("  ✅ Valid interaction type handled correctly")
            except Exception as e:
                logger.error(f"  ❌ Valid interaction type failed: {e}")
                return False

            # Test getting non-existent interaction
            non_existent = self.ai_integration.get_interaction("non_existent_id")
            assert non_existent is None
            logger.info("  ✅ Non-existent interaction handled correctly")

            # Test conversation with invalid session
            if self.conversation_manager:
                invalid_context = self.conversation_manager.get_conversation_context(
                    "non_existent_session"
                )
                assert invalid_context is None
                logger.info("  ✅ Invalid conversation session handled correctly")

            # Test workflow with invalid type
            if self.orchestrator:
                try:
                    result = await self.orchestrator.start_workflow(
                        "invalid_workflow", "test_session", "Test prompt"
                    )
                    assert result["status"] == "failed"
                    logger.info("  ✅ Invalid workflow type handled correctly")
                except Exception as e:
                    logger.info(
                        f"  ✅ Invalid workflow type handled with exception: {e}"
                    )

            logger.info("✅ Error handling test passed")
            self._record_test_result(
                "error_handling", True, "Error handling working correctly"
            )

        except Exception as e:
            logger.error(f"❌ Error handling test failed: {e}")
            self._record_test_result("error_handling", False, str(e))

    async def _test_performance(self):
        """Test performance functionality."""
        logger.info("\n⚡ Testing Performance...")

        if not self.ai_integration:
            logger.error("❌ AI integration not initialized")
            self._record_test_result(
                "performance", False, "AI integration not initialized"
            )
            return

        try:
            # Test interaction creation performance
            start_time = time.perf_counter()

            interactions = []
            for i in range(50):
                interaction = await self.ai_integration.create_interaction(
                    f"Performance test interaction {i}",
                    AIInteractionType.COMMAND_EXECUTION,
                )
                interactions.append(interaction)

            end_time = time.perf_counter()
            total_time = end_time - start_time
            average_time = total_time / 50 * 1000  # Convert to milliseconds

            logger.info(f"📊 Performance Results:")
            logger.info(f"   Created 50 interactions in {total_time:.3f}s")
            logger.info(f"   Average time per interaction: {average_time:.2f}ms")
            logger.info(f"   Interactions per second: {50 / total_time:.1f}")

            # Test conversation performance
            if self.conversation_manager:
                conv_start = time.perf_counter()

                for i in range(20):
                    conversation = self.conversation_manager.create_conversation(
                        f"perf_session_{i}"
                    )
                    # Add some turns
                    for j in range(5):
                        from bridge.ai.ai_interaction_manager import ConversationTurn

                        turn = ConversationTurn(
                            turn_id=f"turn_{j}",
                            user_input=f"Input {j}",
                            ai_response=f"Response {j}",
                            commands_generated=[],
                            execution_results=[],
                            timestamp=time.time(),
                            processing_time=50.0,
                            confidence_score=0.8,
                        )
                        self.conversation_manager.add_turn_to_conversation(
                            conversation.session_id, turn
                        )

                conv_end = time.perf_counter()
                conv_time = conv_end - conv_start

                logger.info(
                    f"   Created 20 conversations with 5 turns each in {conv_time:.3f}s"
                )
                logger.info(
                    f"   Average time per conversation: {conv_time / 20 * 1000:.2f}ms"
                )

            # Performance criteria
            performance_good = average_time < 10.0  # Less than 10ms per interaction

            if performance_good:
                logger.info("✅ Performance is acceptable")
                self._record_test_result(
                    "performance", True, f"Average time: {average_time:.2f}ms"
                )
            else:
                logger.warning("⚠️ Performance may be too slow")
                self._record_test_result(
                    "performance", False, f"Average time too high: {average_time:.2f}ms"
                )

        except Exception as e:
            logger.error(f"❌ Performance test failed: {e}")
            self._record_test_result("performance", False, str(e))

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
        logger.info("📋 AI LAYER INTEGRATION TEST REPORT")
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

        # Show final statistics
        if self.ai_integration:
            stats = self.ai_integration.get_statistics()
            logger.info(f"\n📊 Final AI Integration Statistics:")
            logger.info(f"  Total Interactions: {stats['stats']['total_interactions']}")
            logger.info(f"  Active Interactions: {stats['active_interactions']}")
            logger.info(f"  Interaction History: {stats['interaction_history_size']}")
            logger.info(
                f"  WebSocket Connected: {stats['websocket_status']['connected']}"
            )

        # Overall assessment
        logger.info("\n🎯 Overall Assessment:")
        if successful_tests == total_tests:
            logger.info(
                "🎉 ALL TESTS PASSED! AI Layer Integration is working perfectly."
            )
        elif successful_tests >= total_tests * 0.8:
            logger.info(
                "✅ Most tests passed. AI Layer Integration is mostly functional."
            )
        elif successful_tests >= total_tests * 0.5:
            logger.info(
                "⚠️ Some tests failed. AI Layer Integration has issues that need attention."
            )
        else:
            logger.info(
                "❌ Many tests failed. AI Layer Integration needs significant fixes."
            )

        # Save report to file
        report_file = Path("logs/ai_layer_integration_test_report.md")
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, "w") as f:
            f.write("# AI Layer Integration Test Report\n\n")
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
                f.write("- Check AI integration configuration and dependencies\n")
                f.write("- Verify bridge server connectivity and WebSocket setup\n")
                f.write("- Test with actual AI providers and emulator integration\n")
            else:
                f.write(
                    "- All tests passed! The AI Layer Integration is ready for production use.\n"
                )
                f.write(
                    "- Consider running integration tests with the full bridge system.\n"
                )
                f.write(
                    "- Monitor AI interaction performance in production environment.\n"
                )

        logger.info(f"\n📄 Detailed report saved to: {report_file}")

        # Return success status
        return successful_tests >= total_tests * 0.8


async def main():
    """Main test runner."""
    test_suite = AIIntegrationTestSuite()

    try:
        success = await test_suite.run_all_tests()

        if success:
            logger.info("\n🎉 AI Layer Integration Test Suite completed successfully!")
            sys.exit(0)
        else:
            logger.error(
                "\n❌ AI Layer Integration Test Suite completed with failures!"
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
