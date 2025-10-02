/**
 * Emulator Control MCP Server Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmulatorControlMCPServer } from '../emulator';

describe('Emulator Control MCP Server', () => {
  let server: EmulatorControlMCPServer;

  beforeEach(async () => {
    server = new EmulatorControlMCPServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.shutdown();
  });

  describe('Emulator Lifecycle', () => {
    it('should create a new emulator', async () => {
      const result = await server.executeTool('emu_create', {
        type: 'cpu',
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.type).toBe('cpu');
      expect(result.data.status).toBe('stopped');
    });

    it('should start an emulator', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const startResult = await server.executeTool('emu_start', { id: emulatorId });

      expect(startResult.success).toBe(true);
      expect(startResult.data.status).toBe('running');
    });

    it('should stop an emulator', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      await server.executeTool('emu_start', { id: emulatorId });
      const stopResult = await server.executeTool('emu_stop', { id: emulatorId });

      expect(stopResult.success).toBe(true);
      expect(stopResult.data.status).toBe('stopped');
    });

    it('should pause and resume an emulator', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      await server.executeTool('emu_start', { id: emulatorId });

      const pauseResult = await server.executeTool('emu_pause', { id: emulatorId });
      expect(pauseResult.success).toBe(true);
      expect(pauseResult.data.status).toBe('paused');

      const resumeResult = await server.executeTool('emu_resume', { id: emulatorId });
      expect(resumeResult.success).toBe(true);
      expect(resumeResult.data.status).toBe('running');
    });

    it('should reset an emulator', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      await server.executeTool('emu_start', { id: emulatorId });
      const resetResult = await server.executeTool('emu_reset', { id: emulatorId });

      expect(resetResult.success).toBe(true);
      expect(resetResult.data.status).toBe('stopped');
    });

    it('should list all emulators', async () => {
      await server.executeTool('emu_create', { type: 'cpu' });
      await server.executeTool('emu_create', { type: 'system' });

      const listResult = await server.executeTool('emu_list', {});

      expect(listResult.success).toBe(true);
      expect(listResult.data.emulators.length).toBe(2);
    });
  });

  describe('Emulator State', () => {
    it('should get emulator state', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const stateResult = await server.executeTool('emu_get_state', { id: emulatorId });

      expect(stateResult.success).toBe(true);
      expect(stateResult.data.state).toBeDefined();
      expect(stateResult.data.state.cpu).toBeDefined();
      expect(stateResult.data.state.memory).toBeDefined();
    });

    it('should execute instruction steps', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const stepResult = await server.executeTool('emu_step', {
        id: emulatorId,
        steps: 5,
      });

      expect(stepResult.success).toBe(true);
      expect(stepResult.data.stepsExecuted).toBe(5);
      expect(stepResult.data.state).toBeDefined();
    });

    it('should get performance metrics', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const perfResult = await server.executeTool('emu_get_performance', { id: emulatorId });

      expect(perfResult.success).toBe(true);
      expect(perfResult.data.metrics).toBeDefined();
      expect(perfResult.data.metrics.fps).toBeDefined();
      expect(perfResult.data.metrics.cyclesPerSecond).toBeDefined();
    });
  });

  describe('Memory Operations', () => {
    it('should read from memory', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const readResult = await server.executeTool('emu_read_memory', {
        id: emulatorId,
        address: 0x1000,
        length: 16,
      });

      expect(readResult.success).toBe(true);
      expect(readResult.data.address).toBe(0x1000);
      expect(readResult.data.data.length).toBe(16);
    });

    it('should write to memory', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const data = [0x01, 0x02, 0x03, 0x04];
      const writeResult = await server.executeTool('emu_write_memory', {
        id: emulatorId,
        address: 0x2000,
        data,
      });

      expect(writeResult.success).toBe(true);
      expect(writeResult.data.address).toBe(0x2000);
      expect(writeResult.data.bytesWritten).toBe(4);
    });

    it('should validate memory address', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const writeResult = await server.executeTool('emu_write_memory', {
        id: emulatorId,
        address: 0x100000, // Beyond 64KB
        data: [0x01],
      });

      expect(writeResult.success).toBe(false);
      expect(writeResult.error).toContain('Invalid memory address');
    });

    it('should load program into memory', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const program = [0xa9, 0x01, 0x8d, 0x00, 0x02]; // LDA #$01, STA $0200
      const loadResult = await server.executeTool('emu_load_program', {
        id: emulatorId,
        program,
        address: 0x8000,
      });

      expect(loadResult.success).toBe(true);
      expect(loadResult.data.loaded).toBe(true);
      expect(loadResult.data.address).toBe(0x8000);
      expect(loadResult.data.size).toBe(5);
    });
  });

  describe('Breakpoints', () => {
    it('should set a breakpoint', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const bpResult = await server.executeTool('emu_set_breakpoint', {
        id: emulatorId,
        address: 0x8000,
      });

      expect(bpResult.success).toBe(true);
      expect(bpResult.data.breakpointId).toBeDefined();
      expect(bpResult.data.address).toBe(0x8000);
    });

    it('should set conditional breakpoint', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const bpResult = await server.executeTool('emu_set_breakpoint', {
        id: emulatorId,
        address: 0x8000,
        condition: 'a == 0x42',
      });

      expect(bpResult.success).toBe(true);
      expect(bpResult.data.breakpointId).toBeDefined();
    });

    it('should list breakpoints', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      await server.executeTool('emu_set_breakpoint', {
        id: emulatorId,
        address: 0x8000,
      });
      await server.executeTool('emu_set_breakpoint', {
        id: emulatorId,
        address: 0x9000,
      });

      const listResult = await server.executeTool('emu_list_breakpoints', { id: emulatorId });

      expect(listResult.success).toBe(true);
      expect(listResult.data.breakpoints.length).toBe(2);
    });

    it('should remove a breakpoint', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const bpResult = await server.executeTool('emu_set_breakpoint', {
        id: emulatorId,
        address: 0x8000,
      });
      const breakpointId = bpResult.data.breakpointId;

      const removeResult = await server.executeTool('emu_remove_breakpoint', {
        id: emulatorId,
        breakpointId,
      });

      expect(removeResult.success).toBe(true);
      expect(removeResult.data.removed).toBe(true);

      const listResult = await server.executeTool('emu_list_breakpoints', { id: emulatorId });
      expect(listResult.data.breakpoints.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent emulator', async () => {
      const result = await server.executeTool('emu_start', {
        id: 'non-existent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should prevent pausing non-running emulator', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const pauseResult = await server.executeTool('emu_pause', { id: emulatorId });

      expect(pauseResult.success).toBe(false);
      expect(pauseResult.error).toContain('not running');
    });

    it('should prevent resuming non-paused emulator', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const resumeResult = await server.executeTool('emu_resume', { id: emulatorId });

      expect(resumeResult.success).toBe(false);
      expect(resumeResult.error).toContain('not paused');
    });

    it('should validate program size', async () => {
      const createResult = await server.executeTool('emu_create', { type: 'cpu' });
      const emulatorId = createResult.data.id;

      const largeProgram = new Array(70000).fill(0); // Larger than 64KB
      const loadResult = await server.executeTool('emu_load_program', {
        id: emulatorId,
        program: largeProgram,
        address: 0,
      });

      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toContain('too large');
    });
  });

  describe('Multiple Emulators', () => {
    it('should manage multiple emulators independently', async () => {
      const emu1 = await server.executeTool('emu_create', { type: 'cpu' });
      const emu2 = await server.executeTool('emu_create', { type: 'system' });

      await server.executeTool('emu_start', { id: emu1.data.id });

      const state1 = await server.executeTool('emu_get_state', { id: emu1.data.id });
      const state2 = await server.executeTool('emu_get_state', { id: emu2.data.id });

      expect(state1.data.state.status).toBe('running');
      expect(state2.data.state.status).toBe('stopped');
    });
  });
});
