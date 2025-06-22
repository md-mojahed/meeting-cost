import { useState, useEffect, useRef } from 'react';
import { MeetingState } from '../types';

export function useTimer(initialState: MeetingState, onUpdate: (state: MeetingState) => void) {
  const [meeting, setMeeting] = useState<MeetingState>(initialState);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (meeting.isRunning && meeting.startTime) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const duration = now - meeting.startTime!;
        const newState = { ...meeting, duration };
        setMeeting(newState);
        onUpdate(newState);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [meeting.isRunning, meeting.startTime, onUpdate]);

  const startMeeting = () => {
    const now = Date.now();
    const newState = { ...meeting, isRunning: true, startTime: now };
    setMeeting(newState);
    onUpdate(newState);
  };

  const endMeeting = () => {
    const newState = { ...meeting, isRunning: false };
    setMeeting(newState);
    onUpdate(newState);
  };

  const resetMeeting = () => {
    const newState = { isRunning: false, startTime: null, duration: 0, totalCost: 0 };
    setMeeting(newState);
    onUpdate(newState);
  };

  return { meeting, startMeeting, endMeeting, resetMeeting };
}