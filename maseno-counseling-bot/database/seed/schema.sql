-- Maseno Counseling Bot Database Schema
-- Complete schema with all working components

CREATE TABLE IF NOT EXISTS counselors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  phone VARCHAR(20),
  specialization TEXT,
  bio TEXT,
  office_location TEXT,
  office_hours TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
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
  telegram_user_id BIGINT,
  telegram_username TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  counselor_id INT REFERENCES counselors(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  title TEXT,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
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

-- User sessions for bot integration
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Support system
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  student_name TEXT,
  admission_no TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT DEFAULT 'open', -- open, in_progress, replied, resolved, closed
  assigned_counselor_id INT REFERENCES counselors(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'student' or 'counselor'
  sender_id BIGINT NOT NULL, -- telegram_user_id for students, counselor.id for counselors
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  notification_type TEXT NOT NULL, -- '1_day_before', '1_hour_before'
  scheduled_for TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_counselor_slots_updated_at ON counselor_slots;
CREATE TRIGGER update_counselor_slots_updated_at
BEFORE UPDATE ON counselor_slots
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_counselors_updated_at ON counselors;
CREATE TRIGGER update_counselors_updated_at
BEFORE UPDATE ON counselors
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON user_sessions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Insert default support categories
INSERT INTO support_categories (name, description) VALUES
('Technical', 'Issues with the app, website, or technical problems'),
('Academic', 'School work, grades, exams, assignments'),
('Personal', 'Personal issues, stress, relationships, mental health'),
('General', 'General questions or other concerns')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_counselors_email ON counselors(email);
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);
CREATE INDEX IF NOT EXISTS idx_appointments_student_id ON appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_counselor_id ON appointments(counselor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_ts ON appointments(start_ts);
CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_telegram_user_id ON support_tickets(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
