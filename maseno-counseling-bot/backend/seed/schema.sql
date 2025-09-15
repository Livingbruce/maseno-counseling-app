CREATE TABLE IF NOT EXISTS counselors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  admission_no TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  year_of_study INT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  counselor_id INT REFERENCES counselors(id) ON DELETE CASCADE,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | confirmed | canceled
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  counselor_id INT REFERENCES counselors(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Drop the existing table
DROP TABLE IF EXISTS activities;

-- Create the new table with correct structure
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  activity_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  counselor_id INT REFERENCES counselors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  price_cents INTEGER NOT NULL,
  pickup_station TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS absence_days (
  id SERIAL PRIMARY KEY,
  counselor_id INT REFERENCES counselors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS peer_applicants (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending | approved | rejected
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS counselor_slots (
  id SERIAL PRIMARY KEY,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Optional: keep updated_at fresh
CREATE OR REPLACE FUNCTION update_slot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_counselor_slots_updated_at ON counselor_slots;

CREATE TRIGGER update_counselor_slots_updated_at
BEFORE UPDATE ON counselor_slots
FOR EACH ROW
EXECUTE PROCEDURE update_slot_updated_at();