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
    (isRecording ? 'Recording... Tap stop when finished speaking.' : 
     isProcessingVoice ? 'Processing your audio...' : 
     'Tap the microphone to record voice input. Mention attendee salaries clearly.');

  return (
    <div className="bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 rounded-2xl sm:rounded-3xl p-1 shadow-2xl">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">AI Voice Assistant</h3>
              <p className="text-xs sm:text-sm text-gray-500">Record audio to add attendees</p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            {/* Processing indicators */}
            {isProcessingVoice && (
              <div className="flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 rounded-lg">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs sm:text-sm text-blue-600 font-medium">Processing</span>
              </div>
            )}
            <button
              onClick={toggleRecording}
              disabled={!audioSupported || isProcessingVoice}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-white shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 scale-110' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400'
              }`}
            >
              {isRecording ? <Square className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{voiceInputText}</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {transcript && (
            <div className="bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-800">
                <span className="font-semibold">Transcribed:</span> "{transcript}"
              </p>
            </div>
          )}

          {!audioSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-yellow-800 flex items-center">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Audio recording not supported in this browser
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}