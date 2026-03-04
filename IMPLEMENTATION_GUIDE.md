# Lute Club Finder - Detailed Implementation Guide

> **Status**: Database setup & data migration ✅ COMPLETE  
> **Next**: Phase 1 — Project scaffolding & core frontend

---

## Overview

This guide breaks the entire build into **granular, ordered steps** grouped by feature. Each step is sized to be completable in a single session. Follow them in order — later features depend on earlier ones.

---

## Phase 0: Project Scaffolding (Foundation)

> Everything before any feature can work.

### Step 0.1 — Create React + TypeScript App
- Initialize with Vite (`npm create vite@latest lute-club-finder -- --template react-ts`)
- Verify `npm run dev` starts the dev server

### Step 0.2 — Install Core Dependencies
```bash
npm install firebase react-router-dom @tanstack/react-query
npm install -D tailwindcss @tailwindcss/vite
```

### Step 0.3 — Configure Tailwind CSS
- Add Tailwind plugin to `vite.config.ts`
- Add `@import "tailwindcss"` to the main CSS file
- Test with a colored `<h1>` in `App.tsx`

### Step 0.4 — Firebase Configuration
- Create `src/lib/firebase.ts`
- Copy config values from Firebase Console → Project Settings
- Export `app`, `auth`, `db`, `storage` instances
- Create `.env` file for Firebase keys (`VITE_FIREBASE_*`)

### Step 0.5 — Project Structure & Routing Shell
Create the folder structure:
```
src/
├── components/         # Shared UI components
│   ├── layout/         # Header, Footer, Sidebar
│   └── ui/             # Button, Card, Input, Modal, etc.
├── features/           # Feature modules
│   ├── auth/           # Authentication
│   ├── clubs/          # Club discovery & detail
│   ├── quiz/           # Quiz engine & results
│   ├── events/         # Events calendar
│   ├── announcements/  # Announcements feed
│   └── admin/          # Admin portal
├── hooks/              # Custom React hooks
├── lib/                # Firebase config, utilities
├── pages/              # Route-level page components
├── types/              # TypeScript interfaces
└── context/            # React Context providers
```
- Set up React Router with placeholder pages for: Home, Discover, Club Detail, Quiz, Events, Announcements, Profile, Admin, Login, 404
- Create a `<RootLayout>` with Header and main content area

### Step 0.6 — Shared UI Components (Starter Set)
Build minimal reusable components:
- `<Button>` — primary, secondary, outline variants
- `<Card>` — wrapper with shadow and padding
- `<Input>` — text input with label and error state
- `<LoadingSpinner>` — simple spinner
- `<Badge>` — for tags and categories
- `<Header>` — site navigation with logo, nav links, auth button
- `<Footer>` — simple footer with links

### Step 0.7 — TypeScript Types
Create `src/types/index.ts` with interfaces matching the Firestore data model:
- `User` — matches `users` collection schema
- `Club` — matches `clubs` collection schema
- `Event` — matches `events` collection schema
- `Announcement` — matches `announcements` collection schema
- `QuizQuestion` — matches `quizQuestions` collection schema
- `ClubMatch` — score, percentage, reasons
- `UserPreferences` — timeCommitment, interests, vibes, etc.

---

## Phase 1: Authentication (Feature 1)

> Users can sign in with Google or email, restricted to @plu.edu.

### Step 1.1 — Auth Context & Provider
- Create `src/context/AuthContext.tsx`
- Use `onAuthStateChanged` listener to track current user
- Expose: `user`, `userData` (Firestore doc), `loading`, `signIn`, `signUp`, `signOut`
- Wrap app in `<AuthProvider>`

### Step 1.2 — Google Sign-In
- Implement `signInWithGoogle()` in `src/lib/firebase.ts`
- Restrict to `hd: 'plu.edu'` via `GoogleAuthProvider.setCustomParameters`
- Double-check domain client-side after popup returns
- On first login, create user doc in Firestore `users` collection

### Step 1.3 — Email/Password Sign-Up & Sign-In
- Implement `signUpWithEmail(email, password)` — validate `@plu.edu` before calling Firebase
- Implement `signInWithEmail(email, password)`
- Send verification email on signup
- Create user doc in Firestore on first login

### Step 1.4 — Login Page UI
- Build `src/pages/LoginPage.tsx`
- Google Sign-In button (prominent)
- Email/password form with toggle between Sign In / Sign Up
- Show error messages for invalid domain, wrong password, etc.
- Redirect to home on successful auth

### Step 1.5 — Protected Routes
- Create `<ProtectedRoute>` wrapper component
- Redirect unauthenticated users to `/login`
- Create `<AdminRoute>` wrapper that checks `user.role === 'admin'`
- Apply to all routes except public club browsing

### Step 1.6 — User Profile Page
- Build `src/pages/ProfilePage.tsx`
- Display name, email, role, saved clubs count
- "Edit profile" for display name
- Quiz status (completed / not taken yet)
- Sign out button

---

## Phase 2: Club Discovery (Feature 2)

> Browse, search, and filter all 55 clubs.

### Step 2.1 — Club Data Hooks
- Create `src/hooks/useClubs.ts` using React Query
  - `useClubs(filters?)` — fetch all clubs with optional category/status filters
  - `useClub(id)` — fetch single club by ID
  - `useSearchClubs(term)` — client-side search (name, description, tags)
- All hooks return `{ data, isLoading, error }`

### Step 2.2 — Club Card Component
- Build `src/components/clubs/ClubCard.tsx`
- Display: name, short description, category badge, tags (first 3), meeting time, save button
- Click navigates to club detail page
- Responsive: stack on mobile, grid on desktop

### Step 2.3 — Discover Page
- Build `src/pages/DiscoverPage.tsx`
- **Search bar** at top — debounced text input
- **Category filter** — horizontal pill buttons (All, Academic, Cultural, Arts, etc.)
- **Tag filter** — multi-select dropdown or chip list
- **Club grid** — responsive grid of `<ClubCard>` components
- **Loading skeleton** — placeholder cards while fetching
- **Empty state** — "No clubs found" with reset filters button
- **Sort options** — A-Z, Most Popular, Newest

### Step 2.4 — Club Detail Page
- Build `src/pages/ClubDetailPage.tsx`
- Sections:
  - Hero: name, category badge, save button
  - Description (full)
  - Meeting schedule (day, time, location, frequency)
  - Officers list with emails
  - Social links (website, Instagram, Discord, etc.)
  - Tags display
  - Vibes display
  - Related clubs (same category, limit 4)
- Back button to discovery page

### Step 2.5 — Save/Bookmark Functionality
- Implement `saveClub(clubId)` and `unsaveClub(clubId)` — update user's `savedClubs` array
- Toggle heart/bookmark icon on `<ClubCard>` and detail page
- Optimistic UI update (instant visual feedback)
- Requires authentication (prompt to login if not signed in)

### Step 2.6 — Saved Clubs Page
- Build `src/pages/SavedClubsPage.tsx`
- Grid of saved clubs (reuse `<ClubCard>`)
- Empty state: "No saved clubs yet — start exploring!"
- Unsave button on each card

---

## Phase 3: Quiz Matching Engine (Feature 3)

> 5-question quiz → personalized club recommendations.

### Step 3.1 — Quiz Data Hook
- Create `src/hooks/useQuiz.ts`
  - `useQuizQuestions()` — fetch from `quizQuestions` collection, ordered by `order`
- Fetch all active clubs for matching calculation

### Step 3.2 — Quiz Landing Page
- Build `src/pages/QuizPage.tsx`
- Hero section explaining the quiz ("Find your perfect club in 2 minutes")
- "Start Quiz" button
- If user already took quiz, show: "Retake Quiz" + link to previous results

### Step 3.3 — Quiz Question Components
- Build `src/features/quiz/QuizQuestion.tsx`
  - Handles `single_choice`, `multiple_choice` question types
  - Radio buttons for single, checkboxes for multiple
  - Visual card-style options (not plain radio buttons)
- Build `src/features/quiz/QuizProgress.tsx`
  - Progress bar (e.g., "Question 2 of 5")
  - Step indicators

### Step 3.4 — Quiz Navigation & State
- Manage quiz state with `useReducer` or local state:
  - `currentQuestion` index
  - `answers` object
- Next / Previous buttons
- Validate answer before allowing "Next"
- On final question, button changes to "See My Matches"

### Step 3.5 — Matching Algorithm
- Port `quiz-matching-example.js` to TypeScript in `src/lib/quizMatcher.ts`
- `calculateClubMatch(preferences, club)` → 0-1 score
- `getClubMatches(preferences, allClubs, limit)` → sorted top matches
- `generateMatchExplanation(preferences, club)` → array of reason strings
- Weights: 35% interests, 25% time, 20% vibes, 10% experience, 10% meeting time

### Step 3.6 — Quiz Results Page
- Build `src/features/quiz/QuizResults.tsx`
- Display top 10 matches as ranked cards:
  - Rank number, club name, match percentage (circular progress or bar)
  - Top 3 match reasons as bullet points
  - "View Club" link
- "Retake Quiz" button
- Save results to user's Firestore document (`quizResults`, `preferences`)

---

## Phase 4: Admin Portal (Feature 4)

> Admin users can manage clubs, users, and content.

### Step 4.1 — Admin Layout & Dashboard
- Build `src/pages/admin/AdminDashboard.tsx`
- Sidebar navigation: Dashboard, Clubs, Users, Analytics
- Stats overview: total clubs, total users, active events, quiz completions
- Protected by `<AdminRoute>`

### Step 4.2 — Club Management (CRUD)
- Build `src/pages/admin/AdminClubs.tsx`
  - Table of all clubs (name, category, status, officers, actions)
  - Search/filter within table
- Build `src/pages/admin/AdminClubEdit.tsx`
  - Form to edit all club fields: name, description, category, tags, vibes, meeting schedule, officers, status, featured flag
  - Image upload for logo and cover image (Firebase Storage)
  - Save and Cancel buttons
- Add club creation form (same form, empty state)
- Delete club with confirmation modal

### Step 4.3 — User Management
- Build `src/pages/admin/AdminUsers.tsx`
  - Table of all users (name, email, role, last active, quiz status)
  - Search by email/name
  - Role dropdown to change user role (student → club_leader → admin)
  - Assign/unassign club leader to specific clubs

### Step 4.4 — Admin Analytics Overview
- Build `src/pages/admin/AdminAnalytics.tsx`
  - Total registered users
  - Quiz completion rate
  - Most viewed clubs (top 10)
  - Most saved clubs (top 10)
  - Users by role breakdown
  - New signups over time (simple list, charts in Phase 3)

---

## Phase 5: Events System (Feature 5)

> Club leaders and admins can create events; students browse an events calendar.

### Step 5.1 — Event Data Hooks
- Create `src/hooks/useEvents.ts`
  - `useUpcomingEvents(clubId?)` — fetch future events, optional club filter
  - `useEvent(id)` — single event
  - `useCreateEvent()` — mutation hook
  - `useUpdateEvent()` — mutation hook

### Step 5.2 — Events List Page
- Build `src/pages/EventsPage.tsx`
- Filter by: date range, club, event type
- List view of upcoming events (chronological)
- Each event card: title, club name, date/time, location, type badge
- Click opens event detail

### Step 5.3 — Event Detail Page
- Build `src/pages/EventDetailPage.tsx`
- Full description, date/time, location (virtual link if applicable)
- Registration info (link, max attendees, current count)
- Host club link
- "Add to Calendar" button (generate .ics file or Google Calendar link)
- "Interested" button (increment interestedCount)

### Step 5.4 — Event Creation Form (Leaders/Admin)
- Build `src/features/events/EventForm.tsx`
- Fields: title, description, club (pre-selected for leaders), date/time picker, location, virtual toggle + link, event type, registration link, max attendees, image upload
- Validation: date must be in future, required fields
- Available to club leaders (their clubs only) and admins (any club)

---

## Phase 6: Announcements System (Feature 6)

> Club-level and platform-wide announcements.

### Step 6.1 — Announcement Data Hooks
- Create `src/hooks/useAnnouncements.ts`
  - `useAnnouncements(clubId?)` — recent announcements, optional club filter
  - `useCreateAnnouncement()` — mutation
  - `useUpdateAnnouncement()` — mutation

### Step 6.2 — Announcements Feed Page
- Build `src/pages/AnnouncementsPage.tsx`
- Reverse-chronological feed
- Filter by: club, priority, date
- Pinned announcements at top
- Each card: title, preview text, club name, date, priority badge
- Click expands to full content

### Step 6.3 — Announcement Creation Form (Leaders/Admin)
- Build `src/features/announcements/AnnouncementForm.tsx`
- Fields: title, content (rich text or markdown), club, audience, priority, image, expiration date, pinned toggle
- Available to club leaders (their clubs) and admins (any/platform-wide)

---

## Phase 7: Club Leader Portal (Feature 7)

> Club officers manage their own club pages, events, and announcements.

### Step 7.1 — Leader Dashboard
- Build `src/pages/leader/LeaderDashboard.tsx`
- "My Clubs" list showing clubs they lead
- Quick stats per club: views, saves, upcoming events count
- Quick action buttons: Edit Club, Create Event, Post Announcement

### Step 7.2 — Club Edit (Leader View)
- Reuse admin club edit form but scoped to leader's clubs only
- Leader can edit: description, meeting schedule, social links, officers, logo/cover image
- Leader **cannot** edit: category, status, featured flag (admin only)

### Step 7.3 — Leader Event & Announcement Management
- List of their events with edit/delete actions
- List of their announcements with edit/delete actions
- Reuse creation forms from Phase 5 & 6

---

## Phase 8: Homepage & Navigation Polish (Feature 8)

### Step 8.1 — Homepage
- Build `src/pages/HomePage.tsx`
- Hero section: "Find Your Club" CTA → links to quiz or browse
- Featured clubs carousel/grid (clubs with `featured: true`)
- Upcoming events (next 5)
- Recent announcements (last 3)
- Category quick-links grid
- "Out of Comfort Zone" teaser (if quiz completed)

### Step 8.2 — Navigation & Layout Polish
- Responsive header with mobile hamburger menu
- Active route highlighting
- User avatar/menu dropdown (profile, saved clubs, sign out)
- Breadcrumbs on detail pages
- Footer with links and info

---

## Phase 9: "Out of Comfort Zone" Mode (Feature 9)

### Step 9.1 — Comfort Zone Algorithm
- Port from `quiz-matching-example.js` to `src/lib/comfortZone.ts`
- Filter for unexplored categories (not yet viewed/saved by user)
- Score range 30-70% match (compatible but different)
- Generate novelty reasons ("Explore arts clubs", "Try something creative")

### Step 9.2 — Comfort Zone Discovery Page
- Build `src/pages/ComfortZonePage.tsx`
- Requires quiz to be completed first
- Show 5-10 recommendations with novelty reasons
- Each card: club name, match %, novelty reason badge, "Why try this" explanation
- Link to club detail page

### Step 9.3 — Homepage Integration
- Add "Step Outside Your Comfort Zone" section to homepage (for users who completed quiz)
- Show 3 recommendations with "See More" link

---

## Phase 10: Analytics & Tracking (Feature 10)

### Step 10.1 — View Tracking
- Track club page views (increment `views` field on club doc)
- Track event views
- Track announcement views
- Use Firestore `increment()` for atomic updates

### Step 10.2 — Analytics Collection
- Write daily summary docs to `analytics` collection
- Track: views, saves, quiz matches, click-throughs per club per day

### Step 10.3 — Admin Analytics Dashboard (Enhanced)
- Charts for: signups over time, quiz completions, most popular clubs
- Club comparison view
- Export data as CSV

### Step 10.4 — Club Leader Analytics
- Views & saves trend for their clubs
- Quiz match frequency (how often recommended)
- Event interest counts

---

## Phase 11: UI/UX Polish & Performance (Feature 11)

### Step 11.1 — Loading States & Skeletons
- Skeleton cards for club grids
- Skeleton lines for detail pages
- Smooth transitions between loading and loaded states

### Step 11.2 — Error Handling
- Error boundaries for each route
- Toast notifications for success/error actions
- Retry buttons on failed fetches
- Form validation with clear error messages

### Step 11.3 — Mobile Responsiveness
- Test and fix all pages on mobile viewport (375px)
- Touch-friendly targets (min 44px)
- Bottom sheet modals on mobile
- Swipe-friendly navigation

### Step 11.4 — Performance Optimization
- Code splitting by route (React.lazy + Suspense)
- Image lazy loading
- Debounced search
- Firestore query optimization (pagination, caching)
- Bundle analysis and cleanup

### Step 11.5 — Accessibility
- Keyboard navigation for all interactive elements
- ARIA labels on icons and buttons
- Focus management on modals and route changes
- Color contrast compliance (WCAG AA)

---

## Phase 12: Deployment & Launch (Feature 12)

### Step 12.1 — Production Firebase Setup
- Switch Firestore rules from test mode to production security rules
- Verify all security rules work correctly
- Create composite indexes for queries

### Step 12.2 — Deployment
- Deploy frontend to Vercel (or Firebase Hosting)
- Configure environment variables in hosting platform
- Set up custom domain (optional)
- SSL verification

### Step 12.3 — Pre-Launch Testing
- Test all auth flows (Google, email, sign out)
- Test all CRUD operations across roles
- Test quiz end-to-end
- Mobile testing on real devices
- Lighthouse audit (target >90 performance)

### Step 12.4 — Launch
- Club leader onboarding emails
- Student body announcement
- Monitor error logs
- Gather feedback form

---

## Dependency Map

```
Phase 0 (Scaffolding)
  └── Phase 1 (Auth) — needed by everything below
        ├── Phase 2 (Club Discovery) — core feature
        │     └── Phase 3 (Quiz) — needs clubs data
        │     └── Phase 5 (Events) — shown on club pages
        │     └── Phase 6 (Announcements) — shown on club pages
        ├── Phase 4 (Admin) — needs auth roles
        │     └── Phase 7 (Club Leader) — similar to admin, scoped
        ├── Phase 8 (Homepage) — pulls from clubs, events, announcements
        ├── Phase 9 (Comfort Zone) — needs quiz + clubs
        └── Phase 10 (Analytics) — needs all features running
              └── Phase 11 (Polish) — final pass
                    └── Phase 12 (Deploy)
```

---

## Estimated Timeline

| Phase | Feature | Duration | Running Total |
|-------|---------|----------|---------------|
| 0 | Project Scaffolding | 1-2 days | 2 days |
| 1 | Authentication | 2-3 days | 5 days |
| 2 | Club Discovery | 3-4 days | 9 days |
| 3 | Quiz Engine | 3-4 days | 13 days |
| 4 | Admin Portal | 3-4 days | 17 days |
| 5 | Events System | 2-3 days | 20 days |
| 6 | Announcements | 2-3 days | 23 days |
| 7 | Club Leader Portal | 2-3 days | 26 days |
| 8 | Homepage & Nav | 1-2 days | 28 days |
| 9 | Comfort Zone | 1-2 days | 30 days |
| 10 | Analytics | 2-3 days | 33 days |
| 11 | Polish & Performance | 3-5 days | 38 days |
| 12 | Deploy & Launch | 2-3 days | 41 days |

**Total: ~6-8 weeks** (aligns with original estimate)

---

*Track progress in → [DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md)*
