'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Template } from '@/types';

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  // Mock data - replace with actual API call
  const [template] = useState<Template>({
    id: parseInt(templateId),
    userId: 1,
    name: 'Welcome Email',
    description: 'Welcome new subscribers to your platform',
    subject: 'Welcome to our platform!',
    content: '<h1>Welcome!</h1><p>Thank you for joining us...</p>',
    format: 'html',
    category: 'onboarding',
    isActive: true,
    tags: ['welcome', 'onboarding'],
    usageCount: 15,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  });

  const renderContent = (content: string, format: 'html' | 'markdown') => {
    if (format === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    } else {
      return <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/templates')}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/templates/${template.id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PencilIcon className="h-5 w-5" />
            Edit Template
          </button>
        </div>

        {/* Template Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Format</label>
              <span className="text-sm text-gray-900 capitalize">{template.format}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <span className="text-sm text-gray-900 capitalize">{template.category}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`text-sm ${template.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usage Count</label>
              <span className="text-sm text-gray-900">{template.usageCount || 0}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-900">{template.subject}</span>
            </div>
          </div>

          {template.tags && template.tags.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4 min-h-64 bg-gray-50">
            {renderContent(template.content, template.format)}
          </div>
        </div>
      </div>
    </div>
  );
}
