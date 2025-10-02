"""
Plugin Manager

Central manager for all plugins in the AI Vintage OS system.
Handles plugin lifecycle, loading, unloading, and communication.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

from .plugin_interface import (
    AgentInterface,
    PluginInterface,
    PluginStatus,
    PluginType,
    ToolInterface,
)
from .plugin_loader import PluginLoader
from .plugin_registry import PluginRegistry
from .plugin_security import PluginSecurityManager
from .plugin_validator import PluginValidator


class PluginManager:
    """Main plugin manager for AI Vintage OS."""

    def __init__(
        self, plugins_dir: str = "plugins", config_dir: str = "config/plugins"
    ):
        """Initialize the plugin manager."""
        self.plugins_dir = Path(plugins_dir)
        self.config_dir = Path(config_dir)
        self.logger = logging.getLogger(__name__)

        # Core components
        self.registry = PluginRegistry()
        self.loader = PluginLoader()
        self.validator = PluginValidator()
        self.security = PluginSecurityManager()

        # Plugin state
        self.plugins: Dict[str, PluginInterface] = {}
        self.plugin_configs: Dict[str, Dict[str, Any]] = {}
        self.plugin_dependencies: Dict[str, List[str]] = {}

        # Event system
        self.event_handlers: Dict[str, List[callable]] = {}

        # Ensure directories exist
        self.plugins_dir.mkdir(parents=True, exist_ok=True)
        self.config_dir.mkdir(parents=True, exist_ok=True)

        self.logger.info("Plugin Manager initialized")

    async def initialize(self):
        """Initialize the plugin manager."""
        try:
            # Load plugin configurations
            await self._load_plugin_configs()

            # Discover available plugins
            await self._discover_plugins()

            # Load enabled plugins
            await self._load_enabled_plugins()

            self.logger.info("Plugin Manager initialization complete")
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize Plugin Manager: {e}")
            return False

    async def _load_plugin_configs(self):
        """Load plugin configurations from config directory."""
        config_files = list(self.config_dir.glob("*.json")) + list(
            self.config_dir.glob("*.yaml")
        )

        for config_file in config_files:
            try:
                with open(config_file, "r") as f:
                    if config_file.suffix == ".yaml":
                        config = yaml.safe_load(f)
                    else:
                        config = json.load(f)

                plugin_name = config_file.stem
                self.plugin_configs[plugin_name] = config

            except Exception as e:
                self.logger.error(f"Failed to load config for {config_file}: {e}")

    async def _discover_plugins(self):
        """Discover available plugins in the plugins directory."""
        plugin_dirs = [d for d in self.plugins_dir.iterdir() if d.is_dir()]

        for plugin_dir in plugin_dirs:
            try:
                # Look for plugin manifest
                manifest_file = plugin_dir / "manifest.json"
                if not manifest_file.exists():
                    manifest_file = plugin_dir / "manifest.yaml"

                if manifest_file.exists():
                    with open(manifest_file, "r") as f:
                        if manifest_file.suffix == ".yaml":
                            manifest = yaml.safe_load(f)
                        else:
                            manifest = json.load(f)

                    # Validate manifest
                    if self.validator.validate_manifest(manifest):
                        self.registry.register_plugin(plugin_dir.name, manifest)
                    else:
                        self.logger.warning(
                            f"Invalid manifest for plugin: {plugin_dir.name}"
                        )

            except Exception as e:
                self.logger.error(f"Failed to discover plugin {plugin_dir.name}: {e}")

    async def _load_enabled_plugins(self):
        """Load all enabled plugins."""
        for plugin_name, config in self.plugin_configs.items():
            if config.get("enabled", True):
                await self.load_plugin(plugin_name)

    async def load_plugin(self, plugin_name: str) -> bool:
        """Load a specific plugin."""
        try:
            if plugin_name in self.plugins:
                self.logger.warning(f"Plugin {plugin_name} is already loaded")
                return True

            # Get plugin info from registry
            plugin_info = self.registry.get_plugin(plugin_name)
            if not plugin_info:
                self.logger.error(f"Plugin {plugin_name} not found in registry")
                return False

            # Check dependencies
            if not await self._check_dependencies(plugin_name):
                self.logger.error(f"Dependencies not met for plugin {plugin_name}")
                return False

            # Load plugin module
            plugin_instance = await self.loader.load_plugin(plugin_name, plugin_info)
            if not plugin_instance:
                self.logger.error(f"Failed to load plugin {plugin_name}")
                return False

            # Initialize plugin
            config = self.plugin_configs.get(plugin_name, {})
            if await plugin_instance.initialize(config):
                self.plugins[plugin_name] = plugin_instance
                plugin_instance.set_status(PluginStatus.LOADED)

                # Start plugin if auto_start is enabled
                if config.get("auto_start", False):
                    await self.start_plugin(plugin_name)

                self.logger.info(f"Plugin {plugin_name} loaded successfully")
                return True
            else:
                self.logger.error(f"Failed to initialize plugin {plugin_name}")
                return False

        except Exception as e:
            self.logger.error(f"Error loading plugin {plugin_name}: {e}")
            return False

    async def unload_plugin(self, plugin_name: str) -> bool:
        """Unload a specific plugin."""
        try:
            if plugin_name not in self.plugins:
                self.logger.warning(f"Plugin {plugin_name} is not loaded")
                return True

            plugin = self.plugins[plugin_name]

            # Stop plugin if running
            if plugin.get_status() == PluginStatus.RUNNING:
                await self.stop_plugin(plugin_name)

            # Cleanup plugin
            await plugin.cleanup()

            # Remove from registry
            del self.plugins[plugin_name]

            self.logger.info(f"Plugin {plugin_name} unloaded successfully")
            return True

        except Exception as e:
            self.logger.error(f"Error unloading plugin {plugin_name}: {e}")
            return False

    async def start_plugin(self, plugin_name: str) -> bool:
        """Start a specific plugin."""
        try:
            if plugin_name not in self.plugins:
                self.logger.error(f"Plugin {plugin_name} is not loaded")
                return False

            plugin = self.plugins[plugin_name]

            if plugin.get_status() == PluginStatus.RUNNING:
                self.logger.warning(f"Plugin {plugin_name} is already running")
                return True

            if await plugin.start():
                plugin.set_status(PluginStatus.RUNNING)
                self.logger.info(f"Plugin {plugin_name} started successfully")
                return True
            else:
                plugin.set_status(PluginStatus.ERROR)
                self.logger.error(f"Failed to start plugin {plugin_name}")
                return False

        except Exception as e:
            self.logger.error(f"Error starting plugin {plugin_name}: {e}")
            return False

    async def stop_plugin(self, plugin_name: str) -> bool:
        """Stop a specific plugin."""
        try:
            if plugin_name not in self.plugins:
                self.logger.error(f"Plugin {plugin_name} is not loaded")
                return False

            plugin = self.plugins[plugin_name]

            if plugin.get_status() != PluginStatus.RUNNING:
                self.logger.warning(f"Plugin {plugin_name} is not running")
                return True

            if await plugin.stop():
                plugin.set_status(PluginStatus.STOPPED)
                self.logger.info(f"Plugin {plugin_name} stopped successfully")
                return True
            else:
                self.logger.error(f"Failed to stop plugin {plugin_name}")
                return False

        except Exception as e:
            self.logger.error(f"Error stopping plugin {plugin_name}: {e}")
            return False

    async def _check_dependencies(self, plugin_name: str) -> bool:
        """Check if plugin dependencies are met."""
        plugin_info = self.registry.get_plugin(plugin_name)
        if not plugin_info:
            return False

        dependencies = plugin_info.get("dependencies", [])
        for dep in dependencies:
            if dep not in self.plugins:
                self.logger.error(
                    f"Dependency {dep} not found for plugin {plugin_name}"
                )
                return False

            dep_plugin = self.plugins[dep]
            if dep_plugin.get_status() not in [
                PluginStatus.RUNNING,
                PluginStatus.LOADED,
            ]:
                self.logger.error(
                    f"Dependency {dep} is not running for plugin {plugin_name}"
                )
                return False

        return True

    def get_plugin(self, plugin_name: str) -> Optional[PluginInterface]:
        """Get a loaded plugin instance."""
        return self.plugins.get(plugin_name)

    def get_plugins_by_type(self, plugin_type: PluginType) -> List[PluginInterface]:
        """Get all plugins of a specific type."""
        return [
            plugin
            for plugin in self.plugins.values()
            if plugin.get_metadata().plugin_type == plugin_type
        ]

    def get_tools(self) -> Dict[str, Dict[str, Any]]:
        """Get all available tools from tool plugins."""
        tools = {}
        tool_plugins = self.get_plugins_by_type(PluginType.TOOL)

        for plugin in tool_plugins:
            if isinstance(plugin, ToolInterface):
                plugin_tools = plugin.get_tools()
                for tool in plugin_tools:
                    tool_name = tool.get("name")
                    if tool_name:
                        tools[tool_name] = {
                            "plugin": plugin.get_metadata().name,
                            "tool": tool,
                        }

        return tools

    def get_agents(self) -> Dict[str, AgentInterface]:
        """Get all available agents."""
        agents = {}
        agent_plugins = self.get_plugins_by_type(PluginType.AGENT)

        for plugin in agent_plugins:
            if isinstance(plugin, AgentInterface):
                agents[plugin.get_metadata().name] = plugin

        return agents

    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Any:
        """Execute a tool by name."""
        tools = self.get_tools()
        if tool_name not in tools:
            raise ValueError(f"Tool {tool_name} not found")

        tool_info = tools[tool_name]
        plugin_name = tool_info["plugin"]
        plugin = self.get_plugin(plugin_name)

        if not plugin or not isinstance(plugin, ToolInterface):
            raise ValueError(f"Plugin {plugin_name} not available")

        return await plugin.execute_tool(tool_name, parameters)

    async def process_agent_request(
        self, agent_name: str, request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a request through an agent."""
        agents = self.get_agents()
        if agent_name not in agents:
            raise ValueError(f"Agent {agent_name} not found")

        agent = agents[agent_name]
        return await agent.process_request(request)

    def get_plugin_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all plugins."""
        status = {}
        for name, plugin in self.plugins.items():
            status[name] = {
                "status": plugin.get_status().value,
                "metadata": (
                    plugin.get_metadata().__dict__ if plugin.get_metadata() else None
                ),
                "config": self.plugin_configs.get(name, {}),
            }
        return status

    async def shutdown(self):
        """Shutdown all plugins and cleanup."""
        for plugin_name in list(self.plugins.keys()):
            await self.unload_plugin(plugin_name)

        self.logger.info("Plugin Manager shutdown complete")
