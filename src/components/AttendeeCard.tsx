import React from 'react';
import { Trash2, User } from 'lucide-react';
import { Attendee, WorkingHours, CurrencySettings } from '../types';
import { calculateHourlyRate, calculateMinuteRate, formatCurrency } from '../utils/calculations';

interface AttendeeCardProps {
  attendee: Attendee;
  workingHours: WorkingHours;
  currency: CurrencySettings;
  onRemove: (id: number) => void;
  onUpdateSalary: (id: number, salary: number) => void;
}

export function AttendeeCard({ attendee, workingHours, currency, onRemove, onUpdateSalary }: AttendeeCardProps) {
  const hourlyRate = calculateHourlyRate(attendee.salary, workingHours);
  const minuteRate = calculateMinuteRate(attendee.salary, workingHours);

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this attendee?')) {
      onRemove(attendee.id);
    }
  };

  return (
    <div className="group bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Attendee #{attendee.id}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Team Member</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="opacity-70 sm:opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Annual Salary
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={attendee.salary || ''}
              onChange={(e) => onUpdateSalary(attendee.id, parseInt(e.target.value) || 0)}
              placeholder="100,000"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base sm:text-lg font-medium"
            />
          </div>
        </div>
        
        {attendee.salary > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Hourly Rate:</span>
              <span className="font-bold text-blue-600 text-sm sm:text-base">{formatCurrency(hourlyRate, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Per Minute:</span>
              <span className="font-bold text-purple-600 text-sm sm:text-base">{formatCurrency(minuteRate, currency)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}