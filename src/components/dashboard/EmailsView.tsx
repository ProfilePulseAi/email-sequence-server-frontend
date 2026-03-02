'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDateTime, formatDateTimeTs, getEmailStateColor, getPriorityColor } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import {
  EnvelopeIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Email {
  id: number;
  userId: number;
  taskName: string;
  state: 'SCHEDULE' | 'DELIVERED' | 'FAILED';
  client: {
    firstName: string;
    lastName: string;
    emailId: string;
  };
  outreach: {
    id?: number;
    name: string;
    stateList?: Array<{
      name?: string;
      templateId?: number;
    }>;
  };
  outreachStateId: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  deliveryTime?: string;
  opened: boolean;
  replied: boolean;
  openedEmail?: {
    count: number;
    openedAt: string;
  };
  clicked?: Array<{
    url: string;
    clickedAt: string;
  }>;
  subject?: string;
  createdAt: string;
  scheduled10minInterval: string;
  overrideTemplateId?: number | null;
}

interface PromotionPreview {
  emailId: number;
  currentOutreachStateId: number;
  currentTemplateId?: number;
  nextOutreachStateId: number;
  nextTemplateId: number;
  nextStageName: string;
}

interface FunnelRow {
  key: string;
  outreachName: string;
  stageLabel: string;
  stageIndex: number;
  total: number;
  sent: number;
  openedEmails: number;
  openEvents: number;
  clickedEmails: number;
  clickEvents: number;
  replied: number;
  failed: number;
  scheduled: number;
}

const getOpenedCount = (email: Email): number => {
  if (typeof email.openedEmail?.count === 'number') {
    return email.openedEmail.count;
  }
  return email.opened ? 1 : 0;
};

const isOpened = (email: Email): boolean => {
  return getOpenedCount(email) > 0;
};

const getClickedCount = (email: Email): number => {
  return Array.isArray(email.clicked) ? email.clicked.length : 0;
};

const getLastClickedAt = (email: Email): string | undefined => {
  if (!Array.isArray(email.clicked) || email.clicked.length === 0) {
    return undefined;
  }

  const lastClickedEvent = email.clicked.reduce((latest, current) => {
    if (!latest) {
      return current;
    }
    return new Date(current.clickedAt).getTime() > new Date(latest.clickedAt).getTime() ? current : latest;
  });

  return lastClickedEvent?.clickedAt;
};

const getStageLabel = (email: Email): string => {
  const stageName = email.outreach?.stateList?.[email.outreachStateId]?.name;
  if (stageName && stageName.trim().length > 0) {
    return stageName;
  }

  if (email.outreachStateId === 0) {
    return 'Initial Stage';
  }

  return `Stage ${email.outreachStateId + 1}`;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  const maybeError = error as { response?: { data?: { message?: string | string[] } } };
  const message = maybeError?.response?.data?.message;
  if (Array.isArray(message) && message.length > 0) {
    return message[0];
  }
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }
  return fallback;
};

export default function EmailsView() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'delivered' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [outreachFilter, setOutreachFilter] = useState<{ key: string; label: string } | null>(null);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [promotionPreview, setPromotionPreview] = useState<PromotionPreview | null>(null);
  const [promotionTarget, setPromotionTarget] = useState<Email | null>(null);
  const [promotionOverrideTemplateId, setPromotionOverrideTemplateId] = useState('');
  const [loadingPromotionPreview, setLoadingPromotionPreview] = useState(false);
  const [sendingPromotion, setSendingPromotion] = useState(false);
  const [processingEmailAction, setProcessingEmailAction] = useState<{
    emailId: number;
    action: 'cancel' | 'terminate';
  } | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmails();
      setEmails(data);
    } catch (error) {
      toast.error('Failed to fetch emails');
      console.error('Emails fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendScheduledEmails = async () => {
    try {
      await apiService.sendScheduledEmails();
      toast.success('Scheduled emails sent successfully!');
      fetchEmails();
    } catch {
      toast.error('Failed to send scheduled emails');
    }
  };

  const handleCheckEmails = async () => {
    try {
      await apiService.checkEmails();
      toast.success('Email delivery status checked!');
      fetchEmails();
    } catch {
      toast.error('Failed to check email status');
    }
  };

  const normalizeOutreachName = (name?: string): string => {
    const trimmedName = (name || '').trim();
    return trimmedName.length > 0 ? trimmedName.toLowerCase() : 'untitled outreach';
  };

  const getDisplayOutreachName = (name?: string): string => {
    const trimmedName = (name || '').trim();
    return trimmedName.length > 0 ? trimmedName : 'Untitled Outreach';
  };

  const handleOutreachFilter = (name?: string) => {
    const label = getDisplayOutreachName(name);
    const key = normalizeOutreachName(name);

    setOutreachFilter((currentFilter) => {
      if (currentFilter?.key === key) {
        return null;
      }
      return { key, label };
    });
  };

  const hasNextStage = (email: Email): boolean => {
    const totalStages = email.outreach?.stateList?.length ?? 0;
    return totalStages > email.outreachStateId + 1;
  };

  const isSameOutreachAndClient = (firstEmail: Email, secondEmail: Email): boolean => {
    const firstClientEmail = (firstEmail.client?.emailId || '').toLowerCase();
    const secondClientEmail = (secondEmail.client?.emailId || '').toLowerCase();
    if (!firstClientEmail || !secondClientEmail || firstClientEmail !== secondClientEmail) {
      return false;
    }

    if (firstEmail.outreach?.id != null && secondEmail.outreach?.id != null) {
      return firstEmail.outreach.id === secondEmail.outreach.id;
    }

    return (firstEmail.outreach?.name || '').trim() === (secondEmail.outreach?.name || '').trim();
  };

  const canPromoteAndSend = (email: Email): boolean => {
    if (!hasNextStage(email)) {
      return false;
    }

    if (email.state === 'SCHEDULE') {
      return true;
    }

    if (email.state === 'DELIVERED') {
      const nextStateId = email.outreachStateId + 1;
      return emails.some(
        (candidateEmail) =>
          candidateEmail.id !== email.id &&
          candidateEmail.state === 'SCHEDULE' &&
          candidateEmail.outreachStateId === nextStateId &&
          isSameOutreachAndClient(email, candidateEmail),
      );
    }

    return false;
  };

  const closePromotionModal = (forceClose: boolean = false) => {
    if (sendingPromotion && !forceClose) {
      return;
    }
    setPromotionModalOpen(false);
    setPromotionPreview(null);
    setPromotionTarget(null);
    setPromotionOverrideTemplateId('');
    setLoadingPromotionPreview(false);
  };

  const openPromotionModal = async (email: Email) => {
    if (!canPromoteAndSend(email)) {
      toast.error('This email cannot be promoted right now');
      return;
    }

    setPromotionTarget(email);
    setPromotionPreview(null);
    setPromotionOverrideTemplateId('');
    setPromotionModalOpen(true);
    setLoadingPromotionPreview(true);

    try {
      const preview = await apiService.getEmailPromotionPreview(email.id);
      setPromotionPreview(preview);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load promotion details'));
      closePromotionModal(true);
    } finally {
      setLoadingPromotionPreview(false);
    }
  };

  const handlePromoteAndSend = async () => {
    if (!promotionTarget || !promotionPreview) {
      return;
    }

    let overrideTemplateId: number | undefined;
    if (promotionOverrideTemplateId.trim().length > 0) {
      const parsedTemplateId = Number(promotionOverrideTemplateId.trim());
      if (!Number.isInteger(parsedTemplateId) || parsedTemplateId <= 0) {
        toast.error('Override template ID must be a positive integer');
        return;
      }
      overrideTemplateId = parsedTemplateId;
    }

    try {
      setSendingPromotion(true);
      await apiService.promoteEmailAndSend(
        promotionTarget.id,
        overrideTemplateId ? { overrideTemplateId } : undefined,
      );
      toast.success('Email promoted and sent successfully');
      closePromotionModal(true);
      await fetchEmails();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to promote and send email'));
    } finally {
      setSendingPromotion(false);
    }
  };

  const handleCancelAndAdvance = async (email: Email) => {
    if (!hasNextStage(email)) {
      toast.error('This email is already at the last stage');
      return;
    }

    const confirmed = window.confirm(
      `Cancel this scheduled email for ${email.client?.emailId || 'this client'} and move to the next stage?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setProcessingEmailAction({ emailId: email.id, action: 'cancel' });
      await apiService.cancelScheduledEmailAndAdvance(email.id);
      toast.success('Scheduled email cancelled and moved to next stage');
      await fetchEmails();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to cancel email and move to next stage'));
    } finally {
      setProcessingEmailAction(null);
    }
  };

  const handleTerminateOutreach = async (email: Email) => {
    const confirmed = window.confirm(
      `Terminate this email sequence row (${email.id}) for ${email.client?.emailId || 'this client'}?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setProcessingEmailAction({ emailId: email.id, action: 'terminate' });
      await apiService.terminateEmailById(email.id);
      toast.success(`Email ${email.id} terminated`);
      await fetchEmails();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to terminate email'));
    } finally {
      setProcessingEmailAction(null);
    }
  };

  const summary = useMemo(() => {
    const total = emails.length;
    const scheduled = emails.filter((email) => email.state === 'SCHEDULE').length;
    const delivered = emails.filter((email) => email.state === 'DELIVERED').length;
    const failed = emails.filter((email) => email.state === 'FAILED').length;
    const openedEmails = emails.filter((email) => isOpened(email)).length;
    const clickedEmails = emails.filter((email) => getClickedCount(email) > 0).length;
    const openRate = delivered > 0 ? Math.round((openedEmails / delivered) * 100) : 0;
    const clickRate = delivered > 0 ? Math.round((clickedEmails / delivered) * 100) : 0;

    return {
      total,
      scheduled,
      delivered,
      failed,
      openedEmails,
      clickedEmails,
      openRate,
      clickRate,
    };
  }, [emails]);

  const filteredEmails = useMemo(
    () =>
      emails.filter((email) => {
        const firstName = email.client?.firstName || '';
        const lastName = email.client?.lastName || '';
        const clientEmail = email.client?.emailId || '';
        const taskName = email.taskName || '';
        const outreachName = getDisplayOutreachName(email.outreach?.name);
        const matchesFilter =
          filter === 'all' ||
          (filter === 'scheduled' && email.state === 'SCHEDULE') ||
          (filter === 'delivered' && email.state === 'DELIVERED') ||
          (filter === 'failed' && email.state === 'FAILED');
        const matchesOutreach =
          !outreachFilter || normalizeOutreachName(email.outreach?.name) === outreachFilter.key;

        const stageLabel = getStageLabel(email).toLowerCase();
        const matchesSearch =
          searchTerm === '' ||
          firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          outreachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stageLabel.includes(searchTerm.toLowerCase());

        return matchesFilter && matchesOutreach && matchesSearch;
      }),
    [emails, filter, outreachFilter, searchTerm],
  );

  const funnelRows = useMemo(() => {
    const stageMap = new Map<string, FunnelRow>();

    for (const email of emails) {
      const outreachName = getDisplayOutreachName(email.outreach?.name);
      const stageIndex = email.outreachStateId ?? 0;
      const stageLabel = getStageLabel(email);
      const key = `${outreachName}::${stageIndex}`;

      if (!stageMap.has(key)) {
        stageMap.set(key, {
          key,
          outreachName,
          stageLabel,
          stageIndex,
          total: 0,
          sent: 0,
          openedEmails: 0,
          openEvents: 0,
          clickedEmails: 0,
          clickEvents: 0,
          replied: 0,
          failed: 0,
          scheduled: 0,
        });
      }

      const row = stageMap.get(key)!;
      const openedCount = getOpenedCount(email);
      const clickedCount = getClickedCount(email);

      row.total += 1;
      row.openEvents += openedCount;
      row.clickEvents += clickedCount;

      if (email.state === 'DELIVERED') {
        row.sent += 1;
      }
      if (email.state === 'FAILED') {
        row.failed += 1;
      }
      if (email.state === 'SCHEDULE') {
        row.scheduled += 1;
      }
      if (openedCount > 0) {
        row.openedEmails += 1;
      }
      if (clickedCount > 0) {
        row.clickedEmails += 1;
      }
      if (email.replied) {
        row.replied += 1;
      }
    }

    return Array.from(stageMap.values()).sort((a, b) => {
      const outreachSort = a.outreachName.localeCompare(b.outreachName);
      if (outreachSort !== 0) {
        return outreachSort;
      }
      return a.stageIndex - b.stageIndex;
    });
  }, [emails]);

  const getStatusIcon = (email: Email) => {
    const clickedCount = getClickedCount(email);
    if (email.replied) return <CheckIcon className="h-5 w-5 text-green-500" />;
    if (clickedCount > 0) return <CursorArrowRaysIcon className="h-5 w-5 text-purple-500" />;
    if (isOpened(email)) return <EyeIcon className="h-5 w-5 text-blue-500" />;
    if (email.state === 'DELIVERED') return <CheckIcon className="h-5 w-5 text-green-500" />;
    if (email.state === 'FAILED') return <XMarkIcon className="h-5 w-5 text-red-500" />;
    return <EnvelopeIcon className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Email Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage and track your email sequences</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={handleCheckEmails}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Check Status
          </button>
          <button
            onClick={handleSendScheduledEmails}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Send Scheduled
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.total}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Delivered</p>
            <p className="mt-1 text-2xl font-semibold text-green-700">{summary.delivered}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Opened</p>
            <p className="mt-1 text-2xl font-semibold text-blue-700">{summary.openedEmails}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Clicked</p>
            <p className="mt-1 text-2xl font-semibold text-purple-700">{summary.clickedEmails}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Open Rate</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.openRate}%</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <p className="text-sm font-medium text-gray-500">Click Rate</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.clickRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Funnel</h3>
          </div>
          <p className="mt-1 text-xs text-gray-500">Stage-wise sent, opened, clicked, and reply performance.</p>
        </div>
        {funnelRows.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No funnel data available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outreach</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicked</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Replied</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funnelRows.map((row) => {
                  const openRate = row.sent > 0 ? Math.round((row.openedEmails / row.sent) * 100) : 0;
                  const clickRate = row.sent > 0 ? Math.round((row.clickedEmails / row.sent) * 100) : 0;

                  return (
                    <tr key={row.key}>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={() => handleOutreachFilter(row.outreachName)}
                          className={`font-medium ${
                            outreachFilter?.key === normalizeOutreachName(row.outreachName)
                              ? 'text-primary-700 underline'
                              : 'text-primary-600 hover:text-primary-700 hover:underline'
                          }`}
                        >
                          {row.outreachName}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.stageLabel}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.sent}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.openedEmails} ({row.openEvents})</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.clickedEmails} ({row.clickEvents})</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.replied}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.scheduled}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.failed}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{openRate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{clickRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', count: emails.length },
                { key: 'scheduled', label: 'Scheduled', count: emails.filter((e) => e.state === 'SCHEDULE').length },
                { key: 'delivered', label: 'Delivered', count: emails.filter((e) => e.state === 'DELIVERED').length },
                { key: 'failed', label: 'Failed', count: emails.filter((e) => e.state === 'FAILED').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'scheduled' | 'delivered' | 'failed')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === tab.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          {outreachFilter && (
            <div className="mt-3 flex items-center justify-between rounded-md border border-primary-100 bg-primary-50 px-3 py-2 text-xs text-primary-800">
              <p>
                Outreach filter: <span className="font-semibold">{outreachFilter.label}</span>
              </p>
              <button
                type="button"
                onClick={() => setOutreachFilter(null)}
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {filteredEmails.length === 0 ? (
            <div className="p-6 text-center">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all'
                  ? outreachFilter
                    ? `No emails found for outreach "${outreachFilter.label}".`
                    : 'Get started by creating your first outreach campaign.'
                  : outreachFilter
                    ? `No ${filter} emails found for outreach "${outreachFilter.label}".`
                    : `No ${filter} emails found.`}
              </p>
            </div>
          ) : (
            filteredEmails.map((email) => {
              const openedCount = getOpenedCount(email);
              const clickedCount = getClickedCount(email);
              const lastClickedAt = getLastClickedAt(email);
              const stageLabel = getStageLabel(email);
              const outreachName = getDisplayOutreachName(email.outreach?.name);
              const isPromotionInProgressForEmail =
                promotionTarget?.id === email.id && (loadingPromotionPreview || sendingPromotion);
              const isCancelInProgressForEmail =
                processingEmailAction?.emailId === email.id && processingEmailAction.action === 'cancel';
              const isTerminateInProgressForEmail =
                processingEmailAction?.emailId === email.id && processingEmailAction.action === 'terminate';
              const isActionInProgressForEmail = processingEmailAction?.emailId === email.id;
              const canCancelAndAdvance = email.state === 'SCHEDULE' && hasNextStage(email);
              const canTerminate = true;
              const promoteActionLabel = email.state === 'SCHEDULE' ? 'Promote Message' : 'Promote & Send';

              return (
                <div key={email.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(email)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {(email.client?.firstName || 'Unknown').trim()} {email.client?.lastName || ''}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                              email.priority,
                            )}`}
                          >
                            {email.priority}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 truncate">{email.id} • {email.client?.emailId || 'No email'}</p>

                        <p className="text-sm text-gray-500 truncate mt-1">
                          Outreach:{' '}
                          <button
                            type="button"
                            onClick={() => handleOutreachFilter(outreachName)}
                            className={`font-medium ${
                              outreachFilter?.key === normalizeOutreachName(outreachName)
                                ? 'text-primary-700 underline'
                                : 'text-primary-600 hover:text-primary-700 hover:underline'
                            }`}
                          >
                            {outreachName}
                          </button>{' '}
                          • {stageLabel}
                        </p>

                        {email.subject && <p className="text-sm text-gray-700 truncate mt-1">Subject: {email.subject}</p>}

                        <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-600">
                          {openedCount > 0 && (
                            <span className="flex items-center">
                              <EyeIcon className="h-3.5 w-3.5 mr-1" />
                              Opened {openedCount}x
                            </span>
                          )}
                          {clickedCount > 0 && (
                            <span className="flex items-center">
                              <CursorArrowRaysIcon className="h-3.5 w-3.5 mr-1" />
                              Clicked {clickedCount}x
                            </span>
                          )}
                          {email.replied && (
                            <span className="flex items-center text-green-700">
                              <CheckIcon className="h-3.5 w-3.5 mr-1" />
                              Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      {canCancelAndAdvance && (
                        <button
                          onClick={() => handleCancelAndAdvance(email)}
                          disabled={isPromotionInProgressForEmail || isActionInProgressForEmail}
                          className="inline-flex items-center px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isCancelInProgressForEmail ? 'Cancelling...' : 'Cancel & Next Stage'}
                        </button>
                      )}
                      {canTerminate && (
                        <button
                          onClick={() => handleTerminateOutreach(email)}
                          disabled={isPromotionInProgressForEmail || isActionInProgressForEmail}
                          className="inline-flex items-center px-2.5 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isTerminateInProgressForEmail ? 'Terminating...' : 'Terminate'}
                        </button>
                      )}
                      {canPromoteAndSend(email) && (
                        <button
                          onClick={() => openPromotionModal(email)}
                          disabled={isPromotionInProgressForEmail || isActionInProgressForEmail}
                          className="inline-flex items-center px-2.5 py-1 rounded-md border border-primary-200 bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {promoteActionLabel}
                        </button>
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmailStateColor(
                          email.state,
                        )}`}
                      >
                        {email.state}
                      </span>
                      <p className="text-xs text-gray-500">
                        {email.state === 'DELIVERED' && email.deliveryTime
                          ? `Delivered ${formatDateTime(email.deliveryTime)}`
                          : `Scheduled ${formatDateTimeTs(email.scheduled10minInterval)}`}
                      </p>
                      {email.openedEmail?.openedAt && (
                        <p className="text-xs text-gray-500">Last opened {formatDateTime(email.openedEmail.openedAt)}</p>
                      )}
                      {lastClickedAt && <p className="text-xs text-gray-500">Last click {formatDateTime(lastClickedAt)}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={promotionModalOpen}
        onClose={() => closePromotionModal()}
        title={promotionTarget?.state === 'SCHEDULE' ? 'Promote Scheduled Message' : 'Promote Email To Next Stage'}
        size="md"
      >
        {loadingPromotionPreview || !promotionPreview || !promotionTarget ? (
          <div className="py-8 text-sm text-gray-600">Loading promotion details...</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Client:</span> {promotionTarget.client?.emailId || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Current Stage:</span> {getStageLabel(promotionTarget)}
              </p>
              <p>
                <span className="font-medium">Next Stage:</span> {promotionPreview.nextStageName}
              </p>
              <p>
                <span className="font-medium">Default Next Template ID:</span> {promotionPreview.nextTemplateId}
              </p>
            </div>

            <div>
              <label htmlFor="promotion-template-id" className="block text-sm font-medium text-gray-700 mb-2">
                Override Template ID (optional)
              </label>
              <input
                id="promotion-template-id"
                type="number"
                min={1}
                value={promotionOverrideTemplateId}
                onChange={(e) => setPromotionOverrideTemplateId(e.target.value)}
                placeholder={`${promotionPreview.nextTemplateId}`}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to use the stage template ID ({promotionPreview.nextTemplateId}).
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => closePromotionModal()}
                disabled={sendingPromotion}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteAndSend}
                disabled={sendingPromotion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingPromotion
                  ? 'Sending...'
                  : promotionTarget.state === 'SCHEDULE'
                    ? 'Promote Message'
                    : 'Send Next Stage'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
