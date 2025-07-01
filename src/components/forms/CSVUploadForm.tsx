'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '@/lib/api';

interface CSVUploadFormProps {
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateOnly: boolean;
}

const CSVUploadForm: React.FC<CSVUploadFormProps> = ({
  onUploadSuccess,
  onUploadError,
  className = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [options, setOptions] = useState<UploadOptions>({
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false
  });
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): string | null => {
    // Check file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      return 'Please select a CSV file';
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
    toast.success(`File "${selectedFile.name}" selected`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await apiService.validateClientsCSV(file);
      setValidationResult(result);
      toast.success('File validation completed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Validation failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await apiService.uploadClientsCSV(file, options);
      toast.success(`Successfully processed ${result.processed || 0} clients`);
      onUploadSuccess?.(result);
      
      // Reset form
      setFile(null);
      setValidationResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await apiService.downloadClientsCSVTemplate();
      toast.success('Template downloaded');
    } catch (error: any) {
      toast.error('Failed to download template');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
            <p className="text-sm text-blue-600">Download the CSV template to see the required format</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${file ? 'border-green-400 bg-green-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {file ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Drop your CSV file here</p>
              <p className="text-sm text-gray-500">or click to browse (max 10MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Options */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Upload Options</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.skipDuplicates}
              onChange={(e) => setOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Skip duplicate entries</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.updateExisting}
              onChange={(e) => setOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Update existing clients</span>
          </label>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`border rounded-lg p-4 ${
          validationResult.failed === 0 && validationResult.errors?.length === 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`text-sm font-medium mb-3 ${
            validationResult.failed === 0 && validationResult.errors?.length === 0 
              ? 'text-green-800' 
              : 'text-yellow-800'
          }`}>
            Validation Result
          </h3>
          
          <div className={`text-sm space-y-2 ${
            validationResult.failed === 0 && validationResult.errors?.length === 0 
              ? 'text-green-700' 
              : 'text-yellow-700'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Total processed:</span> {validationResult.processed || 0}</p>
                <p><span className="font-medium">Successful:</span> {validationResult.successful || 0}</p>
                <p><span className="font-medium">Failed:</span> {validationResult.failed || 0}</p>
              </div>
              <div>
                <p><span className="font-medium">Duplicates:</span> {validationResult.duplicates || 0}</p>
                <p><span className="font-medium">Updated:</span> {validationResult.updated || 0}</p>
              </div>
            </div>
            
            {validationResult.failed === 0 && validationResult.errors?.length === 0 ? (
              <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
                <p className="font-medium text-green-800">✅ Validation passed! Your file is ready to upload.</p>
              </div>
            ) : (
              validationResult.errors && validationResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium">Errors found:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1 pl-2">
                    {validationResult.errors.slice(0, 5).map((error: string, index: number) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li className="text-xs font-medium">... and {validationResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleValidate}
          disabled={!file || isUploading}
          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Validate File'
          )}
        </button>
        
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center ${
            validationResult?.failed === 0 && validationResult?.errors?.length === 0
              ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-300'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            validationResult?.failed === 0 && validationResult?.errors?.length === 0
              ? '✅ Upload Clients'
              : 'Upload Clients'
          )}
        </button>
      </div>
    </div>
  );
};

export default CSVUploadForm;
