-- Create user roles table for secure role management
CREATE TYPE public.app_role AS ENUM ('citizen', 'admin');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Green coins transaction history
CREATE TABLE IF NOT EXISTS public.green_coins_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  coins INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
  related_report_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.green_coins_transactions ENABLE ROW LEVEL SECURITY;

-- Rewards store
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cost_in_coins INTEGER NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Reward redemptions
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for green_coins_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.green_coins_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON public.green_coins_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
  ON public.green_coins_transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rewards
CREATE POLICY "Everyone can view available rewards"
  ON public.rewards FOR SELECT
  USING (available = true);

CREATE POLICY "Admins can manage rewards"
  ON public.rewards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reward_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards"
  ON public.reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for report images
CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

-- Trigger to auto-assign citizen role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Function to update green coins and create transaction
CREATE OR REPLACE FUNCTION public.update_user_coins(
  _user_id UUID,
  _coins INTEGER,
  _action TEXT,
  _type TEXT,
  _report_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile coins
  UPDATE profiles
  SET green_coins = green_coins + _coins
  WHERE user_id = _user_id;
  
  -- Create transaction record
  INSERT INTO green_coins_transactions (user_id, action, coins, transaction_type, related_report_id)
  VALUES (_user_id, _action, ABS(_coins), _type, _report_id);
END;
$$;

-- Trigger to award coins when complaint is resolved
CREATE OR REPLACE FUNCTION public.award_coins_on_resolution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    PERFORM public.update_user_coins(
      NEW.user_id,
      NEW.coins_earned,
      'Report resolved: ' || NEW.title,
      'earned',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_complaint_resolved
  AFTER UPDATE ON complaints
  FOR EACH ROW
  WHEN (NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved')
  EXECUTE FUNCTION public.award_coins_on_resolution();