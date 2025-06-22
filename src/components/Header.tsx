import React from 'react';
import { TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 p-3 rounded-2xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Meeting Cost
              </h1>
              <p className="text-sm text-gray-500 font-medium">Executive Edition</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">Live Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}