import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Header } from './components/Header';
import { QuickStats } from './components/QuickStats';
import { WorkingHoursCard } from './components/WorkingHoursCard';
import { CurrencySettings } from './components/CurrencySettings';
import { AttendeeCard } from './components/AttendeeCard';
import { VoiceInput } from './components/VoiceInput';
import { MeetingTimer } from './components/MeetingTimer';
import { CostBreakdown } from './components/CostBreakdown';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTimer } from './hooks/useTimer';
import { calculateMeetingCost } from './utils/calculations';
import { Attendee, WorkingHours, AppState, CurrencySettings as CurrencySettingsType } from './types';

const initialWorkingHours: WorkingHours = {
  hoursPerDay: 8,
  daysPerWeek: 5,
  weeksPerYear: 50,
};

const initialCurrency: CurrencySettingsType = {
  symbol: '$',
  code: 'USD',
  position: 'before',
};

const initialState: AppState = {
  attendees: [],
  workingHours: initialWorkingHours,
  meeting: {
    isRunning: false,
    startTime: null,
    duration: 0,
    totalCost: 0,
  },
  currency: initialCurrency,
};

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('meeting-cost-app-v2', initialState);
  const [nextId, setNextId] = useState(() => 
    Math.max(0, ...appState.attendees.map(a => a.id)) + 1
  );

  const updateMeetingState = useCallback((meetingState: any) => {
    setAppState(prev => ({ ...prev, meeting: meetingState }));
  }, [setAppState]);

  const { meeting, startMeeting, endMeeting, resetMeeting } = useTimer(
    appState.meeting,
    updateMeetingState
  );

  const currentCost = calculateMeetingCost(appState.attendees, appState.workingHours, meeting.duration);

  const addAttendee = () => {
    const newAttendee: Attendee = { id: nextId, salary: 0 };
    setAppState(prev => ({
      ...prev,
      attendees: [...prev.attendees, newAttendee],
    }));
    setNextId(nextId + 1);
  };

  const removeAttendee = (id: number) => {
    setAppState(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.id !== id),
    }));
  };

  const updateAttendeeSalary = (id: number, salary: number) => {
    setAppState(prev => ({
      ...prev,
      attendees: prev.attendees.map(a => a.id === id ? { ...a, salary } : a),
    }));
  };

  const updateWorkingHours = (workingHours: WorkingHours) => {
    setAppState(prev => ({ ...prev, workingHours }));
  };

  const updateCurrency = (currency: CurrencySettingsType) => {
    setAppState(prev => ({ ...prev, currency }));
  };

  const handleVoiceAttendees = (voiceAttendees: Attendee[]) => {
    const newAttendees = voiceAttendees.map(attendee => ({
      ...attendee,
      id: nextId + attendee.id - 1,
    }));
    
    setAppState(prev => ({
      ...prev,
      attendees: [...prev.attendees, ...newAttendees],
    }));
    
    setNextId(nextId + voiceAttendees.length);
  };

  const resetAll = () => {
    setAppState(initialState);
    setNextId(1);
    resetMeeting();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <QuickStats 
        attendees={appState.attendees}
        meeting={meeting}
        currentCost={currentCost}
        currency={appState.currency}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="xl:col-span-2 space-y-8">
            <WorkingHoursCard
              workingHours={appState.workingHours}
              onUpdate={updateWorkingHours}
            />
            
            <CurrencySettings
              currency={appState.currency}
              onUpdate={updateCurrency}
            />
            
            <VoiceInput onAttendeesExtracted={handleVoiceAttendees} />
            
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-2xl">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Meeting Attendees</h2>
                    <p className="text-sm text-gray-500">Add team members and their compensation</p>
                  </div>
                </div>
                <button
                  onClick={addAttendee}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Attendee</span>
                </button>
              </div>
              
              {appState.attendees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Plus className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xl text-gray-500 mb-2">No attendees added yet</p>
                  <p className="text-sm text-gray-400">
                    Add attendees manually or use the AI voice assistant to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {appState.attendees.map(attendee => (
                    <AttendeeCard
                      key={attendee.id}
                      attendee={attendee}
                      workingHours={appState.workingHours}
                      currency={appState.currency}
                      onRemove={removeAttendee}
                      onUpdateSalary={updateAttendeeSalary}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Timer and Results */}
          <div className="space-y-8">
            <MeetingTimer
              meeting={meeting}
              attendees={appState.attendees}
              workingHours={appState.workingHours}
              currency={appState.currency}
              onStart={startMeeting}
              onEnd={endMeeting}
              onReset={resetAll}
            />
            
            <CostBreakdown
              attendees={appState.attendees}
              workingHours={appState.workingHours}
              meeting={meeting}
              currency={appState.currency}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;