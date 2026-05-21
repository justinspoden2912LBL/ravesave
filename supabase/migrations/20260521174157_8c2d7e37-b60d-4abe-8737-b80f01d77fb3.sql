CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert site content" ON public.site_content
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site content" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site content" ON public.site_content
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_content (key, content) VALUES
('about_intro', E'Ich habe selbst Erfahrungen mit über **84 psychoaktiven Substanzen** gemacht — über praktisch jeden denkbaren Applikationsweg. Diese Reise hat mir eines sehr deutlich gezeigt: Konsum kann Genuss, Verbindung und tiefe Selbsterkenntnis bedeuten — und im selben Atemzug ernsthaft gefährlich werden.\n\nGenau deshalb gibt es dieses Tool. Es soll dir helfen, in wenigen Sekunden einzuschätzen, was du gerade vorhast: Welche Wechselwirkungen sind kritisch, welche Dosis ist realistisch, worauf solltest du achten. Ziel ist nicht, dir irgendwas auszureden — sondern dass du eine gute, bewusste Erfahrung machst und das Risiko dabei so klein wie möglich hältst.');