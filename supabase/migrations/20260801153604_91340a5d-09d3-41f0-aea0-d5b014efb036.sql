-- Explicit deny for analytics tables: no direct client access at all.
REVOKE ALL ON public.page_views FROM anon, authenticated;
REVOKE ALL ON public.usage_events FROM anon, authenticated;
GRANT ALL ON public.page_views TO service_role;
GRANT ALL ON public.usage_events TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "no_client_insert_page_views" ON public.page_views;
CREATE POLICY "no_client_insert_page_views"
  ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "no_client_insert_usage_events" ON public.usage_events;
CREATE POLICY "no_client_insert_usage_events"
  ON public.usage_events FOR INSERT TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "no_client_update_page_views" ON public.page_views;
CREATE POLICY "no_client_update_page_views"
  ON public.page_views FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "no_client_update_usage_events" ON public.usage_events;
CREATE POLICY "no_client_update_usage_events"
  ON public.usage_events FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "no_client_delete_page_views" ON public.page_views;
CREATE POLICY "no_client_delete_page_views"
  ON public.page_views FOR DELETE TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "no_client_delete_usage_events" ON public.usage_events;
CREATE POLICY "no_client_delete_usage_events"
  ON public.usage_events FOR DELETE TO anon, authenticated
  USING (false);