"""
Plugin Validator

Validates plugin manifests, dependencies, and security requirements.
"""

import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, List

import semver
import yaml

from .plugin_interface import PluginType


class PluginValidator:
    """Validator for plugin manifests and configurations."""

    def __init__(self):
        """Initialize the plugin validator."""
        self.logger = logging.getLogger(__name__)

        # Validation rules
        self.required_fields = {
            "name": str,
            "version": str,
            "description": str,
            "author": str,
            "type": str,
        }

        self.optional_fields = {
            "dependencies": list,
            "permissions": list,
            "tags": list,
            "icon": str,
            "homepage": str,
            "license": str,
            "min_os_version": str,
            "max_os_version": str,
        }

        # Security patterns
        self.dangerous_patterns = [
            r"__import__",
            r"exec\s*\(",
            r"eval\s*\(",
            r"open\s*\(",
            r"file\s*\(",
            r"subprocess",
            r"os\.system",
            r"os\.popen",
        ]

    def validate_manifest(self, manifest: Dict[str, Any]) -> bool:
        """Validate a plugin manifest."""
        try:
            # Check required fields
            if not self._validate_required_fields(manifest):
                return False

            # Validate field types
            if not self._validate_field_types(manifest):
                return False

            # Validate plugin type
            if not self._validate_plugin_type(manifest.get("type")):
                return False

            # Validate version format
            if not self._validate_version(manifest.get("version")):
                return False

            # Validate dependencies
            if not self._validate_dependencies(manifest.get("dependencies", [])):
                return False

            # Validate permissions
            if not self._validate_permissions(manifest.get("permissions", [])):
                return False

            # Validate URLs
            if not self._validate_urls(manifest):
                return False

            self.logger.info(f"Manifest validation passed for {manifest.get('name')}")
            return True

        except Exception as e:
            self.logger.error(f"Manifest validation failed: {e}")
            return False

    def validate_plugin_file(self, plugin_file: Path) -> bool:
        """Validate a plugin Python file for security issues."""
        try:
            if not plugin_file.exists():
                self.logger.error(f"Plugin file not found: {plugin_file}")
                return False

            with open(plugin_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Check for dangerous patterns
            for pattern in self.dangerous_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    self.logger.warning(
                        f"Dangerous pattern found in {plugin_file}: {pattern}"
                    )
                    return False

            # Check for proper imports
            if not self._validate_imports(content):
                return False

            self.logger.info(f"Plugin file validation passed for {plugin_file}")
            return True

        except Exception as e:
            self.logger.error(f"Plugin file validation failed for {plugin_file}: {e}")
            return False

    def validate_dependencies(
        self, dependencies: List[str], available_plugins: List[str]
    ) -> bool:
        """Validate plugin dependencies against available plugins."""
        try:
            for dep in dependencies:
                if dep not in available_plugins:
                    self.logger.error(f"Dependency {dep} not available")
                    return False

            return True

        except Exception as e:
            self.logger.error(f"Dependency validation failed: {e}")
            return False

    def validate_permissions(self, permissions: List[str]) -> bool:
        """Validate plugin permissions."""
        try:
            valid_permissions = {
                "file_read",
                "file_write",
                "file_delete",
                "network_access",
                "system_info",
                "user_data",
                "ai_access",
                "emulator_access",
                "ui_access",
            }

            for permission in permissions:
                if permission not in valid_permissions:
                    self.logger.error(f"Invalid permission: {permission}")
                    return False

            return True

        except Exception as e:
            self.logger.error(f"Permission validation failed: {e}")
            return False

    def _validate_required_fields(self, manifest: Dict[str, Any]) -> bool:
        """Validate required fields are present."""
        for field, field_type in self.required_fields.items():
            if field not in manifest:
                self.logger.error(f"Missing required field: {field}")
                return False

            if not isinstance(manifest[field], field_type):
                self.logger.error(
                    f"Field {field} has wrong type. Expected {field_type.__name__}"
                )
                return False

        return True

    def _validate_field_types(self, manifest: Dict[str, Any]) -> bool:
        """Validate field types."""
        # Check required fields
        for field, expected_type in self.required_fields.items():
            if field in manifest and not isinstance(manifest[field], expected_type):
                self.logger.error(f"Field {field} has wrong type")
                return False

        # Check optional fields
        for field, expected_type in self.optional_fields.items():
            if field in manifest and not isinstance(manifest[field], expected_type):
                self.logger.error(f"Field {field} has wrong type")
                return False

        return True

    def _validate_plugin_type(self, plugin_type: str) -> bool:
        """Validate plugin type."""
        try:
            PluginType(plugin_type)
            return True
        except ValueError:
            self.logger.error(f"Invalid plugin type: {plugin_type}")
            return False

    def _validate_version(self, version: str) -> bool:
        """Validate version format."""
        try:
            # Try semantic versioning
            semver.VersionInfo.parse(version)
            return True
        except ValueError:
            # Fallback to simple version format
            if re.match(r"^\d+\.\d+(\.\d+)?$", version):
                return True

            self.logger.error(f"Invalid version format: {version}")
            return False

    def _validate_dependencies(self, dependencies: List[str]) -> bool:
        """Validate dependencies format."""
        for dep in dependencies:
            if not isinstance(dep, str) or not dep.strip():
                self.logger.error(f"Invalid dependency: {dep}")
                return False

        return True

    def _validate_permissions(self, permissions: List[str]) -> bool:
        """Validate permissions format."""
        for permission in permissions:
            if not isinstance(permission, str) or not permission.strip():
                self.logger.error(f"Invalid permission: {permission}")
                return False

        return True

    def _validate_urls(self, manifest: Dict[str, Any]) -> bool:
        """Validate URL fields."""
        url_fields = ["homepage", "icon"]

        for field in url_fields:
            if field in manifest:
                url = manifest[field]
                if not self._is_valid_url(url):
                    self.logger.error(f"Invalid URL in {field}: {url}")
                    return False

        return True

    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid."""
        url_pattern = re.compile(
            r"^https?://"  # http:// or https://
            r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
            r"localhost|"  # localhost...
            r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
            r"(?::\d+)?"  # optional port
            r"(?:/?|[/?]\S+)$",
            re.IGNORECASE,
        )

        return bool(url_pattern.match(url))

    def _validate_imports(self, content: str) -> bool:
        """Validate imports in plugin code."""
        # Extract import statements
        import_pattern = r"^(?:from\s+(\S+)\s+)?import\s+(\S+)"
        imports = re.findall(import_pattern, content, re.MULTILINE)

        # Check for dangerous imports
        dangerous_imports = {
            "os",
            "sys",
            "subprocess",
            "shutil",
            "glob",
            "pickle",
            "marshal",
            "shelve",
            "dbm",
        }

        for from_module, import_name in imports:
            if from_module in dangerous_imports or import_name in dangerous_imports:
                self.logger.warning(
                    f"Dangerous import detected: {from_module} {import_name}"
                )
                return False

        return True

    def validate_plugin_directory(self, plugin_dir: Path) -> bool:
        """Validate entire plugin directory structure."""
        try:
            # Check for manifest file
            manifest_files = list(plugin_dir.glob("manifest.*"))
            if not manifest_files:
                self.logger.error(f"No manifest file found in {plugin_dir}")
                return False

            # Validate manifest
            manifest_file = manifest_files[0]
            with open(manifest_file, "r") as f:
                if manifest_file.suffix == ".yaml":
                    manifest = yaml.safe_load(f)
                else:
                    manifest = json.load(f)

            if not self.validate_manifest(manifest):
                return False

            # Check for main plugin file
            plugin_files = [
                plugin_dir / "plugin.py",
                plugin_dir / "main.py",
                plugin_dir / f"{plugin_dir.name}.py",
            ]

            plugin_file = None
            for file_path in plugin_files:
                if file_path.exists():
                    plugin_file = file_path
                    break

            if not plugin_file:
                self.logger.error(f"No plugin file found in {plugin_dir}")
                return False

            # Validate plugin file
            if not self.validate_plugin_file(plugin_file):
                return False

            self.logger.info(f"Plugin directory validation passed for {plugin_dir}")
            return True

        except Exception as e:
            self.logger.error(
                f"Plugin directory validation failed for {plugin_dir}: {e}"
            )
            return False
