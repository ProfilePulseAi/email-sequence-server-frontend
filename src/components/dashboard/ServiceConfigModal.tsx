'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ServiceConfig, CreateServiceConfigDto, UpdateServiceConfigDto } from '@/types';
import Modal from '@/components/ui/Modal';

interface ServiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceConfigDto) => void | Promise<void>;
  onUpdate?: (data: UpdateServiceConfigDto) => void | Promise<void>;
  editingConfig?: ServiceConfig | null;
}

const PLATFORMS = [
  { value: 'jira', label: 'Jira', icon: '🔵' },
  { value: 'linear', label: 'Linear', icon: '🟣' },
  { value: 'trello', label: 'Trello', icon: '🔷' },
  { value: 'github', label: 'GitHub', icon: '⚫' },
  { value: 'clickup', label: 'ClickUp', icon: '🟡' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'discord', label: 'Discord', icon: '🎮' },
] as const;

const CREDENTIAL_FIELDS = {
  jira: [
    { key: 'host', label: 'Jira Host URL', type: 'url', placeholder: 'https://your-domain.atlassian.net' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'your-email@company.com' },
    { key: 'token', label: 'API Token', type: 'password', placeholder: 'Your Jira API token' },
  ],
  linear: [
    { key: 'token', label: 'API Token', type: 'password', placeholder: 'Your Linear API token' },
  ],
  trello: [
    { key: 'key', label: 'API Key', type: 'text', placeholder: 'Your Trello API key' },
    { key: 'token', label: 'API Token', type: 'password', placeholder: 'Your Trello API token' },
  ],
  github: [
    { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'Your GitHub PAT' },
    { key: 'owner', label: 'Repository Owner (Optional)', type: 'text', placeholder: 'username or organization' },
    { key: 'repo', label: 'Repository Name (Optional)', type: 'text', placeholder: 'repository-name' },
  ],
  clickup: [
    { key: 'token', label: 'API Token', type: 'password', placeholder: 'Your ClickUp API token' },
    { key: 'teamId', label: 'Team ID (Optional)', type: 'text', placeholder: 'Your ClickUp team ID' },
  ],
  slack: [
    { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
  ],
  discord: [
    { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://discord.com/api/webhooks/...' },
  ],
};

export default function ServiceConfigModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editingConfig,
}: ServiceConfigModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    platform: 'jira' | 'linear' | 'trello' | 'github' | 'clickup' | 'slack' | 'discord';
    credentials: Record<string, string>;
    description: string;
    isActive: boolean;
  }>({
    name: '',
    platform: 'jira',
    credentials: {},
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        name: editingConfig.name,
        platform: editingConfig.platform,
        credentials: {}, // Don't populate credentials for security
        description: editingConfig.description || '',
        isActive: editingConfig.isActive,
      });
    } else {
      setFormData({
        name: '',
        platform: 'jira',
        credentials: {},
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [editingConfig, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const credentialFields = CREDENTIAL_FIELDS[formData.platform];
    credentialFields.forEach(field => {
      if (field.key === 'token' || field.key === 'host' || field.key === 'email' || field.key === 'key' || field.key === 'webhookUrl') {
        if (!formData.credentials[field.key]?.trim()) {
          newErrors[`credentials.${field.key}`] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingConfig) {
        const updateData: UpdateServiceConfigDto = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          ...(Object.keys(formData.credentials).length > 0 && { 
            credentials: formData.credentials 
          }),
        };
        await onUpdate?.(updateData);
      } else {
        const createData: CreateServiceConfigDto = {
          name: formData.name,
          platform: formData.platform,
          credentials: formData.credentials,
          description: formData.description,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value,
      },
    }));
    
    // Clear error for this field
    if (errors[`credentials.${key}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`credentials.${key}`];
        return newErrors;
      });
    }
  };

  const renderCredentialFields = () => {
    const fields = CREDENTIAL_FIELDS[formData.platform];
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Credentials</h4>
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {(field.key === 'token' || field.key === 'host' || field.key === 'email' || field.key === 'key' || field.key === 'webhookUrl') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type={field.type}
              value={formData.credentials[field.key] || ''}
              onChange={(e) => handleCredentialChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors[`credentials.${field.key}`] ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors[`credentials.${field.key}`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`credentials.${field.key}`]}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editingConfig ? 'Edit Service Configuration' : 'Add Service Configuration'}
      size="lg"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a name for this configuration"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Platform (only show for new configs) */}
              {!editingConfig && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      platform: e.target.value as any,
                      credentials: {} // Reset credentials when platform changes
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {PLATFORMS.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Credentials */}
              {renderCredentialFields()}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this configuration"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Active Status (only for editing) */}
              {editingConfig && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active configuration
                  </label>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-600">🔒</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Security Notice
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      Your credentials will be encrypted and stored securely. We recommend using API tokens instead of passwords when available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingConfig ? 'Update Configuration' : 'Create Configuration'}
                </button>
              </div>
            </form>
      </div>
    </Modal>
  );
}
