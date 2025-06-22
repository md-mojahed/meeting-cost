import React from 'react';
import { TrendingUp, Users, User } from 'lucide-react';
import { Attendee, WorkingHours, MeetingState, CurrencySettings } from '../types';
import { calculateMinuteRate, formatCurrency, formatTime } from '../utils/calculations';

interface CostBreakdownProps {
  attendees: Attendee[];
  workingHours: WorkingHours;
  meeting: MeetingState;
  currency: CurrencySettings;
}

export function CostBreakdown({ attendees, workingHours, meeting, currency }: CostBreakdownProps) {
  if (meeting.duration === 0 || attendees.length === 0) {
    return null;
  }

  const durationMinutes = meeting.duration / (1000 * 60);
  let totalCost = 0;

  const costBreakdown = attendees.map(attendee => {
    const minuteRate = calculateMinuteRate(attendee.salary, workingHours);
    const cost = minuteRate * durationMinutes;
    totalCost += cost;
    
    return {
      ...attendee,
      minuteRate,
      cost
    };
  });

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 p-4 sm:p-8">
      <div className="flex items-center space-x-3 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Cost Analysis</h2>
          <p className="text-xs sm:text-sm text-gray-500">Detailed breakdown by attendee</p>
        </div>
      </div>
      
      <div className="mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Meeting Duration</p>
              <p className="text-xl sm:text-2xl font-bold">{formatTime(meeting.duration)}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Investment</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalCost, currency)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Individual Breakdown</span>
        </h3>
        
        {costBreakdown.map(item => (
          <div key={item.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 sm:p-2 rounded-lg">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Attendee #{item.id}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {formatCurrency(item.minuteRate, currency)}/min × {Math.round(durationMinutes)} min
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(item.cost, currency)}</p>
                <p className="text-xs sm:text-sm text-gray-500">Cost</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}