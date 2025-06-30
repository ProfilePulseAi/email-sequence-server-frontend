'use client';

import { ReactNode } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <Dashboard>{children}</Dashboard>;
}
