import Dashboard from '@/components/dashboard/Dashboard';

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard>{children}</Dashboard>;
}
