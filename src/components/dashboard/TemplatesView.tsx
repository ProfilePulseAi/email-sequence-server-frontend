'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { Template, MailBox } from '@/types';
import { useTemplates } from '@/hooks/useTemplates';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function TemplatesView() {
  const router = useRouter();
  const { templates, loading, deleteTemplate, getTemplateContent } = useTemplates();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [sendTestModalOpen, setSendTestModalOpen] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Send test email state
  const [testEmail, setTestEmail] = useState('');
  const [testMailboxId, setTestMailboxId] = useState<number | ''>('');
  const [mailboxes, setMailboxes] = useState<MailBox[]>([]);
  const [loadingMailboxes, setLoadingMailboxes] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleDeleteTemplate = async (template: Template) => {
    try {
      await deleteTemplate(template.id);
      setDeleteModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handlePreviewTemplate = async (template: Template) => {
    setSelectedTemplate(template);
    setPreviewModalOpen(true);
    setLoadingPreview(true);
    setPreviewContent('');

    try {
      const contentData = await getTemplateContent(template.id);
      setPreviewContent(contentData.content || contentData.htmlContent || '');
    } catch (error) {
      console.error('Error loading template content:', error);
      setPreviewContent('Error loading content');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleOpenSendTest = async (template: Template) => {
    setSelectedTemplate(template);
    setTestEmail('');
    setTestMailboxId('');
    setSendTestModalOpen(true);
    setLoadingMailboxes(true);
    try {
      const data = await apiService.getMailboxes();
      setMailboxes(data);
    } catch (error) {
      console.error('Error fetching mailboxes:', error);
      toast.error('Failed to load mailboxes');
    } finally {
      setLoadingMailboxes(false);
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate) return;
    if (!testEmail) {
      toast.error('Please enter a recipient email address');
      return;
    }
    if (!testMailboxId) {
      toast.error('Please select a mailbox');
      return;
    }

    setSendingTest(true);
    try {
      await apiService.sendTemplateTestEmail({
        email: testEmail,
        mailboxId: testMailboxId as number,
        templateId: selectedTemplate.id,
      });
      toast.success(`Test email sent to ${testEmail}`);
      setSendTestModalOpen(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to send test email';
      toast.error(message);
    } finally {
      setSendingTest(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your HTML email templates
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/templates/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Template
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Get started by creating your first template'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => router.push('/dashboard/templates/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <CodeBracketIcon className="h-4 w-4 text-orange-500" title="HTML Template" />
                    {!template.isActive && (
                      <span className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  )}
                  <p className="text-xs text-gray-500">File: {template.filename}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{formatFileSize(template.fileSize)}</span>
                <span>{formatDate(template.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center gap-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleOpenSendTest(template)}
                  className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 flex items-center gap-1"
                  title="Send test email"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  Test
                </button>
                <button
                  onClick={() => router.push(`/dashboard/templates/${template.id}/edit`)}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setDeleteModalOpen(true);
                  }}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 flex items-center gap-1"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTemplate(null);
        }}
        title="Delete Template"
      >
        {selectedTemplate && (
          <div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the template "{selectedTemplate.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(selectedTemplate)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedTemplate(null);
          setPreviewContent('');
        }}
        title="Template Preview"
        size="lg"
      >
        {selectedTemplate && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{selectedTemplate.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">File Size:</span>
                  <span className="ml-2 text-gray-900">{formatFileSize(selectedTemplate.fileSize)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">{formatDate(selectedTemplate.createdAt)}</span>
                </div>
                {selectedTemplate.description && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Description:</span>
                    <span className="ml-2 text-gray-900">{selectedTemplate.description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h4 className="font-medium text-gray-700 mb-2">HTML Content:</h4>
              {loadingPreview ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-600">Loading content...</span>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Send Test Email Modal */}
      <Modal
        isOpen={sendTestModalOpen}
        onClose={() => {
          setSendTestModalOpen(false);
          setSelectedTemplate(null);
          setTestEmail('');
          setTestMailboxId('');
        }}
        title="Send Test Email"
        size="sm"
      >
        {selectedTemplate && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Send a preview of <span className="font-medium text-gray-900">{selectedTemplate.name}</span> to
              any inbox. Template variables will use placeholder values.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send from (mailbox)
                </label>
                {loadingMailboxes ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                    <LoadingSpinner />
                    <span>Loading mailboxes…</span>
                  </div>
                ) : mailboxes.length === 0 ? (
                  <p className="text-sm text-red-600">
                    No mailboxes configured.{' '}
                    <button
                      onClick={() => router.push('/dashboard/mailbox')}
                      className="underline"
                    >
                      Add one here.
                    </button>
                  </p>
                ) : (
                  <select
                    value={testMailboxId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTestMailboxId(value ? Number(value) : '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="">Select a mailbox…</option>
                    {mailboxes.map((mb) => (
                      <option key={mb.id} value={mb.id}>
                        {mb.name} ({mb.emailId})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setSendTestModalOpen(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={sendingTest || loadingMailboxes || mailboxes.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {sendingTest ? (
                  <>
                    <LoadingSpinner />
                    Sending…
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
