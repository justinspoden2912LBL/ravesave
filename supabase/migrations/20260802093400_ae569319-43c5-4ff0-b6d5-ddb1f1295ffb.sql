CREATE TABLE public.site_theme (
  key text NOT NULL PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  draft_value text,
  label text,
  category text NOT NULL DEFAULT 'color',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_theme TO anon, authenticated;
GRANT ALL ON public.site_theme TO service_role;

ALTER TABLE public.site_theme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_theme: public read" ON public.site_theme
  FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER site_theme_set_updated_at
  BEFORE UPDATE ON public.site_theme
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.admin_change_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool text NOT NULL,
  target text NOT NULL,
  old_value text,
  new_value text,
  summary text,
  reverted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_change_log TO service_role;

ALTER TABLE public.admin_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no client read admin_change_log" ON public.admin_change_log
  FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "no client insert admin_change_log" ON public.admin_change_log
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "no client update admin_change_log" ON public.admin_change_log
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no client delete admin_change_log" ON public.admin_change_log
  FOR DELETE TO anon, authenticated USING (false);

CREATE TRIGGER admin_change_log_set_updated_at
  BEFORE UPDATE ON public.admin_change_log
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.site_theme (key, value, label, category) VALUES
  ('primary', '', 'Primärfarbe (HSL, z. B. 25 95% 55%)', 'color'),
  ('accent', '', 'Akzentfarbe (HSL)', 'color'),
  ('background', '', 'Hintergrund (HSL)', 'color'),
  ('foreground', '', 'Textfarbe (HSL)', 'color'),
  ('radius', '', 'Ecken-Rundung (z. B. 1rem)', 'shape'),
  ('font-scale', '', 'Schrift-Skalierung (z. B. 1.05)', 'shape'),
  ('glass-opacity', '', 'Glas-Effekt Deckkraft (0-1)', 'effect');