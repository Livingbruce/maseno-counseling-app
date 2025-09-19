# Backend API Endpoints Needed for Dashboard Features

## Profile Management
- `PUT /api/counselors/profile` - Update counselor profile information
- `GET /api/counselors/profile` - Get current counselor profile

## Contact Information Management
- `GET /api/contacts` - Get contact information
- `PUT /api/contacts` - Update contact information

## Department Information Management
- `GET /api/department` - Get department information
- `PUT /api/department` - Update department information

## Support Ticket Management
- `GET /api/support/tickets` - Get all support tickets
- `POST /api/support/tickets/:id/reply` - Reply to a support ticket
- `PUT /api/support/tickets/:id/status` - Update ticket status

## Force Announcements
- `POST /api/dashboard/announcements/force` - Send force announcement to all students

## Appointment Management
- `DELETE /api/dashboard/appointments/:id/delete` - Delete canceled appointments

## Internal Notifications (Counselors Only)
- `GET /api/notifications/counselor` - Get counselor notifications
- `POST /api/notifications/counselor` - Send internal notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## Database Tables Needed

### counselors table (update existing)
```sql
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS office_location TEXT;
ALTER TABLE counselors ADD COLUMN IF NOT EXISTS office_hours TEXT;
```

### contacts table
```sql
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  office_phone VARCHAR(20),
  email VARCHAR(255),
  office_location TEXT,
  website VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  instagram VARCHAR(255),
  office_hours TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### department_info table
```sql
CREATE TABLE IF NOT EXISTS department_info (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(255),
  location VARCHAR(255),
  building VARCHAR(255),
  floor VARCHAR(100),
  room_number VARCHAR(50),
  directions TEXT,
  landmarks TEXT,
  parking_info TEXT,
  accessibility_info TEXT,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  operating_hours TEXT,
  services_offered TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### counselor_notifications table
```sql
CREATE TABLE IF NOT EXISTS counselor_notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  target_counselor VARCHAR(50) DEFAULT 'all',
  sender_id INTEGER REFERENCES counselors(id),
  sender_name VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### announcements table (update existing)
```sql
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_force BOOLEAN DEFAULT FALSE;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS sent_to_all BOOLEAN DEFAULT FALSE;
```
