import React from 'react';
import { Users, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { Attendee, MeetingState, CurrencySettings } from '../types';
import { formatTime, formatCurrency } from '../utils/calculations';

interface QuickStatsProps {
  attendees: Attendee[];
  meeting: MeetingState;
  currentCost: number;
  currency: CurrencySettings;
}

export function QuickStats({ attendees, meeting, currentCost, currency }: QuickStatsProps) {
  const costPerMinute = meeting.duration > 0 ? currentCost / (meeting.duration / (1000 * 60)) : 0;

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{attendees.length}</div>
            <div className="text-sm text-gray-500">Attendees</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{formatTime(meeting.duration)}</div>
            <div className="text-sm text-gray-500">Duration</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(currentCost, currency)}
            </div>
            <div className="text-sm text-gray-500">Current Cost</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(costPerMinute, currency)}
            </div>
            <div className="text-sm text-gray-500">Cost/Min</div>
          </div>
        </div>
      </div>
    </div>
  );
}