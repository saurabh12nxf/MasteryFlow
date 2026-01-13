@echo off
echo Installing missing dependencies...

call npm install tailwindcss-animate
call npm install @radix-ui/react-slot
call npm install svix
call npm install dotenv

echo.
echo All dependencies installed!
echo.
echo Now running database migrations...
call npm run db:generate
call npm run db:migrate

echo.
echo Setup complete! You can now run: npm run dev
