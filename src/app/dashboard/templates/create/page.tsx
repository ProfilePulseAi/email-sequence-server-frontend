'use client';

import { useState } from 'react';
import TemplateForm from '@/components/forms/TemplateForm';
import { useRouter } from 'next/navigation';

export default function CreateTemplatePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/templates');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Template</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create a new HTML email template
        </p>
      </div>
      
      <TemplateForm onSuccess={handleSuccess} />
    </div>
  );
}
