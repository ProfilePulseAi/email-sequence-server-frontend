'use client';

import React, { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardProps {
  children: ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Extract current view from pathname
  const getCurrentView = () => {
    if (pathname === '/dashboard') return 'overview';
    const segments = pathname.split('/');
    const dashboardIndex = segments.indexOf('dashboard');
    if (dashboardIndex !== -1 && segments[dashboardIndex + 1]) {
      return segments[dashboardIndex + 1];
    }
    return 'overview';
  };

  const currentView = getCurrentView();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
