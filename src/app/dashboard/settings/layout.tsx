import SettingsLayout from '@/components/dashboard/SettingsLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
