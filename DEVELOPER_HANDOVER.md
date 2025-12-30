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
- **AI Chatbot (Phase 7):** Implemented a non-streaming Mistral AI chatbot (`/api/chat`). Switched from streaming to JSON for 100% reliability.
- **Reservation System (Phase 8):**
    - Added `status` field to artworks (Available, Reserved, Sold).
    - Created `reservations` table for visitor interest.
    - Added "Réserver" button and modal to the gallery.
    - Created Admin Inbox to manage reservation requests.
    - Updated RLS policies to allow public reservation submissions and status updates.

## 🧠 Memory Persistence (Important)
If you start a new session or I seem to "forget" the context:
1. **Developer Handover:** Tell me to read this file (`DEVELOPER_HANDOVER.md`).
2. **Current Brain:** Tell me to look at the `.gemini/antigravity/brain/` folder. It contains my active checklist (`task.md`) and implementation notes.
3. **Context Reset:** Simply send: "Read the handover and project files to get up to speed."

