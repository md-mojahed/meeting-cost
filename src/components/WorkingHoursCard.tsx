import React from 'react';
import { Settings } from 'lucide-react';
import { WorkingHours } from '../types';

interface WorkingHoursCardProps {
  workingHours: WorkingHours;
  onUpdate: (workingHours: WorkingHours) => void;
}

export function WorkingHoursCard({ workingHours, onUpdate }: WorkingHoursCardProps) {
  const handleChange = (field: keyof WorkingHours, value: number) => {
    onUpdate({ ...workingHours, [field]: value });
  };

  const totalHours = workingHours.hoursPerDay * workingHours.daysPerWeek * workingHours.weeksPerYear;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Settings className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Working Hours Configuration</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours per Day
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={workingHours.hoursPerDay}
            onChange={(e) => handleChange('hoursPerDay', parseInt(e.target.value) || 8)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days per Week
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={workingHours.daysPerWeek}
            onChange={(e) => handleChange('daysPerWeek', parseInt(e.target.value) || 5)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weeks per Year
          </label>
          <input
            type="number"
            min="1"
            max="52"
            value={workingHours.weeksPerYear}
            onChange={(e) => handleChange('weeksPerYear', parseInt(e.target.value) || 50)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Total working hours per year:</span> {totalHours.toLocaleString()} hours
        </p>
      </div>
    </div>
  );
}