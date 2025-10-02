"""
Plugin Registry

Manages plugin registration, discovery, and metadata storage.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import yaml

from .plugin_interface import PluginMetadata, PluginType


class PluginRegistry:
    """Registry for managing plugin metadata and discovery."""

    def __init__(self):
        """Initialize the plugin registry."""
        self.logger = logging.getLogger(__name__)
        self.plugins: Dict[str, Dict[str, Any]] = {}
        self.plugin_metadata: Dict[str, PluginMetadata] = {}
        self.dependencies: Dict[str, List[str]] = {}
        self.categories: Dict[str, List[str]] = {}

    def register_plugin(self, plugin_name: str, manifest: Dict[str, Any]) -> bool:
        """Register a plugin with its manifest."""
        try:
            # Validate manifest structure
            if not self._validate_manifest_structure(manifest):
                self.logger.error(
                    f"Invalid manifest structure for plugin {plugin_name}"
                )
                return False

            # Store plugin manifest
            self.plugins[plugin_name] = manifest

            # Create metadata object
            metadata = self._create_metadata(manifest)
            self.plugin_metadata[plugin_name] = metadata

            # Update dependencies
            self.dependencies[plugin_name] = manifest.get("dependencies", [])

            # Update categories
            tags = manifest.get("tags", [])
            for tag in tags:
                if tag not in self.categories:
                    self.categories[tag] = []
                if plugin_name not in self.categories[tag]:
                    self.categories[tag].append(plugin_name)

            self.logger.info(f"Plugin {plugin_name} registered successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to register plugin {plugin_name}: {e}")
            return False

    def unregister_plugin(self, plugin_name: str) -> bool:
        """Unregister a plugin."""
        try:
            if plugin_name not in self.plugins:
                self.logger.warning(f"Plugin {plugin_name} not found in registry")
                return True

            # Remove from categories
            tags = self.plugins[plugin_name].get("tags", [])
            for tag in tags:
                if tag in self.categories and plugin_name in self.categories[tag]:
                    self.categories[tag].remove(plugin_name)

            # Remove plugin data
            del self.plugins[plugin_name]
            if plugin_name in self.plugin_metadata:
                del self.plugin_metadata[plugin_name]
            if plugin_name in self.dependencies:
                del self.dependencies[plugin_name]

            self.logger.info(f"Plugin {plugin_name} unregistered successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to unregister plugin {plugin_name}: {e}")
            return False

    def get_plugin(self, plugin_name: str) -> Optional[Dict[str, Any]]:
        """Get plugin manifest by name."""
        return self.plugins.get(plugin_name)

    def get_plugin_metadata(self, plugin_name: str) -> Optional[PluginMetadata]:
        """Get plugin metadata by name."""
        return self.plugin_metadata.get(plugin_name)

    def get_all_plugins(self) -> Dict[str, Dict[str, Any]]:
        """Get all registered plugins."""
        return self.plugins.copy()

    def get_plugins_by_type(self, plugin_type: PluginType) -> List[str]:
        """Get plugin names by type."""
        return [
            name
            for name, manifest in self.plugins.items()
            if manifest.get("type") == plugin_type.value
        ]

    def get_plugins_by_category(self, category: str) -> List[str]:
        """Get plugin names by category/tag."""
        return self.categories.get(category, [])

    def get_plugin_dependencies(self, plugin_name: str) -> List[str]:
        """Get dependencies for a plugin."""
        return self.dependencies.get(plugin_name, [])

    def get_dependents(self, plugin_name: str) -> List[str]:
        """Get plugins that depend on this plugin."""
        dependents = []
        for name, deps in self.dependencies.items():
            if plugin_name in deps:
                dependents.append(name)
        return dependents

    def search_plugins(self, query: str) -> List[str]:
        """Search plugins by name, description, or tags."""
        query_lower = query.lower()
        results = []

        for name, manifest in self.plugins.items():
            # Search in name
            if query_lower in name.lower():
                results.append(name)
                continue

            # Search in description
            description = manifest.get("description", "").lower()
            if query_lower in description:
                results.append(name)
                continue

            # Search in tags
            tags = manifest.get("tags", [])
            if any(query_lower in tag.lower() for tag in tags):
                results.append(name)
                continue

        return results

    def get_plugin_statistics(self) -> Dict[str, Any]:
        """Get registry statistics."""
        total_plugins = len(self.plugins)
        plugins_by_type = {}
        plugins_by_category = {}

        # Count by type
        for manifest in self.plugins.values():
            plugin_type = manifest.get("type", "unknown")
            plugins_by_type[plugin_type] = plugins_by_type.get(plugin_type, 0) + 1

        # Count by category
        for category, plugin_list in self.categories.items():
            plugins_by_category[category] = len(plugin_list)

        return {
            "total_plugins": total_plugins,
            "plugins_by_type": plugins_by_type,
            "plugins_by_category": plugins_by_category,
            "total_categories": len(self.categories),
        }

    def _validate_manifest_structure(self, manifest: Dict[str, Any]) -> bool:
        """Validate manifest structure."""
        required_fields = ["name", "version", "description", "author", "type"]

        for field in required_fields:
            if field not in manifest:
                self.logger.error(f"Missing required field: {field}")
                return False

        # Validate type
        plugin_type = manifest.get("type")
        try:
            PluginType(plugin_type)
        except ValueError:
            self.logger.error(f"Invalid plugin type: {plugin_type}")
            return False

        return True

    def _create_metadata(self, manifest: Dict[str, Any]) -> PluginMetadata:
        """Create PluginMetadata from manifest."""
        return PluginMetadata(
            name=manifest["name"],
            version=manifest["version"],
            description=manifest["description"],
            author=manifest["author"],
            plugin_type=PluginType(manifest["type"]),
            dependencies=manifest.get("dependencies", []),
            permissions=manifest.get("permissions", []),
            tags=manifest.get("tags", []),
            icon=manifest.get("icon"),
            homepage=manifest.get("homepage"),
            license=manifest.get("license"),
            min_os_version=manifest.get("min_os_version"),
            max_os_version=manifest.get("max_os_version"),
        )

    def export_registry(self, file_path: str) -> bool:
        """Export registry to file."""
        try:
            export_data = {
                "plugins": self.plugins,
                "metadata": {
                    name: metadata.__dict__
                    for name, metadata in self.plugin_metadata.items()
                },
                "dependencies": self.dependencies,
                "categories": self.categories,
                "exported_at": datetime.now().isoformat(),
            }

            with open(file_path, "w") as f:
                if file_path.endswith(".yaml"):
                    yaml.dump(export_data, f, default_flow_style=False)
                else:
                    json.dump(export_data, f, indent=2)

            self.logger.info(f"Registry exported to {file_path}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to export registry: {e}")
            return False

    def import_registry(self, file_path: str) -> bool:
        """Import registry from file."""
        try:
            with open(file_path, "r") as f:
                if file_path.endswith(".yaml"):
                    import_data = yaml.safe_load(f)
                else:
                    import_data = json.load(f)

            # Clear existing data
            self.plugins.clear()
            self.plugin_metadata.clear()
            self.dependencies.clear()
            self.categories.clear()

            # Import data
            self.plugins = import_data.get("plugins", {})
            self.dependencies = import_data.get("dependencies", {})
            self.categories = import_data.get("categories", {})

            # Recreate metadata objects
            metadata_dict = import_data.get("metadata", {})
            for name, metadata_data in metadata_dict.items():
                self.plugin_metadata[name] = PluginMetadata(**metadata_data)

            self.logger.info(f"Registry imported from {file_path}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to import registry: {e}")
            return False
