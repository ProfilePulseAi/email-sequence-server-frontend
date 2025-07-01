'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import { MailBox } from '@/types';
import MailboxForm from '@/components/forms/MailboxForm';
import { 
  InboxIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

export default function MailboxView() {
  const [mailboxes, setMailboxes] = useState<MailBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<MailBox | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMailboxes();
  }, []);

  const fetchMailboxes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMailboxes();
      setMailboxes(data);
    } catch (error) {
      toast.error('Failed to fetch mailboxes');
      console.error('Mailboxes fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMailbox = () => {
    setEditingMailbox(undefined);
    setIsFormOpen(true);
  };

  const handleEditMailbox = (mailbox: MailBox) => {
    setEditingMailbox(mailbox);
    setIsFormOpen(true);
  };

  const handleDeleteMailbox = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email account? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await apiService.deleteMailbox(id);
      toast.success('Mailbox deleted successfully');
      fetchMailboxes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete mailbox');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (mailbox: MailBox) => {
    try {
      const newProbability = mailbox.sendingProbability > 0 ? 0 : 100;
      await apiService.updateMailbox(mailbox.id, { 
        ...mailbox, 
        sendingProbability: newProbability 
      });
      toast.success(`Mailbox ${newProbability > 0 ? 'resumed' : 'paused'} successfully`);
      fetchMailboxes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update mailbox status');
    }
  };

  const handleFormSuccess = () => {
    fetchMailboxes();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMailbox(undefined);
  };

  const handleCopyConfiguration = (mailbox: MailBox) => {
    const configToCopy = {
      emailId: mailbox.emailId,
      name: mailbox.name,
      smtpConfig: {
        host: mailbox.smtpConfig.host,
        port: mailbox.smtpConfig.port,
        secure: mailbox.smtpConfig.secure,
        auth: {
          user: mailbox.smtpConfig.auth.user,
          pass: "[HIDDEN]" // Don't copy actual passwords for security
        }
      },
      imapConfig: {
        host: mailbox.imapConfig.host,
        port: mailbox.imapConfig.port,
        auth: {
          user: mailbox.imapConfig.auth.user,
          pass: "[HIDDEN]" // Don't copy actual passwords for security
        }
      },
      replyTo: mailbox.replyTo,
      maxEmailsPerDay: mailbox.maxEmailsPerDay,
      sendingProbability: mailbox.sendingProbability,
      shouldCheckReplies: mailbox.shouldCheckReplies,
      mailsPer10Mins: mailbox.mailsPer10Mins || 2
    };

    navigator.clipboard.writeText(JSON.stringify(configToCopy, null, 2))
      .then(() => {
        toast.success('Configuration copied to clipboard! (Passwords hidden for security)');
      })
      .catch(() => {
        toast.error('Failed to copy configuration to clipboard');
      });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Email Accounts
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your email accounts for sending and receiving emails
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={handleAddMailbox}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <InboxIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Accounts</dt>
                  <dd className="text-lg font-medium text-gray-900">{mailboxes.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Working</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mailboxes.filter(m => m.sendingProbability > 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paused</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mailboxes.filter(m => m.sendingProbability === 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mailbox List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {mailboxes.length === 0 ? (
          <div className="text-center py-12">
            <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No email accounts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first email account.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddMailbox}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Account
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {mailboxes.map((mailbox) => (
              <div key={mailbox.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`h-3 w-3 rounded-full ${
                      mailbox.sendingProbability > 0 ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {mailbox.name}
                          </p>
                          <p className="text-xs text-gray-500">{mailbox.emailId}</p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div>
                          <p><span className="font-medium">SMTP:</span> {mailbox.smtpConfig.host}:{mailbox.smtpConfig.port}</p>
                        </div>
                        {
                        mailbox?.imapConfig?.host ? <div>
                          <p><span className="font-medium">IMAP:</span> {mailbox?.imapConfig?.host}:{mailbox?.imapConfig?.port}</p>
                        </div> : null}
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-2 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Sent:</span> {mailbox.sentEmails}
                        </div>
                        <div>
                          <span className="font-medium">Failed:</span> {mailbox.failedEmails}
                        </div>
                        <div>
                          <span className="font-medium">Max/10min:</span> {mailbox.mailsPer10Mins}
                        </div>
                        <div>
                          <span className="font-medium">Max/Day:</span> {mailbox.maxEmailsPerDay}
                        </div>
                        
                        <div>
                          <span className="font-medium">Probability:</span> {mailbox.sendingProbability}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Added {formatDate(mailbox.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mailbox.sendingProbability > 0
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mailbox.sendingProbability > 0 ? 'Working' : 'Paused'}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleToggleStatus(mailbox)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title={mailbox.sendingProbability > 0 ? 'Pause sending' : 'Resume sending'}
                      >
                        {mailbox.sendingProbability > 0 ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyConfiguration(mailbox)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Copy configuration as JSON"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditMailbox(mailbox)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Edit account"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMailbox(mailbox.id)}
                        disabled={deletingId === mailbox.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Delete account"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )          )}
        </div>
      )}
      </div>

      {/* Mailbox Form Modal */}
      <MailboxForm
        mailbox={editingMailbox}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
