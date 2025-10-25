-- Trigger to award coins when a complaint is marked as resolved
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_award_coins_on_resolution'
  ) THEN
    CREATE TRIGGER trg_award_coins_on_resolution
    AFTER UPDATE ON public.complaints
    FOR EACH ROW
    WHEN (NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved')
    EXECUTE FUNCTION public.award_coins_on_resolution();
  END IF;
END $$;

-- Ensure updated_at gets refreshed on updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_complaints_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;