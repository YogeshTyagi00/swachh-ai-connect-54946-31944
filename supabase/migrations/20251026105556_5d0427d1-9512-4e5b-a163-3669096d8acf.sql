-- Create eco_actions table for daily eco activities
CREATE TABLE IF NOT EXISTS public.eco_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  coins INTEGER NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_eco_actions table to track completed actions per user
CREATE TABLE IF NOT EXISTS public.user_eco_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES public.eco_actions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  coins_earned INTEGER NOT NULL
);

-- Enable RLS on eco_actions
ALTER TABLE public.eco_actions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_eco_actions
ALTER TABLE public.user_eco_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for eco_actions (everyone can view)
CREATE POLICY "Everyone can view eco actions"
ON public.eco_actions
FOR SELECT
TO authenticated
USING (true);

-- RLS policies for user_eco_actions
CREATE POLICY "Users can view their own completed actions"
ON public.user_eco_actions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed actions"
ON public.user_eco_actions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Insert default eco actions
INSERT INTO public.eco_actions (title, description, coins, icon) VALUES
  ('Used reusable bottle', 'Avoid single-use plastic', 2, 'Droplet'),
  ('Segregated waste', 'Separate wet and dry waste', 5, 'Trash2'),
  ('Walked instead of driving', 'Reduce carbon footprint', 3, 'Footprints'),
  ('Composted food waste', 'Turn organic waste into fertilizer', 5, 'Leaf'),
  ('Recycled plastic', 'Proper plastic disposal', 4, 'Recycle'),
  ('Planted a tree', 'Contribute to green cover', 10, 'Trees')
ON CONFLICT DO NOTHING;