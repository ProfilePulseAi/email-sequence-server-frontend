'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Outreach {
  id?: number;
  name: string;
  description?: string;
  targetAudience?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  emailTemplate?: string;
  subjectLine?: string;
  tags?: string;
}

interface OutreachFormProps {
  outreach?: Outreach;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OutreachForm({ outreach, isOpen, onClose, onSuccess }: OutreachFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!outreach?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Outreach>({
    defaultValues: outreach || {
      name: '',
      description: '',
      targetAudience: '',
      status: 'draft',
      startDate: '',
      endDate: '',
      emailTemplate: '',
      subjectLine: '',
      tags: '',
    },
  });

  const onSubmit = async (data: Outreach) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && outreach?.id) {
        await apiService.updateOutreach(outreach.id, data);
        toast.success('Outreach campaign updated successfully');
      } else {
        await apiService.createOutreach(data);
        toast.success('Outreach campaign created successfully');
      }
      
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} outreach campaign`);
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
      title={isEditing ? 'Edit Outreach Campaign' : 'Create New Outreach Campaign'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Campaign Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Campaign name is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Software Engineer Outreach Q1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Describe the purpose and goals of this outreach campaign..."
          />
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <input
            type="text"
            id="targetAudience"
            {...register('targetAudience')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Senior Software Engineers at startups"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              {...register('tags')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., software, tech, hiring"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              {...register('startDate')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              {...register('endDate')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Email Content */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Email Content</h4>
          
          <div>
            <label htmlFor="subjectLine" className="block text-sm font-medium text-gray-700">
              Subject Line
            </label>
            <input
              type="text"
              id="subjectLine"
              {...register('subjectLine')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Exciting opportunity for talented developers"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700">
              Email Template
            </label>
            <textarea
              id="emailTemplate"
              rows={6}
              {...register('emailTemplate')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Write your email template here. You can use variables like {{firstName}}, {{company}}, etc."
            />
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
