import { useState, useRef, useCallback } from 'react';

interface AudioRecordingResult {
  isRecording: boolean;
  isProcessingAudio: boolean;
  isProcessingText: boolean;
  transcript: string;
  error: string | null;
  processingStep: string;
  audioSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  toggleRecording: () => void;
}

export function useAudioRecording(onAttendeesExtracted: (attendees: any[]) => void): AudioRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');
  const [audioSupported] = useState(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }[type];
    
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform translate-x-full transition-transform duration-300 ${bgColor} text-white`;
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="font-medium">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }, []);

  const startRecording = useCallback(async () => {
    if (!audioSupported) {
      setError('Audio recording not supported in this browser');
      showNotification('Audio recording not supported in this browser', 'error');
      return;
    }

    try {
      setProcessingStep('Requesting microphone access...');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        processAudioRecording();
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setProcessingStep('Recording... Click stop when finished');
      showNotification('Recording started. Speak clearly about attendee salaries.', 'info');

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
      showNotification('Failed to access microphone', 'error');
      setProcessingStep('');
    }
  }, [audioSupported, showNotification]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setProcessingStep('Processing audio...');
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const processAudioRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      showNotification('No audio recorded', 'warning');
      setProcessingStep('');
      return;
    }

    setIsProcessingAudio(true);
    setProcessingStep('Converting audio to text...');

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to speech-to-text API
      const speechResponse = await fetch('https://worker.amarecom.com/api/speech-to-text', {
        method: 'POST',
        body: formData
      });

      if (!speechResponse.ok) {
        throw new Error(`Speech-to-text API failed: ${speechResponse.status} ${speechResponse.statusText}`);
      }

      const speechData = await speechResponse.json();
      
      if (!speechData.text || speechData.text.trim() === '') {
        throw new Error('No text was extracted from the audio');
      }

      setTranscript(speechData.text);
      setProcessingStep('Extracting attendee information...');
      
      // Process the text to extract attendees
      await processTextForAttendees(speechData.text);

    } catch (err) {
      console.error('Audio processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to process audio: ${errorMessage}`);
      showNotification('Failed to process audio. Please try again.', 'error');
    } finally {
      setIsProcessingAudio(false);
      setProcessingStep('');
    }
  }, [showNotification]);

  const processTextForAttendees = useCallback(async (text: string) => {
    if (!text || text.trim() === '') {
      showNotification('No text to process', 'warning');
      return;
    }

    setIsProcessingText(true);
    setProcessingStep('Analyzing text for attendee data...');

    try {
      // Encode the text for URL
      const encodedText = encodeURIComponent(text.trim());
      const apiUrl = `https://worker.amarecom.com/api/get-attendees-from-text?text=${encodedText}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Attendees API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process the API response
      if (data && Array.isArray(data) && data.length > 0) {
        // Filter valid attendees
        const validAttendees = data.filter(attendeeData => 
          attendeeData.salary && attendeeData.salary > 0
        );
        
        if (validAttendees.length > 0) {
          onAttendeesExtracted(validAttendees);
          showNotification(`Successfully added ${validAttendees.length} attendee(s) from voice input!`, 'success');
        } else {
          showNotification('No valid salary information found in the audio.', 'warning');
        }
      } else {
        showNotification('No attendee information found. Try mentioning specific salary amounts.', 'warning');
      }

    } catch (err) {
      console.error('Text processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to extract attendees: ${errorMessage}`);
      showNotification('Failed to extract attendee information. Please try again.', 'error');
    } finally {
      setIsProcessingText(false);
      setProcessingStep('');
    }
  }, [onAttendeesExtracted, showNotification]);

  return {
    isRecording,
    isProcessingAudio,
    isProcessingText,
    transcript,
    error,
    processingStep,
    audioSupported,
    startRecording,
    stopRecording,
    toggleRecording
  };
}