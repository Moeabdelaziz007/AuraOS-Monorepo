/**
 * Voice-First Types for AuraOS Studio
 * 
 * Type definitions for voice processing, STT, TTS, and intent recognition
 */

export type STTEngine = 'whisper-local' | 'deepgram-cloud';

export interface TranscriptionChunk {
  text: string;
  isFinal: boolean;
  confidence?: number;
  timestamp?: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
  duration?: number;
}

export interface IntentResult {
  type: 'execute' | 'note' | 'explain' | 'unknown';
  confidence: number;
  payload?: Record<string, unknown>;
  context?: string;
}

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  engine: STTEngine;
  transcriptLive: string;
  transcriptFinal: string;
  error?: string;
  lastIntent?: IntentResult;
}

export interface VoiceConfig {
  sttEngine: STTEngine;
  ttsEnabled: boolean;
  language: 'ar' | 'en';
  autoDetectLanguage: boolean;
  confidenceThreshold: number;
}

export interface STTClient {
  startListening(): Promise<void>;
  stopListening(): Promise<TranscriptionResult>;
  onTranscription(callback: (chunk: TranscriptionChunk) => void): void;
  onError(callback: (error: Error) => void): void;
  isSupported(): boolean;
}

export interface TTSClient {
  speak(text: string, options?: TTSOptions): Promise<void>;
  stop(): void;
  isSupported(): boolean;
}

export interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface VoiceController {
  startRecording(): Promise<void>;
  stopRecording(): Promise<TranscriptionResult>;
  setEngine(engine: STTEngine): void;
  setLanguage(language: 'ar' | 'en'): void;
  onTranscription(callback: (chunk: TranscriptionChunk) => void): void;
  onIntent(callback: (intent: IntentResult) => void): void;
  onError(callback: (error: Error) => void): void;
}
