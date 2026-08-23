export type RuntimeConfigStatus = {
  configured: boolean;
  missing: string[];
};

export function getPublicSupabaseConfig(): RuntimeConfigStatus {
  const missing: string[] = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }
  return { configured: missing.length === 0, missing };
}

export function formatMissingConfig(status: RuntimeConfigStatus) {
  return status.configured
    ? ''
    : `Supabase ist noch nicht konfiguriert. Fehlend: ${status.missing.join(', ')}. Bitte in Vercel Environment Variables setzen.`;
}
