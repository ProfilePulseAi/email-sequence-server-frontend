'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import OutreachForm from './OutreachForm';
import { OutreachDto, Template } from '@/types';

interface OutreachModalProps {
  outreach?: OutreachDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OutreachModal({ outreach, isOpen, onClose, onSuccess }: OutreachModalProps) {
  const router = useRouter();
  const [showFlowBuilder, setShowFlowBuilder] = useState(false);
  const [showSimpleForm, setShowSimpleForm] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const data = await apiService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleClose = () => {
    onClose();
    setShowFlowBuilder(false);
    setShowSimpleForm(false);
  };

  const handleUseFlowBuilder = () => {
    // Save current data to localStorage if editing
    if (outreach) {
      const key = `outreach_draft_${outreach.id}`;
      localStorage.setItem(key, JSON.stringify(outreach));
      router.push(`/dashboard/outreach/flow?id=${outreach.id}`);
    } else {
      // For new outreach, save any existing data
      const draftData = {
        name: '',
        subject: '',
        outreachType: 'sequence',
        stateList: [
          {
            name: 'initial',
            scheduleAfterDays: 0,
            description: 'Initial email',
            templateId: templates[0]?.id?.toString() || '',
          },
        ],
      };
      localStorage.setItem('outreach_draft_new', JSON.stringify(draftData));
      router.push('/dashboard/outreach/flow');
    }
    onClose();
  };

  const handleUseSimpleForm = () => {
    setShowFlowBuilder(false);
    setShowSimpleForm(true);
  };

  if (showFlowBuilder) {
    // This should not happen anymore since we navigate to a separate page
    return null;
  }

  // Simple form mode
  if (showSimpleForm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={outreach ? 'Edit Outreach Campaign' : 'Create New Outreach Campaign'}
        size="xl"
      >
        <OutreachForm
          outreach={outreach}
          templates={templates}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
        />
      </Modal>
    );
  }

  // Selection mode - show options
  if (!showFlowBuilder && !showSimpleForm && isOpen) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={outreach ? 'Edit Outreach Campaign' : 'Create New Outreach Campaign'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              How would you like to create your outreach campaign?
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={handleUseSimpleForm}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
              >
                <div>
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-900">Simple Form</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Create campaigns using a simple sequential form
                  </div>
                </div>
              </button>

              <button
                onClick={handleUseFlowBuilder}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
              >
                <div>
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-medium text-gray-900">Visual Flow Builder</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Create campaigns using drag-and-drop flowchart
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}
