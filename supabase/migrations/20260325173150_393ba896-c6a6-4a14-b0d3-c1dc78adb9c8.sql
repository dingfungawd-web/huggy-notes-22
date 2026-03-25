CREATE OR REPLACE FUNCTION public.search_orders_by_terms(search_terms text[])
RETURNS TABLE (
  package_note text,
  model text,
  door_window text,
  frame_color text,
  fabric_color text,
  location text,
  width_mm numeric,
  height_mm numeric,
  pull_type text,
  install_type text,
  frame_type text
) AS $$
  SELECT
    o.package_note,
    o.model,
    o.door_window,
    o.frame_color,
    o.fabric_color,
    o.location,
    o.width_mm,
    o.height_mm,
    o.pull_type,
    o.install_type,
    o.frame_type
  FROM public.orders o
  WHERE EXISTS (
    SELECT 1 FROM unnest(search_terms) AS t
    WHERE lower(replace(o.package_note, ' ', '')) LIKE '%' || t || '%'
  )
$$ LANGUAGE sql STABLE;