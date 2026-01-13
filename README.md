# MasteryFlow

A high-end, personalized learning orchestrator designed to enforce 100% consistency in learning core subjects (DSA, System Design, AI/ML, CS Fundamentals, and Open Source) through automated daily missions, intelligent nudging, and gamification.

## 🚀 Features

- **Automated Daily Missions**: System assigns unavoidable daily tasks based on your learning tracks
- **Track Management**: Organize learning across multiple subjects with intelligent rotation
- **Gamification**: Earn XP (Neurons), build streaks, and track progress with GitHub-style heatmaps
- **AI Brain Teasers**: Daily adaptive logic and interview questions
- **Multi-Channel Nudging**: WhatsApp, SMS, and email reminders with escalation logic
- **Open Source Tracking**: GitHub integration for contribution tracking and streak protection
- **Reflection & Intelligence**: Daily mood tracking and weekly AI-generated learning reviews

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn UI
- **Backend**: Node.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk
- **Background Jobs**: Upstash/BullMQ
- **Notifications**: Twilio (WhatsApp/SMS), Resend (Email)
- **AI**: OpenAI/Gemini
- **GitHub API**: Octokit

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MasteryFlow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in the required environment variables in `.env`:
- Database URL (PostgreSQL)
- Clerk API keys
- OpenAI/Gemini API key
- Twilio credentials (optional)
- Resend API key (optional)
- GitHub Personal Access Token (optional)
- Upstash Redis credentials

4. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

See the [Implementation Plan](./docs/implementation_plan.md) for detailed system architecture and design decisions.

## 🗺️ Roadmap

### MVP (Current)
- ✅ User authentication
- ✅ Track creation and management
- ✅ Daily mission auto-assignment
- ✅ Basic gamification (XP, streaks)
- 🚧 Email notifications

### Phase 2
- Multi-channel notifications (WhatsApp, SMS)
- AI brain teasers
- GitHub integration
- Advanced gamification (heatmap, levels)

### Phase 3
- AI-powered track suggestions
- Social features
- Mobile app
- Advanced analytics

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
