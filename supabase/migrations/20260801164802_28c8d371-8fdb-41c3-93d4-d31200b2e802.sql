CREATE TABLE public.post_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text,
  pseudonym text,
  contact text,
  status text not null default 'new',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT ALL ON public.post_submissions TO service_role;

ALTER TABLE public.post_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no client select post_submissions" ON public.post_submissions FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "no client insert post_submissions" ON public.post_submissions FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "no client update post_submissions" ON public.post_submissions FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no client delete post_submissions" ON public.post_submissions FOR DELETE TO anon, authenticated USING (false);

CREATE TRIGGER trg_post_submissions_updated_at BEFORE UPDATE ON public.post_submissions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();