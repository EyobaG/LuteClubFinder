# PLU Club Database - Migration Summary

## Quick Stats

- **Total Clubs**: 55
- **Data Source**: Club List(2).xlsx
- **Target**: Firebase Firestore

## Data Quality Analysis

### Completeness

| Field | Missing | Percentage |
|-------|---------|------------|
| Club Email | 3 clubs | 5.5% |
| Website/Social | 11 clubs | 20% |
| Meeting Time | 25 clubs | 45.5% |
| Meeting Location | 25 clubs | 45.5% |
| Secondary Contact | 6 clubs | 10.9% |
| Description | 2 clubs | 3.6% |

### Issues Found

1. **Duplicate Entry**: Men's Lacrosse appears twice (rows 21 & 32)
2. **Incomplete Descriptions**: 2 clubs flagged as needing descriptions
3. **Missing Meeting Info**: Many clubs don't have scheduled meeting times yet

## Transformation Features

### Auto-Categorization (9 Categories)

The script intelligently categorizes clubs based on keywords:

- **Academic** (8 clubs): Computer Science, Chemistry, Pre-Health, etc.
- **Cultural** (6 clubs): APISA, BSU, LatinX Unidos, NISA, etc.
- **Faith** (3 clubs): InterVarsity, FCA, Young Life
- **Arts** (11 clubs): Theatre, Music, Dance, Media clubs
- **Recreational** (7 clubs): Sports and outdoor clubs
- **Professional** (5 clubs): Finance, DECA, ROTC, Investment Fund
- **Service** (3 clubs): Red Cross, MEDLIFE, Social Work
- **Gaming** (2 clubs): Gamer's Guild, Planeswalker's Society
- **Special Interest** (10 clubs): Everything else

### Smart Tag Generation

Each club gets relevant tags for discovery:

- Category-based tags (e.g., "learning", "community", "creative")
- Activity-based tags (e.g., "music", "technology", "volunteering")
- Accessibility tags (e.g., "beginner-friendly")

### Vibe Assignment

Clubs are assigned personality vibes for matching:

- **Casual**: Gaming, recreational clubs
- **Creative**: Arts and cultural clubs
- **Professional**: Business and career clubs
- **Community-focused**: Service organizations
- **Competitive**: Sports clubs
- **Learning-focused**: Academic clubs

### Meeting Schedule Parsing

The script intelligently parses meeting times:

```
Input: "(T) 6:00pm-7:00pm"
Output: {
  frequency: "weekly",
  dayOfWeek: "Tuesday",
  time: "6:00pm-7:00pm",
  location: "Morken 203"
}
```

Handles:
- Multiple days: "(M, W, F)"
- Biweekly: "Every other Friday"
- Monthly: "Every Third Wednesday"
- Variable: "1-2 times a month"

### Time Commitment Inference

Based on meeting frequency and category:

- **Low** (1-2 hrs/week): Single weekly meetings
- **Medium** (3-5 hrs/week): Multiple meetings or professional clubs
- **High** (6+ hrs/week): Daily meetings or intensive programs

## Sample Transformed Club

```json
{
  "originalId": "9",
  "name": "Computer Science Club",
  "slug": "computer-science-club",
  "description": "Computer Science Club is a student organization at PLU. More information coming soon!",
  "shortDescription": "Join Computer Science Club!",
  "contactEmail": null,
  "website": null,
  "socialLinks": null,
  "meetingSchedule": {
    "frequency": "weekly",
    "dayOfWeek": "Tuesday",
    "time": "6:00pm-7:00pm",
    "location": "Morken 203",
    "virtual": false
  },
  "category": "academic",
  "tags": ["learning", "education", "career", "technology"],
  "vibes": ["learning-focused"],
  "attributes": {
    "timeCommitment": "low",
    "experienceRequired": "beginner",
    "groupSize": "medium",
    "activityType": ["meetings"],
    "bestFor": ["learning", "education", "career"]
  },
  "officers": [
    {
      "name": "Ember McEwen",
      "role": "President",
      "email": "mcewenog@plu.edu",
      "userId": null
    },
    {
      "name": "Kobe Cortez",
      "role": "Vice President",
      "email": "kcortez@plu.edu",
      "userId": null
    }
  ],
  "status": "active",
  "verified": false,
  "featured": false,
  "memberCount": 0,
  "views": 0,
  "saves": 0
}
```

## Migration Workflow

```
┌─────────────────┐
│  club_list.csv  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  data-analysis  │ ← Analyze data quality
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ clean-transform │ ← Enrich & categorize
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│clubs-transformed│
│     .json       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│firestore-import │ ← Upload to Firebase
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore DB  │
│   ✓ clubs       │
│   ✓ quizQuestions│
│   ✓ config      │
└─────────────────┘
```

## Post-Migration Checklist

### Immediate (Day 1)
- [ ] Run migration scripts
- [ ] Verify data in Firebase Console
- [ ] Set up security rules
- [ ] Add your admin email to config
- [ ] Remove duplicate Men's Lacrosse entry

### Short-term (Week 1)
- [ ] Add club logos and cover images
- [ ] Fill in missing descriptions (2 clubs)
- [ ] Verify officer contact information
- [ ] Test authentication flow
- [ ] Deploy initial frontend

### Medium-term (Month 1)
- [ ] Invite club leaders to claim accounts
- [ ] Verify and update meeting schedules
- [ ] Add missing website/social links
- [ ] Test quiz matching algorithm
- [ ] Gather student feedback

### Ongoing
- [ ] Monitor data quality
- [ ] Update club information as needed
- [ ] Add new clubs as they form
- [ ] Refine categorization and tags
- [ ] Improve matching algorithm based on usage

## Key Insights

### Most Complete Clubs
Clubs with full information ready to go:
- Chemistry Club
- Finance Club
- GREAN Club
- InterVarsity Christian Fellowship
- MEDLIFE Chapter
- Regent's Investment Fund

### Clubs Needing Attention
- Creative Writing Club (needs description)
- NAMI on Campus PLU (needs description)
- American Red Cross Club (missing email)
- Several clubs missing meeting schedules

### Popular Categories
1. Arts (11 clubs) - Largest category
2. Special Interest (10 clubs)
3. Academic (8 clubs)
4. Recreational (7 clubs)

### Meeting Patterns
- Most clubs meet weekly
- Tuesday and Thursday are most popular days
- Evening meetings (6-8pm) are most common
- Some clubs have flexible/variable schedules

## Technical Notes

### Firestore Structure
```
/clubs/{clubId}
/users/{userId}
/events/{eventId}
/announcements/{announcementId}
/quizQuestions/{questionId}
/analytics/{analyticsId}
/config/admins
```

### Indexes Needed
Create composite indexes for:
- `clubs`: (category, status)
- `clubs`: (tags, status)
- `events`: (clubId, startTime)
- `announcements`: (clubId, publishedAt)

### Security Considerations
- All reads require @plu.edu authentication
- Club leaders can only edit their own clubs
- Admins have full access
- Analytics are restricted to club leaders and admins

## Cost Estimates

### Firestore Free Tier
- 50K reads/day
- 20K writes/day
- 1GB storage

### Expected Usage (3,000 students)
- Daily active users: 300-500 (10-15%)
- Reads per user: ~50 (club browsing)
- Total daily reads: 15K-25K ✓ Within free tier
- Storage: <100MB ✓ Well within limit

**Conclusion**: Should stay within free tier with proper optimization.

## Success Metrics

Track these after launch:

### Engagement
- Quiz completion rate (target: >60%)
- Clubs viewed per session (target: 5+)
- Return visitor rate (target: >40%)

### Discovery
- Search vs. quiz discovery ratio
- Category diversity explored
- "Comfort zone" feature usage

### Platform Health
- Club profile completion (target: >80%)
- Active club leader accounts (target: >70%)
- Event posting frequency
- Announcement engagement

---

**Ready to migrate?** Head to the `migration/` directory and follow the README!
