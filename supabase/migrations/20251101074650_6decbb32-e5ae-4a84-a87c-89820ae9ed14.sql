-- Ensure RLS enabled and public read policy for heatmap
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='complaints' AND policyname='public_read_for_heatmap'
  ) THEN
    CREATE POLICY public_read_for_heatmap
      ON public.complaints
      FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Ensure latitude/longitude have appropriate types for Leaflet and fast casting
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='complaints' AND column_name='latitude'
      AND data_type <> 'double precision'
  ) THEN
    ALTER TABLE public.complaints
      ALTER COLUMN latitude TYPE double precision USING latitude::double precision;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='complaints' AND column_name='longitude'
      AND data_type <> 'double precision'
  ) THEN
    ALTER TABLE public.complaints
      ALTER COLUMN longitude TYPE double precision USING longitude::double precision;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_complaints_lat_lon ON public.complaints (latitude, longitude);
