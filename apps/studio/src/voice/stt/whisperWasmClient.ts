/**
 * Whisper WASM Client
 * 
 * Local speech-to-text using Whisper.cpp compiled to WebAssembly
 * Provides offline STT capabilities with fallback to cloud services
 */

import { STTClient, TranscriptionChunk, TranscriptionResult } from '../types';

export class WhisperWasmClient implements STTClient {
  private wasmModule: any = null;
  private isInitialized: boolean = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private transcriptionCallbacks: ((chunk: TranscriptionChunk) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];
  private audioBuffer: Float32Array[] = [];
  private isRecording: boolean = false;

  constructor() {
    this.initializeWasm();
  }

  private async initializeWasm(): Promise<void> {
    try {
      // Load Whisper WASM module
      // Note: In a real implementation, you'd load the actual Whisper WASM files
      // For now, we'll simulate the initialization
      console.log('Initializing Whisper WASM module...');
      
      // Simulate WASM loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      console.log('Whisper WASM module initialized');
    } catch (error) {
      console.error('Failed to initialize Whisper WASM:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
    }
  }

  async startListening(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Whisper WASM not initialized');
    }

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Create AudioContext
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      
      // Create audio source
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create audio processor for VAD and buffering
      await this.setupAudioProcessor(source);
      
      this.isRecording = true;
      console.log('Whisper WASM listening started');
      
    } catch (error) {
      console.error('Failed to start Whisper WASM listening:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
      throw error;
    }
  }

  async stopListening(): Promise<TranscriptionResult> {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }

    this.isRecording = false;

    // Process final audio buffer
    const finalText = await this.processAudioBuffer();
    
    // Cleanup
    this.cleanup();

    return {
      text: finalText,
      confidence: 0.9, // Whisper typically has high confidence
      language: 'ar',
      duration: this.audioBuffer.length * 0.1, // Approximate duration
    };
  }

  onTranscription(callback: (chunk: TranscriptionChunk) => void): void {
    this.transcriptionCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.AudioContext &&
      this.isInitialized
    );
  }

  private async setupAudioProcessor(source: MediaStreamAudioSourceNode): Promise<void> {
    try {
      // Create a simple audio processor for VAD and buffering
      const processor = this.audioContext!.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        if (!this.isRecording) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Copy audio data to buffer
        this.audioBuffer.push(new Float32Array(inputData));
        
        // Simple VAD (Voice Activity Detection)
        const energy = this.calculateEnergy(inputData);
        const threshold = 0.01; // Adjust based on testing
        
        if (energy > threshold) {
          // Voice detected, process audio chunk
          this.processAudioChunk(inputData);
        }
      };
      
      source.connect(processor);
      processor.connect(this.audioContext!.destination);
      
    } catch (error) {
      console.error('Failed to setup audio processor:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
    }
  }

  private calculateEnergy(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  private async processAudioChunk(audioData: Float32Array): Promise<void> {
    try {
      // In a real implementation, you'd send this to the Whisper WASM module
      // For now, we'll simulate processing
      const simulatedText = this.simulateTranscription(audioData);
      
      if (simulatedText) {
        const chunk: TranscriptionChunk = {
          text: simulatedText,
          isFinal: false,
          confidence: 0.8,
          timestamp: Date.now(),
        };
        
        this.transcriptionCallbacks.forEach(callback => callback(chunk));
      }
    } catch (error) {
      console.error('Failed to process audio chunk:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
    }
  }

  private async processAudioBuffer(): Promise<string> {
    try {
      // In a real implementation, you'd process the entire audio buffer
      // with the Whisper WASM module
      // For now, we'll simulate final transcription
      const simulatedText = this.simulateFinalTranscription();
      
      const chunk: TranscriptionChunk = {
        text: simulatedText,
        isFinal: true,
        confidence: 0.9,
        timestamp: Date.now(),
      };
      
      this.transcriptionCallbacks.forEach(callback => callback(chunk));
      
      return simulatedText;
    } catch (error) {
      console.error('Failed to process audio buffer:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
      return '';
    }
  }

  private simulateTranscription(audioData: Float32Array): string {
    // Simulate real-time transcription
    // In a real implementation, this would use the actual Whisper model
    const energy = this.calculateEnergy(audioData);
    if (energy > 0.01) {
      return '...'; // Placeholder for live transcription
    }
    return '';
  }

  private simulateFinalTranscription(): string {
    // Simulate final transcription result
    // In a real implementation, this would be the actual Whisper output
    return 'هذا نص تجريبي من Whisper المحلي';
  }

  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.audioBuffer = [];
    this.isRecording = false;
  }

  // Public cleanup method
  destroy(): void {
    this.cleanup();
    this.transcriptionCallbacks = [];
    this.errorCallbacks = [];
  }
}

// Factory function for creating Whisper WASM client
export const createWhisperWasmClient = (): WhisperWasmClient => {
  return new WhisperWasmClient();
};
