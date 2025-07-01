'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '@/lib/api';
import CSVUploadForm from '@/components/forms/CSVUploadForm';
import Modal from '@/components/ui/Modal';

interface UploadHistory {
  id: number;
  filename: string;
  uploadedAt: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'completed' | 'failed' | 'processing';
}

const CSVUploadView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUploadHistory();
  }, []);

  const loadUploadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await apiService.getCSVUploadHistory();
      setUploadHistory(history);
    } catch (error: any) {
      console.error('Failed to load upload history:', error);
      toast.error('Failed to load upload history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (result: any) => {
    toast.success(`Successfully uploaded ${result.processed} clients`);
    setIsModalOpen(false);
    loadUploadHistory(); // Refresh the history
  };

  const handleUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Client Upload</h1>
          <p className="text-gray-600">Upload CSV files to create multiple clients at once</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload CSV
        </button>
      </div>

      {/* Upload Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">CSV Upload Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Required Columns</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-200 px-1 rounded">name</code> - Client name (required)</li>
              <li>• <code className="bg-gray-200 px-1 rounded">email</code> - Email address (required)</li>
              <li>• <code className="bg-gray-200 px-1 rounded">company</code> - Company name (optional)</li>
              <li>• <code className="bg-gray-200 px-1 rounded">phone</code> - Phone number (optional)</li>
              <li>• <code className="bg-gray-200 px-1 rounded">address</code> - Address (optional)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">File Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• File format: CSV (.csv)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• UTF-8 encoding recommended</li>
              <li>• First row should contain column headers</li>
              <li>• Email addresses must be unique</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Upload History</h2>
            <button
              onClick={loadUploadHistory}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {uploadHistory.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No uploads yet. Upload your first CSV file to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Rows
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Successful
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {upload.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(upload.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {upload.totalRows}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {upload.successfulRows}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {upload.failedRows}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(upload.status)}`}>
                        {upload.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload CSV File"
        size="xl"
      >
        <CSVUploadForm
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          className="p-6"
        />
      </Modal>
    </div>
  );
};

export default CSVUploadView;
