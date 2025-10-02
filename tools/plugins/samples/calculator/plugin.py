"""
Sample Calculator Tool Plugin

Demonstrates a simple tool plugin for the AI Vintage OS.
"""

import logging
import math
from typing import Any, Dict, List

from ..core.plugin_interface import (
    PluginConfig,
    PluginMetadata,
    PluginStatus,
    PluginType,
    ToolInterface,
)


class CalculatorPlugin(ToolInterface):
    """Calculator tool plugin."""

    def __init__(self):
        """Initialize calculator plugin."""
        super().__init__()
        self.logger = logging.getLogger(__name__)
        self.tools = [
            {"name": "add", "description": "Add two numbers", "category": "math"},
            {
                "name": "subtract",
                "description": "Subtract two numbers",
                "category": "math",
            },
            {
                "name": "multiply",
                "description": "Multiply two numbers",
                "category": "math",
            },
            {"name": "divide", "description": "Divide two numbers", "category": "math"},
            {
                "name": "power",
                "description": "Raise number to power",
                "category": "math",
            },
            {
                "name": "sqrt",
                "description": "Square root of number",
                "category": "math",
            },
            {
                "name": "sin",
                "description": "Sine of angle in radians",
                "category": "trigonometry",
            },
            {
                "name": "cos",
                "description": "Cosine of angle in radians",
                "category": "trigonometry",
            },
            {
                "name": "tan",
                "description": "Tangent of angle in radians",
                "category": "trigonometry",
            },
        ]

    def get_metadata(self) -> PluginMetadata:
        """Return plugin metadata."""
        return PluginMetadata(
            name="calculator",
            version="1.0.0",
            description="Advanced calculator with mathematical functions",
            author="AI Vintage OS Team",
            plugin_type=PluginType.TOOL,
            dependencies=[],
            permissions=["ui_access"],
            tags=["math", "calculator", "tools"],
        )

    async def initialize(self, config: PluginConfig) -> bool:
        """Initialize the plugin."""
        try:
            self.config = config
            self.logger.info("Calculator plugin initialized")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize calculator plugin: {e}")
            return False

    async def start(self) -> bool:
        """Start the plugin."""
        try:
            self.set_status(PluginStatus.RUNNING)
            self.logger.info("Calculator plugin started")
            return True
        except Exception as e:
            self.logger.error(f"Failed to start calculator plugin: {e}")
            return False

    async def stop(self) -> bool:
        """Stop the plugin."""
        try:
            self.set_status(PluginStatus.STOPPED)
            self.logger.info("Calculator plugin stopped")
            return True
        except Exception as e:
            self.logger.error(f"Failed to stop calculator plugin: {e}")
            return False

    async def cleanup(self) -> bool:
        """Cleanup plugin resources."""
        try:
            self.logger.info("Calculator plugin cleaned up")
            return True
        except Exception as e:
            self.logger.error(f"Failed to cleanup calculator plugin: {e}")
            return False

    def get_tools(self) -> List[Dict[str, Any]]:
        """Return list of tools provided by this plugin."""
        return self.tools

    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Any:
        """Execute a calculator tool."""
        try:
            if tool_name == "add":
                return parameters.get("a", 0) + parameters.get("b", 0)

            elif tool_name == "subtract":
                return parameters.get("a", 0) - parameters.get("b", 0)

            elif tool_name == "multiply":
                return parameters.get("a", 0) * parameters.get("b", 0)

            elif tool_name == "divide":
                b = parameters.get("b", 1)
                if b == 0:
                    raise ValueError("Division by zero")
                return parameters.get("a", 0) / b

            elif tool_name == "power":
                return math.pow(
                    parameters.get("base", 0), parameters.get("exponent", 1)
                )

            elif tool_name == "sqrt":
                value = parameters.get("value", 0)
                if value < 0:
                    raise ValueError("Square root of negative number")
                return math.sqrt(value)

            elif tool_name == "sin":
                return math.sin(parameters.get("angle", 0))

            elif tool_name == "cos":
                return math.cos(parameters.get("angle", 0))

            elif tool_name == "tan":
                return math.tan(parameters.get("angle", 0))

            else:
                raise ValueError(f"Unknown tool: {tool_name}")

        except Exception as e:
            self.logger.error(f"Error executing tool {tool_name}: {e}")
            raise

    def get_tool_schema(self, tool_name: str) -> Dict[str, Any]:
        """Get JSON schema for tool parameters."""
        schemas = {
            "add": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "First number"},
                    "b": {"type": "number", "description": "Second number"},
                },
                "required": ["a", "b"],
            },
            "subtract": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "First number"},
                    "b": {"type": "number", "description": "Second number"},
                },
                "required": ["a", "b"],
            },
            "multiply": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "First number"},
                    "b": {"type": "number", "description": "Second number"},
                },
                "required": ["a", "b"],
            },
            "divide": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "Dividend"},
                    "b": {"type": "number", "description": "Divisor"},
                },
                "required": ["a", "b"],
            },
            "power": {
                "type": "object",
                "properties": {
                    "base": {"type": "number", "description": "Base number"},
                    "exponent": {"type": "number", "description": "Exponent"},
                },
                "required": ["base", "exponent"],
            },
            "sqrt": {
                "type": "object",
                "properties": {
                    "value": {
                        "type": "number",
                        "description": "Number to find square root of",
                    }
                },
                "required": ["value"],
            },
            "sin": {
                "type": "object",
                "properties": {
                    "angle": {"type": "number", "description": "Angle in radians"}
                },
                "required": ["angle"],
            },
            "cos": {
                "type": "object",
                "properties": {
                    "angle": {"type": "number", "description": "Angle in radians"}
                },
                "required": ["angle"],
            },
            "tan": {
                "type": "object",
                "properties": {
                    "angle": {"type": "number", "description": "Angle in radians"}
                },
                "required": ["angle"],
            },
        }

        return schemas.get(tool_name, {"type": "object", "properties": {}})
