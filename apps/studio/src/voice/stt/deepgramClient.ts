/**
 * Deepgram STT Client
 * 
 * Cloud-based speech-to-text using Deepgram API with real-time streaming
 */

import { STTClient, TranscriptionChunk, TranscriptionResult } from '../types';

export class DeepgramClient implements STTClient {
  private apiKey: string;
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;
  private transcriptionCallbacks: ((chunk: TranscriptionChunk) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];
  private audioChunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startListening(): Promise<void> {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Initialize WebSocket connection to Deepgram
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=ar&smart_format=true&interim_results=true`;
      this.websocket = new WebSocket(wsUrl, ['token', this.apiKey]);

      this.websocket.onopen = () => {
        this.isConnected = true;
        console.log('Deepgram WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleTranscriptionResponse(data);
      };

      this.websocket.onerror = (error) => {
        console.error('Deepgram WebSocket error:', error);
        this.errorCallbacks.forEach(callback => callback(new Error('WebSocket connection failed')));
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        console.log('Deepgram WebSocket closed');
      };

      // Start MediaRecorder for audio streaming
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.websocket && this.isConnected) {
          this.websocket.send(event.data);
        }
      };

      this.mediaRecorder.start(100); // Send data every 100ms

    } catch (error) {
      console.error('Failed to start Deepgram listening:', error);
      this.errorCallbacks.forEach(callback => callback(error as Error));
      throw error;
    }
  }

  async stopListening(): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.websocket) {
        reject(new Error('Not currently listening'));
        return;
      }

      // Stop recording
      this.mediaRecorder.stop();
      this.mediaRecorder = null;

      // Close WebSocket
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }

      // Return final transcription
      // In a real implementation, you'd wait for the final result
      resolve({
        text: '', // Will be populated by final transcription
        confidence: 0.9,
        language: 'ar',
        duration: 0,
      });
    });
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
      window.WebSocket &&
      window.MediaRecorder
    );
  }

  private handleTranscriptionResponse(data: any): void {
    if (data.type === 'Results' && data.channel) {
      const alternatives = data.channel.alternatives;
      if (alternatives && alternatives.length > 0) {
        const transcript = alternatives[0].transcript;
        const confidence = alternatives[0].confidence || 0.8;
        const isFinal = data.is_final || false;

        const chunk: TranscriptionChunk = {
          text: transcript,
          isFinal,
          confidence,
          timestamp: Date.now(),
        };

        this.transcriptionCallbacks.forEach(callback => callback(chunk));
      }
    }
  }

  // Cleanup method
  cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.isConnected = false;
    this.transcriptionCallbacks = [];
    this.errorCallbacks = [];
  }
}

// Factory function for creating Deepgram client
export const createDeepgramClient = (apiKey: string): DeepgramClient => {
  return new DeepgramClient(apiKey);
};
