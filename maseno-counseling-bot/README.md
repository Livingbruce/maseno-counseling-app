# 🎓 Maseno Counseling Bot - Fresh Deployment

Complete authentication solution for Maseno University Counseling System.

## ✅ Features

- **Complete Authentication System** with JWT tokens
- **PostgreSQL Database** with full schema
- **React + Vite Frontend** with modern UI
- **RESTful API** with comprehensive endpoints
- **Admin Dashboard** for system management
- **Student Management** system
- **Appointment Scheduling** functionality
- **Announcement System** for communications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maseno-counseling-fresh
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   # Create database
   createdb maseno_counseling
   
   # Run schema
   psql maseno_counseling < database/seed/schema.sql
   
   # Create admin user
   node database/seed/create_admin.js
   ```

5. **Test the system**
   ```bash
   npm test
   ```

6. **Start development**
   ```bash
   npm run dev
   ```

## 🔑 Default Credentials

- **Email**: `admin@maseno.ac.ke`
- **Password**: `123456`
- **Role**: Admin

## 📋 API Endpoints

- `GET /api/` - API status and information
- `GET /api/health` - Health check
- `POST /api/login` - User authentication
- `GET /api/me` - Get current user data
- `GET /api/test` - Test endpoint

## 🏗️ Project Structure

```
maseno-counseling-fresh/
├── api/
│   └── index.js              # Main API server
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utilities and API
│   │   └── styles/          # CSS styles
│   └── package.json
├── database/
│   └── seed/
│       ├── schema.sql       # Database schema
│       └── create_admin.js  # Admin user creation
├── test/
│   └── complete-test.js     # Test suite
├── package.json
├── vercel.json             # Vercel configuration
└── index.html              # Landing page
```

## 🧪 Testing

Run the complete test suite:

```bash
npm test
```

This will test:
- Database connection
- Schema validation
- Admin user verification
- Password hashing
- JWT token generation
- API configuration

## 🚀 Deployment

### Vercel Deployment

1. **Connect to GitHub**
   - Push code to GitHub repository
   - Connect repository to Vercel

2. **Set Environment Variables**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key

3. **Deploy**
   - Vercel will automatically deploy
   - Visit your Vercel URL to test

### Manual Deployment

1. **Build frontend**
   ```bash
   cd frontend && npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3001) | No |
| `VITE_API_URL` | Frontend API URL | No |

### Database Schema

The system includes comprehensive database schema with:
- User management (counselors, students)
- Appointment scheduling
- Announcement system
- Support ticket system
- Activity tracking
- Book management

## 📱 Frontend Features

- **Modern React UI** with responsive design
- **Authentication flow** with login/logout
- **Dashboard** with statistics and quick actions
- **Protected routes** with JWT authentication
- **Error handling** and loading states
- **Mobile responsive** design

## 🔐 Security Features

- **JWT token authentication**
- **Password hashing** with bcrypt
- **CORS configuration**
- **Input validation**
- **SQL injection protection**
- **Environment variable security**

## 🎯 Status

- ✅ **Authentication**: Complete and tested
- ✅ **Database**: Full schema implemented
- ✅ **API**: All endpoints working
- ✅ **Frontend**: Modern React dashboard
- ✅ **Testing**: Comprehensive test suite
- ✅ **Documentation**: Complete setup guide

## 📞 Support

For support or questions:
- Email: admin@maseno.ac.ke
- Documentation: See README.md
- Issues: Create GitHub issue

## 📄 License

MIT License - See LICENSE file for details

---

**Ready for deployment!** 🚀