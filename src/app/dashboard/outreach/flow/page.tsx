'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OutreachFlowBuilder from '@/components/outreach/OutreachFlowBuilder';
import { OutreachDto, Template } from '@/types';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function OutreachFlowPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [outreach, setOutreach] = useState<OutreachDto | undefined>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  const outreachId = searchParams.get('id');
  const isEdit = !!outreachId;

  useEffect(() => {
    loadData();
  }, [outreachId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load templates
      try {
        const templatesData = await apiService.getTemplates();
        console.log('Loaded templates:', templatesData);
        setTemplates(templatesData || []);
      } catch (templateError) {
        console.error('Error loading templates:', templateError);
        toast.error('Failed to load templates');
        setTemplates([]);
      }

      // Load existing outreach if editing
      if (isEdit && outreachId) {
        // Try to get from localStorage first
        const savedData = localStorage.getItem(`outreach_draft_${outreachId}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setOutreach(parsedData);
        } else {
          // Fetch from API if not in localStorage
          try {
            const outreachData = await apiService.getOutreaches();
            const existingOutreach = outreachData.find((o: any) => o.id === parseInt(outreachId));
            if (existingOutreach) {
              setOutreach(existingOutreach);
            }
          } catch (outreachError) {
            console.error('Error loading outreach:', outreachError);
            toast.error('Failed to load outreach data');
          }
        }
      } else {
        // For new outreach, check if there's a draft in localStorage
        const savedData = localStorage.getItem('outreach_draft_new');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setOutreach(parsedData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (outreachData: OutreachDto) => {
    try {
      let result;
      if (isEdit && outreachId) {
        result = await apiService.updateOutreach(parseInt(outreachId), outreachData);
        toast.success('Outreach campaign updated successfully');
        // Clear the draft from localStorage
        localStorage.removeItem(`outreach_draft_${outreachId}`);
      } else {
        result = await apiService.createOutreach(outreachData);
        toast.success('Outreach campaign created successfully');
        // Clear the draft from localStorage
        localStorage.removeItem('outreach_draft_new');
      }
      
      // Navigate back to outreach list
      router.push('/dashboard/outreach');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save outreach campaign');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/outreach');
  };

  const handleDataChange = (outreachData: OutreachDto) => {
    // Save to localStorage as draft
    const key = isEdit && outreachId ? `outreach_draft_${outreachId}` : 'outreach_draft_new';
    localStorage.setItem(key, JSON.stringify(outreachData));
    setOutreach(outreachData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading flow builder...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OutreachFlowBuilder
        outreach={outreach}
        templates={templates}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleDataChange}
      />
    </div>
  );
}

export default function OutreachFlowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading flow builder...</span>
      </div>
    }>
      <OutreachFlowPageContent />
    </Suspense>
  );
}
