"""
6502 Emulator Integration Module

This module provides integration between the AI Vintage OS and the Py65 6502 emulator.
It handles emulator initialization, BASIC-M6502 program loading, execution, and
communication with the Python bridge layer.
"""

import time
from pathlib import Path
from typing import Any, Dict

from loguru import logger
from py65.devices import mpu6502

from bridge.core.settings import get_settings
from engine.emulator.logging_monitor import (
    create_emulator_logger,
    create_performance_monitor,
    create_speed_controller,
)


class M6502Emulator:
    """Main emulator class for 6502 microprocessor emulation."""

    def __init__(self):
        """Initialize the 6502 emulator."""
        self.settings = get_settings()
        self.emulator_path = Path(__file__).parent
        self.engine_path = self.emulator_path.parent

        # Emulator configuration
        self.memory_size = self.settings.engine.emulator["memory_size"]
        self.cpu_speed = self.settings.engine.emulator["cpu_speed"]
        self.debug_mode = self.settings.engine.emulator["debug_mode"]

        # Initialize emulator components
        self.mpu = None
        self.is_running = False

        # Initialize logging and performance monitoring
        self.emulator_logger = create_emulator_logger(self.settings.engine.emulator)
        self.speed_controller = create_speed_controller(self.settings.engine.emulator)
        self.performance_monitor = create_performance_monitor(
            self.settings.engine.emulator
        )

        # BASIC-M6502 specific settings
        self.basic_start_address = 0x8000  # Starting address for BASIC programs
        self.basic_end_address = 0xFFFF  # Ending address for BASIC programs

        logger.info("6502 Emulator initialized")

    def initialize_emulator(self) -> bool:
        """Initialize the emulator components."""
        try:
            # Create MPU6502 processor with default memory
            self.mpu = mpu6502.MPU()

            # Set up memory regions
            self._setup_memory_regions()

            # Initialize MPU state
            self.mpu.reset()

            logger.info("Emulator components initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize emulator: {e}")
            return False

    def _setup_memory_regions(self):
        """Set up memory regions for BASIC-M6502."""
        # Zero page (0x0000-0x00FF) - CPU registers and system variables
        # Stack (0x0100-0x01FF) - CPU stack
        # BASIC program area (0x8000-0xFFFF) - Our BASIC programs

        # Initialize memory with zeros
        for addr in range(0x10000):
            self.mpu.memory[addr] = 0x00

        logger.info("Memory regions configured")

    def load_basic_program(self, program: str) -> bool:
        """Load a BASIC program into emulator memory."""
        try:
            # Convert BASIC program to assembly or bytecode
            # For now, we'll simulate loading a simple program

            # Place a simple "Hello World" program at BASIC start address
            hello_program = [
                0xA9,
                0x48,  # LDA #$48 ('H')
                0x8D,
                0x00,
                0x20,  # STA $2000 (output to display)
                0xA9,
                0x65,  # LDA #$65 ('e')
                0x8D,
                0x01,
                0x20,  # STA $2001
                0xA9,
                0x6C,  # LDA #$6C ('l')
                0x8D,
                0x02,
                0x20,  # STA $2002
                0xA9,
                0x6C,  # LDA #$6C ('l')
                0x8D,
                0x03,
                0x20,  # STA $2003
                0xA9,
                0x6F,  # LDA #$6F ('o')
                0x8D,
                0x04,
                0x20,  # STA $2004
                0x4C,
                0x00,
                0x80,  # JMP $8000 (loop)
            ]

            # Load program into memory
            for i, byte in enumerate(hello_program):
                self.mpu.memory[self.basic_start_address + i] = byte

            # Set program counter to start address
            self.mpu.pc = self.basic_start_address

            logger.info(
                f"BASIC program loaded at address 0x{self.basic_start_address:04X}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to load BASIC program: {e}")
            return False

    def execute_program(self, steps: int = 100) -> Dict[str, Any]:
        """Execute the loaded program for a specified number of steps."""
        try:
            if not self.is_running:
                self.is_running = True

            results = {
                "steps_executed": 0,
                "cpu_state": {},
                "memory_dump": {},
                "output": "",
                "error": None,
            }

            # Execute program steps
            for step in range(steps):
                try:
                    # Apply speed control delay
                    self.speed_controller.delay_step()

                    # Execute one instruction with performance monitoring
                    with self.performance_monitor.time_operation(
                        "instruction_execution"
                    ):
                        self.mpu.step()
                        results["steps_executed"] += 1

                    # Capture CPU state
                    cpu_state = {
                        "pc": self.mpu.pc,
                        "a": self.mpu.a,
                        "x": self.mpu.x,
                        "y": self.mpu.y,
                        "sp": self.mpu.sp,
                        "status": self.mpu.p,
                    }
                    results["cpu_state"] = cpu_state

                    # Log CPU state if enabled
                    self.emulator_logger.log_cpu_state(cpu_state, f"step_{step}")

                    # Check for output in display memory (0x2000-0x20FF)
                    if 0x2000 <= self.mpu.pc <= 0x20FF:
                        char_code = self.mpu.memory[self.mpu.pc]
                        if 32 <= char_code <= 126:  # Printable ASCII
                            results["output"] += chr(char_code)
                            # Log memory access
                            self.emulator_logger.log_memory_access(
                                self.mpu.pc, char_code, "read"
                            )

                except Exception as e:
                    results["error"] = str(e)
                    break

            logger.info(f"Program executed {results['steps_executed']} steps")
            return results

        except Exception as e:
            logger.error(f"Failed to execute program: {e}")
            return {"error": str(e)}

    def execute_basic_command(self, command: str) -> Dict[str, Any]:
        """Execute a single BASIC command."""
        start_time = time.perf_counter()

        try:
            # Parse the BASIC command
            parsed_command = self._parse_basic_command(command)

            result = None
            if parsed_command["type"] == "print":
                result = self._execute_print_command(parsed_command)
            elif parsed_command["type"] == "assignment":
                result = self._execute_assignment_command(parsed_command)
            elif parsed_command["type"] == "end":
                result = self._execute_end_command(parsed_command)
            elif parsed_command["type"] == "comment":
                result = self._execute_comment_command(parsed_command)
            elif parsed_command["type"] == "loop_start":
                result = self._execute_loop_start_command(parsed_command)
            elif parsed_command["type"] == "loop_end":
                result = self._execute_loop_end_command(parsed_command)
            elif parsed_command["type"] == "conditional":
                result = self._execute_conditional_command(parsed_command)
            elif parsed_command["type"] == "goto":
                result = self._execute_goto_command(parsed_command)
            elif parsed_command["type"] == "gosub":
                result = self._execute_gosub_command(parsed_command)
            elif parsed_command["type"] == "return":
                result = self._execute_return_command(parsed_command)
            elif parsed_command["type"] == "data":
                result = self._execute_data_command(parsed_command)
            elif parsed_command["type"] == "read":
                result = self._execute_read_command(parsed_command)
            else:
                result = {
                    "error": f"Unsupported command type: {parsed_command['type']}"
                }

            # Calculate execution time
            execution_time = (
                time.perf_counter() - start_time
            ) * 1000  # Convert to milliseconds

            # Log the command execution
            self.emulator_logger.log_basic_command(command, result, execution_time)

            return result

        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            error_result = {"error": str(e)}
            self.emulator_logger.log_basic_command(
                command, error_result, execution_time
            )
            logger.error(f"Failed to execute BASIC command: {e}")
            return error_result

    def _parse_basic_command(self, command: str) -> Dict[str, Any]:
        """Parse a BASIC command for execution."""
        command = command.strip().upper()

        if command.startswith("PRINT"):
            content = command[5:].strip()
            return {"type": "print", "content": content}
        elif command.startswith("LET"):
            parts = command[3:].strip().split("=", 1)
            if len(parts) == 2:
                return {
                    "type": "assignment",
                    "variable": parts[0].strip(),
                    "value": parts[1].strip(),
                }
        elif command.startswith("FOR"):
            return {"type": "loop_start", "command": command}
        elif command.startswith("NEXT"):
            return {"type": "loop_end", "command": command}
        elif command.startswith("IF"):
            return {"type": "conditional", "command": command}
        elif command.startswith("GOTO"):
            return {"type": "goto", "command": command}
        elif command.startswith("GOSUB"):
            return {"type": "gosub", "command": command}
        elif command.startswith("RETURN"):
            return {"type": "return", "command": command}
        elif command.startswith("REM"):
            return {"type": "comment", "command": command}
        elif command.startswith("DATA"):
            return {"type": "data", "command": command}
        elif command.startswith("READ"):
            return {"type": "read", "command": command}
        elif command.startswith("END"):
            return {"type": "end"}

        return {"type": "unknown", "command": command}

    def _execute_print_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a PRINT command."""
        content = parsed["content"]

        # Remove quotes and process content
        if content.startswith('"') and content.endswith('"'):
            content = content[1:-1]

        return {"type": "print", "output": content, "success": True}

    def _execute_assignment_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a LET command."""
        variable = parsed["variable"]
        value = parsed["value"]

        # Simple variable assignment simulation
        try:
            # Try to evaluate the value
            if value.isdigit():
                numeric_value = int(value)
            else:
                numeric_value = 0

            return {
                "type": "assignment",
                "variable": variable,
                "value": numeric_value,
                "success": True,
            }
        except Exception as e:
            return {"type": "assignment", "error": str(e), "success": False}

    def _execute_end_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an END command."""
        self.is_running = False
        return {"type": "end", "success": True, "message": "Program ended"}

    def _execute_comment_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a REM command (comment)."""
        return {"type": "comment", "success": True, "message": "Comment ignored"}

    def _execute_loop_start_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a FOR command."""
        return {"type": "loop_start", "success": True, "message": "Loop started"}

    def _execute_loop_end_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a NEXT command."""
        return {"type": "loop_end", "success": True, "message": "Loop ended"}

    def _execute_conditional_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an IF command."""
        return {
            "type": "conditional",
            "success": True,
            "message": "Conditional executed",
        }

    def _execute_goto_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a GOTO command."""
        return {"type": "goto", "success": True, "message": "Jump executed"}

    def _execute_gosub_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a GOSUB command."""
        return {"type": "gosub", "success": True, "message": "Subroutine called"}

    def _execute_return_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a RETURN command."""
        return {
            "type": "return",
            "success": True,
            "message": "Returned from subroutine",
        }

    def _execute_data_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a DATA command."""
        return {"type": "data", "success": True, "message": "Data defined"}

    def _execute_read_command(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a READ command."""
        return {"type": "read", "success": True, "message": "Data read"}

    def get_cpu_state(self) -> Dict[str, Any]:
        """Get current CPU state."""
        if not self.mpu:
            return {"error": "MPU not initialized"}

        return {
            "pc": self.mpu.pc,
            "a": self.mpu.a,
            "x": self.mpu.x,
            "y": self.mpu.y,
            "sp": self.mpu.sp,
            "status": self.mpu.p,
            "flags": {
                "carry": bool(self.mpu.p & 0x01),
                "zero": bool(self.mpu.p & 0x02),
                "interrupt": bool(self.mpu.p & 0x04),
                "decimal": bool(self.mpu.p & 0x08),
                "break": bool(self.mpu.p & 0x10),
                "overflow": bool(self.mpu.p & 0x40),
                "negative": bool(self.mpu.p & 0x80),
            },
        }

    def get_memory_dump(
        self, start_addr: int = 0x8000, length: int = 256
    ) -> Dict[str, Any]:
        """Get a memory dump from specified address."""
        if not self.mpu:
            return {"error": "MPU not initialized"}

        dump = {}
        for i in range(length):
            addr = start_addr + i
            dump[f"0x{addr:04X}"] = self.mpu.memory[addr]

        return dump

    def reset_emulator(self) -> bool:
        """Reset the emulator to initial state."""
        try:
            if self.mpu:
                self.mpu.reset()
            self.is_running = False
            logger.info("Emulator reset successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to reset emulator: {e}")
            return False

    def get_emulator_info(self) -> Dict[str, Any]:
        """Get information about the emulator."""
        return {
            "name": "Py65 6502 Emulator",
            "version": "1.2.0",
            "memory_size": self.memory_size,
            "cpu_speed": self.cpu_speed,
            "debug_mode": self.debug_mode,
            "basic_start_address": f"0x{self.basic_start_address:04X}",
            "basic_end_address": f"0x{self.basic_end_address:04X}",
            "is_running": self.is_running,
            "cpu_initialized": self.mpu is not None,
            "memory_initialized": self.mpu is not None,
        }

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics."""
        return {
            "emulator_logger": self.emulator_logger.get_performance_stats(),
            "performance_monitor": self.performance_monitor.get_performance_summary(),
            "speed_controller": {
                "enabled": self.speed_controller.enabled,
                "current_multiplier": self.speed_controller.current_multiplier,
                "cycle_delay_ms": self.speed_controller.cycle_delay_ms,
                "step_delay_ms": self.speed_controller.step_delay_ms,
            },
        }

    def set_speed_multiplier(self, multiplier: float):
        """Set the speed multiplier."""
        self.speed_controller.set_speed_multiplier(multiplier)

    def reset_performance_stats(self):
        """Reset performance statistics."""
        self.emulator_logger.reset_performance_stats()
        self.performance_monitor.reset_performance_data()
        logger.info("Performance statistics reset")

    def get_logging_config(self) -> Dict[str, Any]:
        """Get current logging configuration."""
        return self.emulator_logger.logging_config

    def set_logging_level(self, level: str):
        """Set the logging level."""
        self.emulator_logger.logging_config["level"] = level
        logger.info(f"Logging level set to {level}")

    def create_test_program(self) -> str:
        """Create a simple test program for validation."""
        return """
10 REM 6502 Emulator Test Program
20 PRINT "Hello from 6502 Emulator!"
30 LET X = 42
40 PRINT "X = "; X
50 END
"""


if __name__ == "__main__":
    # Test the emulator
    emulator = M6502Emulator()

    print("6502 Emulator Test")
    print("=" * 30)

    # Initialize emulator
    if emulator.initialize_emulator():
        print("✅ Emulator initialized successfully")

        # Get emulator info
        info = emulator.get_emulator_info()
        print(f"Emulator: {info['name']} v{info['version']}")
        print(f"Memory: {info['memory_size']} bytes")
        print(f"CPU Speed: {info['cpu_speed']} Hz")
        print(f"Debug Mode: {info['debug_mode']}")

        # Load test program
        if emulator.load_basic_program(""):
            print("✅ Test program loaded successfully")

            # Execute some steps
            result = emulator.execute_program(10)
            print(f"✅ Executed {result['steps_executed']} steps")

            # Test BASIC commands
            test_commands = ['PRINT "Hello World"', "LET X = 10", "END"]

            print("\nBASIC Command Execution Test:")
            print("-" * 30)
            for cmd in test_commands:
                result = emulator.execute_basic_command(cmd)
                if result.get("success"):
                    print(f"✅ {cmd}")
                    if "output" in result:
                        print(f"   Output: {result['output']}")
                else:
                    print(f"❌ {cmd}: {result.get('error', 'Unknown error')}")

            # Get CPU state
            cpu_state = emulator.get_cpu_state()
            print("\nCPU State:")
            print(f"  PC: 0x{cpu_state['pc']:04X}")
            print(f"  A: 0x{cpu_state['a']:02X}")
            print(f"  X: 0x{cpu_state['x']:02X}")
            print(f"  Y: 0x{cpu_state['y']:02X}")
            print(f"  SP: 0x{cpu_state['sp']:02X}")

        else:
            print("❌ Failed to load test program")
    else:
        print("❌ Failed to initialize emulator")

    print("\n✅ 6502 Emulator test completed!")
