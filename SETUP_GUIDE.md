# MasteryFlow - Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use a free service like Neon, Supabase, or Railway)
- Clerk account (free tier available)

---

## Step 1: Install Dependencies

```bash
cd c:\Users\HP\Desktop\MasteryFlow
npm install
```

---

## Step 2: Set Up Database

### Option A: Use Neon (Recommended - Free & Easy)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### Option B: Use Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Pooler mode)

### Option C: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `CREATE DATABASE masteryflow;`
3. Connection string: `postgresql://postgres:yourpassword@localhost:5432/masteryflow`

---

## Step 3: Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com)
2. Sign up for free
3. Create a new application
4. Go to **API Keys** and copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Go to **Webhooks** → Add Endpoint:
   - URL: `http://localhost:3000/api/webhooks/clerk` (for local testing)
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** as `CLERK_WEBHOOK_SECRET`

---

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and fill in these required values:

```env
# Database (from Step 2)
DATABASE_URL="your_postgresql_connection_string"

# Clerk (from Step 3)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# These are already set correctly
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 5: Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

This will create all 12 tables in your database.

---

## Step 6: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## Step 7: Test the Features

### 7.1 Sign Up
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create an account (email + password or OAuth)
4. You'll be redirected to the dashboard

### 7.2 Create a Track (via API for now)

Open a new terminal and use curl or Postman:

```bash
# Get your auth token from browser DevTools → Application → Cookies → __session

# Create a track
curl -X POST http://localhost:3000/api/tracks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NeetCode 150",
    "category": "DSA",
    "difficultyLevel": "INTERMEDIATE"
  }'

# Note the track ID from response
```

### 7.3 Add Items to Track

```bash
curl -X POST http://localhost:3000/api/tracks/TRACK_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "title": "Two Sum",
        "description": "Find two numbers that add up to target",
        "difficulty": "EASY",
        "estimatedMinutes": 30
      },
      {
        "title": "Valid Parentheses",
        "description": "Check if brackets are balanced",
        "difficulty": "EASY",
        "estimatedMinutes": 20
      },
      {
        "title": "Longest Substring Without Repeating",
        "description": "Sliding window problem",
        "difficulty": "MEDIUM",
        "estimatedMinutes": 45
      }
    ]
  }'
```

### 7.4 Generate Daily Mission

```bash
curl -X POST http://localhost:3000/api/missions/generate
```

### 7.5 View Dashboard

Refresh your browser at http://localhost:3000/dashboard

You should see:
- ✅ Today's mission with tasks
- ✅ Your current streak (0 initially)
- ✅ Your XP (0 initially)
- ✅ Quick actions panel

### 7.6 Complete a Task

```bash
# Get task ID from the mission response or dashboard
curl -X POST http://localhost:3000/api/missions/MISSION_ID/tasks/TASK_ID/complete \
  -H "Content-Type: application/json" \
  -d '{
    "actualMinutes": 25,
    "difficultyRating": 3,
    "effortRating": 4
  }'
```

Refresh dashboard to see:
- ✅ Task marked as completed
- ✅ XP awarded (50-200 based on difficulty)
- ✅ Streak updated to 1

---

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npm run db:studio
```
This opens Drizzle Studio to view your database.

### Clerk Webhook Not Working
- For local development, use [ngrok](https://ngrok.com) or [localtunnel](https://localtunnel.me)
- Update Clerk webhook URL to your ngrok URL
- Or skip webhook for now (manually create user in database)

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## What You Can Test Now

✅ **Authentication**: Sign up, sign in, sign out  
✅ **Dashboard**: View personalized dashboard  
✅ **Mission System**: Generate and view daily missions  
✅ **Task Completion**: Complete tasks and earn XP  
✅ **Streak Tracking**: Build daily streaks  
✅ **Gamification**: See XP, level, and progress  

---

## Next: Build Track Management UI

Once you've tested the API, we'll build:
- Track list page
- Create track form
- Track detail page with items
- Visual track management

This will make it easy to create tracks without using the API directly!

---

## Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Check browser console (F12)
3. Verify `.env` file has correct values
4. Ensure database is running and accessible
