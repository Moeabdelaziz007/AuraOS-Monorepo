"""
Plugin Security Manager

Manages security policies, sandboxing, and access control for plugins.
"""

import logging
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from .plugin_interface import PluginMetadata, PluginType


class SecurityPolicy:
    """Security policy for a plugin."""

    def __init__(self, plugin_name: str, permissions: List[str]):
        """Initialize security policy."""
        self.plugin_name = plugin_name
        self.permissions = set(permissions)
        self.allowed_paths: Set[str] = set()
        self.allowed_networks: Set[str] = set()
        self.max_memory_mb: int = 100
        self.max_cpu_percent: int = 50
        self.timeout_seconds: int = 30

    def has_permission(self, permission: str) -> bool:
        """Check if plugin has specific permission."""
        return permission in self.permissions

    def add_allowed_path(self, path: str):
        """Add allowed file system path."""
        self.allowed_paths.add(path)

    def add_allowed_network(self, network: str):
        """Add allowed network access."""
        self.allowed_networks.add(network)


class PluginSecurityManager:
    """Security manager for plugins."""

    def __init__(self):
        """Initialize the security manager."""
        self.logger = logging.getLogger(__name__)
        self.security_policies: Dict[str, SecurityPolicy] = {}
        self.sandbox_dirs: Dict[str, str] = {}
        self.active_plugins: Set[str] = set()

        # Default security settings
        self.default_permissions = {
            PluginType.TOOL: ["ui_access"],
            PluginType.AGENT: ["ai_access", "ui_access"],
            PluginType.SERVICE: ["network_access", "system_info"],
            PluginType.WIDGET: ["ui_access"],
            PluginType.THEME: ["ui_access"],
            PluginType.LANGUAGE: ["ui_access"],
        }

    def create_security_policy(self, plugin_metadata: PluginMetadata) -> SecurityPolicy:
        """Create security policy for a plugin."""
        plugin_name = plugin_metadata.name
        plugin_type = plugin_metadata.plugin_type

        # Get base permissions
        base_permissions = self.default_permissions.get(plugin_type, [])

        # Add explicit permissions from manifest
        explicit_permissions = plugin_metadata.permissions

        # Combine permissions
        all_permissions = list(set(base_permissions + explicit_permissions))

        # Create policy
        policy = SecurityPolicy(plugin_name, all_permissions)

        # Set type-specific restrictions
        self._apply_type_restrictions(policy, plugin_type)

        # Store policy
        self.security_policies[plugin_name] = policy

        self.logger.info(f"Security policy created for {plugin_name}")
        return policy

    def _apply_type_restrictions(self, policy: SecurityPolicy, plugin_type: PluginType):
        """Apply type-specific security restrictions."""
        if plugin_type == PluginType.TOOL:
            policy.max_memory_mb = 50
            policy.max_cpu_percent = 25
            policy.timeout_seconds = 15

        elif plugin_type == PluginType.AGENT:
            policy.max_memory_mb = 200
            policy.max_cpu_percent = 75
            policy.timeout_seconds = 60

        elif plugin_type == PluginType.SERVICE:
            policy.max_memory_mb = 100
            policy.max_cpu_percent = 50
            policy.timeout_seconds = 30

        elif plugin_type in [PluginType.WIDGET, PluginType.THEME, PluginType.LANGUAGE]:
            policy.max_memory_mb = 25
            policy.max_cpu_percent = 10
            policy.timeout_seconds = 10

    def create_sandbox(self, plugin_name: str) -> Optional[str]:
        """Create sandbox directory for plugin."""
        try:
            # Create temporary directory
            sandbox_dir = tempfile.mkdtemp(prefix=f"plugin_{plugin_name}_")

            # Store sandbox path
            self.sandbox_dirs[plugin_name] = sandbox_dir

            # Set up sandbox structure
            self._setup_sandbox_structure(sandbox_dir, plugin_name)

            self.logger.info(f"Sandbox created for {plugin_name}: {sandbox_dir}")
            return sandbox_dir

        except Exception as e:
            self.logger.error(f"Failed to create sandbox for {plugin_name}: {e}")
            return None

    def _setup_sandbox_structure(self, sandbox_dir: str, plugin_name: str):
        """Set up sandbox directory structure."""
        sandbox_path = Path(sandbox_dir)

        # Create subdirectories
        subdirs = ["data", "logs", "cache", "temp"]
        for subdir in subdirs:
            (sandbox_path / subdir).mkdir(exist_ok=True)

        # Create README
        readme_content = f"""# Plugin Sandbox: {plugin_name}

This directory is a sandbox for the {plugin_name} plugin.
It provides isolated storage and execution environment.

## Directory Structure:
- data/: Plugin data storage
- logs/: Plugin log files
- cache/: Plugin cache files
- temp/: Temporary files

## Security:
- Access is restricted to the plugin
- Files are cleaned up when plugin is unloaded
- Network access is controlled by security policy
"""

        with open(sandbox_path / "README.md", "w") as f:
            f.write(readme_content)

    def cleanup_sandbox(self, plugin_name: str) -> bool:
        """Cleanup plugin sandbox."""
        try:
            if plugin_name in self.sandbox_dirs:
                sandbox_dir = self.sandbox_dirs[plugin_name]
                shutil.rmtree(sandbox_dir)
                del self.sandbox_dirs[plugin_name]

                self.logger.info(f"Sandbox cleaned up for {plugin_name}")
                return True
            else:
                self.logger.warning(f"No sandbox found for {plugin_name}")
                return True

        except Exception as e:
            self.logger.error(f"Failed to cleanup sandbox for {plugin_name}: {e}")
            return False

    def check_file_access(
        self, plugin_name: str, file_path: str, operation: str
    ) -> bool:
        """Check if plugin can access file."""
        if plugin_name not in self.security_policies:
            self.logger.error(f"No security policy for {plugin_name}")
            return False

        policy = self.security_policies[plugin_name]

        # Check if plugin has file access permission
        if operation == "read" and not policy.has_permission("file_read"):
            return False
        elif operation == "write" and not policy.has_permission("file_write"):
            return False
        elif operation == "delete" and not policy.has_permission("file_delete"):
            return False

        # Check if path is allowed
        file_path_obj = Path(file_path).resolve()

        # Allow access to sandbox directory
        if plugin_name in self.sandbox_dirs:
            sandbox_path = Path(self.sandbox_dirs[plugin_name]).resolve()
            if file_path_obj.is_relative_to(sandbox_path):
                return True

        # Check allowed paths
        for allowed_path in policy.allowed_paths:
            allowed_path_obj = Path(allowed_path).resolve()
            if file_path_obj.is_relative_to(allowed_path_obj):
                return True

        self.logger.warning(f"File access denied for {plugin_name}: {file_path}")
        return False

    def check_network_access(self, plugin_name: str, url: str) -> bool:
        """Check if plugin can access network resource."""
        if plugin_name not in self.security_policies:
            self.logger.error(f"No security policy for {plugin_name}")
            return False

        policy = self.security_policies[plugin_name]

        # Check if plugin has network access permission
        if not policy.has_permission("network_access"):
            return False

        # Check allowed networks (simplified - in production, use proper URL parsing)
        if policy.allowed_networks:
            # For now, allow all if network_access permission is granted
            # In production, implement proper URL filtering
            return True

        return True

    def check_system_access(self, plugin_name: str, resource: str) -> bool:
        """Check if plugin can access system resource."""
        if plugin_name not in self.security_policies:
            self.logger.error(f"No security policy for {plugin_name}")
            return False

        policy = self.security_policies[plugin_name]

        # Check specific permissions
        if resource == "system_info" and not policy.has_permission("system_info"):
            return False
        elif resource == "user_data" and not policy.has_permission("user_data"):
            return False
        elif resource == "ai_access" and not policy.has_permission("ai_access"):
            return False
        elif resource == "emulator_access" and not policy.has_permission(
            "emulator_access"
        ):
            return False

        return True

    def get_plugin_sandbox_path(self, plugin_name: str) -> Optional[str]:
        """Get sandbox path for plugin."""
        return self.sandbox_dirs.get(plugin_name)

    def get_security_policy(self, plugin_name: str) -> Optional[SecurityPolicy]:
        """Get security policy for plugin."""
        return self.security_policies.get(plugin_name)

    def update_security_policy(self, plugin_name: str, **kwargs) -> bool:
        """Update security policy for plugin."""
        try:
            if plugin_name not in self.security_policies:
                self.logger.error(f"No security policy for {plugin_name}")
                return False

            policy = self.security_policies[plugin_name]

            # Update policy attributes
            for key, value in kwargs.items():
                if hasattr(policy, key):
                    setattr(policy, key, value)

            self.logger.info(f"Security policy updated for {plugin_name}")
            return True

        except Exception as e:
            self.logger.error(
                f"Failed to update security policy for {plugin_name}: {e}"
            )
            return False

    def revoke_permission(self, plugin_name: str, permission: str) -> bool:
        """Revoke permission from plugin."""
        try:
            if plugin_name not in self.security_policies:
                self.logger.error(f"No security policy for {plugin_name}")
                return False

            policy = self.security_policies[plugin_name]
            policy.permissions.discard(permission)

            self.logger.info(f"Permission {permission} revoked from {plugin_name}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to revoke permission for {plugin_name}: {e}")
            return False

    def grant_permission(self, plugin_name: str, permission: str) -> bool:
        """Grant permission to plugin."""
        try:
            if plugin_name not in self.security_policies:
                self.logger.error(f"No security policy for {plugin_name}")
                return False

            policy = self.security_policies[plugin_name]
            policy.permissions.add(permission)

            self.logger.info(f"Permission {permission} granted to {plugin_name}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to grant permission for {plugin_name}: {e}")
            return False

    def get_security_report(self) -> Dict[str, Any]:
        """Get security report for all plugins."""
        report = {
            "total_plugins": len(self.security_policies),
            "active_plugins": len(self.active_plugins),
            "sandboxed_plugins": len(self.sandbox_dirs),
            "plugins": {},
        }

        for plugin_name, policy in self.security_policies.items():
            report["plugins"][plugin_name] = {
                "permissions": list(policy.permissions),
                "max_memory_mb": policy.max_memory_mb,
                "max_cpu_percent": policy.max_cpu_percent,
                "timeout_seconds": policy.timeout_seconds,
                "has_sandbox": plugin_name in self.sandbox_dirs,
                "is_active": plugin_name in self.active_plugins,
            }

        return report
