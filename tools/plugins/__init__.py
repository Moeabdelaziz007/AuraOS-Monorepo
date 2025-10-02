"""
AI Vintage OS Plugin System

This module provides the core plugin architecture for extending the AI Vintage OS
with custom functionality, tools, and agents.

The plugin system supports:
- Dynamic plugin loading and unloading
- Plugin lifecycle management
- Inter-plugin communication
- Plugin marketplace integration
- Security sandboxing
- Performance monitoring
"""

from .core.plugin_interface import AgentInterface, PluginInterface, ToolInterface
from .core.plugin_loader import PluginLoader
from .core.plugin_manager import PluginManager
from .core.plugin_registry import PluginRegistry
from .core.plugin_security import PluginSecurityManager
from .core.plugin_validator import PluginValidator

__version__ = "1.0.0"
__author__ = "AI Vintage OS Team"

# Export main classes
__all__ = [
    "PluginManager",
    "PluginRegistry",
    "PluginInterface",
    "ToolInterface",
    "AgentInterface",
    "PluginLoader",
    "PluginValidator",
    "PluginSecurityManager",
]
