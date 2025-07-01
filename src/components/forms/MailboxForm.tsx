'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MailBox } from '@/types';
import Modal from '@/components/ui/Modal';

interface MailboxFormProps {
  mailbox?: MailBox;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MailboxForm({ mailbox, isOpen, onClose, onSuccess }: MailboxFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const isEditing = !!mailbox?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MailBox>({
    defaultValues: mailbox || {
      emailId: '',
      name: '',
      smtpConfig: {
        host: '',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: '',
        },
      },
      imapConfig: {
        host: '',
        port: 993,
        auth: {
          user: '',
          pass: '',
        },
      },
      shouldCheckReplies: false,
      sentEmails: 0,
      failedEmails: 0,
      sendingProbability: 100,
      replyTo: '',
      maxEmailsPerDay: 300,
      mailsPer10Mins: 2,
    },
  });

  const emailId = watch('emailId');
  const shouldCheckReplies = watch('shouldCheckReplies');
  const emailProvider = emailId?.split('@')[1]?.toLowerCase();

  // Reset form when mailbox prop changes
  useEffect(() => {
    if (isOpen) {
      reset(mailbox || {
        emailId: '',
        name: '',
        smtpConfig: {
          host: '',
          port: 587,
          secure: false,
          auth: {
            user: '',
            pass: '',
          },
        },
        imapConfig: {
          host: '',
          port: 993,
          auth: {
            user: '',
            pass: '',
          },
        },
        shouldCheckReplies: false,
        sentEmails: 0,
        failedEmails: 0,
        sendingProbability: 100,
        replyTo: emailId || '',
        maxEmailsPerDay: 300,
        mailsPer10Mins: 2,
      });
    }
  }, [mailbox, isOpen, reset, emailId]);

  // Auto-fill SMTP/IMAP settings based on email provider
  const getProviderSettings = (provider: string) => {
    const settings: Record<string, { 
      smtp: { host: string; port: number; secure: boolean }; 
      imap: { host: string; port: number } 
    }> = {
      'gmail.com': {
        smtp: { host: 'smtp.gmail.com', port: 587, secure: false },
        imap: { host: 'imap.gmail.com', port: 993 },
      },
      'outlook.com': {
        smtp: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
        imap: { host: 'outlook.office365.com', port: 993 },
      },
      'yahoo.com': {
        smtp: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
        imap: { host: 'imap.mail.yahoo.com', port: 993 },
      },
    };
    return settings[provider];
  };

  const onSubmit = async (data: MailBox) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && mailbox?.id) {
        await apiService.updateMailbox(mailbox.id, data);
        toast.success('Mailbox updated successfully');
      } else {
        await apiService.createMailbox(data);
        toast.success('Mailbox created successfully');
      }
      
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 
        `Failed to ${isEditing ? 'update' : 'create'} mailbox configuration`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const autoFillSettings = () => {
    if (emailProvider) {
      const settings = getProviderSettings(emailProvider);
      if (settings) {
        setValue('smtpConfig.host', settings.smtp.host);
        setValue('smtpConfig.port', settings.smtp.port);
        setValue('smtpConfig.secure', settings.smtp.secure);
        setValue('imapConfig.host', settings.imap.host);
        setValue('imapConfig.port', settings.imap.port);
        
        // Auto-fill auth user with email for common providers
        setValue('smtpConfig.auth.user', emailId);
        setValue('imapConfig.auth.user', emailId);
        
        toast.success(`Auto-filled settings for ${emailProvider}`);
      }
    }
  };

  const handleJsonImport = () => {
    try {
      setJsonError('');
      const parsedData = JSON.parse(jsonInput);
      
      // Validate required fields (IMAP is only required if shouldCheckReplies is true)
      const baseRequiredFields = ['emailId', 'name', 'smtpConfig', 'replyTo', 'maxEmailsPerDay'];
      let requiredFields = [...baseRequiredFields];
      
      // Add IMAP config to required fields only if shouldCheckReplies is true
      if (parsedData.shouldCheckReplies) {
        requiredFields.push('imapConfig');
      }
      
      const missingFields = requiredFields.filter(field => !parsedData[field]);
      
      if (missingFields.length > 0) {
        setJsonError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate nested config structures
      if (!parsedData.smtpConfig.host || !parsedData.smtpConfig.port || !parsedData.smtpConfig.auth) {
        setJsonError('Invalid SMTP configuration structure');
        return;
      }

      // Only validate IMAP config if shouldCheckReplies is true
      if (parsedData.shouldCheckReplies && parsedData.imapConfig) {
        if (!parsedData.imapConfig.host || !parsedData.imapConfig.port || !parsedData.imapConfig.auth) {
          setJsonError('Invalid IMAP configuration structure (required when monitoring replies)');
          return;
        }
      }

      // Populate form with JSON data
      setValue('emailId', parsedData.emailId);
      setValue('name', parsedData.name);
      setValue('replyTo', parsedData.replyTo);
      setValue('maxEmailsPerDay', parsedData.maxEmailsPerDay || 300);
      setValue('sendingProbability', parsedData.sendingProbability || 100);
      setValue('shouldCheckReplies', parsedData.shouldCheckReplies || false);
      setValue('mailsPer10Mins', parsedData.mailsPer10Mins || 2);
      
      // SMTP Config
      setValue('smtpConfig.host', parsedData.smtpConfig.host);
      setValue('smtpConfig.port', parsedData.smtpConfig.port);
      setValue('smtpConfig.secure', parsedData.smtpConfig.secure || false);
      setValue('smtpConfig.auth.user', parsedData.smtpConfig.auth.user);
      setValue('smtpConfig.auth.pass', parsedData.smtpConfig.auth.pass);
      
      // IMAP Config (only set if shouldCheckReplies is true)
      if (parsedData.shouldCheckReplies && parsedData.imapConfig) {
        setValue('imapConfig.host', parsedData.imapConfig.host);
        setValue('imapConfig.port', parsedData.imapConfig.port);
        setValue('imapConfig.auth.user', parsedData.imapConfig.auth.user);
        setValue('imapConfig.auth.pass', parsedData.imapConfig.auth.pass);
      }

      setShowJsonImport(false);
      setJsonInput('');
      toast.success('Configuration imported successfully!');
    } catch (error) {
      setJsonError('Invalid JSON format. Please check your input.');
    }
  };

  const handleCloseJsonImport = () => {
    setShowJsonImport(false);
    setJsonInput('');
    setJsonError('');
  };

  const handleLoadSampleJson = () => {
    const sampleJson = {
      "emailId": "user@example.com",
      "name": "Sample Mailbox",
      "smtpConfig": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "auth": {
          "user": "user@example.com",
          "pass": "your_app_password"
        }
      },
      "imapConfig": {
        "host": "imap.gmail.com",
        "port": 993,
        "auth": {
          "user": "user@example.com",
          "pass": "your_app_password"
        }
      },
      "replyTo": "user@example.com",
      "maxEmailsPerDay": 300,
      "sendingProbability": 100,
      "shouldCheckReplies": true,
      "mailsPer10Mins": 2
    };
    
    setJsonInput(JSON.stringify(sampleJson, null, 2));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Mailbox' : 'Add New Mailbox'}
      size="lg"
    >
      <div className="space-y-6">
        {/* JSON Import Section */}
        {!isEditing && (
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Quick Import</h4>
                <p className="text-xs text-gray-500">Import mailbox configuration from JSON</p>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonImport(!showJsonImport)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showJsonImport ? 'Hide Import' : 'Import JSON'}
              </button>
            </div>
            
            {showJsonImport && (
              <div className="mt-4 space-y-3">
                <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700">
                    Paste JSON Configuration
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleJson}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Load Sample
                  </button>
                </div>
                  <textarea
                    id="jsonInput"
                    rows={8}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                    placeholder={`{
  "emailId": "user@example.com",
  "name": "Display Name",
  "smtpConfig": {
    "host": "smtp.example.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "username",
      "pass": "password"
    }
  },
  "imapConfig": {
    "host": "imap.example.com",
    "port": 993,
    "auth": {
      "user": "username",
      "pass": "password"
    }
  },
  "replyTo": "reply@example.com",
  "maxEmailsPerDay": 300,
  "sendingProbability": 100,
  "shouldCheckReplies": false
}`}
                  />
                  {jsonError && (
                    <p className="mt-1 text-sm text-red-600">{jsonError}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseJsonImport}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleJsonImport}
                    disabled={!jsonInput.trim()}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Mailbox Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Mailbox name is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Primary Outreach Account"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="emailId"
                {...register('emailId', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onBlur={autoFillSettings}
              />
              {errors.emailId && (
                <p className="mt-1 text-sm text-red-600">{errors.emailId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="replyTo" className="block text-sm font-medium text-gray-700">
                Reply To Email *
              </label>
              <input
                type="email"
                id="replyTo"
                {...register('replyTo', { 
                  required: 'Reply-to email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address for replies"
              />
              {errors.replyTo && (
                <p className="mt-1 text-sm text-red-600">{errors.replyTo.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">SMTP Settings (Outgoing)</h4>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                SMTP Host *
              </label>
              <input
                type="text"
                id="smtpHost"
                {...register('smtpConfig.host', { required: 'SMTP host is required' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., smtp.gmail.com"
              />
              {errors.smtpConfig?.host && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpConfig.host.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                SMTP Port *
              </label>
              <input
                type="number"
                id="smtpPort"
                {...register('smtpConfig.port', { 
                  required: 'SMTP port is required',
                  min: { value: 1, message: 'Port must be greater than 0' },
                  max: { value: 65535, message: 'Port must be less than 65536' }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="587"
              />
              {errors.smtpConfig?.port && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpConfig.port.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700">
                SMTP Username *
              </label>
              <input
                type="text"
                id="smtpUser"
                {...register('smtpConfig.auth.user', { required: 'SMTP username is required' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Usually your email address"
              />
              {errors.smtpConfig?.auth?.user && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpConfig.auth.user.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="smtpPass" className="block text-sm font-medium text-gray-700">
                SMTP Password *
              </label>
              <input
                type="password"
                id="smtpPass"
                {...register('smtpConfig.auth.pass', { 
                  required: !isEditing ? 'SMTP password is required' : false 
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={isEditing ? "Leave blank to keep current" : "App password or regular password"}
              />
              {errors.smtpConfig?.auth?.pass && (
                <p className="mt-1 text-sm text-red-600">{errors.smtpConfig.auth.pass.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smtpSecure"
                {...register('smtpConfig.secure')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smtpSecure" className="ml-2 block text-sm text-gray-900">
                Use secure connection (SSL/TLS)
              </label>
            </div>
          </div>
        </div>

        {/* IMAP Configuration - Only shown if shouldCheckReplies is enabled */}
        {shouldCheckReplies && (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">IMAP Settings (Incoming)</h4>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="imapHost" className="block text-sm font-medium text-gray-700">
                  IMAP Host *
                </label>
                <input
                  type="text"
                  id="imapHost"
                  {...register('imapConfig.host', { 
                    required: shouldCheckReplies ? 'IMAP host is required when monitoring replies' : false 
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., imap.gmail.com"
                />
                {errors.imapConfig?.host && (
                  <p className="mt-1 text-sm text-red-600">{errors.imapConfig.host.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="imapPort" className="block text-sm font-medium text-gray-700">
                  IMAP Port *
                </label>
                <input
                  type="number"
                  id="imapPort"
                  {...register('imapConfig.port', { 
                    required: shouldCheckReplies ? 'IMAP port is required when monitoring replies' : false,
                    min: { value: 1, message: 'Port must be greater than 0' },
                    max: { value: 65535, message: 'Port must be less than 65536' }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="993"
                />
                {errors.imapConfig?.port && (
                  <p className="mt-1 text-sm text-red-600">{errors.imapConfig.port.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="imapUser" className="block text-sm font-medium text-gray-700">
                  IMAP Username *
                </label>
                <input
                  type="text"
                  id="imapUser"
                  {...register('imapConfig.auth.user', { 
                    required: shouldCheckReplies ? 'IMAP username is required when monitoring replies' : false 
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Usually your email address"
                />
                {errors.imapConfig?.auth?.user && (
                  <p className="mt-1 text-sm text-red-600">{errors.imapConfig.auth.user.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="imapPass" className="block text-sm font-medium text-gray-700">
                  IMAP Password *
                </label>
                <input
                  type="password"
                  id="imapPass"
                  {...register('imapConfig.auth.pass', { 
                    required: shouldCheckReplies && !isEditing ? 'IMAP password is required when monitoring replies' : false 
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={isEditing ? "Leave blank to keep current" : "App password or regular password"}
                />
                {errors.imapConfig?.auth?.pass && (
                  <p className="mt-1 text-sm text-red-600">{errors.imapConfig.auth.pass.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Email Settings</h4>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="maxEmailsPerDay" className="block text-sm font-medium text-gray-700">
                Max Emails Per Day *
              </label>
              <input
                type="number"
                id="maxEmailsPerDay"
                {...register('maxEmailsPerDay', { 
                  required: 'Max emails per day is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 1000, message: 'Must be less than 1000' }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="300"
              />
              {errors.maxEmailsPerDay && (
                <p className="mt-1 text-sm text-red-600">{errors.maxEmailsPerDay.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="sendingProbability" className="block text-sm font-medium text-gray-700">
                Sending Probability (%) *
              </label>
              <input
                type="number"
                id="sendingProbability"
                {...register('sendingProbability', { 
                  required: 'Sending probability is required',
                  min: { value: 1, message: 'Must be at least 1%' },
                  max: { value: 100, message: 'Must be at most 100%' }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="100"
              />
              {errors.sendingProbability && (
                <p className="mt-1 text-sm text-red-600">{errors.sendingProbability.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="mailsPer10Mins" className="block text-sm font-medium text-gray-700">
                Emails per 10 mins
              </label>
              <input
                type="number"
                id="mailsPer10Mins"
                {...register('mailsPer10Mins', { 
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 50, message: 'Must be less than 50' }
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="2"
              />
              {errors.mailsPer10Mins && (
                <p className="mt-1 text-sm text-red-600">{errors.mailsPer10Mins.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="shouldCheckReplies"
                {...register('shouldCheckReplies')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="shouldCheckReplies" className="ml-2 block text-sm text-gray-900">
                Monitor this mailbox for replies
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Mailbox' : 'Add Mailbox'}
          </button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
