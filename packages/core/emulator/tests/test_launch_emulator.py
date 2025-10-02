"""
Emulator Launcher Tests

Test suite for the emulator launcher functionality.
"""

import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

from engine.launch_emulator import EmulatorLauncher


class TestEmulatorLauncher:
    """Test emulator launcher functionality."""

    def test_launcher_initialization(self):
        """Test launcher initialization."""
        launcher = EmulatorLauncher()

        assert launcher.settings is not None
        assert launcher.emulator is not None
        assert launcher.basic_engine is not None
        assert launcher.is_running is False
        assert launcher.current_program is None

    def test_initialize(self):
        """Test launcher initialization."""
        launcher = EmulatorLauncher()

        # Mock the emulator initialization
        with patch.object(launcher.emulator, "initialize_emulator", return_value=True):
            result = launcher.initialize()
            assert result is True

    def test_initialize_failure(self):
        """Test launcher initialization failure."""
        launcher = EmulatorLauncher()

        # Mock the emulator initialization failure
        with patch.object(launcher.emulator, "initialize_emulator", return_value=False):
            result = launcher.initialize()
            assert result is False

    def test_load_program_success(self):
        """Test loading a program successfully."""
        launcher = EmulatorLauncher()

        # Create a temporary BASIC program file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".bas", delete=False) as f:
            f.write('10 PRINT "Hello World"\n20 END\n')
            temp_file = f.name

        try:
            result = launcher.load_program(temp_file)
            assert result is True
            assert launcher.current_program is not None
            assert launcher.current_program["path"] == temp_file
            assert len(launcher.current_program["commands"]) == 2
        finally:
            Path(temp_file).unlink()

    def test_load_program_file_not_found(self):
        """Test loading a non-existent program file."""
        launcher = EmulatorLauncher()

        result = launcher.load_program("nonexistent.bas")
        assert result is False
        assert launcher.current_program is None

    def test_load_program_empty_file(self):
        """Test loading an empty program file."""
        launcher = EmulatorLauncher()

        # Create an empty temporary file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".bas", delete=False) as f:
            temp_file = f.name

        try:
            result = launcher.load_program(temp_file)
            assert result is False
            assert launcher.current_program is None
        finally:
            Path(temp_file).unlink()

    def test_parse_basic_program(self):
        """Test parsing BASIC program content."""
        launcher = EmulatorLauncher()

        program_content = """
10 REM This is a comment
20 PRINT "Hello World"
30 LET X = 10
40 END
        """

        commands = launcher._parse_basic_program(program_content)

        assert len(commands) == 4
        assert commands[0] == "REM This is a comment"
        assert commands[1] == 'PRINT "Hello World"'
        assert commands[2] == "LET X = 10"
        assert commands[3] == "END"

    def test_parse_basic_program_with_comments(self):
        """Test parsing BASIC program with comments."""
        launcher = EmulatorLauncher()

        program_content = """
10 REM This is a comment
20 PRINT "Hello"
30 REM Another comment
40 END
        """

        commands = launcher._parse_basic_program(program_content)

        assert len(commands) == 4
        assert commands[0] == "REM This is a comment"
        assert commands[1] == 'PRINT "Hello"'
        assert commands[2] == "REM Another comment"
        assert commands[3] == "END"

    def test_run_program_no_program_loaded(self):
        """Test running program when no program is loaded."""
        launcher = EmulatorLauncher()

        result = launcher.run_program()

        assert "error" in result
        assert result["error"] == "No program loaded"

    def test_run_program_success(self):
        """Test running a program successfully."""
        launcher = EmulatorLauncher()

        # Mock current program
        launcher.current_program = {
            "path": "test.bas",
            "content": '10 PRINT "Hello"\n20 END',
            "commands": ['PRINT "Hello"', "END"],
        }

        # Mock emulator command execution
        with patch.object(launcher.emulator, "execute_basic_command") as mock_execute:
            mock_execute.side_effect = [
                {"success": True, "output": "Hello"},
                {"success": True, "message": "Program ended"},
            ]

            with patch.object(
                launcher.emulator, "get_cpu_state", return_value={"pc": 0x8000}
            ):
                result = launcher.run_program()

                assert result["commands_executed"] == 2
                assert len(result["output"]) == 1
                assert result["output"][0] == "Hello"
                assert len(result["errors"]) == 0

    def test_run_program_with_errors(self):
        """Test running a program with command errors."""
        launcher = EmulatorLauncher()

        # Mock current program
        launcher.current_program = {
            "path": "test.bas",
            "content": '10 PRINT "Hello"\n20 INVALID COMMAND',
            "commands": ['PRINT "Hello"', "INVALID COMMAND"],
        }

        # Mock emulator command execution
        with patch.object(launcher.emulator, "execute_basic_command") as mock_execute:
            mock_execute.side_effect = [
                {"success": True, "output": "Hello"},
                {"success": False, "error": "Unknown command"},
            ]

            with patch.object(
                launcher.emulator, "get_cpu_state", return_value={"pc": 0x8000}
            ):
                result = launcher.run_program()

                assert result["commands_executed"] == 1
                assert len(result["output"]) == 1
                assert len(result["errors"]) == 1
                assert "Unknown command" in result["errors"][0]

    def test_step_execution(self):
        """Test step execution."""
        launcher = EmulatorLauncher()

        # Mock emulator step execution
        with patch.object(launcher.emulator, "execute_program") as mock_execute:
            mock_execute.return_value = {
                "steps_executed": 5,
                "cpu_state": {"pc": 0x8005},
                "output": "",
                "error": None,
            }

            result = launcher.step_execution(5)

            assert result["steps_executed"] == 5
            mock_execute.assert_called_once_with(5)

    def test_step_execution_error(self):
        """Test step execution with error."""
        launcher = EmulatorLauncher()

        # Mock emulator step execution with error
        with patch.object(launcher.emulator, "execute_program") as mock_execute:
            mock_execute.return_value = {"error": "Execution failed"}

            result = launcher.step_execution(5)

            assert "error" in result
            assert result["error"] == "Execution failed"

    def test_show_cpu_state(self):
        """Test displaying CPU state."""
        launcher = EmulatorLauncher()

        # Mock CPU state
        cpu_state = {
            "pc": 0x8000,
            "a": 0x42,
            "x": 0x10,
            "y": 0x20,
            "sp": 0xFF,
            "status": 0x34,
            "flags": {
                "carry": False,
                "zero": True,
                "interrupt": False,
                "decimal": False,
                "break": False,
                "overflow": False,
                "negative": False,
            },
        }

        with patch.object(launcher.emulator, "get_cpu_state", return_value=cpu_state):
            # Capture print output
            with patch("builtins.print") as mock_print:
                launcher.show_cpu_state()

                # Verify that print was called multiple times
                assert mock_print.call_count > 5

    def test_show_cpu_state_error(self):
        """Test displaying CPU state with error."""
        launcher = EmulatorLauncher()

        # Mock CPU state with error
        with patch.object(
            launcher.emulator,
            "get_cpu_state",
            return_value={"error": "CPU not initialized"},
        ):
            with patch("builtins.print"):
                with patch("loguru.logger.error") as mock_logger:
                    launcher.show_cpu_state()

                    # Should log error message
                    mock_logger.assert_called_once()

    def test_show_memory_dump(self):
        """Test displaying memory dump."""
        launcher = EmulatorLauncher()

        # Mock memory dump
        dump = {
            "0x8000": 0xA9,
            "0x8001": 0x48,
            "0x8002": 0x8D,
            "0x8003": 0x00,
            "0x8004": 0x20,
            "0x8005": 0x4C,
            "0x8006": 0x00,
            "0x8007": 0x80,
        }

        with patch.object(launcher.emulator, "get_memory_dump", return_value=dump):
            with patch("builtins.print") as mock_print:
                launcher.show_memory_dump(0x8000, 8)

                # Verify that print was called
                assert mock_print.call_count > 0

    def test_show_memory_dump_error(self):
        """Test displaying memory dump with error."""
        launcher = EmulatorLauncher()

        # Mock memory dump with error
        with patch.object(
            launcher.emulator,
            "get_memory_dump",
            return_value={"error": "Memory not initialized"},
        ):
            with patch("builtins.print"):
                with patch("loguru.logger.error") as mock_logger:
                    launcher.show_memory_dump()

                    # Should log error message
                    mock_logger.assert_called_once()

    def test_reset_emulator(self):
        """Test resetting emulator."""
        launcher = EmulatorLauncher()

        # Set some state
        launcher.is_running = True
        launcher.current_program = {"path": "test.bas"}

        # Mock emulator reset
        with patch.object(launcher.emulator, "reset_emulator", return_value=True):
            result = launcher.reset_emulator()

            assert result is True
            assert launcher.is_running is False
            assert launcher.current_program is None

    def test_reset_emulator_failure(self):
        """Test resetting emulator failure."""
        launcher = EmulatorLauncher()

        # Mock emulator reset failure
        with patch.object(launcher.emulator, "reset_emulator", return_value=False):
            result = launcher.reset_emulator()

            assert result is False

    def test_show_help(self):
        """Test displaying help."""
        launcher = EmulatorLauncher()

        with patch("builtins.print") as mock_print:
            launcher.show_help()

            # Verify that print was called
            assert mock_print.call_count > 0

    def test_interactive_mode_quit(self):
        """Test interactive mode quit command."""
        launcher = EmulatorLauncher()

        # Mock input to return 'quit'
        with patch("builtins.input", return_value="quit"):
            with patch("builtins.print"):
                # Should not raise an exception and should exit cleanly
                try:
                    launcher.interactive_mode()
                except SystemExit:
                    pass  # Expected behavior

    def test_interactive_mode_help(self):
        """Test interactive mode help command."""
        launcher = EmulatorLauncher()

        # Mock input to return 'help' then 'quit'
        with patch("builtins.input", side_effect=["help", "quit"]):
            with patch("builtins.print"):
                with patch.object(launcher, "show_help") as mock_help:
                    try:
                        launcher.interactive_mode()
                    except SystemExit:
                        pass

                    mock_help.assert_called_once()

    def test_interactive_mode_load_command(self):
        """Test interactive mode load command."""
        launcher = EmulatorLauncher()

        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".bas", delete=False) as f:
            f.write('10 PRINT "Hello"\n20 END\n')
            temp_file = f.name

        try:
            # Mock input to return load command then quit
            with patch("builtins.input", side_effect=[f"load {temp_file}", "quit"]):
                with patch("builtins.print"):
                    with patch.object(launcher, "load_program") as mock_load:
                        try:
                            launcher.interactive_mode()
                        except SystemExit:
                            pass

                        mock_load.assert_called_once_with(temp_file)
        finally:
            Path(temp_file).unlink()

    def test_interactive_mode_unknown_command(self):
        """Test interactive mode unknown command."""
        launcher = EmulatorLauncher()

        # Mock input to return unknown command then quit
        with patch("builtins.input", side_effect=["unknown_command", "quit"]):
            with patch("builtins.print") as mock_print:
                try:
                    launcher.interactive_mode()
                except SystemExit:
                    pass

                # Should print error message
                assert mock_print.call_count > 0

    def test_settings_integration(self):
        """Test settings integration."""
        launcher = EmulatorLauncher()

        # Verify settings are loaded
        assert launcher.settings is not None
        assert "engine" in launcher.settings.model_dump()
        assert "emulator" in launcher.settings.engine.model_dump()

        # Verify emulator settings
        emulator_settings = launcher.settings.engine.emulator
        assert "memory_size" in emulator_settings
        assert "cpu_speed" in emulator_settings
        assert "debug_mode" in emulator_settings

    def test_launcher_lifecycle(self):
        """Test complete launcher lifecycle."""
        launcher = EmulatorLauncher()

        # Initialize
        with patch.object(launcher.emulator, "initialize_emulator", return_value=True):
            assert launcher.initialize() is True

        # Load program
        with tempfile.NamedTemporaryFile(mode="w", suffix=".bas", delete=False) as f:
            f.write('10 PRINT "Hello"\n20 END\n')
            temp_file = f.name

        try:
            assert launcher.load_program(temp_file) is True

            # Run program
            with patch.object(
                launcher.emulator, "execute_basic_command"
            ) as mock_execute:
                mock_execute.side_effect = [
                    {"success": True, "output": "Hello"},
                    {"success": True, "message": "Program ended"},
                ]

                with patch.object(
                    launcher.emulator, "get_cpu_state", return_value={"pc": 0x8000}
                ):
                    result = launcher.run_program()
                    assert result["commands_executed"] == 2

            # Reset
            with patch.object(launcher.emulator, "reset_emulator", return_value=True):
                assert launcher.reset_emulator() is True
                assert launcher.current_program is None

        finally:
            Path(temp_file).unlink()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
