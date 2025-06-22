import React from 'react';

export function BoltBadge() {
  return (
    <a
      href="https://bolt.new/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Built with Bolt.new"
    >
      <div className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-black"
          >
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-sm font-medium">Built with Bolt.new</span>
      </div>
    </a>
  );
}