'use client';

import { toast } from 'react-hot-toast';
import { KeyIcon } from '@heroicons/react/24/outline';

export default function SecurityView() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account security and authentication preferences.
        </p>
      </div>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-500">Change your account password</p>
            </div>
            <button
              onClick={() => toast.success('Password change feature coming soon!')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Change Password
            </button>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => toast.success('2FA feature coming soon!')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
