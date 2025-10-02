#!/usr/bin/env python3
"""
AI Vintage OS - Bridge Launcher

This script provides a simple way to launch the bridge server with proper
configuration and environment setup. It handles initialization, dependency
checking, and graceful shutdown.
"""

import argparse
import asyncio
import signal
import sys
import time
from pathlib import Path

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.bridge_server import BridgeServer
from bridge.core.settings import get_settings


class BridgeLauncher:
    """Main launcher class for the bridge server."""

    def __init__(self):
        """Initialize the bridge launcher."""
        self.settings = get_settings()
        self.bridge_server = None
        self.is_running = False

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        logger.info("Bridge launcher initialized")

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.is_running = False

    async def check_dependencies(self) -> bool:
        """Check if all required dependencies are available."""
        try:
            logger.info("Checking dependencies...")

            # Check if emulator components are available
            try:
                from engine.basic_m6502 import BASICM6502Engine
                from engine.emulator.m6502_emulator import M6502Emulator

                logger.info("✅ Emulator components found")
            except ImportError as e:
                logger.error(f"❌ Missing emulator components: {e}")
                return False

            # Check if required packages are installed
            required_packages = ["fastapi", "uvicorn", "loguru", "pydantic"]

            missing_packages = []
            for package in required_packages:
                try:
                    __import__(package)
                    logger.info(f"✅ {package} is available")
                except ImportError:
                    missing_packages.append(package)
                    logger.error(f"❌ {package} is missing")

            if missing_packages:
                logger.error(
                    f"Missing required packages: {', '.join(missing_packages)}"
                )
                logger.error(
                    "Install them with: pip install " + " ".join(missing_packages)
                )
                return False

            logger.info("✅ All dependencies are available")
            return True

        except Exception as e:
            logger.error(f"❌ Dependency check failed: {e}")
            return False

    async def initialize_bridge(self) -> bool:
        """Initialize the bridge server."""
        try:
            logger.info("Initializing bridge server...")

            self.bridge_server = BridgeServer()

            # Initialize bridge components
            if not await self.bridge_server.initialize():
                logger.error("❌ Failed to initialize bridge server")
                return False

            logger.info("✅ Bridge server initialized successfully")
            return True

        except Exception as e:
            logger.error(f"❌ Bridge initialization failed: {e}")
            return False

    async def start_server(self):
        """Start the bridge server."""
        try:
            logger.info("Starting bridge server...")
            logger.info(f"Host: {self.settings.bridge.host}")
            logger.info(f"Port: {self.settings.bridge.port}")
            logger.info(f"Debug mode: {self.settings.bridge.debug}")

            self.is_running = True

            # Start the server
            import uvicorn

            config = uvicorn.Config(
                self.bridge_server.app,
                host=self.settings.bridge.host,
                port=self.settings.bridge.port,
                reload=self.settings.bridge.debug,
                log_level=self.settings.bridge.logging.get("level", "info").lower(),
                access_log=True,
            )

            server = uvicorn.Server(config)

            logger.info("🚀 Bridge server is starting...")
            logger.info(
                f"📡 API available at: http://{self.settings.bridge.host}:{self.settings.bridge.port}"
            )
            logger.info(
                f"🔌 WebSocket available at: ws://{self.settings.bridge.host}:{self.settings.bridge.port}/ws"
            )
            logger.info(
                "📚 API documentation at: http://{self.settings.bridge.host}:{self.settings.bridge.port}/docs"
            )
            logger.info("Press Ctrl+C to stop the server")

            # Run the server
            await server.serve()

        except Exception as e:
            logger.error(f"❌ Failed to start server: {e}")
            return False

    async def shutdown(self):
        """Shutdown the bridge server gracefully."""
        try:
            logger.info("Shutting down bridge server...")

            self.is_running = False

            if self.bridge_server:
                await self.bridge_server.shutdown()

            logger.info("✅ Bridge server shut down successfully")

        except Exception as e:
            logger.error(f"❌ Error during shutdown: {e}")

    async def run(self):
        """Main run method."""
        try:
            # Check dependencies
            if not await self.check_dependencies():
                logger.error("❌ Dependency check failed, cannot start bridge server")
                return False

            # Initialize bridge
            if not await self.initialize_bridge():
                logger.error("❌ Bridge initialization failed, cannot start server")
                return False

            # Start server
            await self.start_server()

            return True

        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt, shutting down...")
            await self.shutdown()
            return True

        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            await self.shutdown()
            return False


def main():
    """Main entry point for the bridge launcher."""
    parser = argparse.ArgumentParser(
        description="AI Vintage OS - Bridge Server Launcher",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python launch_bridge.py                    # Start with default settings
  python launch_bridge.py --host 0.0.0.0    # Start on all interfaces
  python launch_bridge.py --port 8080       # Start on custom port
  python launch_bridge.py --debug           # Start in debug mode
  python launch_bridge.py --check-deps      # Check dependencies only
        """,
    )

    parser.add_argument(
        "--host", type=str, help="Host address to bind to (default: from settings)"
    )

    parser.add_argument(
        "--port", type=int, help="Port number to bind to (default: from settings)"
    )

    parser.add_argument("--debug", action="store_true", help="Enable debug mode")

    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Set logging level",
    )

    parser.add_argument(
        "--check-deps", action="store_true", help="Check dependencies and exit"
    )

    parser.add_argument(
        "--version", action="version", version="AI Vintage OS Bridge Server 1.0.0"
    )

    args = parser.parse_args()

    # Load settings
    settings = get_settings()

    # Override settings with command line arguments
    if args.host:
        settings.bridge.host = args.host
    if args.port:
        settings.bridge.port = args.port
    if args.debug:
        settings.bridge.debug = True
    if args.log_level:
        settings.bridge.logging["level"] = args.log_level

    # Configure logging
    logger.remove()
    logger.add(
        sys.stderr,
        level=settings.bridge.logging.get("level", "INFO"),
        format=(
            "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
            "<cyan>Bridge</cyan> - <level>{message}</level>"
        ),
    )

    # Create launcher
    launcher = BridgeLauncher()

    # Check dependencies only
    if args.check_deps:
        logger.info("Checking dependencies...")
        success = asyncio.run(launcher.check_dependencies())
        if success:
            logger.info("✅ All dependencies are satisfied")
            sys.exit(0)
        else:
            logger.error("❌ Missing dependencies")
            sys.exit(1)

    # Start the bridge server
    logger.info("Starting AI Vintage OS Bridge Server...")
    logger.info(f"Configuration: {settings.bridge.host}:{settings.bridge.port}")

    try:
        success = asyncio.run(launcher.run())
        if success:
            logger.info("✅ Bridge server completed successfully")
            sys.exit(0)
        else:
            logger.error("❌ Bridge server failed")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Bridge server stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
