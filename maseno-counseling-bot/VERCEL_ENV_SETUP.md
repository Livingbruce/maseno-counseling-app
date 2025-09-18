# 🔧 VERCEL ENVIRONMENT VARIABLES SETUP

## 🚨 CRITICAL: Missing Environment Variables

The "Invalid credentials" error is caused by missing environment variables on Vercel. Here's how to fix it:

## ✅ STEP-BY-STEP FIX

### 1. **Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Click on your project: `maseno-counseling-bot`
3. Go to **Settings** → **Environment Variables**

### 2. **Add Required Environment Variables**

Add these variables one by one:

#### **DATABASE_URL** (CRITICAL)
```
Name: DATABASE_URL
Value: postgresql://username:password@host:port/database
Environment: Production
```

**Get your database URL from:**
- **Railway**: Project → Database → Connect → PostgreSQL
- **Supabase**: Settings → Database → Connection string
- **Neon**: Dashboard → Connection string

#### **JWT_SECRET** (CRITICAL)
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-here-make-it-long-and-random
Environment: Production
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **NODE_ENV** (OPTIONAL)
```
Name: NODE_ENV
Value: production
Environment: Production
```

### 3. **Redeploy After Adding Variables**
1. After adding all variables, go to **Deployments**
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

## 🔍 **How to Get Database URL**

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. Create new project → Database → PostgreSQL
3. Click on database → Connect → PostgreSQL
4. Copy the connection string

### Option 2: Supabase
1. Go to https://supabase.com
2. Create new project
3. Settings → Database → Connection string
4. Copy the connection string

### Option 3: Neon
1. Go to https://neon.tech
2. Create new project
3. Dashboard → Connection string
4. Copy the connection string

## 🧪 **Test After Setup**

Once you've added the environment variables and redeployed:

1. **Test the API**:
   ```bash
   curl -X POST https://maseno-counseling-bot.vercel.app/api/hello \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@maseno.ac.ke","password":"123456"}'
   ```

2. **Expected Response**:
   ```json
   {
     "message": "Login successful",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 2,
       "name": "Admin User",
       "email": "admin@maseno.ac.ke",
       "is_admin": true
     }
   }
   ```

## 🎯 **Quick Fix Commands**

If you have a database URL, add it to Vercel:

```bash
# Add DATABASE_URL to Vercel
vercel env add DATABASE_URL

# Add JWT_SECRET to Vercel
vercel env add JWT_SECRET

# Redeploy
vercel --prod
```

## 🚨 **Common Issues**

1. **"Database configuration missing"** → Add DATABASE_URL
2. **"JWT configuration missing"** → Add JWT_SECRET
3. **"Cannot connect to database"** → Check DATABASE_URL format
4. **"Invalid credentials"** → Check database has admin user

## ✅ **Success Checklist**

- [ ] DATABASE_URL added to Vercel
- [ ] JWT_SECRET added to Vercel
- [ ] Project redeployed
- [ ] API returns proper error messages
- [ ] Login works with admin credentials

## 🎉 **After Setup**

Once environment variables are added:
1. The API will show proper error messages
2. Login will work with admin credentials
3. Dashboard will authenticate successfully
4. All features will be functional

**The login will work 100% once environment variables are properly configured!**
