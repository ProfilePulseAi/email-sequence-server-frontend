'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TemplateForm from '@/components/forms/TemplateForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Template } from '@/types';
import apiService from '@/lib/api';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const templateId = params.id as string;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await apiService.getTemplate(Number(templateId));
        setTemplate(data);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const handleSuccess = () => {
    router.push('/dashboard/templates');
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h1>
        <p className="text-gray-600 mb-4">{error || 'The template you are looking for does not exist.'}</p>
        <button
          onClick={() => router.push('/dashboard/templates')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update your email template
        </p>
      </div>
      
      <TemplateForm template={template} onSuccess={handleSuccess} />
    </div>
  );
}
