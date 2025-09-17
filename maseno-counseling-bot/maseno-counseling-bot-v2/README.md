# Maseno Counseling Bot

A comprehensive counseling management system for Maseno University with a Telegram bot and web dashboard.

## Project Structure

```
maseno-counseling-bot/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── bot.js          # Telegram bot logic
│   │   ├── index.js        # Express server
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Security & auth middleware
│   │   └── utils/          # Utility functions
│   └── seed/               # Database setup scripts
├── dashboard/              # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── styles/         # CSS files
│   └── index.html          # Main HTML file
└── README.md
```

## Features

- **Telegram Bot**: Student counseling and appointment booking
- **Web Dashboard**: Counselor management interface
- **Appointment System**: Schedule and manage counseling sessions
- **Support Tickets**: Student support system
- **Announcements**: Force announcements to all users
- **Security**: Comprehensive security measures

## Quick Start

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Configure .env with your database and bot token
   npm run init-db
   npm start
   ```

2. **Dashboard Setup:**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

## Environment Variables

Create `.env` files in both `backend/` and `dashboard/` directories with the required configuration.

## Database

PostgreSQL database with comprehensive schema for users, appointments, tickets, and more.
