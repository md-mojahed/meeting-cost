import React from 'react';
import { Play, Square, RotateCcw, Clock } from 'lucide-react';
import { MeetingState, Attendee, WorkingHours, CurrencySettings } from '../types';
import { formatTime, calculateMeetingCost, formatCurrency } from '../utils/calculations';

interface MeetingTimerProps {
  meeting: MeetingState;
  attendees: Attendee[];
  workingHours: WorkingHours;
  currency: CurrencySettings;
  onStart: () => void;
  onEnd: () => void;
  onReset: () => void;
}

export function MeetingTimer({ meeting, attendees, workingHours, currency, onStart, onEnd, onReset }: MeetingTimerProps) {
  const currentCost = calculateMeetingCost(attendees, workingHours, meeting.duration);
  const hasAttendees = attendees.length > 0 && attendees.some(a => a.salary > 0);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear all attendees, settings, and meeting history.')) {
      onReset();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meeting Timer</h2>
          <p className="text-sm text-gray-500">Track your meeting costs in real-time</p>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl p-8 mb-6">
          <div className="text-5xl font-bold text-white mb-2 font-mono tracking-wider">
            {formatTime(meeting.duration)}
          </div>
          <div className="text-gray-300 text-sm font-medium">ELAPSED TIME</div>
        </div>
        {currentCost > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {formatCurrency(currentCost, currency)}
            </div>
            <div className="text-red-500 text-sm font-medium">TOTAL COST</div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-4">
        {!meeting.isRunning ? (
          <button
            onClick={onStart}
            disabled={!hasAttendees}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
          >
            <Play className="h-5 w-5" />
            <span>Start Meeting</span>
          </button>
        ) : (
          <button
            onClick={onEnd}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Square className="h-5 w-5" />
            <span>End Meeting</span>
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Reset All</span>
        </button>
      </div>
      
      {!hasAttendees && (
        <div className="text-center text-sm text-gray-500 mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          Add attendees with salaries to start the meeting timer
        </div>
      )}
    </div>
  );
}