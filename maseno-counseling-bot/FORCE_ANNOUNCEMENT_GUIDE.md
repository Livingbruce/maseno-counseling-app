# 📢 Force Announcement Feature Guide

## Overview
The Force Announcement feature allows counselors to send urgent messages directly to all registered users via Telegram DMs. This bypasses normal announcement channels and ensures immediate delivery to all students.

## 🚀 How It Works

### **Backend Implementation**
1. **Database Storage**: Force announcements are saved to the `announcements` table with `is_force=true` and `sent_to_all=true`
2. **User Retrieval**: Gets all registered users from the `user_sessions` table (Telegram users)
3. **Message Delivery**: Uses the `botSender.js` utility to send messages via Telegram Bot API
4. **Tracking**: Provides detailed statistics on delivery success/failure

### **Frontend Implementation**
1. **Toggle Option**: Checkbox to enable force announcement mode
2. **Enhanced Feedback**: Shows detailed delivery statistics
3. **Visual Indicators**: Different styling for force announcements

## 📋 Features

### **✅ What's Included**
- ✅ Sends DM to ALL registered Telegram users
- ✅ Professional message formatting with sender info
- ✅ Detailed delivery statistics
- ✅ Error handling and retry logic
- ✅ Database logging of all announcements
- ✅ Real-time feedback in dashboard
- ✅ Security validation and rate limiting

### **📊 Delivery Statistics**
The system provides comprehensive statistics:
- **Total Users**: Number of registered users
- **Sent Successfully**: Messages delivered without errors
- **Failed**: Messages that couldn't be delivered
- **Failed Users**: List of users who couldn't receive the message

## 🔧 Technical Details

### **Database Schema**
```sql
-- Announcements table with force announcement support
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS is_force BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sent_to_all BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS counselor_id INT REFERENCES counselors(id);
```

### **Message Format**
```
🚨 **URGENT ANNOUNCEMENT** 🚨

[Your message here]

*From: [Counselor Name]*
*Maseno University Counseling Department*

*This is an urgent message sent to all students.*
```

### **API Endpoint**
```
POST /api/dashboard/announcements/force
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]

{
  "message": "Your urgent announcement message"
}
```

### **Response Format**
```json
{
  "success": true,
  "message": "Force announcement sent successfully",
  "announcement": {
    "id": 123,
    "message": "Your message",
    "counselor_id": 1,
    "is_force": true,
    "sent_to_all": true,
    "created_at": "2025-09-15T09:26:41.000Z"
  },
  "stats": {
    "total_users": 150,
    "sent_successfully": 148,
    "failed": 2,
    "failed_users": [
      {
        "name": "John Doe",
        "telegram_id": 123456789,
        "error": "User blocked the bot"
      }
    ]
  }
}
```

## 🎯 Usage Instructions

### **For Counselors**

1. **Access Announcements Page**
   - Log into the dashboard
   - Navigate to "Announcements" section

2. **Create Force Announcement**
   - Check the "🚨 Force Announcement" checkbox
   - Type your urgent message
   - Click "Post Announcement"

3. **Monitor Delivery**
   - View delivery statistics in the success message
   - Check console logs for detailed information
   - Review failed deliveries if any

### **For Students**
- Students receive the message as a direct message from the bot
- Message includes clear "URGENT ANNOUNCEMENT" header
- Shows sender information and department details

## 🔒 Security Features

### **Access Control**
- Only authenticated counselors can send force announcements
- JWT token validation required
- Rate limiting prevents spam

### **Message Validation**
- Input sanitization prevents XSS attacks
- Message length limits (max 4000 characters)
- Content filtering for inappropriate material

### **Audit Trail**
- All force announcements are logged in database
- Counselor information is tracked
- Delivery statistics are recorded

## 📈 Monitoring & Analytics

### **Console Logs**
```
🚨 Force announcement sent by Victor Mburugu: "make haste"
📊 Sending to 150 registered users
✅ Sent to John Doe (123456789)
❌ Failed to send to Jane Smith (987654321)
📊 Force announcement summary:
   Total users: 150
   Sent successfully: 148
   Failed: 2
```

### **Database Queries**
```sql
-- View all force announcements
SELECT * FROM announcements WHERE is_force = true;

-- Get delivery statistics
SELECT 
  COUNT(*) as total_announcements,
  SUM(CASE WHEN sent_to_all = true THEN 1 ELSE 0 END) as force_announcements
FROM announcements;
```

## 🚨 Best Practices

### **When to Use Force Announcements**
- ✅ Emergency situations
- ✅ Critical deadline changes
- ✅ Important policy updates
- ✅ Campus-wide alerts

### **When NOT to Use**
- ❌ Regular announcements
- ❌ Non-urgent information
- ❌ Personal messages
- ❌ Spam or promotional content

### **Message Guidelines**
- Keep messages concise and clear
- Use professional language
- Include relevant details
- Avoid excessive use of force announcements

## 🔧 Troubleshooting

### **Common Issues**

1. **No Users Receive Messages**
   - Check if users are registered in `user_sessions` table
   - Verify bot token is valid
   - Check if users have blocked the bot

2. **Partial Delivery**
   - Some users may have blocked the bot
   - Network issues can cause temporary failures
   - Check failed users list for details

3. **Database Errors**
   - Ensure announcement columns exist
   - Run migration: `npm run migrate-announcements`
   - Check database connection

### **Debug Commands**
```bash
# Check registered users
SELECT COUNT(*) FROM user_sessions WHERE telegram_user_id IS NOT NULL;

# View recent force announcements
SELECT * FROM announcements WHERE is_force = true ORDER BY created_at DESC LIMIT 5;

# Check bot connectivity
curl -X GET "https://api.telegram.org/bot<BOT_TOKEN>/getMe"
```

## 📞 Support

For technical issues with force announcements:
- Check server logs for error details
- Verify database schema is up to date
- Ensure bot token is valid and active
- Contact system administrator if problems persist

---

**Remember**: Force announcements are powerful tools that reach all students immediately. Use them responsibly and only for truly urgent matters.
