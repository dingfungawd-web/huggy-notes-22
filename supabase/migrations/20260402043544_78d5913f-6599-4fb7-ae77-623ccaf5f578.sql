
-- Table to store search count
CREATE TABLE public.search_stats (
  id integer PRIMARY KEY DEFAULT 1,
  count bigint NOT NULL DEFAULT 0
);

-- Insert initial row
INSERT INTO public.search_stats (id, count) VALUES (1, 0);

-- Enable RLS
ALTER TABLE public.search_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Anyone can read search_stats" ON public.search_stats FOR SELECT TO anon, authenticated USING (true);

-- Function to atomically increment and return new count
CREATE OR REPLACE FUNCTION public.increment_search_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.search_stats SET count = count + 1 WHERE id = 1 RETURNING count;
$$;
