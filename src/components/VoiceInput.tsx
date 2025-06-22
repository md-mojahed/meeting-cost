import React from 'react';
import { Mic, Square, AlertTriangle } from 'lucide-react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { Attendee } from '../types';

interface VoiceInputProps {
  onAttendeesExtracted: (attendees: Attendee[]) => void;
}

export function VoiceInput({ onAttendeesExtracted }: VoiceInputProps) {
  const handleAttendeesExtracted = (apiAttendees: any[]) => {
    const attendees: Attendee[] = apiAttendees.map((attendeeData, index) => ({
      id: index + 1, // This will be updated by the parent component
      salary: attendeeData.salary
    }));
    onAttendeesExtracted(attendees);
  };

  const {
    isRecording,
    isProcessingAudio,
    isProcessingText,
    transcript,
    error,
    processingStep,
    audioSupported,
    toggleRecording
  } = useAudioRecording(handleAttendeesExtracted);

  const isProcessingVoice = isProcessingAudio || isProcessingText;

  const voiceInputText = processingStep || 
    (isRecording ? 'Recording... Click stop when finished speaking.' : 
     isProcessingVoice ? 'Processing your audio...' : 
     'Click the microphone to record voice input. Mention attendee salaries clearly.');

  return (
    <div className="bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 rounded-3xl p-1 shadow-2xl">
      <div className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-2xl">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Voice Assistant</h3>
              <p className="text-sm text-gray-500">Record audio to add attendees</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Processing indicators */}
            {isProcessingVoice && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600 font-medium">Processing</span>
              </div>
            )}
            <button
              onClick={toggleRecording}
              disabled={!audioSupported || isProcessingVoice}
              className={`p-4 rounded-2xl transition-all duration-300 text-white shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 scale-110' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400'
              }`}
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{voiceInputText}</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {transcript && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Transcribed:</span> "{transcript}"
              </p>
            </div>
          )}

          {!audioSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-sm text-yellow-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Audio recording not supported in this browser
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}