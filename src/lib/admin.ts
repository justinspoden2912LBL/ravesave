import { supabase } from '@/integrations/supabase/client';

const adminUserId = import.meta.env.VITE_ADMIN_USER_ID as string | undefined;

export function isConfiguredAdmin(userId: string | undefined) {
  return Boolean(userId && adminUserId && userId === adminUserId);
}

export async function requireConfiguredAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user || !isConfiguredAdmin(user.id)) {
    throw new Error('Admin access denied.');
  }
  return user;
}
