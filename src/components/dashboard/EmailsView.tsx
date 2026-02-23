'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDateTime, formatDateTimeTs, getEmailStateColor, getPriorityColor } from '@/lib/utils';
import { 
  EnvelopeIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface Email {
  id: number;
  userId: number;
  taskName: string;
  state: 'SCHEDULE' | 'DELIVERED' | 'FAILED';
  client: {
    firstName: string;
    lastName: string;
    emailId: string;
  };
  outreach: {
    name: string;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  deliveryTime?: string;
  opened: boolean;
  replied: boolean;
  subject?: string;
  createdAt: string;
  scheduled10minInterval: string;
}

export default function EmailsView() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'delivered' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmails();
      setEmails(data);
    } catch (error) {
      toast.error('Failed to fetch emails');
      console.error('Emails fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendScheduledEmails = async () => {
    try {
      await apiService.sendScheduledEmails();
      toast.success('Scheduled emails sent successfully!');
      fetchEmails(); // Refresh the list
    } catch (error) {
      toast.error('Failed to send scheduled emails');
    }
  };

  const handleCheckEmails = async () => {
    try {
      await apiService.checkEmails();
      toast.success('Email delivery status checked!');
      fetchEmails(); // Refresh the list
    } catch (error) {
      toast.error('Failed to check email status');
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesFilter = filter === 'all' || 
      (filter === 'scheduled' && email.state === 'SCHEDULE') ||
      (filter === 'delivered' && email.state === 'DELIVERED') ||
      (filter === 'failed' && email.state === 'FAILED');
    
    const matchesSearch = searchTerm === '' ||
      email.client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.client.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.outreach.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (state: string, opened: boolean, replied: boolean) => {
    if (replied) return <CheckIcon className="h-5 w-5 text-green-500" />;
    if (opened) return <EyeIcon className="h-5 w-5 text-blue-500" />;
    if (state === 'DELIVERED') return <CheckIcon className="h-5 w-5 text-green-500" />;
    if (state === 'FAILED') return <XMarkIcon className="h-5 w-5 text-red-500" />;
    return <EnvelopeIcon className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Email Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your email sequences
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={handleCheckEmails}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Check Status
          </button>
          <button
            onClick={handleSendScheduledEmails}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Send Scheduled
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', count: emails.length },
                { key: 'scheduled', label: 'Scheduled', count: emails.filter(e => e.state === 'SCHEDULE').length },
                { key: 'delivered', label: 'Delivered', count: emails.filter(e => e.state === 'DELIVERED').length },
                { key: 'failed', label: 'Failed', count: emails.filter(e => e.state === 'FAILED').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === tab.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="divide-y divide-gray-200">
          {filteredEmails.length === 0 ? (
            <div className="p-6 text-center">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'Get started by creating your first outreach campaign.' : `No ${filter} emails found.`}
              </p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div key={email.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(email.state, email.opened, email.replied)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {email.client.firstName} {email.client.lastName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                          {email.priority}
                        </span>
                      </div>
                      {/* <p className="text-sm text-gray-500 truncate">
                        {email.client.emailId}
                      </p> */}
                      <p className="text-sm text-gray-500 truncate">
                        {email.id} • {email.client.emailId}
                      </p>
                      {email.subject && (
                        <p className="text-sm text-gray-700 truncate mt-1">
                          Subject: {email.subject}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmailStateColor(email.state)}`}>
                      {email.state}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {email.opened && (
                        <span className="flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Opened
                        </span>
                      )}
                      {email.replied && (
                        <span className="flex items-center">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {email.deliveryTime ? formatDateTime(email.deliveryTime) : formatDateTimeTs(email.scheduled10minInterval)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
