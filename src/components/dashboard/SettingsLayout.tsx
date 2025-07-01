'use client';

import { useAuth } from '@/components/providers';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  UserIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  ArrowRightOnRectangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon, href: '/dashboard/settings/profile' },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, href: '/dashboard/settings/security' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, href: '/dashboard/settings/notifications' },
    { id: 'nudge-management', name: 'Nudge Management', icon: CogIcon, href: '/dashboard/settings/nudge-management' },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon, href: '/dashboard/settings/appearance' },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      toast.success('Signed out successfully');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`${
                    isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                  } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                >
                  <tab.icon
                    className={`${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{tab.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
