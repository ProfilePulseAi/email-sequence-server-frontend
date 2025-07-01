'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import OutreachForm from './OutreachForm';
import OutreachFlowBuilder from '@/components/outreach/OutreachFlowBuilder';
import { OutreachDto, Template } from '@/types';

interface OutreachModalProps {
  outreach?: OutreachDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OutreachModal({ outreach, isOpen, onClose, onSuccess }: OutreachModalProps) {
  const [showFlowBuilder, setShowFlowBuilder] = useState(false);
  const [showSimpleForm, setShowSimpleForm] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSaveOutreach = async (outreachData: OutreachDto) => {
    try {
      setLoading(true);
      
      if (outreach?.id) {
        await apiService.updateOutreach(outreach.id, outreachData);
        toast.success('Outreach campaign updated successfully');
      } else {
        await apiService.createOutreach(outreachData);
        toast.success('Outreach campaign created successfully');
      }
      
      onSuccess();
      onClose();
      setShowFlowBuilder(false);
      setShowSimpleForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save outreach campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setShowFlowBuilder(false);
    setShowSimpleForm(false);
  };

  const handleUseFlowBuilder = () => {
    setShowFlowBuilder(true);
    setShowSimpleForm(false);
  };

  const handleUseSimpleForm = () => {
    setShowFlowBuilder(false);
    setShowSimpleForm(true);
  };

  if (showFlowBuilder) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <OutreachFlowBuilder
          outreach={outreach}
          templates={templates}
          onSave={handleSaveOutreach}
          onCancel={() => setShowFlowBuilder(false)}
        />
      </div>
    );
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
