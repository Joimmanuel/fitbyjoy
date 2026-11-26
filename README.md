# 💪 Joy Fit — Personal Progress Tracker

Aplikasi web fitness personal untuk mencatat progres gym, tracking kalori harian, dan memantau perkembangan latihan. Dibangun dengan Next.js 16, Supabase, dan Tailwind CSS. Mobile-first, bisa diakses dari HP maupun laptop.

🔗 **Live:** [fitbyjoy-git-main-joy-215e.vercel.app](https://fitbyjoy-git-main-joy-215e.vercel.app)

---

## 🛠 Tech Stack

| Tech | Kegunaan |
|------|----------|
| Next.js 16 | Framework utama (App Router) |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI Components |
| Supabase | Database + Authentication |
| Recharts | Grafik progress |
| date-fns | Manipulasi tanggal |

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 🏠 Dashboard | Ringkasan harian, streak, weekly goal, top progress, motivational quote |
| 💪 Workout Log | Catat latihan per muscle group (Chest, Back, Shoulder, Leg, Biceps, Triceps) |
| 🔍 Last Progress di Input | Auto-fill weight/sets/reps dari sesi terakhir saat tambah exercise |
| 🗓️ Workout Combinations | Rekomendasi kombinasi latihan (Push/Pull/Leg/Upper/Arms) berdasarkan otot yang belum dilatih |
| ✏️ Edit & Delete History | Edit atau hapus exercise/sesi dari history |
| 🏆 PR Badge | Otomatis detect Personal Record baru saat save workout |
| 📈 Exercise Progress | Grafik perkembangan beban per exercise |
| 🍽️ Nutrition Tracker | Log makanan + estimasi kalori otomatis + history kalori per hari |
| 📊 Analytics | Volume tracker, streak, distribusi muscle group per exercise |
| ⚖️ Body Weight Tracker | Monitor berat badan harian |
| 👤 Profile | Atur nama, target kalori, weekly goal |
| 🔄 Sync | Data sinkron di semua device via Supabase |

---

## 📱 UI Overview

### 🏠 Dashboard
```
┌─────────────────────────────┐
│  Good morning 👋            │
│  Joy                        │
│  Monday, 01 January 2026    │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🔥 Streak│ │🎯 Weekly │  │
│  │  7 days  │ │  3 / 4   │  │
│  └──────────┘ └──────────┘  │
│                             │
│  Today's Summary            │
│  ┌────────┐ ┌────────────┐  │
│  │Exercises│ │ Total Sets │  │
│  │   5    │ │    20      │  │
│  └────────┘ └────────────┘  │
│  ┌────────┐ ┌────────────┐  │
│  │Calories│ │Week Volume │  │
│  │650 kcal│ │ 12,400 kg  │  │
│  └────────┘ └────────────┘  │
│                             │
│  🏆 Top Improvement         │
│  ┌─────────────────────┐    │
│  │ Seated Tricep Ext.  │    │
│  │ +2.5 KG ✅          │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### 💪 Workout Log
```
┌─────────────────────────────┐
│  Workout Log                │
│  ┌──────┬───────────┬──────┐│
│  │ Log  │ Recommend │History│
│  └──────┴───────────┴──────┘│
│                             │
│  [Log Tab]                  │
│  Date: [11/01/2026      ]   │
│                             │
│  Pick Muscle Group          │
│  ┌─────────┐ ┌──────────┐  │
│  │🏋️ Chest │ │🔙 Back   │  │
│  │5 exer.  │ │6 exer.   │  │
│  └─────────┘ └──────────┘  │
│  ┌─────────┐ ┌──────────┐  │
│  │🏔️ Shldr │ │🦵 Leg    │  │
│  └─────────┘ └──────────┘  │
│                             │
│  [Recommend Tab]            │
│  ⚡ Workout Combinations    │
│  ┌─────────────────────┐   │
│  │🔴 Push Day ★ Recom. │   │
│  │ Chest · Shoulder ·  │   │
│  │ Triceps             │   │
│  │ Chest Press  20KG + │   │
│  │ Shldr Press  30KG + │   │
│  └─────────────────────┘   │
│                             │
│  [Quick Add Dialog]         │
│  Seated Tricep Extension    │
│  Last · 03 Jan 2026         │
│  20KG · 3×15                │
│  Weight [20] Unit [KG]      │
│  Sets   [3 ] Reps [15]      │
│  [  Add to Session  ]       │
└─────────────────────────────┘
```

### 📈 Exercise Progress
```
┌─────────────────────────────┐
│  Exercise Progress          │
│                             │
│  [Tricep Ext] [Lat Pull] →  │
│                             │
│  ┌────────┬──────┬───────┐  │
│  │Current │ Last │Progress│  │
│  │ 20 KG  │17.5KG│ +2.5✅│  │
│  └────────┴──────┴───────┘  │
│                             │
│  [1M][3M][6M][1Y][All]      │
│                             │
│  ╭──────────────────────╮   │
│  │    📈 Line Chart     │   │
│  │  Weight vs Date      │   │
│  ╰──────────────────────╯   │
└─────────────────────────────┘
```

### 🍽️ Nutrition
```
┌─────────────────────────────┐
│  Nutrition                  │
│                             │
│  ┌─────────────────────┐    │
│  │ Today's Calories    │    │
│  │       1,450         │    │
│  │  of 2000 kcal target│    │
│  │  ████████░░░░░░░░   │    │
│  │  550 kcal remaining │    │
│  └─────────────────────┘    │
│                             │
│  ┌────────┬───────────────┐ │
│  │ Today  │    History    │ │
│  └────────┴───────────────┘ │
│                             │
│  [Today Tab]                │
│  🔍 [Nasi Ayam...      ]    │
│  Qty: [1]                   │
│  ≈ 650 kcal per serving     │
│  [+ Add Food]               │
│                             │
│  Food        Qty  Calories  │
│  Nasi Ayam    1   650 kcal  │
│  Pisang       1   110 kcal  │
│  Total            760 kcal  │
│                             │
│  [History Tab]              │
│  13 Nov 2026  1,450 kcal    │
│  ████████░░░░  72% of target│
│  12 Nov 2026  1,800 kcal    │
│  ██████████░░  90% of target│
└─────────────────────────────┘
```

### 📊 Analytics
```
┌─────────────────────────────┐
│  Analytics                  │
│                             │
│  ┌────────┐ ┌────────────┐  │
│  │📅 12   │ │📊 Avg 3.5  │  │
│  │ /month │ │  /week     │  │
│  └────────┘ └────────────┘  │
│  ┌────────┐ ┌────────────┐  │
│  │⚡7 days│ │💪 48,200kg │  │
│  │ streak │ │ total vol  │  │
│  └────────┘ └────────────┘  │
│                             │
│  Weekly Workouts            │
│  ╭──────────────────────╮   │
│  │    📊 Bar Chart      │   │
│  ╰──────────────────────╯   │
│                             │
│  Weekly Volume (kg)         │
│  ╭──────────────────────╮   │
│  │    📊 Bar Chart      │   │
│  ╰──────────────────────╯   │
│                             │
│  Muscle Distribution        │
│  Triceps  ████████  40%     │
│  Back     █████     25%     │
│  Chest    ████      20%     │
└─────────────────────────────┘
```

### 👤 Profile
```
┌─────────────────────────────┐
│  Profile                    │
│                             │
│  ┌─────────────────────┐    │
│  │  [JY]  Joy          │    │
│  │        Joy Fit      │    │
│  │        82.5 KG -0.5 │    │
│  └─────────────────────┘    │
│                             │
│  👤 Profile Settings        │
│  Name: [Joy              ]  │
│  🎯 Daily Calorie Target    │
│  [2000                   ]  │
│  🎯 Weekly Workout Goal     │
│  [4                      ]  │
│  [Save Profile]             │
│                             │
│  ⚖️ Body Weight Tracker     │
│  Date: [01/01/2026]         │
│  Weight: [82.5 KG  ]        │
│  [Save Weight]              │
│                             │
│  01 Jan 2026   82.5 KG      │
│  28 Dec 2025   83.0 KG      │
└─────────────────────────────┘
```

### 📱 Bottom Navigation
```
┌─────────────────────────────┐
│  🏠    💪    📈    🍽️  📊  👤 │
│ Home Workout Progress Nutr Ana Prof│
└─────────────────────────────┘
```

---

## 🚀 Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/Joimmanuel/fitbyjoy.git
cd fitbyjoy
npm install
```

### 2. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste isi `supabase-schema.sql` → **Run**
3. Jalankan juga SQL tambahan:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_goal INTEGER DEFAULT 4;
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS muscle_group TEXT;
ALTER TABLE workout_sessions ALTER COLUMN muscle_group DROP NOT NULL;
```
4. Buka **Authentication → Providers → Email** → matikan **Confirm email**
5. Aktifkan **Anonymous Sign-ins** (opsional)

### 3. Environment Variables
Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Jalankan Lokal
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy ke Vercel

1. Push ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Tambahkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**

---

## 📖 Cara Penggunaan

### Pertama Kali
1. Buka website → klik **Daftar**
2. Isi nama, email, password → **Buat Akun**
3. Langsung masuk ke Dashboard

### Log Workout
1. Tap menu **Workout** (💪)
2. Pilih tanggal
3. Tab **Log** → pilih Muscle Group → tap exercise → dialog auto-fill dari sesi terakhir
4. Sesuaikan weight/sets/reps jika perlu → tap **Add to Session**
5. Tap **+ More Muscles** untuk tambah muscle group lain
6. Tap **Save**

### Cek Rekomendasi Kombinasi
1. Tap tab **Recommend** di halaman Workout
2. Kombinasi teratas = otot yang paling lama tidak dilatih
3. Tap **+ Add** langsung dari card untuk tambah ke sesi

### Cek Progress
1. Tap menu **Progress** (📈)
2. Pilih exercise dari daftar
3. Lihat current weight, last weight, dan selisihnya
4. Filter grafik: 1M / 3M / 6M / 1Y / All

### Log Makanan
1. Tap menu **Nutrition** (🍽️)
2. Ketik nama makanan → kalori otomatis terisi
3. Atur quantity → tap **Add Food**
4. Total kalori harian terupdate otomatis
5. Tap tab **History** untuk lihat total kalori per hari

### Monitor Analytics
1. Tap menu **Analytics** (📊)
2. Lihat streak, volume, distribusi muscle group
3. Cek grafik weekly workouts & volume

### Atur Profile & Target
1. Tap menu **Profile** (👤)
2. Ubah nama, target kalori harian, weekly goal
3. Log berat badan di **Body Weight Tracker**
4. Tap **Save**

### Akses dari HP
- Buka link Vercel di browser HP
- Login dengan akun yang sama → data langsung sinkron ✅

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          → Halaman login
│   │   └── register/       → Halaman register
│   └── (dashboard)/
│       ├── dashboard/      → Home dashboard
│       ├── workout/        → Log workout
│       ├── progress/       → Progress charts
│       ├── nutrition/      → Calorie tracker
│       ├── analytics/      → Analytics & insights
│       └── profile/        → Profile & body weight
├── components/
│   └── layout/             → AppShell, BottomNav, UserProvider
├── lib/
│   ├── supabase/           → Supabase client & server
│   ├── constants.ts        → Exercise list, food calories
│   └── storage.ts          → localStorage helpers
└── types/                  → TypeScript types
```

---

## 🔒 Security

- Row Level Security (RLS) aktif di semua tabel Supabase
- Setiap user hanya bisa akses data miliknya sendiri
- Auth dihandle via `@supabase/ssr`
- Tidak ada sensitive key yang terekspos ke client

---

Made with ❤️ by Joy
