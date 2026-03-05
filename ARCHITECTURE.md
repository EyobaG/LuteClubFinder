# Lute Club Finder - System Architecture & Data Model

## Executive Summary

A full-stack web platform for PLU students to discover, join, and engage with campus clubs through intelligent matching, personalized recommendations, and streamlined club management.

## Technology Stack Recommendation

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js with Express or Next.js API routes
- **Database**: Firebase Firestore (recommended) or MongoDB Atlas
- **Authentication**: Firebase Auth with Google Sign-In
- **Storage**: Firebase Storage (for club images/media)
- **Hosting**: Vercel (frontend) + Firebase (backend services)

### Why Firebase Firestore?
- Real-time updates for announcements/events
- Built-in authentication with email domain restrictions
- Excellent security rules for role-based access
- Scalable with minimal DevOps overhead
- Free tier suitable for PLU student body size

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Discovery│  │   Quiz   │  │  Events  │  │  Admin   │   │
│  │   Page   │  │  Engine  │  │ Calendar │  │  Portal  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Express/Next.js API)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Clubs   │  │  Quiz    │  │  Admin   │   │
│  │Middleware│  │   API    │  │ Matching │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Firestore │  │ Storage  │  │Functions │   │
│  │ (@plu.edu│  │ Database │  │  (Media) │  │(Triggers)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## NoSQL Data Model (Firestore)

### Collection: `users`
```javascript
{
  uid: "firebase_auth_uid",
  email: "student@plu.edu",
  displayName: "John Doe",
  role: "student" | "club_leader" | "admin",
  clubLeaderOf: ["club_id_1", "club_id_2"], // Array of club IDs they lead
  preferences: {
    interests: ["technology", "music", "service"],
    timeCommitment: "low" | "medium" | "high",
    experienceLevel: "beginner" | "intermediate" | "advanced",
    meetingPreferences: ["weekday_evening", "weekend"],
    vibes: ["casual", "competitive", "social"]
  },
  savedClubs: ["club_id_1", "club_id_3"], // Bookmarked clubs
  quizCompleted: true,
  quizResults: {
    completedAt: timestamp,
    matchScores: {
      "club_id_1": 0.85,
      "club_id_2": 0.72
    }
  },
  createdAt: timestamp,
  lastActive: timestamp
}
```

### Collection: `clubs`
```javascript
{
  id: "auto_generated_id",
  name: "PLU Coding Club",
  slug: "plu-coding-club", // URL-friendly
  description: "A community for students passionate about programming...",
  shortDescription: "Learn to code and build projects together", // For cards
  
  // Contact & Social
  contactEmail: "codingclub@plu.edu",
  website: "https://plucodingclub.com",
  socialLinks: {
    instagram: "@plucodingclub",
    discord: "discord.gg/plucode",
    facebook: "facebook.com/plucodingclub"
  },
  
  // Meeting Information
  meetingSchedule: {
    frequency: "weekly" | "biweekly" | "monthly" | "varies",
    dayOfWeek: "Monday",
    time: "6:00 PM - 7:30 PM",
    location: "Xavier Hall 101",
    virtual: false
  },
  
  // Categorization & Discovery
  category: "academic" | "cultural" | "service" | "recreational" | "professional" | "special_interest",
  tags: ["technology", "programming", "career", "beginner-friendly"],
  vibes: ["casual", "collaborative", "learning-focused"],
  
  // Quiz Matching Attributes
  attributes: {
    timeCommitment: "medium", // low (1-2hrs/week), medium (3-5hrs), high (6+hrs)
    experienceRequired: "beginner", // beginner, intermediate, advanced
    groupSize: "medium", // small (<15), medium (15-30), large (30+)
    activityType: ["meetings", "projects", "events"],
    bestFor: ["networking", "skill-building", "fun"]
  },
  
  // Leadership
  officers: [
    {
      name: "Jane Smith",
      role: "President",
      email: "jsmith@plu.edu",
      userId: "user_id_if_registered" // Link to users collection
    }
  ],
  
  // Media
  logo: "gs://bucket/clubs/coding-club-logo.png",
  coverImage: "gs://bucket/clubs/coding-club-cover.jpg",
  gallery: ["image_url_1", "image_url_2"],
  
  // Metadata
  status: "active" | "inactive" | "pending_approval",
  memberCount: 45, // Approximate or tracked
  featured: false, // Highlight on homepage
  verified: true, // Admin verified
  
  // Engagement
  views: 234,
  saves: 18,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  lastModifiedBy: "user_id"
}
```

### Collection: `announcements`
```javascript
{
  id: "auto_generated_id",
  title: "Welcome Week Kickoff!",
  content: "Join us for our first meeting of the semester...",
  type: "club" | "platform", // Club-specific or platform-wide
  
  // Association
  clubId: "club_id" | null, // null for platform announcements
  clubName: "PLU Coding Club", // Denormalized for quick display
  
  // Targeting
  audience: "all" | "members" | "leaders", // Future: target specific groups
  priority: "normal" | "high" | "urgent",
  
  // Media
  imageUrl: "optional_image_url",
  
  // Metadata
  authorId: "user_id",
  authorName: "Jane Smith",
  publishedAt: timestamp,
  expiresAt: timestamp | null, // Auto-hide after date
  pinned: false,
  
  // Engagement
  views: 156,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `events`
```javascript
{
  id: "auto_generated_id",
  title: "Hackathon 2024",
  description: "24-hour coding competition with prizes...",
  
  // Association
  clubId: "club_id",
  clubName: "PLU Coding Club",
  
  // Event Details
  startTime: timestamp,
  endTime: timestamp,
  location: "Xavier Hall Auditorium",
  virtual: false,
  virtualLink: "zoom.us/j/123456" | null,
  
  // Registration
  requiresRegistration: true,
  registrationLink: "forms.gle/abc123",
  maxAttendees: 50 | null,
  currentAttendees: 23,
  
  // Categorization
  eventType: "meeting" | "social" | "competition" | "workshop" | "service" | "other",
  tags: ["technology", "competition", "networking"],
  
  // Media
  imageUrl: "event_poster_url",
  
  // Metadata
  createdBy: "user_id",
  status: "upcoming" | "ongoing" | "completed" | "cancelled",
  featured: false,
  
  // Engagement
  interestedCount: 34, // Students who marked "interested"
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `quizQuestions`
```javascript
{
  id: "auto_generated_id",
  question: "How much time can you commit to club activities per week?",
  type: "single_choice" | "multiple_choice" | "scale" | "ranking",
  order: 1,
  
  options: [
    {
      id: "opt_1",
      text: "1-2 hours (low commitment)",
      value: "low",
      weight: 1
    },
    {
      id: "opt_2",
      text: "3-5 hours (moderate commitment)",
      value: "medium",
      weight: 2
    },
    {
      id: "opt_3",
      text: "6+ hours (high commitment)",
      value: "high",
      weight: 3
    }
  ],
  
  // Matching Logic
  matchingAttribute: "timeCommitment", // Maps to club.attributes
  category: "logistics" | "interests" | "personality" | "goals",
  
  active: true,
  createdAt: timestamp
}
```

### Collection: `analytics`
```javascript
{
  id: "date_clubId", // e.g., "2024-02-10_club123"
  date: "2024-02-10",
  clubId: "club_id" | "platform", // "platform" for site-wide stats
  
  metrics: {
    views: 45,
    saves: 8,
    quizMatches: 12, // Times recommended in quiz
    clickThroughs: 6, // Clicks to external links
    eventViews: 23,
    announcementViews: 34
  },
  
  // Aggregated over time
  period: "daily" | "weekly" | "monthly",
  
  createdAt: timestamp
}
```

### Collection: `clubEdits` (Moderation Queue)
```javascript
{
  id: "auto_generated_id",
  clubId: "club_id",
  editedBy: "user_id",
  editType: "create" | "update" | "delete",
  
  // Store proposed changes
  proposedChanges: {
    description: "New description...",
    meetingSchedule: { /* updated schedule */ }
  },
  
  status: "pending" | "approved" | "rejected",
  reviewedBy: "admin_user_id" | null,
  reviewedAt: timestamp | null,
  reviewNotes: "Looks good!" | null,
  
  createdAt: timestamp
}
```

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isPLUEmail() {
      return isSignedIn() && 
             request.auth.token.email.matches('.*@plu.edu$');
    }
    
    function isAdmin() {
      return isPLUEmail() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isClubLeader(clubId) {
      return isPLUEmail() && 
             clubId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clubLeaderOf;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isPLUEmail();
      allow create: if isPLUEmail() && request.auth.uid == userId;
      allow update: if isPLUEmail() && 
                      (request.auth.uid == userId || isAdmin());
    }
    
    // Clubs collection
    match /clubs/{clubId} {
      allow read: if true; // Public discovery
      allow create: if isAdmin();
      allow update: if isAdmin() || isClubLeader(clubId);
      allow delete: if isAdmin();
    }
    
    // Announcements
    match /announcements/{announcementId} {
      allow read: if true; // Public — shown on homepage
      allow create: if isPLUEmail() && 
                      (isAdmin() || 
                       isClubLeader(request.resource.data.clubId));
      allow update, delete: if isAdmin() || 
                              (isClubLeader(resource.data.clubId) && 
                               request.auth.uid == resource.data.authorId);
    }
    
    // Events
    match /events/{eventId} {
      allow read: if true; // Public — shown on homepage
      allow create: if isPLUEmail() && 
                      (isAdmin() || isClubLeader(request.resource.data.clubId));
      allow update, delete: if isAdmin() || 
                              isClubLeader(resource.data.clubId);
    }
    
    // Quiz questions (read-only for students)
    match /quizQuestions/{questionId} {
      allow read: if isPLUEmail();
      allow write: if isAdmin();
    }
    
    // Analytics (restricted)
    match /analytics/{analyticsId} {
      allow read: if isAdmin() || 
                    (isClubLeader(resource.data.clubId));
      allow write: if false; // Only via Cloud Functions
    }
  }
}
```

## Quiz Matching Algorithm

### Approach: Weighted Attribute Scoring

```javascript
function calculateClubMatch(userPreferences, club) {
  let totalScore = 0;
  let maxScore = 0;
  
  // 1. Time Commitment Match (Weight: 25%)
  const timeWeight = 0.25;
  if (userPreferences.timeCommitment === club.attributes.timeCommitment) {
    totalScore += 100 * timeWeight;
  } else {
    // Partial credit for adjacent levels
    const timeMap = { low: 0, medium: 1, high: 2 };
    const diff = Math.abs(
      timeMap[userPreferences.timeCommitment] - 
      timeMap[club.attributes.timeCommitment]
    );
    totalScore += (100 - diff * 50) * timeWeight;
  }
  maxScore += 100 * timeWeight;
  
  // 2. Interest Tags Match (Weight: 35%)
  const interestWeight = 0.35;
  const matchingTags = userPreferences.interests.filter(
    interest => club.tags.includes(interest)
  );
  const interestScore = (matchingTags.length / userPreferences.interests.length) * 100;
  totalScore += interestScore * interestWeight;
  maxScore += 100 * interestWeight;
  
  // 3. Vibe Match (Weight: 20%)
  const vibeWeight = 0.20;
  const matchingVibes = userPreferences.vibes.filter(
    vibe => club.vibes.includes(vibe)
  );
  const vibeScore = matchingVibes.length > 0 
    ? (matchingVibes.length / userPreferences.vibes.length) * 100 
    : 0;
  totalScore += vibeScore * vibeWeight;
  maxScore += 100 * vibeWeight;
  
  // 4. Experience Level Match (Weight: 10%)
  const expWeight = 0.10;
  if (userPreferences.experienceLevel === club.attributes.experienceRequired ||
      club.attributes.experienceRequired === 'beginner') {
    totalScore += 100 * expWeight;
  }
  maxScore += 100 * expWeight;
  
  // 5. Meeting Time Preference (Weight: 10%)
  const meetingWeight = 0.10;
  const clubMeetingTime = determineMeetingTimeCategory(club.meetingSchedule);
  if (userPreferences.meetingPreferences.includes(clubMeetingTime)) {
    totalScore += 100 * meetingWeight;
  }
  maxScore += 100 * meetingWeight;
  
  // Normalize to 0-1 scale
  return totalScore / maxScore;
}

// "Out of Comfort Zone" Mode
function getComfortZoneRecommendations(userPreferences, allClubs, userHistory) {
  // Find clubs that:
  // 1. User hasn't saved or viewed extensively
  // 2. Have different tags than user's typical interests
  // 3. Still have some compatibility (score > 0.3)
  
  const unexploredCategories = findUnexploredCategories(userHistory);
  
  return allClubs
    .filter(club => 
      !userHistory.viewedClubs.includes(club.id) &&
      unexploredCategories.includes(club.category)
    )
    .map(club => ({
      club,
      score: calculateClubMatch(userPreferences, club),
      noveltyReason: generateNoveltyReason(club, userPreferences)
    }))
    .filter(result => result.score > 0.3 && result.score < 0.7)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
```

## Authentication Flow

### Firebase Auth Configuration

```javascript
// Initialize Firebase Auth with domain restriction
const firebaseConfig = {
  // ... config
};

const auth = getAuth(app);

// Google Sign-In with domain restriction
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  hd: 'plu.edu' // Hosted domain restriction
});

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;
    
    // Double-check domain (client-side)
    if (!email.endsWith('@plu.edu')) {
      await auth.signOut();
      throw new Error('Only @plu.edu emails are allowed');
    }
    
    // Create/update user document
    await createOrUpdateUser(result.user);
    
  } catch (error) {
    console.error('Sign-in error:', error);
  }
}

// Email/Password sign-up with validation
async function signUpWithEmail(email, password) {
  if (!email.endsWith('@plu.edu')) {
    throw new Error('Only @plu.edu emails are allowed');
  }
  
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    email, 
    password
  );
  
  // Send verification email
  await sendEmailVerification(userCredential.user);
  
  await createOrUpdateUser(userCredential.user);
}
```

### Role Assignment Logic

```javascript
// Cloud Function: Assign roles on user creation
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  
  // Check if email matches any club officer
  const clubsSnapshot = await db.collection('clubs')
    .where('officers', 'array-contains-any', [{ email }])
    .get();
  
  const clubLeaderOf = clubsSnapshot.docs.map(doc => doc.id);
  
  // Check admin list (stored in Firestore config)
  const adminConfig = await db.collection('config').doc('admins').get();
  const isAdmin = adminConfig.data().emails.includes(email);
  
  // Create user document
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: email,
    displayName: user.displayName || email.split('@')[0],
    role: isAdmin ? 'admin' : (clubLeaderOf.length > 0 ? 'club_leader' : 'student'),
    clubLeaderOf: clubLeaderOf,
    createdAt: FieldValue.serverTimestamp(),
    lastActive: FieldValue.serverTimestamp()
  });
});
```

## API Endpoints

### Core Routes

```
Authentication:
POST   /api/auth/signup          - Email/password signup
POST   /api/auth/signin          - Email/password signin
POST   /api/auth/google          - Google OAuth
POST   /api/auth/signout         - Sign out
GET    /api/auth/me              - Get current user

Clubs:
GET    /api/clubs                - List all clubs (with filters)
GET    /api/clubs/:id            - Get club details
POST   /api/clubs                - Create club (admin only)
PUT    /api/clubs/:id            - Update club (admin/leader)
DELETE /api/clubs/:id            - Delete club (admin only)
GET    /api/clubs/:id/analytics  - Get club analytics (leader/admin)

Discovery:
GET    /api/discover/featured    - Featured clubs
GET    /api/discover/search      - Search clubs
GET    /api/discover/comfort-zone - Out of comfort zone recommendations

Quiz:
GET    /api/quiz/questions       - Get quiz questions
POST   /api/quiz/submit          - Submit quiz answers
GET    /api/quiz/matches         - Get personalized matches

Events:
GET    /api/events               - List events (with filters)
GET    /api/events/:id           - Get event details
POST   /api/events               - Create event (leader/admin)
PUT    /api/events/:id           - Update event
DELETE /api/events/:id           - Delete event

Announcements:
GET    /api/announcements        - List announcements
GET    /api/announcements/:id    - Get announcement
POST   /api/announcements        - Create announcement (leader/admin)
PUT    /api/announcements/:id    - Update announcement
DELETE /api/announcements/:id    - Delete announcement

Admin:
GET    /api/admin/users          - List all users
PUT    /api/admin/users/:id/role - Update user role
GET    /api/admin/analytics      - Platform analytics
GET    /api/admin/edits          - Pending club edits
POST   /api/admin/edits/:id/approve - Approve edit
POST   /api/admin/edits/:id/reject  - Reject edit
```

## CSV Migration Strategy

### Step 1: Data Cleaning Script

```javascript
const csv = require('csv-parser');
const fs = require('fs');

const clubs = [];

fs.createReadStream('plu_clubs.csv')
  .pipe(csv())
  .on('data', (row) => {
    clubs.push({
      name: row['Club Name']?.trim(),
      contactEmail: row['Contact Email']?.trim().toLowerCase(),
      website: row['Website']?.trim(),
      meetingTime: row['Meeting Time']?.trim(),
      officers: parseOfficers(row), // Custom parser
      // Set defaults for missing fields
      description: row['Description'] || 'Description coming soon!',
      category: inferCategory(row['Club Name']), // Smart categorization
      status: 'active',
      verified: false // Require manual verification
    });
  })
  .on('end', () => {
    console.log(`Parsed ${clubs.length} clubs`);
    // Next: validate and import
  });
```

### Step 2: Firestore Import

```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function importClubs(clubs) {
  const batch = db.batch();
  
  for (const club of clubs) {
    const clubRef = db.collection('clubs').doc();
    batch.set(clubRef, {
      ...club,
      slug: generateSlug(club.name),
      tags: [], // To be filled by admin
      vibes: [],
      attributes: {
        timeCommitment: 'medium',
        experienceRequired: 'beginner',
        groupSize: 'medium',
        activityType: ['meetings'],
        bestFor: []
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await batch.commit();
  console.log('Import complete!');
}
```

## Stretch Features

### 1. Smart Notifications
- Push notifications for new events from saved clubs
- Weekly digest of recommended clubs based on activity
- Reminder notifications for upcoming events

### 2. Social Features
- "Friends at this club" - see which connections are members
- Club reviews and ratings from verified members
- Photo galleries from club events

### 3. Gamification
- Badges for exploring different club categories
- "Explorer" status for trying clubs outside comfort zone
- Leaderboard for most engaged students (opt-in)

### 4. Advanced Analytics
- Heatmap of popular meeting times
- Trend analysis: growing vs. declining clubs
- Diversity metrics: how many categories students explore

### 5. Integration Features
- iCal/Google Calendar export for events
- Slack/Discord bot for announcements
- Email digest subscriptions

### 6. AI Enhancements
- Natural language search: "clubs that meet on weekends"
- Auto-generate club descriptions from website scraping
- Chatbot for club discovery questions

### 7. Accessibility
- Screen reader optimization
- High contrast mode
- Keyboard navigation throughout

## Implementation Phases

### Phase 1: MVP (4-6 weeks)
- Basic authentication (@plu.edu restriction)
- Club discovery with search and filters
- Simple quiz (5-7 questions)
- Admin portal for club management
- CSV data migration

### Phase 2: Engagement (3-4 weeks)
- Events calendar
- Announcements system
- Club leader portal
- Save/bookmark functionality
- Enhanced quiz algorithm

### Phase 3: Polish (2-3 weeks)
- Analytics dashboard
- Out of comfort zone mode
- Email notifications
- Mobile responsiveness
- Performance optimization

### Phase 4: Growth (Ongoing)
- Stretch features based on user feedback
- A/B testing for quiz effectiveness
- Integration with PLU systems
- Marketing and adoption campaigns

## Performance Considerations

### Firestore Optimization
- Use composite indexes for complex queries
- Implement pagination (limit 20-50 clubs per page)
- Cache frequently accessed data (featured clubs)
- Use Firestore bundles for initial data load

### Frontend Optimization
- Lazy load images with placeholders
- Code splitting by route
- Service worker for offline capability
- Debounce search inputs

### Cost Management
- Firestore free tier: 50K reads/day, 20K writes/day
- Estimated PLU student body: ~3,000 students
- Expected daily active users: 300-500 (10-15%)
- Should stay within free tier with optimization

## Security Checklist

- [ ] Email domain validation (client + server)
- [ ] Firestore security rules tested
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization for user-generated content
- [ ] HTTPS only
- [ ] Environment variables for secrets
- [ ] Regular security audits
- [ ] GDPR/privacy compliance (data export/deletion)

## Success Metrics

### Engagement
- Daily active users (target: 15% of student body)
- Quiz completion rate (target: >60%)
- Average clubs viewed per session (target: 5+)
- Return visitor rate (target: >40%)

### Discovery
- Clubs discovered via quiz vs. search
- "Out of comfort zone" feature usage
- Diversity of club categories explored

### Platform Health
- Club profile completion rate (target: >80%)
- Active club leader accounts (target: >70%)
- Event posting frequency
- Announcement engagement

---

This architecture provides a solid foundation for a scalable, maintainable platform that can grow with PLU's needs. The NoSQL schema is flexible enough to accommodate new features while maintaining data integrity through proper security rules.
