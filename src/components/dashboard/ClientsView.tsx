'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';
import ClientForm from '@/components/forms/ClientForm';
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  industry?: string;
  notes?: string;
  createdAt: string;
}

export default function ClientsView() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getClients();
      setClients(data);
    } catch (error) {
      toast.error('Failed to fetch clients');
      console.error('Clients fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: number, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteClient(clientId);
      toast.success('Client deleted successfully');
      await fetchClients(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    }
  };

  console.log('Clients data:', clients);
  const filteredClients = clients.filter(client =>
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-10 bg-gray-200 rounded w-64"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Clients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your client contacts and information
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex space-x-3">
          <button
            onClick={() => router.push('/dashboard/clients/upload')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                  <dd className="text-lg font-medium text-gray-900">{clients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Companies</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(clients.filter(c => c.company).map(c => c.company)).size}
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
                <EnvelopeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter(c => {
                      const clientDate = new Date(c.createdAt);
                      const now = new Date();
                      return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first client.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Client
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {getInitials(client.firstName, client.lastName)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {client.firstName} {client.lastName}
                      </p>
                      {client.company && (
                        <p className="text-sm text-gray-500 truncate">
                          {client.position ? `${client.position} at ` : ''}{client.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                      title="Edit client"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, `${client.firstName} ${client.lastName}`)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete client"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{client.emailId}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center text-sm text-gray-500">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      <span>{client.industry}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Added {formatDate(client.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Client Form Modal */}
      <ClientForm
        client={editingClient || undefined}
        isOpen={showCreateModal || !!editingClient}
        onClose={() => {
          setShowCreateModal(false);
          setEditingClient(null);
        }}
        onSuccess={fetchClients}
      />
    </div>
  );
}
