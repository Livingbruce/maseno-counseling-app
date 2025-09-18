# 🤖 Maseno Counseling Bot Setup Guide

## 🎯 What Your Bot Can Do

Your Telegram bot provides comprehensive counseling services:

### 📱 **Student Features:**
- **📅 Book Appointments** - Easy appointment booking with counselors
- **❌ Cancel Appointments** - Cancel existing appointments
- **📋 My Appointments** - View all booked appointments
- **👥 Counselors** - See available counselors
- **📢 Announcements** - Read important announcements
- **🗓 Activities** - View counseling activities and events
- **📚 Books for Sale** - Browse available books
- **🆘 Support** - Get help with any issues
- **📞 Contact** - Office information and contact details
- **ℹ️ Help** - Get assistance with using the bot

### 🔧 **Admin Features:**
- **Dashboard Management** - Full admin control via web dashboard
- **Appointment Management** - View and manage all appointments
- **Support Ticket System** - Handle student support requests
- **Announcement System** - Send announcements to students
- **Analytics** - Track counseling statistics

## 🚀 Setup Instructions

### Step 1: Create Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send:** `/newbot`
4. **Enter bot name:** `Maseno Counseling Bot`
5. **Enter username:** `maseno_counseling_bot` (must end with `_bot`)
6. **Copy the token** you receive (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Configure Environment

Create `backend/.env` file with:

```env
# Database Configuration
DATABASE_URL=your-database-connection-string-here

# JWT Secret
JWT_SECRET=maseno-counseling-super-secret-jwt-key-2024

# Telegram Bot Token (from BotFather)
BOT_TOKEN=your-telegram-bot-token-here

# Server Configuration
PORT=4000
NODE_ENV=development

# Security
DEBUG_DB=false
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Start the Bot

```bash
cd backend
npm run dev
```

## 🎉 You're Ready!

Once running, your bot will:
- ✅ **Respond to `/start`** with welcome message
- ✅ **Show interactive keyboard** with all features
- ✅ **Handle appointment booking** automatically
- ✅ **Manage support tickets** seamlessly
- ✅ **Send announcements** to students
- ✅ **Connect to your dashboard** for admin management

## 📱 How Students Use It

1. **Search for your bot** on Telegram using its username
2. **Send `/start`** to begin
3. **Use the keyboard buttons** to navigate features
4. **Book appointments** by following the guided process
5. **Get support** whenever needed

## 🔧 Admin Management

- **Web Dashboard:** https://maseno-counseling-bot.vercel.app/
- **Login:** vicymbrush@gmail.com / Victor254
- **Manage everything** from the web interface

## 🆘 Troubleshooting

**Bot not responding?**
- Check if `BOT_TOKEN` is correct
- Ensure database connection is working
- Verify the bot is running (`npm run dev`)

**Database errors?**
- Check `DATABASE_URL` is correct
- Ensure database is accessible
- Run database migrations if needed

## 🎯 Next Steps

1. **Create your bot** with BotFather
2. **Set up the environment** file
3. **Start the bot** locally
4. **Test with students** by sharing the bot username
5. **Deploy to production** when ready

Your Maseno Counseling Bot is ready to help students! 🚀
