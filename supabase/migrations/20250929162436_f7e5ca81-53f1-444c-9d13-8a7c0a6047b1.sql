-- Create enum for user types
CREATE TYPE user_type AS ENUM ('citizen', 'authority');

-- Create enum for waste categories
CREATE TYPE waste_category AS ENUM ('biodegradable', 'recyclable', 'hazardous', 'general');

-- Create enum for complaint status
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type user_type NOT NULL DEFAULT 'citizen',
  green_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create waste_reports table for citizen uploads
CREATE TABLE public.waste_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category waste_category,
  confidence_score DECIMAL(3,2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  disposal_instructions TEXT,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table for dirty area reports
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  status complaint_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  coins_earned INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection_centers table
CREATE TABLE public.collection_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  operating_hours TEXT,
  accepted_waste_types waste_category[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard view for top users
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.user_id,
  p.full_name,
  p.green_coins,
  ROW_NUMBER() OVER (ORDER BY p.green_coins DESC) as rank
FROM public.profiles p
WHERE p.user_type = 'citizen'
ORDER BY p.green_coins DESC
LIMIT 100;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for waste_reports
CREATE POLICY "Users can view their own waste reports" ON public.waste_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waste reports" ON public.waste_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authorities can view all waste reports" ON public.waste_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND user_type = 'authority'
    )
  );

-- RLS Policies for complaints
CREATE POLICY "Users can view their own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authorities can view all complaints" ON public.complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND user_type = 'authority'
    )
  );

CREATE POLICY "Authorities can update complaint status" ON public.complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND user_type = 'authority'
    )
  );

-- RLS Policies for collection_centers (public read access)
CREATE POLICY "Everyone can view collection centers" ON public.collection_centers
  FOR SELECT USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample collection centers
INSERT INTO public.collection_centers (name, address, latitude, longitude, phone, operating_hours, accepted_waste_types) VALUES
('Green Valley Recycling Center', 'Sector 15, Phase 2, New Delhi', 28.6139, 77.2090, '+91-98765-43210', '9:00 AM - 6:00 PM', ARRAY['recyclable'::waste_category]),
('Bio-Waste Processing Plant', 'Industrial Area, Gurgaon', 28.4595, 77.0266, '+91-98765-43211', '8:00 AM - 5:00 PM', ARRAY['biodegradable'::waste_category]),
('Hazardous Waste Facility', 'Okhla Phase 3, New Delhi', 28.5355, 77.2732, '+91-98765-43212', '10:00 AM - 4:00 PM', ARRAY['hazardous'::waste_category]),
('Municipal Waste Center', 'Dwarka Sector 12, New Delhi', 28.5921, 77.0460, '+91-98765-43213', '24 Hours', ARRAY['general'::waste_category, 'recyclable'::waste_category]);