/**
 * useMemoryState Hook
 * Manages memory state for emulator debugging
 * 
 * TODO: Implement full memory management in Sprint 2
 */

import { useState, useCallback } from 'react';

const MEMORY_SIZE = 65536; // 64KB for 6502

export const useMemoryState = () => {
  const [memory, setMemory] = useState<Uint8Array>(() => new Uint8Array(MEMORY_SIZE));

  const readByte = useCallback(
    (address: number): number => {
      if (address < 0 || address >= MEMORY_SIZE) {
        throw new Error(`Invalid memory address: ${address}`);
      }
      return memory[address];
    },
    [memory]
  );

  const writeByte = useCallback((address: number, value: number) => {
    if (address < 0 || address >= MEMORY_SIZE) {
      throw new Error(`Invalid memory address: ${address}`);
    }
    if (value < 0 || value > 255) {
      throw new Error(`Invalid byte value: ${value}`);
    }
    setMemory((prev) => {
      const newMemory = new Uint8Array(prev);
      newMemory[address] = value;
      return newMemory;
    });
  }, []);

  const readWord = useCallback(
    (address: number): number => {
      const low = readByte(address);
      const high = readByte(address + 1);
      return (high << 8) | low;
    },
    [readByte]
  );

  const writeWord = useCallback(
    (address: number, value: number) => {
      writeByte(address, value & 0xff);
      writeByte(address + 1, (value >> 8) & 0xff);
    },
    [writeByte]
  );

  const loadProgram = useCallback((program: Uint8Array, startAddress: number = 0) => {
    setMemory((prev) => {
      const newMemory = new Uint8Array(prev);
      newMemory.set(program, startAddress);
      return newMemory;
    });
  }, []);

  const reset = useCallback(() => {
    setMemory(new Uint8Array(MEMORY_SIZE));
  }, []);

  return {
    memory,
    readByte,
    writeByte,
    readWord,
    writeWord,
    loadProgram,
    reset,
  };
};

export default useMemoryState;
