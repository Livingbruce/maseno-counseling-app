# Maseno Counseling Bot

A complete authentication solution for Maseno University's counseling services.

## Features

- 🔐 User Authentication (Login/Logout)
- 👤 User Profile Management
- 🎓 Admin Dashboard
- 📱 Responsive Design
- 🔒 Secure JWT Authentication

## Tech Stack

- **Frontend**: React.js, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Render

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd maseno-counseling-bot
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Update `.env` with your database credentials:
```
DATABASE_URL=postgresql://username:password@hostname:port/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=5000
```

5. Build the frontend:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

## Demo Credentials

- **Email**: admin@maseno.ac.ke
- **Password**: 123456

## API Endpoints

- `GET /api/` - API status
- `GET /api/health` - Health check
- `POST /api/login` - User login
- `GET /api/me` - Get user profile

## Deployment on Render

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Create a PostgreSQL database on Render
4. Set environment variables in Render dashboard
5. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NODE_ENV` | Environment (production/development) | No |
| `PORT` | Server port (Render sets this) | No |

## License

MIT License - see LICENSE file for details.