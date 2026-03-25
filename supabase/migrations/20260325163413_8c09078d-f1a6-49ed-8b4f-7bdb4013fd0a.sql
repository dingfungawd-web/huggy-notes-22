
CREATE TABLE public.estate_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_name text NOT NULL,
  canonical_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(alias_name)
);

ALTER TABLE public.estate_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read aliases" ON public.estate_aliases FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can insert aliases" ON public.estate_aliases FOR INSERT TO authenticated WITH CHECK (true);

-- Seed with known aliases
INSERT INTO public.estate_aliases (alias_name, canonical_name) VALUES
  ('PY', 'Park YOHO'),
  ('py', 'Park YOHO'),
  ('Prak yoho', 'Park YOHO'),
  ('元朗Prak yoho', 'Park YOHO');
