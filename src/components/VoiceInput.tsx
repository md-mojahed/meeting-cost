import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { parseSpeechToAttendees } from '../utils/calculations';
import { Attendee } from '../types';

interface VoiceInputProps {
  onAttendeesExtracted: (attendees: Attendee[]) => void;
}

export function VoiceInput({ onAttendeesExtracted }: VoiceInputProps) {
  const { transcript, isListening, error, startListening, stopListening } = useSpeechToText();
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

  useEffect(() => {
    if (transcript && transcript !== lastProcessedTranscript) {
      const attendees = parseSpeechToAttendees(transcript);
      if (attendees.length > 0) {
        onAttendeesExtracted(attendees);
        setLastProcessedTranscript(transcript);
      }
    }
  }, [transcript, onAttendeesExtracted, lastProcessedTranscript]);

  const voiceInputText = isListening
    ? 'Listening... Speak clearly and mention salary amounts.'
    : 'Click the microphone to add attendees by voice. Try: "Add three people with salaries 80k, 120k, and 150k"';

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
              <p className="text-sm text-gray-500">Speak naturally to add attendees</p>
            </div>
          </div>
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
            className={`p-4 rounded-2xl transition-all duration-300 text-white shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 scale-110' 
                : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400'
            }`}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
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
                <span className="font-semibold">Recognized:</span> "{transcript}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}