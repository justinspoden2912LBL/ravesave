
# Ravesave 🎉

AI-powered rave event assistant

## 🚀 Quick Start

### 1. Setup Supabase

```bash
# Go to Supabase Dashboard
https://supabase.com/dashboard

# Create user:
# Authentication → Users → Add user
# Email: justin.spoden2912@gmail.com
# Password: (choose secure password)
```

### 2. Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env with your Supabase credentials:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
# Add environment variables in Vercel dashboard
# Then push to main
git push origin main
```

## 🔐 Admin Panel

**Login:** https://ravesave.de/admin/login

### Protected Routes:
- `/admin` — Dashboard
- `/admin/chat` — AI Chat Management
- `/admin/settings` — AI Settings
- `/admin-key` — API Key Management
- `/admin-design` — Design Studio

## 📋 Setup Checklist

Run the setup check:

```bash
npm run check-setup
```

Or manually:

- [ ] Supabase user created
- [ ] Environment variables set in Vercel
- [ ] Can access admin login
- [ ] Can login successfully

## 📖 Documentation

- `SETUP_GUIDE.md` — Complete setup instructions
- `ADMIN_AUTH_SETUP.md` — Admin authentication details
- `CHECKLIST.md` — Step-by-step checklist

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Routing:** TanStack Router
- **Backend:** Supabase (Auth + Database)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS

## 🔒 Security

- Admin emails whitelisted in `src/lib/auth.ts`
- Environment variables stored in Vercel (not in Git)
- Supabase Auth for session management
- Password reset via email

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check-setup  # Check environment configuration
```

---

**Status:** ✅ Production Ready  
**License:** MIT
