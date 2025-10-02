"""
Plugin Loader

Handles dynamic loading and instantiation of plugin modules.
"""

import importlib.util
import inspect
import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional, Type

from .plugin_interface import PluginInterface


class PluginLoader:
    """Loader for dynamic plugin loading."""

    def __init__(self):
        """Initialize the plugin loader."""
        self.logger = logging.getLogger(__name__)
        self.loaded_modules: Dict[str, Any] = {}

    async def load_plugin(
        self, plugin_name: str, plugin_info: Dict[str, Any]
    ) -> Optional[PluginInterface]:
        """Load a plugin module and return an instance."""
        try:
            plugin_path = Path(plugin_info.get("path", f"plugins/{plugin_name}"))

            # Look for main plugin file
            plugin_file = self._find_plugin_file(plugin_path)
            if not plugin_file:
                self.logger.error(f"Plugin file not found for {plugin_name}")
                return None

            # Load the module
            module = await self._load_module(plugin_name, plugin_file)
            if not module:
                self.logger.error(f"Failed to load module for {plugin_name}")
                return None

            # Find plugin class
            plugin_class = self._find_plugin_class(module, plugin_info.get("type"))
            if not plugin_class:
                self.logger.error(f"Plugin class not found for {plugin_name}")
                return None

            # Instantiate plugin
            plugin_instance = plugin_class()

            # Set metadata
            metadata = self._create_metadata_from_info(plugin_info)
            plugin_instance.metadata = metadata

            self.logger.info(f"Plugin {plugin_name} loaded successfully")
            return plugin_instance

        except Exception as e:
            self.logger.error(f"Error loading plugin {plugin_name}: {e}")
            return None

    def _find_plugin_file(self, plugin_path: Path) -> Optional[Path]:
        """Find the main plugin file."""
        possible_files = [
            plugin_path / "plugin.py",
            plugin_path / "main.py",
            plugin_path / f"{plugin_path.name}.py",
            plugin_path / "__init__.py",
        ]

        for file_path in possible_files:
            if file_path.exists():
                return file_path

        return None

    async def _load_module(self, plugin_name: str, plugin_file: Path) -> Optional[Any]:
        """Load a Python module from file."""
        try:
            # Create module spec
            spec = importlib.util.spec_from_file_location(plugin_name, plugin_file)
            if not spec or not spec.loader:
                self.logger.error(f"Could not create spec for {plugin_name}")
                return None

            # Load module
            module = importlib.util.module_from_spec(spec)
            sys.modules[plugin_name] = module
            spec.loader.exec_module(module)

            # Store loaded module
            self.loaded_modules[plugin_name] = module

            return module

        except Exception as e:
            self.logger.error(f"Error loading module {plugin_name}: {e}")
            return None

    def _find_plugin_class(
        self, module: Any, plugin_type: str
    ) -> Optional[Type[PluginInterface]]:
        """Find the plugin class in the module."""
        try:
            # Get all classes from the module
            classes = [
                obj
                for name, obj in inspect.getmembers(module, inspect.isclass)
                if obj.__module__ == module.__name__
            ]

            # Look for plugin classes
            for cls in classes:
                if issubclass(cls, PluginInterface):
                    return cls

            # If no specific plugin class found, look for common names
            common_names = ["Plugin", "MainPlugin", "DefaultPlugin"]
            for name in common_names:
                if hasattr(module, name):
                    cls = getattr(module, name)
                    if inspect.isclass(cls) and issubclass(cls, PluginInterface):
                        return cls

            return None

        except Exception as e:
            self.logger.error(f"Error finding plugin class: {e}")
            return None

    def _create_metadata_from_info(self, plugin_info: Dict[str, Any]) -> Any:
        """Create metadata object from plugin info."""
        from .plugin_interface import PluginMetadata, PluginType

        return PluginMetadata(
            name=plugin_info["name"],
            version=plugin_info["version"],
            description=plugin_info["description"],
            author=plugin_info["author"],
            plugin_type=PluginType(plugin_info["type"]),
            dependencies=plugin_info.get("dependencies", []),
            permissions=plugin_info.get("permissions", []),
            tags=plugin_info.get("tags", []),
            icon=plugin_info.get("icon"),
            homepage=plugin_info.get("homepage"),
            license=plugin_info.get("license"),
            min_os_version=plugin_info.get("min_os_version"),
            max_os_version=plugin_info.get("max_os_version"),
        )

    def unload_plugin(self, plugin_name: str) -> bool:
        """Unload a plugin module."""
        try:
            if plugin_name in self.loaded_modules:
                # Remove from sys.modules
                if plugin_name in sys.modules:
                    del sys.modules[plugin_name]

                # Remove from loaded modules
                del self.loaded_modules[plugin_name]

                self.logger.info(f"Plugin {plugin_name} unloaded successfully")
                return True
            else:
                self.logger.warning(f"Plugin {plugin_name} not loaded")
                return True

        except Exception as e:
            self.logger.error(f"Error unloading plugin {plugin_name}: {e}")
            return False

    def get_loaded_modules(self) -> Dict[str, Any]:
        """Get all loaded modules."""
        return self.loaded_modules.copy()

    def is_plugin_loaded(self, plugin_name: str) -> bool:
        """Check if a plugin is loaded."""
        return plugin_name in self.loaded_modules
