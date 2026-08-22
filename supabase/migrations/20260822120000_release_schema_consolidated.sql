-- Release 2026-08-22: Consolidated schema for Ravesave
-- Tables: substances, mix_risks, sessions, checklist_entries, safety_plans

-- Substanzen
CREATE TABLE IF NOT EXISTS public.substances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- e.g., 'Stimulans', 'Depressiv', 'Psychedelisch', 'Dissoziativ'
  typical_dose_min_mg NUMERIC,
  typical_dose_max_mg NUMERIC,
  duration_hours NUMERIC,
  comedown_hours NUMERIC,
  risks TEXT[],
  harm_reduction_tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mischkonsum-Risiken
CREATE TABLE IF NOT EXISTS public.mix_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  substance_a UUID NOT NULL REFERENCES public.substances(id) ON DELETE CASCADE,
  substance_b UUID NOT NULL REFERENCES public.substances(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'very_high'
  description TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(substance_a, substance_b)
);

-- Sessions (Konsum-Protokolle)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  substances_used UUID[] REFERENCES public.substances(id),
  doses JSONB, -- {substance_id: dose_in_mg}
  subjective_effects TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkliste-EintrÃ¤ge
CREATE TABLE IF NOT EXISTS public.checklist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL, -- e.g., 'stable_mentally', 'know_effects', 'food_water', 'sober_person', 'ice_contacts', 'er_route'
  checked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, item_key)
);

-- Safety Plans
CREATE TABLE IF NOT EXISTS public.safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  nearest_hospital_name TEXT,
  nearest_hospital_address TEXT,
  personal_triggers TEXT[],
  calming_strategies TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (basic, adjust as needed)
ALTER TABLE public.substances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mix_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;

-- Substances: read for all, write for authenticated
CREATE POLICY "Substances readable by all" ON public.substances
  FOR SELECT USING (true);

CREATE POLICY "Substances writable by authenticated" ON public.substances
  FOR ALL USING (auth.role() = 'authenticated');

-- Mix risks: read for all
CREATE POLICY "Mix risks readable by all" ON public.mix_risks
  FOR SELECT USING (true);

-- Sessions: user can only see their own
CREATE POLICY "Sessions user can see own" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

-- Checklist: via session ownership
CREATE POLICY "Checklist via session" ON public.checklist_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Safety plans: via session ownership
CREATE POLICY "Safety plans via session" ON public.safety_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_substances_category ON public.substances(category);
CREATE INDEX IF NOT EXISTS idx_mix_risks_substance_a ON public.mix_risks(substance_a);
CREATE INDEX IF NOT EXISTS idx_mix_risks_substance_b ON public.mix_risks(substance_b);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_entries_session_id ON public.checklist_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_session_id ON public.safety_plans(session_id);
