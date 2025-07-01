'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import OutreachModal from '@/components/forms/OutreachModal';
import { OutreachDto } from '@/types';
import { 
  MegaphoneIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Outreach {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function OutreachView() {
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOutreach, setEditingOutreach] = useState<OutreachDto | null>(null);

  useEffect(() => {
    fetchOutreaches();
  }, []);

  const fetchOutreaches = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOutreaches();
      setOutreaches(data);
    } catch (error) {
      toast.error('Failed to fetch outreaches');
      console.error('Outreaches fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
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
            Outreach Campaigns
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your email outreach campaigns and sequences
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MegaphoneIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                  <dd className="text-lg font-medium text-gray-900">{outreaches.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {outreaches.filter(o => o.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {outreaches.filter(o => !o.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {outreaches.length === 0 ? (
          <div className="text-center py-12">
            <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No outreach campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first outreach campaign.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Campaign
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {outreaches.map((outreach) => (
              <li key={outreach.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`h-2 w-2 rounded-full ${outreach.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {outreach.name}
                        </p>
                        {outreach.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {outreach.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Created {formatDate(outreach.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        outreach.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {outreach.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => toast.success('Toggle status feature coming soon!')}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                          title={outreach.isActive ? 'Pause campaign' : 'Start campaign'}
                        >
                          {outreach.isActive ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const outreachDto: OutreachDto = {
                              id: outreach.id,
                              name: outreach.name,
                              stateList: [],
                              subject: '',
                              isActive: outreach.isActive
                            };
                            setEditingOutreach(outreachDto);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                          title="Edit campaign"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this campaign?')) {
                              toast.success('Delete feature coming soon!');
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete campaign"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Outreach Modal */}
      <OutreachModal
        outreach={editingOutreach || undefined}
        isOpen={showCreateModal || !!editingOutreach}
        onClose={() => {
          setShowCreateModal(false);
          setEditingOutreach(null);
        }}
        onSuccess={fetchOutreaches}
      />
    </div>
  );
}
