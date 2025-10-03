/**
 * Emulator MCP Server
 * Provides 6502 emulator control through MCP protocol
 */

import { BaseMCPServer } from '../../../ai/src/mcp/server';
import { Tool } from '../../../ai/src/mcp/types';

interface CPUState {
  A: number; // Accumulator
  X: number; // X register
  Y: number; // Y register
  PC: number; // Program counter
  SP: number; // Stack pointer
  P: number; // Processor status
}

export class EmulatorMCPServer extends BaseMCPServer {
  name = 'emulator';
  version = '1.0.0';
  description = '6502 CPU emulator control for AuraOS';

  tools: Tool[] = [
    {
      name: 'load_program',
      description: 'Load a program into emulator memory',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Machine code as hex string (e.g., "A9 00 8D 00 02")',
          },
          address: {
            type: 'number',
            description: 'Starting address (default: 0x0600)',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'run_program',
      description: 'Execute the loaded program',
      inputSchema: {
        type: 'object',
        properties: {
          maxCycles: {
            type: 'number',
            description: 'Maximum cycles to execute (default: 10000)',
          },
        },
      },
    },
    {
      name: 'step_instruction',
      description: 'Execute a single instruction',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_registers',
      description: 'Get current CPU register values',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_memory',
      description: 'Read a range of memory',
      inputSchema: {
        type: 'object',
        properties: {
          address: {
            type: 'number',
            description: 'Starting address',
          },
          length: {
            type: 'number',
            description: 'Number of bytes to read',
          },
        },
        required: ['address', 'length'],
      },
    },
    {
      name: 'set_memory',
      description: 'Write to memory',
      inputSchema: {
        type: 'object',
        properties: {
          address: {
            type: 'number',
            description: 'Starting address',
          },
          data: {
            type: 'string',
            description: 'Data as hex string',
          },
        },
        required: ['address', 'data'],
      },
    },
    {
      name: 'reset',
      description: 'Reset the CPU to initial state',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'set_breakpoint',
      description: 'Set a breakpoint at an address',
      inputSchema: {
        type: 'object',
        properties: {
          address: {
            type: 'number',
            description: 'Address for breakpoint',
          },
        },
        required: ['address'],
      },
    },
    {
      name: 'get_status',
      description: 'Get emulator status and statistics',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];

  private memory: Uint8Array = new Uint8Array(65536); // 64KB
  private cpu: CPUState = {
    A: 0,
    X: 0,
    Y: 0,
    PC: 0x0600,
    SP: 0xff,
    P: 0x20,
  };
  private breakpoints: Set<number> = new Set();
  private cycleCount = 0;
  private running = false;

  protected async onInitialize(): Promise<void> {
    this.reset();
  }

  protected async handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case 'load_program':
        return this.loadProgram(input.code, input.address || 0x0600);
      case 'run_program':
        return this.runProgram(input.maxCycles || 10000);
      case 'step_instruction':
        return this.stepInstruction();
      case 'get_registers':
        return this.getRegisters();
      case 'get_memory':
        return this.getMemory(input.address, input.length);
      case 'set_memory':
        return this.setMemory(input.address, input.data);
      case 'reset':
        return this.resetCPU();
      case 'set_breakpoint':
        return this.setBreakpoint(input.address);
      case 'get_status':
        return this.getStatus();
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private loadProgram(code: string, address: number): { success: boolean; bytesLoaded: number } {
    const bytes = this.hexStringToBytes(code);
    
    if (address + bytes.length > 0x10000) {
      throw new Error('Program too large for memory');
    }

    for (let i = 0; i < bytes.length; i++) {
      this.memory[address + i] = bytes[i];
    }

    this.cpu.PC = address;

    return {
      success: true,
      bytesLoaded: bytes.length,
    };
  }

  private runProgram(maxCycles: number): {
    success: boolean;
    cyclesExecuted: number;
    stopped: 'completed' | 'breakpoint' | 'max_cycles';
  } {
    this.running = true;
    const startCycles = this.cycleCount;
    let stopped: 'completed' | 'breakpoint' | 'max_cycles' = 'completed';

    for (let i = 0; i < maxCycles && this.running; i++) {
      if (this.breakpoints.has(this.cpu.PC)) {
        stopped = 'breakpoint';
        break;
      }

      const opcode = this.memory[this.cpu.PC];
      
      // BRK instruction (0x00) stops execution
      if (opcode === 0x00) {
        this.running = false;
        break;
      }

      this.executeInstruction(opcode);
      this.cycleCount++;

      if (i === maxCycles - 1) {
        stopped = 'max_cycles';
      }
    }

    return {
      success: true,
      cyclesExecuted: this.cycleCount - startCycles,
      stopped,
    };
  }

  private stepInstruction(): { opcode: number; mnemonic: string; registers: CPUState } {
    const opcode = this.memory[this.cpu.PC];
    const mnemonic = this.getOpcodeMnemonic(opcode);
    
    this.executeInstruction(opcode);
    this.cycleCount++;

    return {
      opcode,
      mnemonic,
      registers: { ...this.cpu },
    };
  }

  private getRegisters(): CPUState {
    return { ...this.cpu };
  }

  private getMemory(address: number, length: number): { data: string; bytes: number[] } {
    if (address < 0 || address + length > 0x10000) {
      throw new Error('Invalid memory range');
    }

    const bytes: number[] = [];
    for (let i = 0; i < length; i++) {
      bytes.push(this.memory[address + i]);
    }

    return {
      data: this.bytesToHexString(bytes),
      bytes,
    };
  }

  private setMemory(address: number, data: string): { success: boolean; bytesWritten: number } {
    const bytes = this.hexStringToBytes(data);
    
    if (address < 0 || address + bytes.length > 0x10000) {
      throw new Error('Invalid memory range');
    }

    for (let i = 0; i < bytes.length; i++) {
      this.memory[address + i] = bytes[i];
    }

    return {
      success: true,
      bytesWritten: bytes.length,
    };
  }

  private resetCPU(): { success: boolean } {
    this.reset();
    return { success: true };
  }

  private setBreakpoint(address: number): { success: boolean; breakpoints: number[] } {
    this.breakpoints.add(address);
    return {
      success: true,
      breakpoints: Array.from(this.breakpoints),
    };
  }

  private getStatus(): {
    running: boolean;
    cycleCount: number;
    pc: number;
    breakpoints: number[];
  } {
    return {
      running: this.running,
      cycleCount: this.cycleCount,
      pc: this.cpu.PC,
      breakpoints: Array.from(this.breakpoints),
    };
  }

  private reset(): void {
    this.memory.fill(0);
    this.cpu = {
      A: 0,
      X: 0,
      Y: 0,
      PC: 0x0600,
      SP: 0xff,
      P: 0x20,
    };
    this.breakpoints.clear();
    this.cycleCount = 0;
    this.running = false;
  }

  private executeInstruction(opcode: number): void {
    // Simplified 6502 instruction execution
    switch (opcode) {
      case 0xa9: // LDA immediate
        this.cpu.A = this.memory[++this.cpu.PC];
        this.cpu.PC++;
        break;
      case 0xa2: // LDX immediate
        this.cpu.X = this.memory[++this.cpu.PC];
        this.cpu.PC++;
        break;
      case 0xa0: // LDY immediate
        this.cpu.Y = this.memory[++this.cpu.PC];
        this.cpu.PC++;
        break;
      case 0x8d: // STA absolute
        {
          const addr = this.memory[++this.cpu.PC] | (this.memory[++this.cpu.PC] << 8);
          this.memory[addr] = this.cpu.A;
          this.cpu.PC++;
        }
        break;
      case 0xe8: // INX
        this.cpu.X = (this.cpu.X + 1) & 0xff;
        this.cpu.PC++;
        break;
      case 0xc8: // INY
        this.cpu.Y = (this.cpu.Y + 1) & 0xff;
        this.cpu.PC++;
        break;
      case 0xea: // NOP
        this.cpu.PC++;
        break;
      default:
        // Unknown opcode, just advance PC
        this.cpu.PC++;
    }
  }

  private getOpcodeMnemonic(opcode: number): string {
    const mnemonics: Record<number, string> = {
      0x00: 'BRK',
      0xa9: 'LDA',
      0xa2: 'LDX',
      0xa0: 'LDY',
      0x8d: 'STA',
      0xe8: 'INX',
      0xc8: 'INY',
      0xea: 'NOP',
    };
    return mnemonics[opcode] || 'UNKNOWN';
  }

  private hexStringToBytes(hex: string): number[] {
    const cleaned = hex.replace(/\s+/g, '');
    const bytes: number[] = [];
    
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.substr(i, 2), 16));
    }
    
    return bytes;
  }

  private bytesToHexString(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
  }
}
