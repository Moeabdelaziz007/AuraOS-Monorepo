"""
AI Vintage OS - Settings Management Module

This module provides comprehensive settings management using Pydantic for validation,
type safety, and automatic configuration loading.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional, Union

from loguru import logger
from pydantic import BaseModel, Field, field_validator, model_validator


class ProjectSettings(BaseModel):
    """Project-level configuration settings."""

    name: str = Field(default="AI Vintage OS", description="Project name")
    version: str = Field(default="1.0.0", description="Project version")
    environment: str = Field(
        default="development",
        description="Environment (development, production, testing)",
    )
    debug: bool = Field(default=True, description="Enable debug mode")
    log_level: str = Field(default="INFO", description="Logging level")


class AIProviderSettings(BaseModel):
    """AI provider configuration settings."""

    enabled: bool = Field(default=True, description="Enable this AI provider")
    api_key: str = Field(default="", description="API key for the provider")
    model: str = Field(default="gpt-4", description="Model to use")
    max_tokens: int = Field(
        default=4000, ge=1, le=32000, description="Maximum tokens per request"
    )
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Temperature for response generation"
    )
    timeout: int = Field(
        default=30, ge=1, le=300, description="Request timeout in seconds"
    )
    retry_attempts: int = Field(
        default=3, ge=0, le=10, description="Number of retry attempts"
    )
    fallback_model: Optional[str] = Field(
        default=None, description="Fallback model if primary fails"
    )


class AISettings(BaseModel):
    """AI service configuration settings."""

    providers: Dict[str, AIProviderSettings] = Field(
        default_factory=dict, description="AI provider configurations"
    )
    default_provider: str = Field(default="openai", description="Default AI provider")
    fallback_provider: str = Field(default="google", description="Fallback AI provider")
    rate_limiting: Dict[str, int] = Field(
        default_factory=lambda: {
            "requests_per_minute": 60,
            "requests_per_hour": 1000,
            "burst_limit": 10,
        },
        description="Rate limiting configuration",
    )
    caching: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "ttl_seconds": 3600,
            "max_cache_size": 1000,
        },
        description="Caching configuration",
    )


class BridgeSettings(BaseModel):
    """Bridge layer configuration settings."""

    host: str = Field(default="localhost", description="Bridge server host")
    port: int = Field(default=8000, ge=1, le=65535, description="Bridge server port")
    debug: bool = Field(default=True, description="Enable debug mode")
    translation: Dict[str, Any] = Field(
        default_factory=lambda: {
            "max_command_length": 1000,
            "timeout_seconds": 30,
            "retry_attempts": 3,
            "command_validation": True,
            "syntax_checking": True,
        },
        description="Translation configuration",
    )
    logging: Dict[str, Any] = Field(
        default_factory=lambda: {
            "level": "INFO",
            "format": "json",
            "file_path": "logs/bridge.log",
            "max_file_size": "10MB",
            "backup_count": 5,
        },
        description="Logging configuration",
    )
    performance: Dict[str, Any] = Field(
        default_factory=lambda: {
            "max_concurrent_requests": 10,
            "request_timeout": 30,
            "connection_pool_size": 20,
        },
        description="Performance configuration",
    )


class EngineSettings(BaseModel):
    """Engine and emulator configuration settings."""

    emulator: Dict[str, Any] = Field(
        default_factory=lambda: {
            "type": "vice",
            "path": "engine/emulator/vice",
            "executable": "x64sc",
            "config_file": "engine/emulator/vice.conf",
            "rom_path": "engine/basic-m6502/roms",
            "save_path": "engine/emulator/saves",
        },
        description="Emulator configuration",
    )
    basic_m6502: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "version": "1.1",
            "memory_size": 65536,
            "startup_commands": ['LOAD "*",8', "RUN"],
            "timeout_seconds": 60,
        },
        description="BASIC-M6502 configuration",
    )
    performance: Dict[str, Any] = Field(
        default_factory=lambda: {
            "speed": "normal",
            "cpu_speed": 1.0,
            "turbo_mode": False,
            "frame_skip": 1,
        },
        description="Performance configuration",
    )
    logging: Dict[str, Any] = Field(
        default_factory=lambda: {
            "level": "INFO",
            "file_path": "logs/engine.log",
            "command_logging": True,
            "response_logging": True,
            "debug_mode": False,
        },
        description="Logging configuration",
    )
    audio: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "sample_rate": 44100,
            "buffer_size": 1024,
        },
        description="Audio configuration",
    )
    video: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "width": 640,
            "height": 480,
            "fullscreen": False,
            "scaling": "linear",
        },
        description="Video configuration",
    )


class UISettings(BaseModel):
    """User interface configuration settings."""

    theme: Dict[str, Any] = Field(
        default_factory=lambda: {
            "name": "quantum-space",
            "primary_color": "#0066cc",
            "secondary_color": "#4d9fff",
            "background_color": "#1a1a1a",
            "text_color": "#ffffff",
            "accent_color": "#00ff88",
            "dark_mode": True,
        },
        description="Theme configuration",
    )
    layout: Dict[str, Any] = Field(
        default_factory=lambda: {
            "sidebar_width": 250,
            "header_height": 60,
            "footer_height": 40,
            "window_padding": 16,
            "border_radius": 8,
            "animation_duration": 300,
        },
        description="Layout configuration",
    )
    fonts: Dict[str, Any] = Field(
        default_factory=lambda: {
            "primary": "Inter",
            "secondary": "JetBrains Mono",
            "size": {"small": 12, "medium": 14, "large": 16, "xlarge": 20},
            "weight": {"light": 300, "normal": 400, "medium": 500, "bold": 700},
        },
        description="Font configuration",
    )
    animations: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "fade_in_duration": 200,
            "slide_duration": 300,
            "bounce_enabled": False,
            "reduced_motion": False,
        },
        description="Animation configuration",
    )
    accessibility: Dict[str, Any] = Field(
        default_factory=lambda: {
            "high_contrast": False,
            "large_text": False,
            "screen_reader": False,
            "keyboard_navigation": True,
            "focus_indicators": True,
        },
        description="Accessibility configuration",
    )
    responsive: Dict[str, Any] = Field(
        default_factory=lambda: {
            "breakpoints": {"mobile": 768, "tablet": 1024, "desktop": 1440},
            "mobile_first": True,
            "fluid_layout": True,
        },
        description="Responsive design configuration",
    )


class AppSettings(BaseModel):
    """Application-specific configuration settings."""

    enabled: bool = Field(default=True, description="Enable this application")
    name: str = Field(default="", description="Application name")
    description: str = Field(default="", description="Application description")
    precision: str = Field(
        default="medium", description="Precision level (low, medium, high)"
    )
    shortcuts: Dict[str, str] = Field(
        default_factory=dict, description="Keyboard shortcuts"
    )
    features: Dict[str, bool] = Field(default_factory=dict, description="Feature flags")
    settings: Dict[str, Any] = Field(
        default_factory=dict, description="Application-specific settings"
    )


class ServiceSettings(BaseModel):
    """External service configuration settings."""

    enabled: bool = Field(default=True, description="Enable this service")
    api_key: str = Field(default="", description="API key for the service")
    provider: str = Field(default="", description="Service provider")
    endpoint: str = Field(default="", description="Service endpoint URL")
    rate_limit: Dict[str, int] = Field(
        default_factory=dict, description="Rate limiting configuration"
    )
    settings: Dict[str, Any] = Field(
        default_factory=dict, description="Service-specific settings"
    )


class SecuritySettings(BaseModel):
    """Security configuration settings."""

    encryption: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "algorithm": "AES-256-GCM",
            "key_rotation_days": 30,
        },
        description="Encryption configuration",
    )
    api_keys: Dict[str, Any] = Field(
        default_factory=lambda: {
            "encrypt_at_rest": True,
            "encrypt_in_transit": True,
            "key_derivation": "PBKDF2",
        },
        description="API key security configuration",
    )
    permissions: Dict[str, Any] = Field(
        default_factory=lambda: {
            "admin_users": [],
            "guest_mode": True,
            "session_timeout": 3600,
        },
        description="Permission configuration",
    )
    audit: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "log_api_calls": True,
            "log_file_access": True,
            "retention_days": 90,
        },
        description="Audit logging configuration",
    )


class PerformanceSettings(BaseModel):
    """Performance configuration settings."""

    caching: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "memory_limit": "512MB",
            "disk_limit": "1GB",
            "ttl_default": 3600,
        },
        description="Caching configuration",
    )
    optimization: Dict[str, Any] = Field(
        default_factory=lambda: {
            "lazy_loading": True,
            "code_splitting": True,
            "image_optimization": True,
            "minification": True,
        },
        description="Optimization configuration",
    )
    monitoring: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "metrics_collection": True,
            "performance_tracking": True,
            "error_reporting": True,
        },
        description="Monitoring configuration",
    )


class DevelopmentSettings(BaseModel):
    """Development configuration settings."""

    debug: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "verbose_logging": True,
            "performance_profiling": False,
            "memory_profiling": False,
        },
        description="Debug configuration",
    )
    testing: Dict[str, Any] = Field(
        default_factory=lambda: {
            "auto_run_tests": False,
            "coverage_threshold": 80,
            "test_timeout": 30,
        },
        description="Testing configuration",
    )
    hot_reload: Dict[str, Any] = Field(
        default_factory=lambda: {
            "enabled": True,
            "watch_patterns": ["*.py", "*.js", "*.css"],
            "exclude_patterns": ["node_modules", "__pycache__"],
        },
        description="Hot reload configuration",
    )


class AIVintageOSSettings(BaseModel):
    """Main settings class for AI Vintage OS."""

    project: ProjectSettings = Field(default_factory=ProjectSettings)
    ai: AISettings = Field(default_factory=AISettings)
    bridge: BridgeSettings = Field(default_factory=BridgeSettings)
    engine: EngineSettings = Field(default_factory=EngineSettings)
    ui: UISettings = Field(default_factory=UISettings)
    apps: Dict[str, AppSettings] = Field(default_factory=dict)
    services: Dict[str, ServiceSettings] = Field(default_factory=dict)
    security: SecuritySettings = Field(default_factory=SecuritySettings)
    performance: PerformanceSettings = Field(default_factory=PerformanceSettings)
    development: DevelopmentSettings = Field(default_factory=DevelopmentSettings)

    @field_validator("ai")
    @classmethod
    def validate_ai_providers(cls, v):
        """Validate AI provider configurations."""
        if not v.providers:
            logger.warning("No AI providers configured")
        return v

    @field_validator("bridge")
    @classmethod
    def validate_bridge_port(cls, v):
        """Validate bridge port configuration."""
        if v.port < 1024 and not v.debug:
            logger.warning("Using privileged port in production mode")
        return v

    @model_validator(mode="after")
    def validate_environment(self):
        """Validate environment-specific settings."""
        env = self.project.environment

        if env == "production":
            # Production-specific validations
            if self.project.debug:
                logger.warning("Debug mode enabled in production")

            if self.development.debug.get("enabled", True):
                logger.warning("Development debug mode enabled in production")

        return self

    @classmethod
    def load_from_file(cls, file_path: Union[str, Path]) -> "AIVintageOSSettings":
        """Load settings from JSON file."""
        file_path = Path(file_path)

        if not file_path.exists():
            logger.error(f"Settings file not found: {file_path}")
            raise FileNotFoundError(f"Settings file not found: {file_path}")

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            logger.info(f"Loaded settings from {file_path}")
            return cls(**data)

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in settings file: {e}")
            raise ValueError(f"Invalid JSON in settings file: {e}")
        except Exception as e:
            logger.error(f"Error loading settings: {e}")
            raise

    def save_to_file(self, file_path: Union[str, Path]) -> None:
        """Save settings to JSON file."""
        file_path = Path(file_path)

        try:
            # Ensure directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(self.model_dump(), f, indent=2, ensure_ascii=False)

            logger.info(f"Saved settings to {file_path}")

        except Exception as e:
            logger.error(f"Error saving settings: {e}")
            raise

    def get_app_settings(self, app_name: str) -> Optional[AppSettings]:
        """Get settings for a specific application."""
        return self.apps.get(app_name)

    def get_service_settings(self, service_name: str) -> Optional[ServiceSettings]:
        """Get settings for a specific service."""
        return self.services.get(service_name)

    def is_app_enabled(self, app_name: str) -> bool:
        """Check if an application is enabled."""
        app_settings = self.get_app_settings(app_name)
        return app_settings.enabled if app_settings else False

    def is_service_enabled(self, service_name: str) -> bool:
        """Check if a service is enabled."""
        service_settings = self.get_service_settings(service_name)
        return service_settings.enabled if service_settings else False


# Global settings instance
_settings: Optional[AIVintageOSSettings] = None


def load_settings(file_path: Union[str, Path] = "settings.json") -> AIVintageOSSettings:
    """Load global settings from file."""
    global _settings
    _settings = AIVintageOSSettings.load_from_file(file_path)
    return _settings


def get_settings() -> AIVintageOSSettings:
    """Get the global settings instance."""
    global _settings
    if _settings is None:
        _settings = load_settings()
    return _settings


def save_settings(file_path: Union[str, Path] = "settings.json") -> None:
    """Save global settings to file."""
    global _settings
    if _settings is None:
        _settings = AIVintageOSSettings()
    _settings.save_to_file(file_path)


if __name__ == "__main__":
    # Test settings loading and validation
    try:
        settings = load_settings()
        print("✅ Settings loaded successfully")
        print(f"Project: {settings.project.name} v{settings.project.version}")
        print(f"Environment: {settings.project.environment}")
        print(f"Debug mode: {settings.project.debug}")

        # Test app settings
        print(f"Assistant enabled: {settings.is_app_enabled('assistant')}")
        print(f"Browser enabled: {settings.is_app_enabled('browser')}")

        # Test service settings
        print(f"Weather service enabled: {settings.is_service_enabled('weather')}")
        print(f"Images service enabled: {settings.is_service_enabled('images')}")

    except Exception as e:
        print(f"❌ Error loading settings: {e}")
