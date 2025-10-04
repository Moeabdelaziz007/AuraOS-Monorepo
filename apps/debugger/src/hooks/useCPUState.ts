/**
 * useCPUState Hook
 * Manages CPU state for 6502 emulator debugging
 * 
 * TODO: Implement full CPU state management in Sprint 2
 */

import { useState, useCallback } from 'react';

export interface CPUState {
  // 6502 Registers
  A: number; // Accumulator
  X: number; // X register
  Y: number; // Y register
  PC: number; // Program Counter
  SP: number; // Stack Pointer
  // Status flags
  flags: {
    N: boolean; // Negative
    V: boolean; // Overflow
    B: boolean; // Break
    D: boolean; // Decimal
    I: boolean; // Interrupt Disable
    Z: boolean; // Zero
    C: boolean; // Carry
  };
}

const initialCPUState: CPUState = {
  A: 0,
  X: 0,
  Y: 0,
  PC: 0,
  SP: 0xff,
  flags: {
    N: false,
    V: false,
    B: false,
    D: false,
    I: false,
    Z: false,
    C: false,
  },
};

export const useCPUState = () => {
  const [cpuState, setCPUState] = useState<CPUState>(initialCPUState);

  const updateRegister = useCallback((register: keyof CPUState, value: number) => {
    setCPUState((prev) => ({ ...prev, [register]: value }));
  }, []);

  const updateFlag = useCallback((flag: keyof CPUState['flags'], value: boolean) => {
    setCPUState((prev) => ({
      ...prev,
      flags: { ...prev.flags, [flag]: value },
    }));
  }, []);

  const reset = useCallback(() => {
    setCPUState(initialCPUState);
  }, []);

  return {
    cpuState,
    updateRegister,
    updateFlag,
    reset,
  };
};

export default useCPUState;
