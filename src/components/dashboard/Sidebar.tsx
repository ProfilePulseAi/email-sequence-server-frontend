'use client';

import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import {
  HomeIcon,
  EnvelopeIcon,
  UserGroupIcon,
  MegaphoneIcon,
  InboxIcon,
  CogIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  currentView: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', view: 'overview', icon: HomeIcon },
  { name: 'Emails', href: '/dashboard/emails', view: 'emails', icon: EnvelopeIcon },
  { name: 'Clients', href: '/dashboard/clients', view: 'clients', icon: UserGroupIcon },
  { name: 'Templates', href: '/dashboard/templates', view: 'templates', icon: DocumentTextIcon },
  { name: 'Outreach', href: '/dashboard/outreach', view: 'outreach', icon: MegaphoneIcon },
  { name: 'Mailbox', href: '/dashboard/mailbox', view: 'mailbox', icon: InboxIcon },
  { name: 'Settings', href: '/dashboard/settings', view: 'settings', icon: CogIcon },
];

export default function Sidebar({ currentView, isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false); // Close mobile sidebar after navigation
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-4 h-16 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Email Dashboard</h1>
            </div>
            <nav className="mt-5 flex-1 overflow-y-auto">
              <div className="px-2 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`${
                      currentView === item.view
                        ? 'bg-primary-100 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center w-full px-2 py-2 text-sm font-medium border-l-4 transition-colors`}
                  >
                    <item.icon
                      className={`${
                        currentView === item.view ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col h-full border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Email Dashboard</h1>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-white space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`${
                    currentView === item.view
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center w-full px-2 py-2 text-sm font-medium border-l-4 transition-colors`}
                >
                  <item.icon
                    className={`${
                      currentView === item.view ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              ))}
            </nav>
            
            {/* User info */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.firstName || 'User'}
                  </p>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
