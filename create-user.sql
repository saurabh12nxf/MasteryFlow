-- Manual User Creation Script
-- Run this in your Neon SQL Editor (neon.tech dashboard)

-- Replace 'YOUR_CLERK_USER_ID' with your actual Clerk user ID
-- You can find this in the Clerk dashboard or browser DevTools

-- 1. Create user
INSERT INTO users (clerk_id, email, username, timezone)
VALUES (
  'YOUR_CLERK_USER_ID',  -- Replace with your Clerk user ID
  'your-email@example.com',  -- Replace with your email
  'YourUsername',  -- Replace with your username
  'Asia/Kolkata'
)
ON CONFLICT (clerk_id) DO NOTHING;

-- 2. Get the user ID (run this to see your user)
SELECT id, clerk_id, email FROM users;

-- 3. Create user settings (replace USER_ID with the id from step 2)
INSERT INTO user_settings (user_id)
SELECT id FROM users WHERE clerk_id = 'YOUR_CLERK_USER_ID'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Create global streak (replace USER_ID)
INSERT INTO streaks (user_id, track_id, current_streak, longest_streak)
SELECT id, NULL, 0, 0 FROM users WHERE clerk_id = 'YOUR_CLERK_USER_ID'
ON CONFLICT DO NOTHING;

-- Verify everything was created
SELECT * FROM users;
SELECT * FROM user_settings;
SELECT * FROM streaks WHERE track_id IS NULL;
