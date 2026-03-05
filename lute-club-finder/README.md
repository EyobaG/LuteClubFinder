# Lute Club Finder

A web platform for Pacific Lutheran University students to discover, join, and engage with campus clubs through intelligent quiz-based matching, personalized recommendations, and streamlined club management.

Built with React, TypeScript, Firebase, and Tailwind CSS.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Firebase Setup](#firebase-setup)
- [Local Development](#local-development)
- [Data Migration](#data-migration)
- [Building for Production](#building-for-production)
- [User Roles](#user-roles)
- [Routes](#routes)
- [Data Model](#data-model)
- [Architecture](#architecture)
- [Author](#author)

---

## Features

### For Students

- **Smart Quiz Matching** — A weighted algorithm scores clubs across 5 dimensions (time commitment 25%, interests 35%, vibes 20%, experience 10%, meeting preferences 10%) and presents ranked results with match percentages and reasons
- **Club Discovery** — Browse 55+ clubs with search, category filters (9 categories), and sorting (A–Z, most saved, most viewed)
- **Save & Bookmark** — Bookmark clubs for quick access later
- **Out of Comfort Zone** — Get recommendations for clubs outside your usual interests, filtered by novelty score and unexplored categories
- **Events** — Browse upcoming club events with type, date, and club filters; mark interest and register
- **Announcements** — Read club and platform announcements with priority badges and pinning
- **Profiles** — View quiz results, saved clubs, and account preferences

### For Club Leaders

- **Club Portal** — Edit club info, meeting schedule, officers, images, social links (scoped to clubs they lead)
- **Event Management** — Create, edit, and delete events for their clubs
- **Announcements** — Post club-specific announcements
- **Analytics** — Track views, saves, quiz match frequency, event interest, and announcement performance per club

### For Admins

- **Dashboard** — Platform-wide stats at a glance (users, quiz rates, views, saves)
- **User Management** — View all users, assign roles (student / club_leader / admin), assign club leader permissions
- **Full CRUD** — Create, edit, delete any club, event, or announcement
- **Analytics** — Charts for category distribution, top clubs, role breakdown, event/announcement performance, quiz analytics

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 7.3 |
| Routing | React Router 7 |
| State / Data | TanStack React Query 5 |
| Styling | Tailwind CSS 4.2 (via @tailwindcss/vite) |
| Forms | React Hook Form 7 + Zod 4 |
| Charts | Recharts 3.7 |
| Toasts | Sonner 2 |
| Auth | Firebase Authentication (Google + Email/Password) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |

---

## Project Structure

```
LuteClubFinder/
├── lute-club-finder/            # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── announcements/   # AnnouncementCard, AnnouncementForm
│   │   │   ├── auth/            # ProtectedRoute, AdminRoute, LeaderRoute
│   │   │   ├── clubs/           # ClubCard
│   │   │   ├── events/          # EventCard, EventForm
│   │   │   ├── layout/          # Header, Footer, RootLayout, UserMenu
│   │   │   ├── quiz/            # QuizLanding, QuizQuestionCard, QuizProgress, QuizResults
│   │   │   └── ui/              # Button, Card, Input, Select, Modal, Badge, Skeleton, ErrorBoundary, etc.
│   │   ├── context/             # AuthContext (Firebase auth state)
│   │   ├── hooks/               # React Query hooks (useClubs, useEvents, useAdmin, useLeader, etc.)
│   │   ├── lib/                 # firebase.ts (all Firebase helpers), quizMatcher.ts, comfortZone.ts
│   │   ├── pages/               # All page components
│   │   │   ├── admin/           # Admin portal pages (dashboard, CRUD, analytics)
│   │   │   └── leader/          # Leader portal pages (dashboard, CRUD, analytics)
│   │   ├── types/               # TypeScript interfaces (Club, ClubEvent, Announcement, UserData, etc.)
│   │   ├── App.tsx              # Router config, providers, lazy loading
│   │   └── main.tsx             # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── migration/                   # Data migration scripts (CSV → Firestore)
│   ├── data-analysis.js
│   ├── clean-and-transform.js
│   ├── firestore-import.js
│   ├── seed-events.js
│   ├── seed-announcements.js
│   └── serviceAccountKey.json   # (not committed — you provide this)
├── examples/                    # Reference implementations
│   ├── quiz-matching-example.js
│   └── firebase-config-template.js
├── ARCHITECTURE.md              # System architecture & Firestore security rules
├── DEVELOPMENT_PROGRESS.md      # Phase-by-phase build progress
└── README.md
```

---

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (required by Vite 7)
- **npm** 9+
- A **Firebase project** (free Spark plan works for development)

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).

2. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable **Google** (restrict to `plu.edu` domain if desired)
   - Enable **Email/Password**

3. **Create Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in **test mode** for development (deploy security rules from `ARCHITECTURE.md` before production)

4. **Enable Storage:**
   - Go to Storage → Get started
   - This is used for club logos, cover images, and event images

5. **Get your config values:**
   - Go to Project Settings → General → Your apps → Web app
   - Copy the Firebase config object values

---

## Local Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/EyobaG/LuteClubFinder.git
   cd LuteClubFinder/lute-club-finder
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   Create a `.env.local` file in the `lute-club-finder/` directory:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

---

## Data Migration

The `migration/` directory contains scripts to import the original 55 PLU clubs from CSV into Firestore, along with quiz questions and sample data.

1. **Get a Firebase service account key:**
   - Firebase Console → Project Settings → Service accounts → Generate new private key
   - Save as `migration/serviceAccountKey.json`
   - **Do not commit this file to version control**

2. **Run the migration:**

   ```bash
   cd migration
   npm install
   npm run migrate
   ```

   This runs three steps:
   - **Analyze** — Checks data quality (missing fields, duplicates)
   - **Transform** — Cleans data, generates slugs, auto-categorizes clubs, assigns tags/vibes, parses meeting schedules → outputs `clubs-transformed.json`
   - **Import** — Uploads clubs, quiz questions, and config to Firestore

3. **Optional: Seed sample events and announcements:**

   ```bash
   node seed-events.js
   node seed-announcements.js
   ```

4. **Post-migration:**
   - Verify data in the Firebase Console
   - Assign an admin user: in Firestore, set a user document's `role` field to `"admin"`
   - Deploy Firestore security rules from `ARCHITECTURE.md` before going to production

---

## Building for Production

```bash
cd lute-club-finder
npm run build
```

This runs TypeScript type checking (`tsc -b`) then Vite production build. Output goes to `dist/`.

The build uses code splitting:
- **vendor-react** — React, React DOM, React Router (~100 KB)
- **vendor-firebase** — Firebase SDK (~368 KB)
- **vendor-charts** — Recharts (~369 KB)
- **16 lazy-loaded chunks** — Admin and leader portal pages (1–13 KB each)

To preview the production build locally:

```bash
npm run preview
```

---

## User Roles

| Role | Access |
|------|--------|
| **student** | Default role. Browse clubs, take quiz, save clubs, view events/announcements, view profile |
| **club_leader** | Everything students can do + leader portal to manage their assigned clubs, events, and announcements |
| **admin** | Full access to admin portal with CRUD for all clubs/events/announcements, user management, analytics |

Roles are stored in the `users` Firestore collection. Admins can assign roles and club leader permissions through the Admin → Users page.

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Homepage — featured clubs, announcements, upcoming events, category grid |
| `/discover` | Public | Club discovery with search, category filters, sorting |
| `/clubs/:id` | Public | Club detail — description, schedule, officers, events, related clubs |
| `/quiz` | Public | Interactive matching quiz (works without login, saves on login) |
| `/events` | Public | Browse events with type, club, and date filters |
| `/events/:id` | Public | Event detail with interest toggle and registration |
| `/announcements` | Public | Announcement feed with type/priority filters |
| `/announcements/:id` | Public | Announcement detail |
| `/login` | Public | Sign in with Google or email/password |
| `/profile` | Auth | User profile, quiz results, preferences |
| `/saved` | Auth | Bookmarked clubs |
| `/comfort-zone` | Auth | Out-of-comfort-zone recommendations (requires quiz) |
| `/admin/*` | Admin | Admin portal — dashboard, clubs, events, announcements, users, analytics |
| `/leader/*` | Leader | Leader portal — dashboard, club edit, events, announcements, analytics |

---

## Data Model

### Firestore Collections

**`clubs`** — 55+ PLU clubs with enriched metadata
- Name, description, category (academic / cultural / faith / arts / recreational / professional / service / gaming / special_interest)
- Tags, vibes, time commitment, experience level
- Meeting schedule (day, time, location, frequency, virtual)
- Officers, social links, images
- View and save counters

**`users`** — Authenticated user profiles
- Role, preferences, saved clubs, viewed clubs
- Quiz results with per-club match scores
- Interested events list

**`events`** — Club events
- Type (meeting / social / competition / workshop / service / other)
- Date/time, location, virtual link, registration
- Interest count, view tracking

**`announcements`** — Club and platform announcements
- Type (club / platform / news / plu-spotlight)
- Priority (normal / high / urgent), pinning, expiration
- View tracking

**`quizQuestions`** — Matching quiz questions
- Single/multiple choice with weighted options
- Maps to club matching attributes

**`config`** — Admin configuration

---

## Architecture

- **Authentication** flows through Firebase Auth with a React context (`AuthContext`) that provides the current user and Firestore user data to all components
- **Data fetching** uses TanStack React Query with a 5-minute stale time and 1 retry, providing automatic caching and background refetching
- **All Firebase operations** (CRUD, auth, storage) are centralized in `src/lib/firebase.ts`
- **Quiz matching** is handled client-side in `src/lib/quizMatcher.ts` — no server-side computation needed
- **Route protection** uses wrapper components (`ProtectedRoute`, `AdminRoute`, `LeaderRoute`) that check auth state and role before rendering
- **Admin/leader pages** are lazy-loaded with `React.lazy()` and `Suspense` to reduce initial bundle size
- **Error handling** uses an `ErrorBoundary` class component with retry, plus `errorElement` on the root route
- **Accessibility** targets WCAG AA: skip-to-content link, aria landmarks, focus management on navigation, keyboard support, reduced motion preference, focus-visible styling

For the full system architecture, data model diagrams, and Firestore security rules, see `ARCHITECTURE.md`.

---

## Author

**Job Menjigso (Eyob)** — Pacific Lutheran University

---
