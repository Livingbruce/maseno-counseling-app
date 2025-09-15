-- Add missing columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create support_tickets table
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

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'student' or 'counselor'
  sender_id BIGINT NOT NULL, -- telegram_user_id for students, counselor.id for counselors
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Create support_categories table
CREATE TABLE IF NOT EXISTS support_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Create notifications table
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

-- Insert default support categories
INSERT INTO support_categories (name, description) VALUES
('Technical', 'Issues with the app, website, or technical problems'),
('Academic', 'School work, grades, exams, assignments'),
('Personal', 'Personal issues, stress, relationships, mental health'),
('General', 'General questions or other concerns')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_telegram_user_id ON support_tickets(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_appointments_telegram_user_id ON appointments(telegram_user_id);
