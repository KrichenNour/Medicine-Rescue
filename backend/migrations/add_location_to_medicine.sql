-- Add location and donor information to medicine table
ALTER TABLE medicine 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS donor_name TEXT,
ADD COLUMN IF NOT EXISTS donor_address TEXT,
ADD COLUMN IF NOT EXISTS donor_type TEXT,
ADD COLUMN IF NOT EXISTS working_hours TEXT;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_medicine_location ON medicine(latitude, longitude);

-- Add comment
COMMENT ON COLUMN medicine.latitude IS 'Latitude coordinate of the donor location';
COMMENT ON COLUMN medicine.longitude IS 'Longitude coordinate of the donor location';
COMMENT ON COLUMN medicine.donor_name IS 'Name of the donor (hospital, pharmacy, clinic, etc.)';
COMMENT ON COLUMN medicine.donor_address IS 'Full address of the donor';
COMMENT ON COLUMN medicine.donor_type IS 'Type of donor: Pharmacy, Clinic, Hospital, NGO, etc.';
COMMENT ON COLUMN medicine.working_hours IS 'Working hours of the donor location';
