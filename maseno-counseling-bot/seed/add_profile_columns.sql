-- Add missing profile columns to counselors table
ALTER TABLE counselors 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS office_location TEXT,
ADD COLUMN IF NOT EXISTS office_hours TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_counselor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_counselors_updated_at ON counselors;

CREATE TRIGGER update_counselors_updated_at
BEFORE UPDATE ON counselors
FOR EACH ROW
EXECUTE PROCEDURE update_counselor_updated_at();
