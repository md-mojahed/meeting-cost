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
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cost Analysis</h2>
          <p className="text-sm text-gray-500">Detailed breakdown by attendee</p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Meeting Duration</p>
              <p className="text-2xl font-bold">{formatTime(meeting.duration)}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm font-medium mb-1">Total Investment</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCost, currency)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2 text-lg">
          <Users className="h-5 w-5" />
          <span>Individual Breakdown</span>
        </h3>
        
        {costBreakdown.map(item => (
          <div key={item.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Attendee #{item.id}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.minuteRate, currency)}/min × {Math.round(durationMinutes)} min
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(item.cost, currency)}</p>
                <p className="text-sm text-gray-500">Cost</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}