"""
BASIC-M6502 Engine Tests

Test suite for the BASIC-M6502 engine integration.
"""

import pytest

from engine.basic_m6502 import BASICM6502Engine


class TestBASICM6502Engine:
    """Test BASIC-M6502 engine functionality."""

    def test_engine_initialization(self):
        """Test engine initialization."""
        engine = BASICM6502Engine()

        assert engine.version == "1.1"
        assert engine.memory_size == 65536
        assert engine.timeout == 60
        assert engine.src_path.exists()
        assert engine.libs_path.exists()
        assert engine.tests_path.exists()

    def test_load_source_file(self):
        """Test loading source files."""
        engine = BASICM6502Engine()

        # Test loading the main source file
        content = engine.load_source_file("m6502.asm")
        assert isinstance(content, str)
        assert len(content) > 0
        assert "BASIC M6502" in content

    def test_load_nonexistent_file(self):
        """Test loading non-existent file."""
        engine = BASICM6502Engine()

        with pytest.raises(FileNotFoundError):
            engine.load_source_file("nonexistent.asm")

    def test_parse_print_command(self):
        """Test parsing PRINT commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command('PRINT "Hello World"')
        assert parsed["type"] == "print"
        assert parsed["args"]["content"] == '"HELLO WORLD"'

    def test_parse_let_command(self):
        """Test parsing LET commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("LET X = 10")
        assert parsed["type"] == "assignment"
        assert parsed["args"]["variable"] == "X"
        assert parsed["args"]["value"] == "10"

    def test_parse_for_command(self):
        """Test parsing FOR commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("FOR I = 1 TO 10")
        assert parsed["type"] == "loop_start"
        assert parsed["args"]["variable"] == "I"
        assert parsed["args"]["start"] == "1"
        assert parsed["args"]["end"] == "10"

    def test_parse_next_command(self):
        """Test parsing NEXT commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("NEXT I")
        assert parsed["type"] == "loop_end"
        assert parsed["args"]["variable"] == "I"

    def test_parse_if_command(self):
        """Test parsing IF commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command('IF X > 5 THEN PRINT "Big"')
        assert parsed["type"] == "conditional"
        assert parsed["args"]["condition"] == "X > 5"
        assert parsed["args"]["action"] == 'PRINT "BIG"'

    def test_parse_goto_command(self):
        """Test parsing GOTO commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("GOTO 100")
        assert parsed["type"] == "goto"
        assert parsed["args"]["line_number"] == "100"

    def test_parse_gosub_command(self):
        """Test parsing GOSUB commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("GOSUB 200")
        assert parsed["type"] == "gosub"
        assert parsed["args"]["line_number"] == "200"

    def test_parse_return_command(self):
        """Test parsing RETURN commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("RETURN")
        assert parsed["type"] == "return"
        assert parsed["args"] == {}

    def test_parse_end_command(self):
        """Test parsing END commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("END")
        assert parsed["type"] == "end"
        assert parsed["args"] == {}

    def test_parse_unknown_command(self):
        """Test parsing unknown commands."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command("UNKNOWN COMMAND")
        assert parsed["type"] == "unknown"

    def test_validate_command(self):
        """Test command validation."""
        engine = BASICM6502Engine()

        # Valid commands
        assert engine.validate_command('PRINT "Hello"') is True
        assert engine.validate_command("LET X = 10") is True
        assert engine.validate_command("FOR I = 1 TO 10") is True
        assert engine.validate_command("NEXT I") is True
        assert engine.validate_command('IF X > 5 THEN PRINT "Big"') is True
        assert engine.validate_command("GOTO 100") is True
        assert engine.validate_command("END") is True

        # Invalid commands
        assert engine.validate_command("UNKNOWN COMMAND") is False
        assert engine.validate_command("") is False

    def test_get_engine_info(self):
        """Test getting engine information."""
        engine = BASICM6502Engine()

        info = engine.get_engine_info()
        assert info["name"] == "BASIC-M6502"
        assert info["version"] == "1.1"
        assert info["memory_size"] == 65536
        assert info["timeout"] == 60
        assert info["source_file"] == "m6502.asm"
        assert info["source_size"] > 0
        assert "PRINT" in info["supported_commands"]
        assert "LET" in info["supported_commands"]
        assert "FOR" in info["supported_commands"]

    def test_create_test_program(self):
        """Test creating test program."""
        engine = BASICM6502Engine()

        program = engine.create_test_program()
        assert isinstance(program, str)
        assert "BASIC-M6502 Test Program" in program
        assert "PRINT" in program
        assert "LET" in program
        assert "FOR" in program
        assert "NEXT" in program
        assert "IF" in program
        assert "END" in program

    def test_case_insensitive_parsing(self):
        """Test case insensitive command parsing."""
        engine = BASICM6502Engine()

        # Test different cases
        parsed1 = engine.parse_basic_command('print "Hello"')
        parsed2 = engine.parse_basic_command('PRINT "Hello"')
        parsed3 = engine.parse_basic_command('Print "Hello"')

        assert parsed1["type"] == "print"
        assert parsed2["type"] == "print"
        assert parsed3["type"] == "print"
        assert parsed1["args"] == parsed2["args"] == parsed3["args"]

    def test_command_stripping(self):
        """Test command whitespace stripping."""
        engine = BASICM6502Engine()

        parsed = engine.parse_basic_command('  PRINT "Hello"  ')
        assert parsed["type"] == "print"
        assert parsed["args"]["content"] == '"HELLO"'

    def test_complex_command_parsing(self):
        """Test parsing complex commands."""
        engine = BASICM6502Engine()

        # Complex PRINT with multiple expressions
        parsed = engine.parse_basic_command('PRINT "Value: "; X; " units"')
        assert parsed["type"] == "print"
        assert parsed["args"]["content"] == '"VALUE: "; X; " UNITS"'

        # Complex LET with expressions
        parsed = engine.parse_basic_command("LET Y = X * 2 + 1")
        assert parsed["type"] == "assignment"
        assert parsed["args"]["variable"] == "Y"
        assert parsed["args"]["value"] == "X * 2 + 1"

    def test_engine_paths(self):
        """Test engine path configuration."""
        engine = BASICM6502Engine()

        assert engine.src_path.name == "src"
        assert engine.libs_path.name == "libs"
        assert engine.tests_path.name == "tests"
        assert engine.src_path.exists()
        assert engine.libs_path.exists()
        assert engine.tests_path.exists()

    def test_source_file_exists(self):
        """Test that source file exists."""
        engine = BASICM6502Engine()

        source_file = engine.src_path / "m6502.asm"
        assert source_file.exists()
        assert source_file.stat().st_size > 0

    def test_engine_settings_integration(self):
        """Test integration with settings system."""
        engine = BASICM6502Engine()

        # Test that engine uses settings
        assert engine.settings is not None
        assert engine.memory_size == engine.settings.engine.basic_m6502["memory_size"]
        assert engine.version == engine.settings.engine.basic_m6502["version"]
        assert engine.timeout == engine.settings.engine.basic_m6502["timeout_seconds"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
