# 🚀 Render Deployment Guide (Backup Option)

## 📋 If Railway Keeps Failing, Use Render:

### Step 1: Go to Render
1. **Open**: https://render.com
2. **Sign up with GitHub**
3. **Connect your GitHub account**

### Step 2: Create New Web Service
1. **Click "New +"**
2. **Select "Web Service"**
3. **Connect your GitHub repository**
4. **Choose**: `maseno-counseling-bot`

### Step 3: Configure Service
1. **Name**: `maseno-counseling-bot`
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment**: `Node`

### Step 4: Add Environment Variables
In the Environment Variables section:

```
BOT_TOKEN=8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ
DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=maseno-counseling-bot-secret-key-2024
NODE_ENV=production
PORT=3001
```

### Step 5: Deploy
1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Copy the URL** (e.g., https://your-app.onrender.com)

### Step 6: Set Webhook
1. **Open Command Prompt**
2. **Navigate to your project**:
   ```cmd
   cd "C:\Users\Fluxtech Solutions\Desktop\web development\maseno-counseling-bot"
   ```
3. **Run**:
   ```cmd
   setup-webhook-cmd.bat
   ```

## 🎯 Why Render?

- ✅ **More reliable** than Railway
- ✅ **Better error messages**
- ✅ **Easier configuration**
- ✅ **Free tier available**

## 🔧 Need Help?

**Tell me what you see at each step!**
