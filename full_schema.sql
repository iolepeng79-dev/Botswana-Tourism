-- ==========================================
-- SUPABASE FULL SCHEMA FOR THE APPLICATION
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'Tourist', 'Business', 'Guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_status AS ENUM ('Pending', 'Approved', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE location_type AS ENUM ('district', 'city', 'town', 'village', 'suburb', 'ward', 'area', 'kgotla', 'settlement', 'location', 'tourism_area', 'safari_zone', 'special_place');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- Profiles (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    country TEXT,
    role user_role DEFAULT 'Tourist',
    profile_picture TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type location_type NOT NULL,
    parent_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    UNIQUE(name, type, parent_id)
);

-- Packages
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    features JSONB DEFAULT '{}'::jsonb
);

-- Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    status business_status DEFAULT 'Pending',
    admin_comments TEXT,
    bio TEXT,
    mini_bio TEXT,
    price_range TEXT,
    whatsapp TEXT,
    office_line TEXT,
    email TEXT NOT NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    location_name TEXT,
    area_name TEXT,
    district_name TEXT,
    settlement_name TEXT,
    region_name TEXT,
    verified_location BOOLEAN DEFAULT FALSE,
    manual_address TEXT,
    latitude TEXT,
    longitude TEXT,
    package_id TEXT REFERENCES public.packages(id) DEFAULT 'basic',
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    owner_name TEXT,
    profile_picture TEXT,
    documents TEXT[], -- Array of URLs for compliance (e.g. BTO certs)
    payment_proof TEXT, -- URL for package payment
    category TEXT NOT NULL,
    media JSONB DEFAULT '[]'::jsonb, -- Photos/Videos gallery
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings (Specific services offered by businesses)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    category TEXT,
    rating DECIMAL(2,1),
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    listing_title TEXT,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    booking_date TIMESTAMPTZ NOT NULL,
    duration TEXT,
    amount DECIMAL(10,2),
    status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_picture TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    image_url TEXT,
    start_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package Upgrade Requests
CREATE TABLE IF NOT EXISTS public.package_upgrade_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    current_package TEXT,
    requested_package TEXT,
    payment_proof_url TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_comments TEXT,
    payment_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Analytics
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods (Admin defined)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    instructions TEXT
);

-- 4. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('verification-docs', 'verification-docs', true),
    ('business-gallery', 'business-gallery', true),
    ('profile-pictures', 'profile-pictures', true),
    ('promotions', 'promotions', true),
    ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Allow public read, authenticated upload)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('verification-docs', 'business-gallery', 'profile-pictures', 'promotions', 'listings'));
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. INITIAL DATA

-- Packages
INSERT INTO public.packages (id, name, price, features) VALUES
('basic', 'Basic Plan', 0, '{"photos_allowed": 1, "videos_allowed": 0, "promotions_allowed": 0, "analytics": false, "priority_listing": false}'),
('professional', 'Professional Plan', 280, '{"photos_allowed": 8, "videos_allowed": 2, "promotions_allowed": 3, "analytics": true, "priority_listing": false}'),
('enterprise', 'Enterprise Plan', 500, '{"photos_allowed": 20, "videos_allowed": 5, "promotions_allowed": 10, "analytics": true, "priority_listing": true}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, features = EXCLUDED.features;

-- Payment Methods
INSERT INTO public.payment_methods (id, name, account_number, instructions) VALUES
('fnb', 'FNB Bank', '63028544822', 'Use your registered Business Name as the reference. Send proof of payment below.'),
('orange_money', 'Orange Money', '72468080', 'Send to Orange Money number 72468080. Include Business Name in the reference.'),
('smega', 'BTC Smega', '73253410', 'Send to Smega number 73253410.'),
('myzaka', 'Mascom MyZaka', '75666237', 'Send to Mascom MyZaka number 75666237.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, account_number = EXCLUDED.account_number, instructions = EXCLUDED.instructions;

-- 6. TRIGGERS, FUNCTIONS & SEED DATA (CONSOLIDATED)

-- Ensure location type constraint matches enum
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS location_type_check;
ALTER TABLE public.locations ADD CONSTRAINT location_type_check CHECK (type::text IN ('district','city','town','village','suburb','ward','settlement','location','tourism_area','safari_zone','special_place'));

-- A. PRE-POPULATE LOCATIONS (DISTRICTS)
INSERT INTO public.locations (name, type) VALUES
('South-East','district'), ('Kweneng','district'), ('Kgatleng','district'), ('Southern','district'), ('Central','district'),
('North-East','district'), ('North-West','district'), ('Chobe','district'), ('Ghanzi','district'), ('Kgalagadi','district')
ON CONFLICT (name, type, parent_id) DO NOTHING;

-- B. INSERT TOWNS / VILLAGES
INSERT INTO public.locations (name, type, parent_id)
SELECT town, type::location_type,
(SELECT id FROM locations WHERE name = district AND type='district')
FROM (VALUES
('South-East','Gaborone','city'),
('South-East','Tlokweng','village'),
('South-East','Ramotswa','village'),
('Kweneng','Molepolole','village'),
('Kweneng','Thamaga','village'),
('North-West','Maun','town'),
('North-West','Shakawe','village'),
('Chobe','Kasane','town'),
('Chobe','Kachikau','village'),
('Central','Serowe','village'),
('Central','Palapye','town'),
('Central','Mahalapye','town'),
('Southern','Kanye','village'),
('Southern','Moshupa','village'),
('Kgatleng','Mochudi','village'),
('North-East','Francistown','city'),
('Ghanzi','Ghanzi','town'),
('Kgalagadi','Tsabong','village')
) AS t(district, town, type)
ON CONFLICT DO NOTHING;

-- C. AUTO-GENERATE AREAS (WARDS / SUBURBS)
INSERT INTO public.locations (name, type, parent_id)
SELECT 
  town.name || ' Ward ' || gs AS name,
  'ward',
  town.id
FROM public.locations town
CROSS JOIN generate_series(1, 10) gs
WHERE town.type IN ('city','town','village')
ON CONFLICT DO NOTHING;

-- D. AUTO-GENERATE SPECIFIC LOCATIONS
INSERT INTO public.locations (name, type, parent_id)
SELECT
  area.name || ' Location ' || gs,
  'location',
  area.id
FROM public.locations area
CROSS JOIN generate_series(1, 5) gs
WHERE area.type IN ('ward','suburb','settlement')
ON CONFLICT DO NOTHING;

-- E. ADD REAL KEY TOURISM LOCATIONS
INSERT INTO public.locations (name, type, parent_id)
VALUES
('Okavango Delta Camp','location',(SELECT id FROM locations WHERE name LIKE 'Maun Ward 1' LIMIT 1)),
('Moremi Game Reserve','location',(SELECT id FROM locations WHERE name LIKE 'Maun Ward 2' LIMIT 1)),
('Chobe National Park Gate','location',(SELECT id FROM locations WHERE name LIKE 'Kasane Ward 1' LIMIT 1)),
('Kasane Waterfront','location',(SELECT id FROM locations WHERE name LIKE 'Kasane Ward 2' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Validation Trigger for Location IDs
CREATE OR REPLACE FUNCTION public.validate_location()
RETURNS trigger AS $$
BEGIN
    IF NEW.location_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.locations WHERE id = NEW.location_id
    ) THEN
        NEW.location_id := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_location') THEN
    CREATE TRIGGER trg_validate_location
      BEFORE INSERT OR UPDATE ON public.businesses
      FOR EACH ROW EXECUTE FUNCTION public.validate_location();
  END IF;
END $$;

-- Profiles update on Auth User change
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, COALESCE((new.raw_user_meta_data->>'role')::user_role, 'Tourist'));
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
