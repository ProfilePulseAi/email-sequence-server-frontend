'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalEmails: number;
  deliveredEmails: number;
  openedEmails: number;
  repliedEmails: number;
  totalClients: number;
  activeOutreaches: number;
  emailsThisWeek: number;
  openRate: number;
  replyRate: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmails: 0,
    deliveredEmails: 0,
    openedEmails: 0,
    repliedEmails: 0,
    totalClients: 0,
    activeOutreaches: 0,
    emailsThisWeek: 0,
    openRate: 0,
    replyRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState<{ name: string; emails: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch emails, clients, and outreach data
      const [emails, clients, outreaches] = await Promise.all([
        apiService.getEmails(),
        apiService.getClients(),
        apiService.getOutreaches()
      ]);

      // Calculate stats
      const totalEmails = emails.length;
      const deliveredEmails = emails.filter((email: any) => email.state === 'DELIVERED').length;
      const openedEmails = emails.filter((email: any) => email.opened).length;
      const repliedEmails = emails.filter((email: any) => email.replied).length;
      const totalClients = clients.length;
      const activeOutreaches = outreaches.filter((outreach: any) => outreach.isActive).length;
      
      // Calculate this week's emails
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const emailsThisWeek = emails.filter((email: any) => 
        new Date(email.createdAt) >= oneWeekAgo
      ).length;

      const openRate = deliveredEmails > 0 ? Math.round((openedEmails / deliveredEmails) * 100) : 0;
      const replyRate = deliveredEmails > 0 ? Math.round((repliedEmails / deliveredEmails) * 100) : 0;

      setStats({
        totalEmails,
        deliveredEmails,
        openedEmails,
        repliedEmails,
        totalClients,
        activeOutreaches,
        emailsThisWeek,
        openRate,
        replyRate,
      });

      // Generate chart data for the last 7 days
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayEmails = emails.filter((email: any) => {
          const emailDate = new Date(email.createdAt);
          return emailDate.toDateString() === date.toDateString();
        }).length;
        
        chartData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          emails: dayEmails,
        });
      }
      setEmailData(chartData);

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Emails',
      value: stats.totalEmails,
      icon: EnvelopeIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Delivered',
      value: stats.deliveredEmails,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'Opened',
      value: stats.openedEmails,
      icon: EyeIcon,
      color: 'bg-yellow-500',
      change: `${stats.openRate}%`,
      changeType: 'neutral',
    },
    {
      name: 'Replied',
      value: stats.repliedEmails,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      change: `${stats.replyRate}%`,
      changeType: 'neutral',
    },
    {
      name: 'Clients',
      value: stats.totalClients,
      icon: UserGroupIcon,
      color: 'bg-indigo-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'This Week',
      value: stats.emailsThisWeek,
      icon: EnvelopeIcon,
      color: 'bg-pink-500',
      change: '+15%',
      changeType: 'increase',
    },
  ];

  const pieData = [
    { name: 'Delivered', value: stats.deliveredEmails, color: '#10B981' },
    { name: 'Opened', value: stats.openedEmails, color: '#F59E0B' },
    { name: 'Replied', value: stats.repliedEmails, color: '#8B5CF6' },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 ${stat.color} rounded-md flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 
                        stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.changeType === 'increase' && <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />}
                        {stat.changeType === 'decrease' && <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : stat.changeType === 'decrease' ? 'Decreased' : 'Changed'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Activity (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="emails" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => window.location.href = '#emails'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                    <EnvelopeIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Send Emails
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Schedule and send email sequences to your clients.
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '#clients'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
                    <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Manage Clients
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add and organize your client contacts.
                  </p>
                </div>
              </button>

              <button
                onClick={() => toast.success('Feature coming soon!')}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100">
                    <EyeIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Analytics
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Detailed insights into your email performance.
                  </p>
                </div>
              </button>

              <button
                onClick={() => toast.success('Feature coming soon!')}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                    <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Check Replies
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Review and respond to client replies.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
