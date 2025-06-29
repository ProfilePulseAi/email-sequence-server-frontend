'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import EmailsView from './EmailsView';
import ClientsView from './ClientsView';
import OutreachView from './OutreachView';
import MailboxView from './MailboxView';
import SettingsView from './SettingsView';

type View = 'overview' | 'emails' | 'clients' | 'outreach' | 'mailbox' | 'settings';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'emails':
        return <EmailsView />;
      case 'clients':
        return <ClientsView />;
      case 'outreach':
        return <OutreachView />;
      case 'mailbox':
        return <MailboxView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
