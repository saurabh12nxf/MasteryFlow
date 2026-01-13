# Quick User Setup

Your database tables are created! Now we just need to create your user record.

## Simple Fix:

1. **Make sure the app is running** (`npm run dev`)

2. **Open your browser** and go to: http://localhost:3000

3. **Sign in with Clerk**

4. **Open a new tab** and go to:
   ```
   http://localhost:3000/api/setup-user
   ```
   
   Or run this in your terminal:
   ```bash
   curl -X POST http://localhost:3000/api/setup-user
   ```

5. You should see:
   ```json
   {
     "message": "User created successfully",
     "user": { ... }
   }
   ```

6. **Go back to http://localhost:3000** and refresh

7. **You should now see the Dashboard!** 🎉

---

## What You'll See:

✅ **Dashboard** with:
- Empty mission card (no tracks created yet)
- 0 XP
- 0 Streak  
- Quick actions panel

---

## Next Steps After Dashboard Loads:

I can help you:
1. Create a test track
2. Add some tasks to it
3. Generate a daily mission
4. Complete tasks and earn XP

**Try the setup-user endpoint and let me know if the dashboard loads!**
