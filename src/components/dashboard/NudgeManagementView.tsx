'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { ServiceConfig, CreateServiceConfigDto, UpdateServiceConfigDto } from '@/types';
import ServiceConfigModal from '@/components/dashboard/ServiceConfigModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PLATFORM_ICONS = {
  jira: '🔵',
  linear: '🟣',
  trello: '🔷',
  github: '⚫',
  clickup: '🟡',
  slack: '💬',
  discord: '🎮'
};

const PLATFORM_NAMES = {
  jira: 'Jira',
  linear: 'Linear',
  trello: 'Trello',
  github: 'GitHub',
  clickup: 'ClickUp',
  slack: 'Slack',
  discord: 'Discord'
};

export default function NudgeManagementView() {
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ServiceConfig | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchServiceConfigs();
  }, []);

  const fetchServiceConfigs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/service-configs', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setServiceConfigs(data);
      
      // Mock data for now
      setServiceConfigs([
        {
          id: 1,
          name: 'Main Jira Instance',
          platform: 'jira',
          isActive: true,
          userId: 1,
          description: 'Primary Jira for project management',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'GitHub Integration',
          platform: 'github',
          isActive: false,
          userId: 1,
          description: 'Repository notifications',
          createdAt: '2024-01-20T14:30:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: 3,
          name: 'Team Slack Workspace',
          platform: 'slack',
          isActive: true,
          userId: 1,
          description: 'Notifications to team channels',
          createdAt: '2024-01-25T09:15:00Z',
          updatedAt: '2024-01-25T09:15:00Z'
        },
        {
          id: 4,
          name: 'Development Discord',
          platform: 'discord',
          isActive: true,
          userId: 1,
          description: 'Dev team coordination and alerts',
          createdAt: '2024-01-28T16:45:00Z',
          updatedAt: '2024-01-28T16:45:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching service configs:', error);
      toast.error('Failed to load service configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateServiceConfigDto) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/service-configs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(data),
      // });
      // const newConfig = await response.json();
      
      // Mock response
      const newConfig: ServiceConfig = {
        id: Date.now(),
        name: data.name,
        platform: data.platform,
        isActive: true,
        userId: 1,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setServiceConfigs(prev => [...prev, newConfig]);
      setModalOpen(false);
      toast.success('Service configuration created successfully');
    } catch (error) {
      console.error('Error creating service config:', error);
      toast.error('Failed to create service configuration');
    }
  };

  const handleUpdate = async (id: number, data: UpdateServiceConfigDto) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/service-configs/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(data),
      // });
      // const updatedConfig = await response.json();
      
      setServiceConfigs(prev => 
        prev.map(config => 
          config.id === id 
            ? { ...config, ...data, updatedAt: new Date().toISOString() }
            : config
        )
      );
      setModalOpen(false);
      setEditingConfig(null);
      toast.success('Service configuration updated successfully');
    } catch (error) {
      console.error('Error updating service config:', error);
      toast.error('Failed to update service configuration');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service configuration?')) {
      return;
    }

    try {
      setDeleting(id);
      // TODO: Replace with actual API call
      // await fetch(`/api/service-configs/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      
      setServiceConfigs(prev => prev.filter(config => config.id !== id));
      toast.success('Service configuration deleted successfully');
    } catch (error) {
      console.error('Error deleting service config:', error);
      toast.error('Failed to delete service configuration');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await handleUpdate(id, { isActive });
    } catch (error) {
      console.error('Error toggling service config status:', error);
      toast.error('Failed to update service configuration status');
    }
  };

  const openEditModal = (config: ServiceConfig) => {
    setEditingConfig(config);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingConfig(null);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Nudge Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage integrations with project management and communication platforms
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Integration
        </button>
      </div>

      {/* Service Configurations List */}
      {serviceConfigs.length === 0 ? (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first service integration.
          </p>
          <div className="mt-6">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Integration
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {serviceConfigs.map((config) => (
              <li key={config.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {PLATFORM_ICONS[config.platform]}
                      </span>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {config.name}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {PLATFORM_NAMES[config.platform]}
                        </span>
                        {config.isActive ? (
                          <span className="inline-flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="ml-1 text-xs text-green-700">Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <XCircleIcon className="h-4 w-4 text-gray-400" />
                            <span className="ml-1 text-xs text-gray-500">Inactive</span>
                          </span>
                        )}
                      </div>
                      {config.description && (
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {config.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Created {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(config.id, !config.isActive)}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                        config.isActive
                          ? 'text-red-700 bg-red-100 hover:bg-red-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                    >
                      {config.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditModal(config)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      disabled={deleting === config.id}
                      className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {deleting === config.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Service Configuration Modal */}
      {modalOpen && (
        <ServiceConfigModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingConfig(null);
          }}
          onSubmit={handleCreate}
          onUpdate={editingConfig ? 
            (data: UpdateServiceConfigDto) => handleUpdate(editingConfig.id, data) : 
            undefined
          }
          editingConfig={editingConfig}
        />
      )}
    </div>
  );
}
