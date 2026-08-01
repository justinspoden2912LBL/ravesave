CREATE TABLE public.ai_settings (
  id text PRIMARY KEY DEFAULT 'default',
  enabled boolean NOT NULL DEFAULT true,
  provider text NOT NULL DEFAULT 'auto',
  model text NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  fallback_model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  temperature numeric NOT NULL DEFAULT 0.6,
  max_messages integer NOT NULL DEFAULT 60,
  rate_limit_per_min integer NOT NULL DEFAULT 20,
  answer_style text NOT NULL DEFAULT 'normal',
  extra_rules text NOT NULL DEFAULT '',
  blocked_topics text NOT NULL DEFAULT '',
  disabled_message text NOT NULL DEFAULT 'Marleen ist gerade offline. Die Infos in der App bleiben verfügbar — bei akuter Gefahr: 112.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.ai_settings TO service_role;

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.ai_settings (id) VALUES ('default');

CREATE TRIGGER ai_settings_set_updated_at
BEFORE UPDATE ON public.ai_settings
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();