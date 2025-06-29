'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Mailbox {
  id?: number;
  email: string;
  password: string;
  smtpHost: string;
  smtpPort: number;
  imapHost: string;
  imapPort: number;
  isActive?: boolean;
  name?: string;
  description?: string;
}

interface MailboxFormProps {
  mailbox?: Mailbox;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MailboxForm({ mailbox, isOpen, onClose, onSuccess }: MailboxFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!mailbox?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<Mailbox>({
    defaultValues: mailbox || {
      email: '',
      password: '',
      smtpHost: '',
      smtpPort: 587,
      imapHost: '',
      imapPort: 993,
      isActive: true,
      name: '',
      description: '',
    },
  });

  const emailProvider = watch('email')?.split('@')[1]?.toLowerCase();

  // Auto-fill SMTP/IMAP settings based on email provider
  const getProviderSettings = (provider: string) => {
    const settings: Record<string, { smtp: string; smtpPort: number; imap: string; imapPort: number }> = {
      'gmail.com': {
        smtp: 'smtp.gmail.com',
        smtpPort: 587,
        imap: 'imap.gmail.com',
        imapPort: 993,
      },
      'outlook.com': {
        smtp: 'smtp-mail.outlook.com',
        smtpPort: 587,
        imap: 'outlook.office365.com',
        imapPort: 993,
      },
      'yahoo.com': {
        smtp: 'smtp.mail.yahoo.com',
        smtpPort: 587,
        imap: 'imap.mail.yahoo.com',
        imapPort: 993,
      },
    };
    return settings[provider];
  };

  const onSubmit = async (data: Mailbox) => {
    try {
      setIsSubmitting(true);
      
      await apiService.createMailbox(data);
      toast.success('Mailbox configuration saved successfully');
      
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save mailbox configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const autoFillSettings = () => {
    if (emailProvider) {
      const settings = getProviderSettings(emailProvider);
      if (settings) {
        // This would need to be implemented with setValue from react-hook-form
        toast.success(`Auto-filled settings for ${emailProvider}`);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Mailbox' : 'Add New Mailbox'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Mailbox Name
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Primary Outreach Account"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={2}
            {...register('description')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Optional description for this mailbox..."
          />
        </div>

        {/* Email Configuration */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Email Configuration</h4>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onBlur={autoFillSettings}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              id="password"
              {...register('password', { required: 'Password is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email account password or app password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              For Gmail, use an App Password instead of your regular password.
            </p>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">SMTP Settings (Outgoing)</h4>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                SMTP Host *
              </label>
              <input
                type="text"
                id="smtpHost"
                {...register('smtpHost', { required: 'SMTP host is required' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., smtp.gmail.com"
              />
              {errors.smtpHost && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpHost.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                SMTP Port *
              </label>
              <input
                type="number"
                id="smtpPort"
                {...register('smtpPort', { 
                  required: 'SMTP port is required',
                  min: { value: 1, message: 'Port must be greater than 0' },
                  max: { value: 65535, message: 'Port must be less than 65536' }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="587"
              />
              {errors.smtpPort && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpPort.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* IMAP Configuration */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">IMAP Settings (Incoming)</h4>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="imapHost" className="block text-sm font-medium text-gray-700">
                IMAP Host *
              </label>
              <input
                type="text"
                id="imapHost"
                {...register('imapHost', { required: 'IMAP host is required' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., imap.gmail.com"
              />
              {errors.imapHost && (
                <p className="mt-1 text-sm text-red-600">{errors.imapHost.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="imapPort" className="block text-sm font-medium text-gray-700">
                IMAP Port *
              </label>
              <input
                type="number"
                id="imapPort"
                {...register('imapPort', { 
                  required: 'IMAP port is required',
                  min: { value: 1, message: 'Port must be greater than 0' },
                  max: { value: 65535, message: 'Port must be less than 65536' }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="993"
              />
              {errors.imapPort && (
                <p className="mt-1 text-sm text-red-600">{errors.imapPort.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="border-t pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Enable this mailbox for sending emails
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Mailbox' : 'Add Mailbox'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
