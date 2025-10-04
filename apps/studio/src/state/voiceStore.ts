/**
 * Voice Store - Zustand Store for Voice-First Features
 * 
 * Manages voice recording state, transcription, and intent recognition
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { VoiceState, VoiceConfig, IntentResult, TranscriptionResult } from '../voice/types';

export interface VoiceStore extends VoiceState {
  config: VoiceConfig;
  
  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<TranscriptionResult>;
  setEngine: (engine: 'whisper-local' | 'deepgram-cloud') => void;
  setLanguage: (language: 'ar' | 'en') => void;
  setTranscriptLive: (text: string) => void;
  setTranscriptFinal: (text: string) => void;
  setError: (error: string | null) => void;
  setProcessing: (processing: boolean) => void;
  setLastIntent: (intent: IntentResult | null) => void;
  reset: () => void;
}

const initialConfig: VoiceConfig = {
  sttEngine: 'whisper-local',
  ttsEnabled: true,
  language: 'ar',
  autoDetectLanguage: true,
  confidenceThreshold: 0.7,
};

const initialState: VoiceState = {
  isRecording: false,
  isProcessing: false,
  engine: 'whisper-local',
  transcriptLive: '',
  transcriptFinal: '',
  error: undefined,
  lastIntent: undefined,
};

export const useVoiceStore = create<VoiceStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    config: initialConfig,
    
    startRecording: async () => {
      set({ isRecording: true, error: undefined, transcriptLive: '', transcriptFinal: '' });
    },
    
    stopRecording: async () => {
      const state = get();
      set({ isRecording: false, isProcessing: true });
      
      // Return the final transcription
      return {
        text: state.transcriptFinal,
        confidence: 0.9, // Will be updated by actual STT
        language: state.config.language,
      };
    },
    
    setEngine: (engine) => {
      set({ engine });
      get().config.sttEngine = engine;
    },
    
    setLanguage: (language) => {
      get().config.language = language;
    },
    
    setTranscriptLive: (text) => {
      set({ transcriptLive: text });
    },
    
    setTranscriptFinal: (text) => {
      set({ transcriptFinal: text, isProcessing: false });
    },
    
    setError: (error) => {
      set({ error: error || undefined, isRecording: false, isProcessing: false });
    },
    
    setProcessing: (processing) => {
      set({ isProcessing: processing });
    },
    
    setLastIntent: (intent) => {
      set({ lastIntent: intent || undefined });
    },
    
    reset: () => {
      set(initialState);
    },
  }))
);

// Voice-specific Pub/Sub events
export const voiceEvents = {
  TRANSCRIPTION_START: 'voice.transcription.start',
  TRANSCRIPTION_CHUNK: 'voice.transcription.chunk',
  TRANSCRIPTION_FINAL: 'voice.transcription.final',
  INTENT_DETECTED: 'voice.intent.detected',
  ERROR: 'voice.error',
  RECORDING_START: 'voice.recording.start',
  RECORDING_STOP: 'voice.recording.stop',
} as const;

export default useVoiceStore;
