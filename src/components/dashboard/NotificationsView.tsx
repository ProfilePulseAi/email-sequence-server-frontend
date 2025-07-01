'use client';

import { toast } from 'react-hot-toast';

export default function NotificationsView() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Preferences</h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose what notifications you want to receive and how.
        </p>
      </div>
      <div className="space-y-4">
        {[
          { title: 'Email Delivery Notifications', description: 'Get notified when emails are delivered' },
          { title: 'Reply Notifications', description: 'Get notified when clients reply to your emails' },
          { title: 'Campaign Updates', description: 'Get notified about outreach campaign status changes' },
          { title: 'Weekly Reports', description: 'Receive weekly performance reports' },
        ].map((notification, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-500">{notification.description}</p>
              </div>
              <button
                onClick={() => toast.success('Notification settings coming soon!')}
                className="bg-primary-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
