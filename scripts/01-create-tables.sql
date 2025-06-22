-- Create profiles table to extend Supabase auth users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treks table
CREATE TABLE IF NOT EXISTS treks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  duration TEXT,
  difficulty TEXT,
  price DECIMAL(10,2),
  overview TEXT,
  highlights TEXT[],
  who_can_participate TEXT,
  itinerary JSONB,
  how_to_reach TEXT,
  cost_terms TEXT,
  trek_essentials TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  trek_id INTEGER REFERENCES treks(id),
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trek_date DATE,
  total_participants INTEGER,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  is_primary_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  valid_until DATE,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view participants of own bookings" ON participants FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert participants for own bookings" ON participants FOR INSERT WITH CHECK (
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own vouchers" ON vouchers FOR SELECT USING (auth.uid() = user_id);

-- Treks are public for viewing
CREATE POLICY "Anyone can view treks" ON treks FOR SELECT TO public USING (true);
