@echo off
echo Creating 4 structured commits...

REM Commit 1: Project Configuration
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs drizzle.config.ts components.json jsconfig.json .gitignore .env.example README.md
git commit -m "feat: initialize Next.js 15 project with Tailwind CSS and Drizzle ORM configuration"

REM Commit 2: Database Schema
git add lib/
git commit -m "feat: implement comprehensive database schema with 12 tables using Drizzle ORM"

REM Commit 3: Authentication
git add middleware.ts app/layout.tsx app/page.tsx app/globals.css app/(auth)/
git commit -m "feat: set up Clerk authentication with middleware and branded auth pages"

REM Commit 4: API Routes and UI
git add app/api/ app/(dashboard)/ components/
git commit -m "feat: add API routes, dashboard, and Shadcn UI components"

echo.
echo All 4 commits created successfully!
echo.
git log --oneline
