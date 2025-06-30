'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Client {
  id?: number;
  firstName: string;
  lastName: string;
  emailId: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  industry?: string;
  notes?: string;
}

interface ClientFormProps {
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientForm({ client, isOpen, onClose, onSuccess }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!client?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Client>({
    defaultValues: client || {
      firstName: '',
      lastName: '',
      emailId: '',
      company: '',
      position: '',
      phone: '',
      website: '',
      industry: '',
      notes: '',
    },
  });

  // Reset form when client prop changes (for editing)
  useEffect(() => {
    if (client) {
      reset(client);
    } else {
      reset({
        firstName: '',
        lastName: '',
        emailId: '',
        company: '',
        position: '',
        phone: '',
        website: '',
        industry: '',
        notes: '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: Client) => {
    try {
      setIsSubmitting(true);
      
      // Filter out empty/null values
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key as keyof Client] = value;
        }
        return acc;
      }, {} as Partial<Client>);
      
      if (isEditing && client?.id) {
        await apiService.updateClient(client.id, filteredData);
        toast.success('Client updated successfully');
      } else {
        await apiService.createClient(filteredData);
        toast.success('Client created successfully');
      }
      
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} client`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Client' : 'Add New Client'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              {...register('lastName')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="emailId"
            {...register('emailId', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.emailId && (
            <p className="mt-1 text-sm text-red-600">{errors.emailId.message}</p>
          )}
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              id="company"
              {...register('company')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              id="position"
              {...register('position')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              {...register('industry')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            id="website"
            {...register('website', {
              pattern: {
                value: /^https?:\/\/.+/i,
                message: 'Please enter a valid URL (including http:// or https://)'
              }
            })}
            placeholder="https://example.com"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Additional notes about this client..."
          />
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Client' : 'Create Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
