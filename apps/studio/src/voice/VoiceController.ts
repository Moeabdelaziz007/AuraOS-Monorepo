/**
 * Voice Controller
 * 
 * Main controller for voice processing with fallback between local and cloud STT
 */

import { VoiceController as IVoiceController, TranscriptionChunk, TranscriptionResult, IntentResult } from './types';
import { DeepgramClient, createDeepgramClient } from './stt/deepgramClient';
import { WhisperWasmClient, createWhisperWasmClient } from './stt/whisperWasmClient';
import { studioPubSub } from '../stores/StudioStore';

export class VoiceController implements IVoiceController {
  private deepgramClient: DeepgramClient | null = null;
  private whisperClient: WhisperWasmClient | null = null;
  private currentEngine: 'whisper-local' | 'deepgram-cloud' = 'whisper-local';
  private currentLanguage: 'ar' | 'en' = 'ar';
  private isRecording: boolean = false;
  private transcriptionCallbacks: ((chunk: TranscriptionChunk) => void)[] = [];
  private intentCallbacks: ((intent: IntentResult) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  constructor(deepgramApiKey?: string) {
    // Initialize clients
    if (deepgramApiKey) {
      this.deepgramClient = createDeepgramClient(deepgramApiKey);
    }
    this.whisperClient = createWhisperWasmClient();
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      this.isRecording = true;
      
      // Try local engine first, fallback to cloud
      if (this.currentEngine === 'whisper-local' && this.whisperClient?.isSupported()) {
        await this.startLocalRecording();
      } else if (this.currentEngine === 'deepgram-cloud' && this.deepgramClient?.isSupported()) {
        await this.startCloudRecording();
      } else {
        // Fallback logic
        await this.tryFallback();
      }

      // Publish recording start event
      studioPubSub.publish('voice.recording.start', {
        engine: this.currentEngine,
        language: this.currentLanguage,
      });

    } catch (error) {
      this.isRecording = false;
      this.errorCallbacks.forEach(callback => callback(error as Error));
      throw error;
    }
  }

  async stopRecording(): Promise<TranscriptionResult> {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }

    try {
      let result: TranscriptionResult;

      if (this.currentEngine === 'whisper-local' && this.whisperClient) {
        result = await this.whisperClient.stopListening();
      } else if (this.currentEngine === 'deepgram-cloud' && this.deepgramClient) {
        result = await this.deepgramClient.stopListening();
      } else {
        throw new Error('No active recording session');
      }

      this.isRecording = false;

      // Publish transcription final event
      studioPubSub.publish('voice.transcription.final', result);

      // Process intent
      const intent = await this.processIntent(result.text);
      if (intent) {
        this.intentCallbacks.forEach(callback => callback(intent));
        studioPubSub.publish('voice.intent.detected', intent);
      }

      return result;

    } catch (error) {
      this.isRecording = false;
      this.errorCallbacks.forEach(callback => callback(error as Error));
      throw error;
    }
  }

  setEngine(engine: 'whisper-local' | 'deepgram-cloud'): void {
    this.currentEngine = engine;
  }

  setLanguage(language: 'ar' | 'en'): void {
    this.currentLanguage = language;
  }

  onTranscription(callback: (chunk: TranscriptionChunk) => void): void {
    this.transcriptionCallbacks.push(callback);
  }

  onIntent(callback: (intent: IntentResult) => void): void {
    this.intentCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  private async startLocalRecording(): Promise<void> {
    if (!this.whisperClient) {
      throw new Error('Whisper client not available');
    }

    // Setup callbacks
    this.whisperClient.onTranscription((chunk) => {
      this.transcriptionCallbacks.forEach(callback => callback(chunk));
      studioPubSub.publish('voice.transcription.chunk', chunk);
    });

    this.whisperClient.onError((error) => {
      this.errorCallbacks.forEach(callback => callback(error));
      studioPubSub.publish('voice.error', error);
    });

    await this.whisperClient.startListening();
  }

  private async startCloudRecording(): Promise<void> {
    if (!this.deepgramClient) {
      throw new Error('Deepgram client not available');
    }

    // Setup callbacks
    this.deepgramClient.onTranscription((chunk) => {
      this.transcriptionCallbacks.forEach(callback => callback(chunk));
      studioPubSub.publish('voice.transcription.chunk', chunk);
    });

    this.deepgramClient.onError((error) => {
      this.errorCallbacks.forEach(callback => callback(error));
      studioPubSub.publish('voice.error', error);
    });

    await this.deepgramClient.startListening();
  }

  private async tryFallback(): Promise<void> {
    // Try the other engine
    const fallbackEngine = this.currentEngine === 'whisper-local' ? 'deepgram-cloud' : 'whisper-local';
    
    if (fallbackEngine === 'deepgram-cloud' && this.deepgramClient?.isSupported()) {
      this.currentEngine = 'deepgram-cloud';
      await this.startCloudRecording();
    } else if (fallbackEngine === 'whisper-local' && this.whisperClient?.isSupported()) {
      this.currentEngine = 'whisper-local';
      await this.startLocalRecording();
    } else {
      throw new Error('No supported STT engines available');
    }
  }

  private async processIntent(text: string): Promise<IntentResult | null> {
    if (!text.trim()) return null;

    // Simple intent detection based on Arabic/English patterns
    const intent = this.detectIntent(text);
    
    if (intent) {
      // Publish intent event
      studioPubSub.publish('voice.intent.detected', intent);
    }

    return intent;
  }

  private detectIntent(text: string): IntentResult | null {
    const lowerText = text.toLowerCase();
    
    // Arabic patterns
    const arabicPatterns = {
      execute: [
        'شغّل', 'نفّذ', 'تشغيل', 'تشغيل الكود', 'تشغيل الملف',
        'run', 'execute', 'run code', 'run file'
      ],
      note: [
        'دوّن', 'اكتب', 'سجّل', 'ملاحظة', 'note', 'write', 'record'
      ],
      explain: [
        'اشرح', 'وضّح', 'explain', 'clarify', 'what is'
      ]
    };

    // English patterns
    const englishPatterns = {
      execute: [
        'run', 'execute', 'run code', 'run file', 'run this'
      ],
      note: [
        'note', 'write', 'record', 'save', 'create note'
      ],
      explain: [
        'explain', 'clarify', 'what is', 'how does', 'tell me about'
      ]
    };

    const patterns = this.currentLanguage === 'ar' ? arabicPatterns : englishPatterns;

    // Check for execute intent
    for (const pattern of patterns.execute) {
      if (lowerText.includes(pattern)) {
        return {
          type: 'execute',
          confidence: 0.8,
          payload: { text, action: 'execute' },
          context: 'terminal'
        };
      }
    }

    // Check for note intent
    for (const pattern of patterns.note) {
      if (lowerText.includes(pattern)) {
        return {
          type: 'note',
          confidence: 0.8,
          payload: { text, action: 'create_note' },
          context: 'notes'
        };
      }
    }

    // Check for explain intent
    for (const pattern of patterns.explain) {
      if (lowerText.includes(pattern)) {
        return {
          type: 'explain',
          confidence: 0.8,
          payload: { text, action: 'explain' },
          context: 'ai_assistant'
        };
      }
    }

    // Default to unknown
    return {
      type: 'unknown',
      confidence: 0.3,
      payload: { text },
      context: 'general'
    };
  }

  // Cleanup method
  cleanup(): void {
    if (this.whisperClient) {
      this.whisperClient.destroy();
    }
    
    if (this.deepgramClient) {
      this.deepgramClient.cleanup();
    }
    
    this.transcriptionCallbacks = [];
    this.intentCallbacks = [];
    this.errorCallbacks = [];
    this.isRecording = false;
  }
}

// Factory function
export const createVoiceController = (deepgramApiKey?: string): VoiceController => {
  return new VoiceController(deepgramApiKey);
};
