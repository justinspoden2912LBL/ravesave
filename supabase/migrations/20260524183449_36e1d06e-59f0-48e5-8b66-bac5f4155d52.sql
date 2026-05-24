-- Feature Flags: pro Seite/Funktion an- oder abschaltbar
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  page text NOT NULL,
  label text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Öffentlich lesbar (App fragt Flags ab)
CREATE POLICY "feature_flags: public read"
  ON public.feature_flags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-Schreibzugriff läuft serverseitig über service_role (umgeht RLS),
-- daher keine zusätzliche INSERT/UPDATE/DELETE Policy nötig.

CREATE TRIGGER feature_flags_set_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed: die wichtigsten Seiten/Funktionen
INSERT INTO public.feature_flags (key, page, label, description, enabled) VALUES
  ('page.mix',           'mix',           'Mix-Rechner',          'Substanz-Kombinationen prüfen', true),
  ('page.substances',    'substances',    'Substanz-Wiki',         'Übersicht & Detailseiten zu Substanzen', true),
  ('page.checkliste',    'checkliste',    'Checkliste',            'Vor-, Während-, Nach-Konsum Checks', true),
  ('page.risks',         'risks',         'Risiken',               'Risiko-Übersicht', true),
  ('page.akut',          'akut',          'Akut-Coach',            'Geführte Akut-Hilfe mit AI', true),
  ('page.notfall',       'notfall',       'Notfall-Infos',         'Notrufnummern & Erste-Hilfe', true),
  ('page.chat',          'chat',          'AI-Chat',               'Freier Chat mit Safer-Use-AI', true),
  ('page.drugchecking',  'drugchecking',  'Drugchecking',          'Drugchecking-Stellen', true),
  ('page.reagenztest',   'reagenztest',   'Reagenz-Tests',         'Marquis/Mecke/Simon-Anleitung', true),
  ('page.knigge',        'knigge',        'Rave-Knigge',           'Verhaltensregeln auf Events', true),
  ('page.tolerance',     'tolerance',     'Toleranz',              'Toleranz-Tracker', true),
  ('page.aftercare',     'aftercare',     'Aftercare',             'Erholung nach Konsum', true),
  ('page.log',           'log',           'Konsum-Log',            'Persönliches Log', true),
  ('page.safety-plan',   'safety-plan',   'Safety-Plan',           'Persönlicher Safety-Plan', true),
  ('page.erfahrungen',   'erfahrungen',   'Erfahrungen/Blog',      'Beiträge & Erfahrungen', true),
  ('page.stats',         'stats',         'Statistik (öffentlich)','Öffentliche Stat-Seite', true),
  ('page.install',       'install',       'App installieren',      'PWA-Install-Anleitung', true),
  ('page.about',         'about',         'Über uns',              'About-Seite', true);
