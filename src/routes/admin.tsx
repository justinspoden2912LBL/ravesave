import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getAdminUser } from '@/lib/admin';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    try {
      await getAdminUser();
    } catch {
      throw redirect({ to: '/admin-login' });
    }
  },
  component: () => <Outlet />,
});
