/**
 * ElevenLabs TTS Client
 * 
 * Cloud-based text-to-speech using ElevenLabs API
 */

import { TTSClient, TTSOptions } from '../types';

export class ElevenLabsClient implements TTSClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private currentAudio: HTMLAudioElement | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      // Stop any current audio
      this.stop();

      // Prepare request
      const voiceId = options.voice || 'pNInz6obpgDQGcFmaJgB'; // Default voice
      const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
      
      const requestBody = {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      };

      // Make API request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      // Get audio data
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = options.volume || 1.0;
      
      // Set playback rate if specified
      if (options.speed) {
        this.currentAudio.playbackRate = options.speed;
      }

      // Play audio
      await this.currentAudio.play();

      // Cleanup after playback
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      };

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isSupported(): boolean {
    return !!this.apiKey;
  }

  // Get available voices
  async getVoices(): Promise<Array<{ voice_id: string; name: string; labels?: { language?: string } }>> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }

  // Get voice by name (useful for Arabic voices)
  async getVoiceByName(name: string): Promise<string | null> {
    const voices = await this.getVoices();
    const voice = voices.find(v => 
      v.name.toLowerCase().includes(name.toLowerCase()) ||
      v.labels?.language?.toLowerCase().includes(name.toLowerCase())
    );
    return voice?.voice_id || null;
  }

  // Get Arabic voices
  async getArabicVoices(): Promise<Array<{ voice_id: string; name: string; labels?: { language?: string } }>> {
    const voices = await this.getVoices();
    return voices.filter(voice => 
      voice.labels?.language === 'ar' || 
      voice.name.toLowerCase().includes('arabic') ||
      voice.name.toLowerCase().includes('عربي')
    );
  }
}

// Factory function
export const createElevenLabsClient = (apiKey: string): ElevenLabsClient => {
  return new ElevenLabsClient(apiKey);
};
