
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS door_window text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pull_type text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS install_type text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS frame_type text;

CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT TO anon USING (true);
