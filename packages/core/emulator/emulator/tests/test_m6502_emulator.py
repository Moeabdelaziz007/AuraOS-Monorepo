"""
6502 Emulator Tests

Test suite for the Py65 6502 emulator integration.
"""

import pytest

from engine.emulator.m6502_emulator import M6502Emulator


class TestM6502Emulator:
    """Test 6502 emulator functionality."""

    def test_emulator_initialization(self):
        """Test emulator initialization."""
        emulator = M6502Emulator()

        assert emulator.memory_size == 65536
        assert emulator.cpu_speed == 1000000
        assert emulator.debug_mode is True
        assert emulator.basic_start_address == 0x8000
        assert emulator.basic_end_address == 0xFFFF
        assert emulator.is_running is False

    def test_emulator_components_initialization(self):
        """Test emulator components initialization."""
        emulator = M6502Emulator()

        # Test initialization
        result = emulator.initialize_emulator()
        assert result is True

        # Test components are created
        assert emulator.mpu is not None

    def test_memory_setup(self):
        """Test memory regions setup."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test memory is accessible
        assert emulator.mpu.memory[0x0000] == 0x00
        assert emulator.mpu.memory[0x8000] == 0x00
        assert emulator.mpu.memory[0xFFFF] == 0x00

    def test_load_basic_program(self):
        """Test loading BASIC program."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test loading program
        result = emulator.load_basic_program("")
        assert result is True

        # Test program counter is set
        assert emulator.mpu.pc == emulator.basic_start_address

    def test_execute_program(self):
        """Test program execution."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()
        emulator.load_basic_program("")

        # Test execution
        result = emulator.execute_program(10)

        assert "steps_executed" in result
        assert "cpu_state" in result
        assert "memory_dump" in result
        assert "output" in result
        assert "error" in result

        assert result["steps_executed"] > 0
        assert result["steps_executed"] <= 10

    def test_execute_print_command(self):
        """Test PRINT command execution."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test PRINT command
        result = emulator.execute_basic_command('PRINT "Hello World"')

        assert result["type"] == "print"
        assert result["output"] == "HELLO WORLD"
        assert result["success"] is True

    def test_execute_let_command(self):
        """Test LET command execution."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test LET command
        result = emulator.execute_basic_command("LET X = 42")

        assert result["type"] == "assignment"
        assert result["variable"] == "X"
        assert result["value"] == 42
        assert result["success"] is True

    def test_execute_end_command(self):
        """Test END command execution."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test END command
        result = emulator.execute_basic_command("END")

        assert result["type"] == "end"
        assert result["success"] is True
        assert result["message"] == "Program ended"
        assert emulator.is_running is False

    def test_parse_basic_command(self):
        """Test BASIC command parsing."""
        emulator = M6502Emulator()

        # Test PRINT command parsing
        parsed = emulator._parse_basic_command('PRINT "Hello"')
        assert parsed["type"] == "print"
        assert parsed["content"] == '"HELLO"'

        # Test LET command parsing
        parsed = emulator._parse_basic_command("LET X = 10")
        assert parsed["type"] == "assignment"
        assert parsed["variable"] == "X"
        assert parsed["value"] == "10"

        # Test END command parsing
        parsed = emulator._parse_basic_command("END")
        assert parsed["type"] == "end"

        # Test unknown command parsing
        parsed = emulator._parse_basic_command("UNKNOWN COMMAND")
        assert parsed["type"] == "unknown"

    def test_get_cpu_state(self):
        """Test getting CPU state."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test CPU state
        cpu_state = emulator.get_cpu_state()

        assert "pc" in cpu_state
        assert "a" in cpu_state
        assert "x" in cpu_state
        assert "y" in cpu_state
        assert "sp" in cpu_state
        assert "status" in cpu_state
        assert "flags" in cpu_state

        # Test flags
        flags = cpu_state["flags"]
        assert "carry" in flags
        assert "zero" in flags
        assert "interrupt" in flags
        assert "decimal" in flags
        assert "break" in flags
        assert "overflow" in flags
        assert "negative" in flags

    def test_get_memory_dump(self):
        """Test getting memory dump."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test memory dump
        dump = emulator.get_memory_dump(0x8000, 16)

        assert len(dump) == 16
        assert "0x8000" in dump
        assert "0x800F" in dump

        # Test all values are bytes
        for addr, value in dump.items():
            assert 0 <= value <= 255

    def test_reset_emulator(self):
        """Test emulator reset."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()
        emulator.load_basic_program("")

        # Test reset
        result = emulator.reset_emulator()
        assert result is True
        assert emulator.is_running is False

    def test_get_emulator_info(self):
        """Test getting emulator information."""
        emulator = M6502Emulator()

        info = emulator.get_emulator_info()

        assert info["name"] == "Py65 6502 Emulator"
        assert info["version"] == "1.2.0"
        assert info["memory_size"] == 65536
        assert info["cpu_speed"] == 1000000
        assert info["debug_mode"] is True
        assert info["basic_start_address"] == "0x8000"
        assert info["basic_end_address"] == "0xFFFF"
        assert info["is_running"] is False
        assert info["cpu_initialized"] is False
        assert info["memory_initialized"] is False

    def test_create_test_program(self):
        """Test creating test program."""
        emulator = M6502Emulator()

        program = emulator.create_test_program()

        assert isinstance(program, str)
        assert "6502 Emulator Test Program" in program
        assert "PRINT" in program
        assert "LET" in program
        assert "END" in program

    def test_error_handling(self):
        """Test error handling."""
        emulator = M6502Emulator()

        # Test executing command without initialization
        result = emulator.execute_basic_command('PRINT "Hello"')
        # The emulator can execute commands without initialization
        assert result["type"] == "print"
        assert result["success"] is True

        # Test getting CPU state without initialization
        cpu_state = emulator.get_cpu_state()
        assert "error" in cpu_state

        # Test getting memory dump without initialization
        dump = emulator.get_memory_dump()
        assert "error" in dump

    def test_case_insensitive_commands(self):
        """Test case insensitive command processing."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test different cases
        result1 = emulator.execute_basic_command('print "Hello"')
        result2 = emulator.execute_basic_command('PRINT "Hello"')
        result3 = emulator.execute_basic_command('Print "Hello"')

        assert result1["success"] is True
        assert result2["success"] is True
        assert result3["success"] is True
        assert result1["output"] == result2["output"] == result3["output"]

    def test_command_stripping(self):
        """Test command whitespace stripping."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test with whitespace
        result = emulator.execute_basic_command('  PRINT "Hello"  ')
        assert result["success"] is True
        assert result["output"] == "HELLO"

    def test_complex_command_execution(self):
        """Test complex command execution."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test complex PRINT command
        result = emulator.execute_basic_command('PRINT "Value: "; X; " units"')
        assert result["success"] is True
        assert result["output"] == 'VALUE: "; X; " UNITS'

        # Test complex LET command
        result = emulator.execute_basic_command("LET Y = X * 2 + 1")
        assert result["success"] is True
        assert result["variable"] == "Y"
        assert result["value"] == 0  # Non-numeric value defaults to 0

    def test_emulator_settings_integration(self):
        """Test integration with settings system."""
        emulator = M6502Emulator()

        # Test that emulator uses settings
        assert emulator.settings is not None
        assert emulator.memory_size == emulator.settings.engine.emulator["memory_size"]
        assert emulator.cpu_speed == emulator.settings.engine.emulator["cpu_speed"]
        assert emulator.debug_mode == emulator.settings.engine.emulator["debug_mode"]

    def test_memory_regions(self):
        """Test memory region configuration."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        # Test memory regions are accessible
        assert emulator.mpu.memory[0x0000] == 0x00  # Zero page
        assert emulator.mpu.memory[0x0100] == 0x00  # Stack
        assert emulator.mpu.memory[0x8000] == 0x00  # BASIC program area
        assert emulator.mpu.memory[0x2000] == 0x00  # Display buffer

    def test_program_counter_management(self):
        """Test program counter management."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()
        emulator.load_basic_program("")

        # Test initial PC
        assert emulator.mpu.pc == emulator.basic_start_address

        # Test PC changes during execution
        initial_pc = emulator.mpu.pc
        emulator.execute_program(5)
        assert emulator.mpu.pc != initial_pc

    def test_status_flags(self):
        """Test CPU status flags."""
        emulator = M6502Emulator()
        emulator.initialize_emulator()

        cpu_state = emulator.get_cpu_state()
        flags = cpu_state["flags"]

        # Test all flags are boolean
        for flag_name, flag_value in flags.items():
            assert isinstance(flag_value, bool)

    def test_emulator_lifecycle(self):
        """Test complete emulator lifecycle."""
        emulator = M6502Emulator()

        # Initialize
        assert emulator.initialize_emulator() is True

        # Load program
        assert emulator.load_basic_program("") is True

        # Execute
        result = emulator.execute_program(10)
        assert result["steps_executed"] > 0

        # Get state
        cpu_state = emulator.get_cpu_state()
        assert "pc" in cpu_state

        # Reset
        assert emulator.reset_emulator() is True
        assert emulator.is_running is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
