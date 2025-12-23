# 📁 Project Handover: Galerie Kohl

**Date:** December 23, 2025
**Status:** Live (Web) / In Progress (Native iOS)

## 🔗 Critical Links
- **Live Gallery (iPad/Client):** [https://galerie-kohl.vercel.app](https://galerie-kohl.vercel.app)
- **Admin Dashboard:** [https://galerie-kohl.vercel.app/admin](https://galerie-kohl.vercel.app/admin)
- **Supabase (Database):** [https://supabase.com/dashboard/project/sgxfikmpeaiamopqxcst](https://supabase.com/dashboard/project/sgxfikmpeaiamopqxcst)
- **GitHub Repo:** [https://github.com/bloblolachose/Galerie](https://github.com/bloblolachose/Galerie)

## 🔑 Credentials & Secrets
- **Admin Access Code:** `gallery-m4-master`
- **Supabase Keys:** Stored in Vercel Environment Variables.
  - `NEXT_PUBLIC_SUPABASE_URL`: `https://sgxfikmpeaiamopqxcst.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_VeX6B-zOPQSkirFljH22eQ__TnHJlF3`

## 🛠 Tech Stack (The "Brain")
- **Framework:** Next.js 16 (React)
- **Database:** Supabase (PostgreSQL) + Storage (Images)
- **Styling:** Tailwind CSS 4 (Brutalist Theme)
- **Animation:** Framer Motion
- **Native Wrapper:** Capacitor (iOS)

## 📱 Native App Status (iOS)
- **Tools:** Capacitor is installed and configured to point to the **Live Vercel URL**.
- **Current State:** The Xcode project is generated in `ios/`.
- **Next Step:** Open `ios/App/App.xcworkspace`, select iPad, and press Run/Play. (Currently waiting for an 8GB Xcode component download).

## 🚀 How to Resume Work (For the next AI/Dev)
1. **Clone the Repo:** `git clone https://github.com/bloblolachose/Galerie.git`
2. **Install:** `npm install`
3. **Run Local:** `npm run dev`
4. **Deploy Updates:**
   - Commit changes to GitHub.
   - Vercel auto-deploys.
   - Native App auto-updates (because it points to Vercel URL).

## 📝 Recent Changes
- Migrated from IndexDB (Local) to Supabase (Cloud).
- Implemented "Magic Sync" for iPad.
- Added file upload to Cloud Storage.
