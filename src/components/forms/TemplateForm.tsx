'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Template, TemplateContent } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SAMPLE_TEMPLATES, TEMPLATE_VARIABLES } from '@/lib/templates';
import { useTemplates } from '@/hooks/useTemplates';

interface TemplateFormProps {
  template?: Template;
  onSuccess?: () => void;
}

export default function TemplateForm({ template, onSuccess }: TemplateFormProps) {
  const router = useRouter();
  const { createTemplate, updateTemplate, getTemplateContent } = useTemplates();
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    htmlContent: '',
    isActive: true,
  });
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (template) {
      // Load basic template info
      setFormData({
        name: template.name,
        description: template.description || '',
        htmlContent: '',
        isActive: template.isActive,
      });

      // Load template content separately
      loadTemplateContent();
    }
  }, [template]);

  const loadTemplateContent = async () => {
    if (!template) return;
    
    try {
      setLoadingContent(true);
      const contentData = await getTemplateContent(template.id);
      setFormData(prev => ({
        ...prev,
        htmlContent: contentData.content,
      }));
    } catch (error) {
      console.error('Error loading template content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        htmlContent: formData.htmlContent,
      };

      if (template) {
        // Update existing template
        await updateTemplate(template.id, {
          name: templateData.name,
          description: templateData.description,
          isActive: formData.isActive,
        });
      } else {
        // Create new template
        await createTemplate(templateData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, htmlContent: value }));
  };

  const loadSampleTemplate = (templateKey: string) => {
    const samples = SAMPLE_TEMPLATES.html;
    const template = (samples as any)[templateKey];
    
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        htmlContent: template.content,
      }));
      setShowSamples(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          htmlContent: content,
          name: prev.name || file.name.replace('.html', ''),
        }));
        setShowUpload(false);
      };
      reader.readAsText(file);
    } else {
      alert('Please select an HTML file (.html)');
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[placeholder*="HTML"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      setFormData(prev => ({ ...prev, htmlContent: newText }));
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
    setShowVariables(false);
  };

  if (loadingContent) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Loading template content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter template name"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Template is active
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the template"
          />
        </div>

        {/* Content Editor */}
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              HTML Content *
            </label>
            <div className="flex gap-2">
              {!template && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSamples(!showSamples)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Use Sample Template
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setShowUpload(!showUpload)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Upload HTML File
                  </button>
                  <span className="text-gray-300">|</span>
                </>
              )}
              <button
                type="button"
                onClick={() => setShowVariables(!showVariables)}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Insert Variable
              </button>
            </div>
          </div>

          {/* Sample Templates Dropdown */}
          {showSamples && !template && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Choose a sample template:</h4>
              <div className="w-full">
                <h5 className="font-medium text-gray-700 mb-2">HTML Templates</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(SAMPLE_TEMPLATES.html).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => loadSampleTemplate(key)}
                      className="w-full text-left p-3 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-gray-500 text-xs mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload HTML File */}
          {showUpload && !template && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3">Upload HTML File:</h4>
              <input
                type="file"
                accept=".html"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="text-sm text-purple-600 mt-2">Select an HTML file to load as template content</p>
            </div>
          )}

          {/* Variables Dropdown */}
          {showVariables && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">Click to insert variable:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {TEMPLATE_VARIABLES.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 font-mono"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 w-full">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content
              </label>
              <textarea
                value={formData.htmlContent}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                placeholder="Enter your HTML content here..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can use variables like {'{{firstName}}'}, {'{{lastName}}'}, {'{{company}}'}, etc.
              </p>
            </div>
            {formData.htmlContent && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="w-full border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: formData.htmlContent }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/dashboard/templates')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
}
