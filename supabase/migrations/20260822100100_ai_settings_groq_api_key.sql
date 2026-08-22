-- Admin kann den Groq-Key im Panel speichern.
ALTER TABLE public.ai_settings
ADD COLUMN IF NOT EXISTS groq_api_key text NOT NULL DEFAULT '';
