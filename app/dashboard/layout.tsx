import AdminLayout from '@/app/admin/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
