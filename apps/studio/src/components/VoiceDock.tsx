/**
 * VoiceDock - Voice-First Interface Component
 * 
 * Main voice interface for AuraOS Studio with recording, transcription, and intent display
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVoiceStore } from '../state/voiceStore';
import { studioPubSub } from '../stores/StudioStore';
import { createVoiceController } from '../voice/VoiceController';
import { createElevenLabsClient } from '../voice/tts/elevenlabsClient';

interface VoiceDockProps {
  className?: string;
}

export const VoiceDock: React.FC<VoiceDockProps> = ({ className = '' }) => {
  const {
    isRecording,
    isProcessing,
    engine,
    transcriptLive,
    transcriptFinal,
    error,
    startRecording,
    stopRecording,
    setEngine,
    setLanguage,
    setError,
    setTranscriptLive,
    setTranscriptFinal,
  } = useVoiceStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'whisper-local' | 'deepgram-cloud'>('whisper-local');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceControllerRef = useRef<any>(null);
  const ttsClientRef = useRef<any>(null);

  // Initialize voice controller and TTS
  useEffect(() => {
    const initVoice = async () => {
      try {
        // Initialize voice controller
        const deepgramApiKey = process.env.REACT_APP_DEEPGRAM_API_KEY;
        voiceControllerRef.current = createVoiceController(deepgramApiKey);
        
        // Initialize TTS client
        const elevenLabsApiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
        if (elevenLabsApiKey) {
          ttsClientRef.current = createElevenLabsClient(elevenLabsApiKey);
        }
        
        // Setup voice controller callbacks
        voiceControllerRef.current.onTranscription((chunk: any) => {
          if (chunk.isFinal) {
            setTranscriptFinal(chunk.text);
          } else {
            setTranscriptLive(chunk.text);
          }
        });
        
        voiceControllerRef.current.onIntent((intent: any) => {
          console.log('Intent detected:', intent);
          // Publish intent to studio system
          studioPubSub.publish('voice.intent.detected', intent);
        });
        
        voiceControllerRef.current.onError((error: Error) => {
          setError(error.message);
        });
        
      } catch (err) {
        setError('Failed to initialize voice features. Please check your API keys.');
        console.error('Voice initialization failed:', err);
      }
    };

    initVoice();

    return () => {
      if (voiceControllerRef.current) {
        voiceControllerRef.current.cleanup();
      }
    };
  }, [setError]);

  const handleStartRecording = async () => {
    try {
      setError(undefined);
      
      if (!voiceControllerRef.current) {
        throw new Error('Voice controller not initialized');
      }
      
      // Set engine and language
      voiceControllerRef.current.setEngine(selectedEngine);
      voiceControllerRef.current.setLanguage(selectedLanguage);
      
      await voiceControllerRef.current.startRecording();
      await startRecording();
      
      // Publish recording start event
      studioPubSub.publish('voice.recording.start', { engine: selectedEngine });
      
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Recording start failed:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!voiceControllerRef.current) {
        throw new Error('Voice controller not initialized');
      }
      
      const result = await voiceControllerRef.current.stopRecording();
      await stopRecording();
      
      // Publish transcription final event
      studioPubSub.publish('voice.transcription.final', result);
      
      // Handle TTS response if not muted
      if (!isMuted && ttsClientRef.current && result.text) {
        try {
          await ttsClientRef.current.speak(result.text, {
            voice: selectedLanguage === 'ar' ? 'arabic_voice' : 'default_voice'
          });
        } catch (ttsError) {
          console.warn('TTS failed:', ttsError);
        }
      }
      
    } catch (err) {
      setError('Failed to stop recording. Please try again.');
      console.error('Recording stop failed:', err);
    }
  };

  const toggleEngine = () => {
    const newEngine = selectedEngine === 'whisper-local' ? 'deepgram-cloud' : 'whisper-local';
    setSelectedEngine(newEngine);
    setEngine(newEngine);
  };

  const toggleLanguage = () => {
    const newLanguage = selectedLanguage === 'ar' ? 'en' : 'ar';
    setSelectedLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement TTS mute/unmute
  };

  return (
    <div className={`voice-dock ${className}`}>
      {/* Main Voice Interface */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
        {/* Recording Button */}
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            shadow-lg hover:shadow-xl
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Status and Controls */}
        <div className="flex-1 min-w-0">
          {/* Live Transcript */}
          {transcriptLive && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">Live:</span> {transcriptLive}
            </div>
          )}
          
          {/* Final Transcript */}
          {transcriptFinal && (
            <div className="text-sm text-gray-800 dark:text-gray-100">
              <span className="font-medium">Final:</span> {transcriptFinal}
              {isProcessing && (
                <div className="flex items-center space-x-2 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs text-gray-500">Processing intent...</span>
                </div>
              )}
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          
          {/* Status Text */}
          {!transcriptLive && !transcriptFinal && !error && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isRecording ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              ) : (
                'Click to start recording'
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* TTS Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`
              p-2 rounded-lg transition-colors
              ${isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              dark:bg-gray-700 dark:hover:bg-gray-600
            `}
            title={isMuted ? 'Unmute TTS' : 'Mute TTS'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Voice Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Settings Panel */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Voice Settings
          </h3>
          
          <div className="space-y-3">
            {/* Engine Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Speech Recognition Engine
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedEngine('whisper-local')}
                  className={`
                    px-3 py-1 text-xs rounded-md transition-colors
                    ${selectedEngine === 'whisper-local'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  Whisper (Local)
                </button>
                <button
                  onClick={() => setSelectedEngine('deepgram-cloud')}
                  className={`
                    px-3 py-1 text-xs rounded-md transition-colors
                    ${selectedEngine === 'deepgram-cloud'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  Deepgram (Cloud)
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Language
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLanguage('ar')}
                  className={`
                    px-3 py-1 text-xs rounded-md transition-colors
                    ${selectedLanguage === 'ar'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  العربية
                </button>
                <button
                  onClick={() => setSelectedLanguage('en')}
                  className={`
                    px-3 py-1 text-xs rounded-md transition-colors
                    ${selectedLanguage === 'en'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  English
                </button>
              </div>
            </div>

            {/* Engine Status */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current: {selectedEngine === 'whisper-local' ? 'Local Whisper' : 'Deepgram Cloud'} • 
              Language: {selectedLanguage === 'ar' ? 'العربية' : 'English'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceDock;
