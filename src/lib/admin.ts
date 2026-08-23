import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'justin.spoden2912@gmail.com';

export function isAdminEmail(email: string | undefined | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export async function getAdminUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user || !isAdminEmail(data.user.email)) {
    throw new Error('Admin access denied.');
  }
  return data.user;
}
