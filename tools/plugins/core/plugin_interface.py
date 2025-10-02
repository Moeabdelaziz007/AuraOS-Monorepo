"""
Plugin Interface Definitions

This module defines the core interfaces that all plugins must implement
to integrate with the AI Vintage OS plugin system.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class PluginType(Enum):
    """Types of plugins supported by the system."""

    TOOL = "tool"
    AGENT = "agent"
    SERVICE = "service"
    WIDGET = "widget"
    THEME = "theme"
    LANGUAGE = "language"


class PluginStatus(Enum):
    """Plugin lifecycle status."""

    INSTALLED = "installed"
    LOADED = "loaded"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    ERROR = "error"
    UNINSTALLED = "uninstalled"


@dataclass
class PluginMetadata:
    """Metadata for a plugin."""

    name: str
    version: str
    description: str
    author: str
    plugin_type: PluginType
    dependencies: List[str]
    permissions: List[str]
    tags: List[str]
    icon: Optional[str] = None
    homepage: Optional[str] = None
    license: Optional[str] = None
    min_os_version: Optional[str] = None
    max_os_version: Optional[str] = None


@dataclass
class PluginConfig:
    """Configuration for a plugin."""

    enabled: bool = True
    auto_start: bool = False
    settings: Dict[str, Any] = None
    permissions: List[str] = None

    def __post_init__(self):
        if self.settings is None:
            self.settings = {}
        if self.permissions is None:
            self.permissions = []


class PluginInterface(ABC):
    """Base interface for all plugins."""

    def __init__(self):
        self.metadata: Optional[PluginMetadata] = None
        self.config: Optional[PluginConfig] = None
        self.status: PluginStatus = PluginStatus.INSTALLED
        self.logger = None
        self.event_handlers: Dict[str, List[Callable]] = {}

    @abstractmethod
    def get_metadata(self) -> PluginMetadata:
        """Return plugin metadata."""
        pass

    @abstractmethod
    async def initialize(self, config: PluginConfig) -> bool:
        """Initialize the plugin with given configuration."""
        pass

    @abstractmethod
    async def start(self) -> bool:
        """Start the plugin."""
        pass

    @abstractmethod
    async def stop(self) -> bool:
        """Stop the plugin."""
        pass

    @abstractmethod
    async def cleanup(self) -> bool:
        """Cleanup plugin resources."""
        pass

    def get_status(self) -> PluginStatus:
        """Get current plugin status."""
        return self.status

    def set_status(self, status: PluginStatus):
        """Set plugin status."""
        self.status = status

    def add_event_handler(self, event: str, handler: Callable):
        """Add event handler for plugin events."""
        if event not in self.event_handlers:
            self.event_handlers[event] = []
        self.event_handlers[event].append(handler)

    def emit_event(self, event: str, data: Any = None):
        """Emit an event to registered handlers."""
        if event in self.event_handlers:
            for handler in self.event_handlers[event]:
                try:
                    handler(data)
                except Exception as e:
                    if self.logger:
                        self.logger.error(f"Error in event handler: {e}")


class ToolInterface(PluginInterface):
    """Interface for tool plugins."""

    @abstractmethod
    def get_tools(self) -> List[Dict[str, Any]]:
        """Return list of tools provided by this plugin."""
        pass

    @abstractmethod
    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Any:
        """Execute a tool with given parameters."""
        pass

    @abstractmethod
    def get_tool_schema(self, tool_name: str) -> Dict[str, Any]:
        """Get JSON schema for tool parameters."""
        pass

    def validate_tool_parameters(
        self, tool_name: str, parameters: Dict[str, Any]
    ) -> bool:
        """Validate tool parameters against schema."""
        schema = self.get_tool_schema(tool_name)
        # Basic validation - can be enhanced with jsonschema
        required_params = schema.get("required", [])
        for param in required_params:
            if param not in parameters:
                return False
        return True


class AgentInterface(PluginInterface):
    """Interface for agent plugins."""

    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Return list of agent capabilities."""
        pass

    @abstractmethod
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process an agent request."""
        pass

    @abstractmethod
    async def learn(self, data: Any) -> bool:
        """Learn from new data."""
        pass

    @abstractmethod
    def get_knowledge_base(self) -> Dict[str, Any]:
        """Get agent's knowledge base."""
        pass

    def can_handle(self, request_type: str) -> bool:
        """Check if agent can handle a specific request type."""
        return request_type in self.get_capabilities()


class ServiceInterface(PluginInterface):
    """Interface for service plugins."""

    @abstractmethod
    def get_service_endpoints(self) -> List[Dict[str, Any]]:
        """Return list of service endpoints."""
        pass

    @abstractmethod
    async def handle_request(self, endpoint: str, request: Dict[str, Any]) -> Any:
        """Handle a service request."""
        pass

    @abstractmethod
    def get_service_health(self) -> Dict[str, Any]:
        """Get service health status."""
        pass


class WidgetInterface(PluginInterface):
    """Interface for widget plugins."""

    @abstractmethod
    def get_widget_config(self) -> Dict[str, Any]:
        """Get widget configuration."""
        pass

    @abstractmethod
    def render_widget(self, context: Dict[str, Any]) -> str:
        """Render widget HTML/JS."""
        pass

    @abstractmethod
    def get_widget_styles(self) -> str:
        """Get widget CSS styles."""
        pass

    @abstractmethod
    def get_widget_scripts(self) -> str:
        """Get widget JavaScript."""
        pass


class ThemeInterface(PluginInterface):
    """Interface for theme plugins."""

    @abstractmethod
    def get_theme_config(self) -> Dict[str, Any]:
        """Get theme configuration."""
        pass

    @abstractmethod
    def get_css_variables(self) -> Dict[str, str]:
        """Get CSS custom properties."""
        pass

    @abstractmethod
    def get_color_palette(self) -> Dict[str, str]:
        """Get color palette."""
        pass

    @abstractmethod
    def get_font_config(self) -> Dict[str, Any]:
        """Get font configuration."""
        pass


class LanguageInterface(PluginInterface):
    """Interface for language plugins."""

    @abstractmethod
    def get_language_code(self) -> str:
        """Get language code (e.g., 'en', 'es', 'fr')."""
        pass

    @abstractmethod
    def get_translations(self) -> Dict[str, str]:
        """Get translation dictionary."""
        pass

    @abstractmethod
    def translate(self, key: str, **kwargs) -> str:
        """Translate a key with optional parameters."""
        pass

    @abstractmethod
    def get_date_format(self) -> str:
        """Get date format string."""
        pass

    @abstractmethod
    def get_number_format(self) -> Dict[str, Any]:
        """Get number formatting configuration."""
        pass
