-- Add missing columns to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS is_force BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sent_to_all BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS counselor_id INT REFERENCES counselors(id) ON DELETE SET NULL;

-- Update existing announcements to have default values
UPDATE announcements 
SET is_force = false, sent_to_all = false 
WHERE is_force IS NULL OR sent_to_all IS NULL;
