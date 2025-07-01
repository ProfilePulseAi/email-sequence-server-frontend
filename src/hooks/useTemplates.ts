'use client';

import { useState, useEffect } from 'react';
import { Template, TemplateContent } from '@/types';
import apiService from '@/lib/api';

export interface UseTemplatesReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;
  createTemplate: (data: { name: string; description?: string; htmlContent: string }) => Promise<any>;
  updateTemplate: (id: number, data: { name?: string; description?: string; isActive?: boolean }) => Promise<Template>;
  deleteTemplate: (id: number) => Promise<void>;
  getTemplate: (id: number) => Promise<Template>;
  getTemplateContent: (id: number) => Promise<TemplateContent>;
  refreshTemplates: () => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates');
      
      // Mock data for development
      const mockTemplates: Template[] = [
        {
          id: 1,
          name: 'Welcome Email',
          description: 'Welcome new subscribers to your platform',
          filename: 'welcome-email.html',
          filePath: '/templates/welcome-email.html',
          mimeType: 'text/html',
          fileSize: 1024,
          isActive: true,
          userId: 1,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
        {
          id: 2,
          name: 'Follow-up Template',
          description: 'Follow up with potential clients',
          filename: 'follow-up.html',
          filePath: '/templates/follow-up.html',
          mimeType: 'text/html',
          fileSize: 2048,
          isActive: true,
          userId: 1,
          createdAt: '2024-01-20T00:00:00Z',
          updatedAt: '2024-01-25T00:00:00Z',
        },
      ];
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (data: { name: string; description?: string; htmlContent: string }) => {
    try {
      const result = await apiService.createTemplate(data);
      await fetchTemplates(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Error creating template:', err);
      throw err;
    }
  };

  const updateTemplate = async (id: number, data: { name?: string; description?: string; isActive?: boolean }): Promise<Template> => {
    try {
      const updatedTemplate = await apiService.updateTemplate(id, data);
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      console.error('Error updating template:', err);
      throw err;
    }
  };

  const deleteTemplate = async (id: number): Promise<void> => {
    try {
      await apiService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
      throw err;
    }
  };

  const getTemplate = async (id: number): Promise<Template> => {
    try {
      const template = await apiService.getTemplate(id);
      return template;
    } catch (err) {
      console.error('Error fetching template:', err);
      throw err;
    }
  };

  const getTemplateContent = async (id: number): Promise<TemplateContent> => {
    try {
      const content = await apiService.getTemplateContent(id);
      return content;
    } catch (err) {
      console.error('Error fetching template content:', err);
      throw err;
    }
  };

  const refreshTemplates = async () => {
    await fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    getTemplateContent,
    refreshTemplates,
  };
}
