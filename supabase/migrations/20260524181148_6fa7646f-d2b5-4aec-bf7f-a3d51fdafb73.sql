
-- Page views
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  country TEXT,
  session_id TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views(path);
CREATE INDEX idx_page_views_country ON public.page_views(country);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_views: deny client read"
  ON public.page_views FOR SELECT TO anon, authenticated USING (false);

-- Usage events
CREATE TABLE public.usage_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  detail TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_usage_events_created ON public.usage_events(created_at DESC);
CREATE INDEX idx_usage_events_type ON public.usage_events(event_type);
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_events: deny client read"
  ON public.usage_events FOR SELECT TO anon, authenticated USING (false);

-- UI text overrides
CREATE TABLE public.ui_texts (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  category TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.ui_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ui_texts: public read"
  ON public.ui_texts FOR SELECT TO anon, authenticated USING (true);

-- Substance overrides (JSONB patch per slug)
CREATE TABLE public.substance_overrides (
  slug TEXT NOT NULL PRIMARY KEY,
  patch JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.substance_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "substance_overrides: public read"
  ON public.substance_overrides FOR SELECT TO anon, authenticated USING (true);
