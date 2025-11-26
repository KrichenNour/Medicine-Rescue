-- Enable pgcrypto extension (needed for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create medicine table
CREATE TABLE IF NOT EXISTS medicine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  quantity_unit TEXT,
  expiry_date DATE,
  distance_km NUMERIC,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
