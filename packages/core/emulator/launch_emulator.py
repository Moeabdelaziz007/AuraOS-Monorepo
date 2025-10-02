#!/usr/bin/env python3
"""
AI Vintage OS - Emulator Launcher

This script provides a command-line interface for launching and controlling
the Py65 6502 emulator with BASIC-M6502 engine integration.
"""

import argparse
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

from loguru import logger

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from bridge.core.settings import get_settings  # noqa: E402
from engine.basic_m6502 import BASICM6502Engine  # noqa: E402
from engine.emulator.m6502_emulator import M6502Emulator  # noqa: E402


class EmulatorLauncher:
    """Main launcher class for the 6502 emulator with BASIC-M6502 integration."""

    def __init__(self):
        """Initialize the emulator launcher."""
        self.settings = get_settings()
        self.emulator = M6502Emulator()
        self.basic_engine = BASICM6502Engine()
        self.is_running = False
        self.current_program = None

        # Configure logging
        logger.remove()
        logger.add(
            sys.stderr,
            level=self.settings.engine.emulator.get("log_level", "INFO"),
            format=(
                "<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                "<level>{message}</level>"
            ),
        )

    def initialize(self) -> bool:
        """Initialize the emulator and BASIC engine."""
        try:
            logger.info("Initializing AI Vintage OS Emulator...")

            # Initialize emulator
            if not self.emulator.initialize_emulator():
                logger.error("Failed to initialize emulator")
                return False

            logger.info("✅ Emulator initialized successfully")
            logger.info(f"Memory: {self.settings.engine.emulator['memory_size']} bytes")
            logger.info(f"CPU Speed: {self.settings.engine.emulator['cpu_speed']} Hz")
            logger.info(f"Debug Mode: {self.settings.engine.emulator['debug_mode']}")

            return True

        except Exception as e:
            logger.error(f"Failed to initialize launcher: {e}")
            return False

    def load_program(self, program_path: str) -> bool:
        """Load a BASIC program from file."""
        try:
            program_file = Path(program_path)

            if not program_file.exists():
                logger.error(f"Program file not found: {program_path}")
                return False

            # Read program content
            with open(program_file, "r", encoding="utf-8") as f:
                program_content = f.read()

            logger.info(f"Loading program: {program_file.name}")

            # Parse BASIC program into commands
            commands = self._parse_basic_program(program_content)

            if not commands:
                logger.error("No valid BASIC commands found in program")
                return False

            # Store current program
            self.current_program = {
                "path": program_path,
                "content": program_content,
                "commands": commands,
            }

            logger.info(f"✅ Program loaded successfully ({len(commands)} commands)")
            return True

        except Exception as e:
            logger.error(f"Failed to load program: {e}")
            return False

    def _parse_basic_program(self, content: str) -> List[str]:
        """Parse BASIC program content into individual commands."""
        commands = []
        lines = content.strip().split("\n")

        for line in lines:
            line = line.strip()
            if not line or line.startswith("REM"):
                continue

            # Extract command from line number
            if " " in line:
                command = line.split(" ", 1)[1]
                commands.append(command)
            else:
                commands.append(line)

        return commands

    def run_program(self, steps: int = 100) -> Dict[str, Any]:
        """Run the loaded BASIC program."""
        if not self.current_program:
            logger.error("No program loaded")
            return {"error": "No program loaded"}

        try:
            logger.info("Starting program execution...")
            self.is_running = True

            results = {
                "commands_executed": 0,
                "output": [],
                "errors": [],
                "cpu_states": [],
            }

            # Execute each BASIC command
            for i, command in enumerate(self.current_program["commands"]):
                if not self.is_running:
                    break

                logger.info(f"Executing command {i+1}: {command}")

                # Execute command through emulator
                result = self.emulator.execute_basic_command(command)

                if result.get("success"):
                    results["commands_executed"] += 1

                    # Capture output
                    if "output" in result:
                        results["output"].append(result["output"])
                        logger.info(f"Output: {result['output']}")

                    # Capture CPU state
                    cpu_state = self.emulator.get_cpu_state()
                    results["cpu_states"].append(cpu_state)

                else:
                    error_msg = result.get("error", "Unknown error")
                    results["errors"].append(f"Command {i+1}: {error_msg}")
                    logger.error(f"Command failed: {error_msg}")

                # Small delay for readability
                time.sleep(0.1)

            logger.info(
                f"✅ Program execution completed "
                f"({results['commands_executed']} commands)"
            )
            return results

        except Exception as e:
            logger.error(f"Program execution failed: {e}")
            return {"error": str(e)}

    def step_execution(self, steps: int = 1) -> Dict[str, Any]:
        """Step through program execution."""
        try:
            logger.info(f"Stepping through {steps} instruction(s)...")

            result = self.emulator.execute_program(steps)

            if result.get("error"):
                logger.error(f"Step execution error: {result['error']}")
            else:
                logger.info(f"✅ Executed {result['steps_executed']} steps")

            return result

        except Exception as e:
            logger.error(f"Step execution failed: {e}")
            return {"error": str(e)}

    def show_cpu_state(self) -> None:
        """Display current CPU state."""
        try:
            cpu_state = self.emulator.get_cpu_state()

            if "error" in cpu_state:
                logger.error(f"Failed to get CPU state: {cpu_state['error']}")
                return

            print("\n" + "=" * 50)
            print("CPU STATE")
            print("=" * 50)
            print(f"Program Counter (PC): 0x{cpu_state['pc']:04X}")
            print(f"Accumulator (A):       0x{cpu_state['a']:02X}")
            print(f"X Register:           0x{cpu_state['x']:02X}")
            print(f"Y Register:           0x{cpu_state['y']:02X}")
            print(f"Stack Pointer (SP):   0x{cpu_state['sp']:02X}")
            print(f"Status Register (P):  0x{cpu_state['status']:02X}")

            print("\nStatus Flags:")
            flags = cpu_state["flags"]
            for flag_name, flag_value in flags.items():
                status = "SET" if flag_value else "CLEAR"
                print(f"  {flag_name.upper():<12}: {status}")

            print("=" * 50)

        except Exception as e:
            logger.error(f"Failed to display CPU state: {e}")

    def show_memory_dump(self, start_addr: int = 0x8000, length: int = 16) -> None:
        """Display memory dump."""
        try:
            dump = self.emulator.get_memory_dump(start_addr, length)

            if "error" in dump:
                logger.error(f"Failed to get memory dump: {dump['error']}")
                return

            print(
                f"\nMemory Dump (0x{start_addr:04X} - 0x{start_addr + length - 1:04X})"
            )
            print("=" * 60)

            for i in range(0, length, 8):
                addr = start_addr + i
                hex_values = []
                ascii_values = []

                for j in range(8):
                    if i + j < length:
                        byte_addr = start_addr + i + j
                        byte_value = dump[f"0x{byte_addr:04X}"]
                        hex_values.append(f"{byte_value:02X}")
                        ascii_values.append(
                            chr(byte_value) if 32 <= byte_value <= 126 else "."
                        )
                    else:
                        hex_values.append("  ")
                        ascii_values.append(" ")

                hex_str = " ".join(hex_values)
                ascii_str = "".join(ascii_values)
                print(f"0x{addr:04X}: {hex_str} |{ascii_str}|")

            print("=" * 60)

        except Exception as e:
            logger.error(f"Failed to display memory dump: {e}")

    def reset_emulator(self) -> bool:
        """Reset the emulator to initial state."""
        try:
            logger.info("Resetting emulator...")

            if self.emulator.reset_emulator():
                self.is_running = False
                self.current_program = None
                logger.info("✅ Emulator reset successfully")
                return True
            else:
                logger.error("Failed to reset emulator")
                return False

        except Exception as e:
            logger.error(f"Reset failed: {e}")
            return False

    def show_help(self) -> None:
        """Display help information."""
        help_text = """
AI Vintage OS - Emulator Launcher Help
=====================================

Commands:
  load <file>     Load a BASIC program from file
  run [steps]     Run the loaded program (default: 100 steps)
  step [count]    Step through execution (default: 1 step)
  cpu            Show current CPU state
  memory [addr] [len]  Show memory dump (default: 0x8000, 16 bytes)
  reset          Reset emulator to initial state
  help           Show this help message
  quit           Exit the launcher

Examples:
  load sample.bas
  run 50
  step 5
  memory 0x8000 32
  cpu
  reset

Settings:
  Memory Size: {memory_size} bytes
  CPU Speed: {cpu_speed} Hz
  Debug Mode: {debug_mode}
        """.format(
            memory_size=self.settings.engine.emulator["memory_size"],
            cpu_speed=self.settings.engine.emulator["cpu_speed"],
            debug_mode=self.settings.engine.emulator["debug_mode"],
        )

        print(help_text)

    def interactive_mode(self) -> None:
        """Start interactive command mode."""
        print("\n" + "=" * 60)
        print("AI Vintage OS - Emulator Launcher")
        print("=" * 60)
        print("Type 'help' for commands, 'quit' to exit")
        print("=" * 60)

        while True:
            try:
                command = input("\nemulator> ").strip()

                if not command:
                    continue

                parts = command.split()
                cmd = parts[0].lower()

                if cmd == "quit" or cmd == "exit":
                    logger.info("Exiting emulator launcher...")
                    break

                elif cmd == "help":
                    self.show_help()

                elif cmd == "load":
                    if len(parts) < 2:
                        print("Usage: load <filename>")
                    else:
                        self.load_program(parts[1])

                elif cmd == "run":
                    steps = int(parts[1]) if len(parts) > 1 else 100
                    self.run_program(steps)

                elif cmd == "step":
                    count = int(parts[1]) if len(parts) > 1 else 1
                    self.step_execution(count)

                elif cmd == "cpu":
                    self.show_cpu_state()

                elif cmd == "memory":
                    start_addr = int(parts[1], 16) if len(parts) > 1 else 0x8000
                    length = int(parts[2]) if len(parts) > 2 else 16
                    self.show_memory_dump(start_addr, length)

                elif cmd == "reset":
                    self.reset_emulator()

                else:
                    print(
                        f"Unknown command: {cmd}. Type 'help' for available commands."
                    )

            except KeyboardInterrupt:
                print("\nUse 'quit' to exit")
            except Exception as e:
                logger.error(f"Command error: {e}")


def main():
    """Main entry point for the emulator launcher."""
    parser = argparse.ArgumentParser(
        description="AI Vintage OS - 6502 Emulator Launcher",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python launch_emulator.py --interactive
  python launch_emulator.py --load sample.bas --run
  python launch_emulator.py --load program.bas --step 10 --cpu
        """,
    )

    parser.add_argument(
        "--interactive", "-i", action="store_true", help="Start interactive mode"
    )

    parser.add_argument("--load", "-l", type=str, help="Load a BASIC program file")

    parser.add_argument(
        "--run", "-r", action="store_true", help="Run the loaded program"
    )

    parser.add_argument(
        "--steps",
        "-s",
        type=int,
        default=100,
        help="Number of steps to execute (default: 100)",
    )

    parser.add_argument(
        "--cpu", action="store_true", help="Show CPU state after execution"
    )

    parser.add_argument(
        "--memory",
        "-m",
        nargs=2,
        metavar=("ADDR", "LENGTH"),
        help="Show memory dump (address in hex, length in decimal)",
    )

    parser.add_argument(
        "--reset", action="store_true", help="Reset emulator before other operations"
    )

    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )

    parser.add_argument(
        "--speed", "-sp", type=float, help="Set speed multiplier (0.1 to 10.0)"
    )

    parser.add_argument(
        "--log-level",
        "-ll",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Set logging level",
    )

    parser.add_argument(
        "--performance-stats", action="store_true", help="Show performance statistics"
    )

    parser.add_argument(
        "--reset-stats", action="store_true", help="Reset performance statistics"
    )

    args = parser.parse_args()

    # Create launcher
    launcher = EmulatorLauncher()

    # Set verbose logging if requested
    if args.verbose:
        logger.remove()
        logger.add(sys.stderr, level="DEBUG")

    # Initialize emulator
    if not launcher.initialize():
        logger.error("Failed to initialize emulator launcher")
        sys.exit(1)

    # Handle command line arguments
    if args.interactive:
        launcher.interactive_mode()
    else:
        # Non-interactive mode
        try:
            # Handle speed and logging settings
            if args.speed:
                launcher.emulator.set_speed_multiplier(args.speed)

            if args.log_level:
                launcher.emulator.set_logging_level(args.log_level)

            if args.reset_stats:
                launcher.emulator.reset_performance_stats()

            if args.reset:
                launcher.reset_emulator()

            if args.load:
                if not launcher.load_program(args.load):
                    sys.exit(1)

            if args.run:
                launcher.run_program(args.steps)

            if args.cpu:
                launcher.show_cpu_state()

            if args.memory:
                addr = int(args.memory[0], 16)
                length = int(args.memory[1])
                launcher.show_memory_dump(addr, length)

            if args.performance_stats:
                stats = launcher.emulator.get_performance_stats()
                print("\n" + "=" * 60)
                print("PERFORMANCE STATISTICS")
                print("=" * 60)
                print(f"Speed Controller: {stats['speed_controller']['enabled']}")
                print(
                    f"Speed Multiplier: {stats['speed_controller']['current_multiplier']:.2f}x"
                )
                print(
                    f"Cycle Delay: {stats['speed_controller']['cycle_delay_ms']:.3f}ms"
                )
                print(f"Step Delay: {stats['speed_controller']['step_delay_ms']:.3f}ms")

                if stats["emulator_logger"]["instruction_count"] > 0:
                    print(
                        f"\nInstructions Executed: {stats['emulator_logger']['instruction_count']}"
                    )
                    print(
                        f"Average Instruction Time: {stats['emulator_logger'].get('avg_instruction_time_ms', 0):.3f}ms"
                    )

                if stats["emulator_logger"]["basic_command_count"] > 0:
                    print(
                        f"BASIC Commands Executed: {stats['emulator_logger']['basic_command_count']}"
                    )
                    print(
                        f"Average Command Time: {stats['emulator_logger'].get('avg_basic_command_time_ms', 0):.3f}ms"
                    )

                print("=" * 60)

        except Exception as e:
            logger.error(f"Execution error: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
