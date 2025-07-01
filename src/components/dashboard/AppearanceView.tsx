'use client';

import { toast } from 'react-hot-toast';

export default function AppearanceView() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Appearance</h3>
        <p className="mt-1 text-sm text-gray-500">
          Customize the look and feel of your dashboard.
        </p>
      </div>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Theme</h4>
              <p className="text-sm text-gray-500">Choose between light and dark mode</p>
            </div>
            <select
              className="block w-32 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              onChange={() => toast.success('Theme switching coming soon!')}
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
              <p className="text-sm text-gray-500">Use more compact spacing in the interface</p>
            </div>
            <button
              onClick={() => toast.success('Compact mode coming soon!')}
              className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
