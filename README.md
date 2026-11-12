# Joy Fit - Personal Progress Tracker

A modern fitness tracking web app built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Supabase** (Auth + Database)
- **Recharts** (Charts)
- **date-fns**

## Features
- 💪 Workout Log with muscle group & exercise tracking
- 📈 Exercise Progress with weight history charts
- 🍽️ Nutrition Tracker with auto calorie estimation
- 📊 Analytics dashboard
- ⚖️ Body Weight Tracker
- 🔐 Supabase Authentication
- 📱 Mobile-first with Bottom Navigation

---

## Setup Guide

### 1. Clone & Install
```bash
git clone https://github.com/Joimmanuel/fitbyjoy.git
cd fitbyjoy
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run
3. Go to **Project Settings → API** → copy:
   - `Project URL`
   - `anon public` key

### 3. Configure Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B: GitHub + Vercel Dashboard
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

### 5. Access from Phone
After deploy, open the Vercel URL on your phone browser.
To install as PWA: tap **Share → Add to Home Screen** (iOS) or **Install App** (Android).

---

## Supabase Auth Settings

In Supabase Dashboard → **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## Security Best Practices Applied
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Auth handled server-side via `@supabase/ssr`
- No sensitive keys exposed to client
- Middleware protects all dashboard routes
