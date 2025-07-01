'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { createOutreach, updateOutreach } from '@/lib/api';
import { OutreachDto, State } from '@/types';

interface OutreachFormProps {
  outreach?: OutreachDto;
  onSuccess?: () => void;
}

export default function OutreachForm({ outreach, onSuccess }: OutreachFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
  });
  const [stateList, setStateList] = useState<State[]>([
    {
      name: 'initial',
      scheduleAfterDays: 0,
      description: 'Initial email',
      templateId: '1'
    }
  ]);

  useEffect(() => {
    if (outreach) {
      setFormData({
        name: outreach.name,
        subject: outreach.subject,
      });
      setStateList(outreach.stateList || stateList);
    }
  }, [outreach]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const outreachDataToSave = {
        name: formData.name,
        subject: formData.subject,
        stateList: stateList,
      };

      if (outreach?.id) {
        await updateOutreach(outreach.id, outreachDataToSave);
      } else {
        await createOutreach(outreachDataToSave);
      }

      onSuccess?.();
      router.push('/dashboard/outreach');
    } catch (error) {
      console.error('Error saving outreach:', error);
      alert('Error saving outreach campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addState = () => {
    setStateList([...stateList, {
      name: `stage_${stateList.length + 1}`,
      scheduleAfterDays: 3,
      description: '',
      templateId: '1'
    }]);
  };

  const removeState = (index: number) => {
    if (stateList.length > 1) {
      setStateList(stateList.filter((_, i) => i !== index));
    }
  };

  const updateState = (index: number, field: string, value: any) => {
    const newStateList = [...stateList];
    newStateList[index] = { ...newStateList[index], [field]: value };
    setStateList(newStateList);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email subject"
              required
            />
          </div>
        </div>

        {/* Email Sequence */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Email Sequence *
            </label>
            <button
              type="button"
              onClick={addState}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Stage
            </button>
          </div>
          
          {stateList.map((state, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Stage {index + 1}</h4>
                {stateList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeState(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={state.name}
                    onChange={(e) => updateState(index, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Stage name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Days After Previous
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={state.scheduleAfterDays}
                    onChange={(e) => updateState(index, 'scheduleAfterDays', parseInt(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Template ID
                  </label>
                  <input
                    type="text"
                    value={state.templateId}
                    onChange={(e) => updateState(index, 'templateId', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Template ID"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={state.description}
                  onChange={(e) => updateState(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Stage description"
                />
              </div>
            </div>
          ))}
          
          <p className="text-sm text-gray-500">
            Create a sequence of emails that will be sent to your contacts. Each stage can have a different template and timing.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/dashboard/outreach')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || stateList.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {outreach ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
