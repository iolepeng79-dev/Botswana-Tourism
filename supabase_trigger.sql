-- 1. ENSURE LOCATION STRUCTURE
ALTER TABLE public.locations
DROP CONSTRAINT IF EXISTS location_type_check;

ALTER TABLE public.locations
ADD CONSTRAINT location_type_check
CHECK (type IN ('district','city','town','village','suburb','ward','settlement','location'));

-- 2. INSERT ALL BOTSWANA DISTRICTS
INSERT INTO public.locations (name, type)
VALUES
('South-East','district'),
('Kweneng','district'),
('Kgatleng','district'),
('Southern','district'),
('Central','district'),
('North-East','district'),
('North-West','district'),
('Chobe','district'),
('Ghanzi','district'),
('Kgalagadi','district')
ON CONFLICT DO NOTHING;

-- 3. INSERT TOWNS / VILLAGES
INSERT INTO public.locations (name, type, parent_id)
SELECT town, type,
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

-- 4. AUTO-GENERATE AREAS (WARDS / SUBURBS)
INSERT INTO public.locations (name, type, parent_id)
SELECT
town.name || ' Ward ' || gs AS name,
'ward',
town.id
FROM public.locations town
CROSS JOIN generate_series(1, 20) gs
WHERE town.type IN ('city','town','village')
ON CONFLICT DO NOTHING;

-- 5. AUTO-GENERATE SPECIFIC LOCATIONS
INSERT INTO public.locations (name, type, parent_id)
SELECT
area.name || ' Location ' || gs,
'location',
area.id
FROM public.locations area
CROSS JOIN generate_series(1, 10) gs
WHERE area.type IN ('ward','suburb','settlement')
ON CONFLICT DO NOTHING;

-- 6. ADD REAL KEY TOURISM LOCATIONS
INSERT INTO public.locations (name, type, parent_id)
VALUES
('Okavango Delta Camp','location',(SELECT id FROM locations WHERE name LIKE 'Maun Ward 1')),
('Moremi Game Reserve','location',(SELECT id FROM locations WHERE name LIKE 'Maun Ward 2')),
('Chobe National Park Gate','location',(SELECT id FROM locations WHERE name LIKE 'Kasane Ward 1')),
('Kasane Waterfront','location',(SELECT id FROM locations WHERE name LIKE 'Kasane Ward 2'))
ON CONFLICT DO NOTHING;

-- 7. DATABASE SAFETY (CRITICAL)
ALTER TABLE public.businesses
DROP CONSTRAINT IF EXISTS businesses_location_id_fkey;

ALTER TABLE public.businesses
ADD CONSTRAINT businesses_location_id_fkey
FOREIGN KEY (location_id)
REFERENCES public.locations(id)
ON DELETE SET NULL;

-- 8. AUTO-VALIDATE LOCATION IDs
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

DROP TRIGGER IF EXISTS trg_validate_location ON public.businesses;

CREATE TRIGGER trg_validate_location
BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.validate_location();
