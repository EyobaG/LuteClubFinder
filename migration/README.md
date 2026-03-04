# PLU Club Finder - Data Migration Guide

This directory contains scripts to migrate your club data from CSV to Firebase Firestore.

## Overview

The migration process has 3 steps:

1. **Analyze** - Understand data quality and completeness
2. **Transform** - Clean and enrich the data with smart categorization
3. **Import** - Upload to Firestore with proper structure

## Prerequisites

1. Node.js installed (v16 or higher)
2. Firebase project created
3. Service account key downloaded from Firebase Console

## Setup

### 1. Install Dependencies

```bash
cd migration
npm install
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `serviceAccountKey.json` in this directory

⚠️ **Important**: Never commit `serviceAccountKey.json` to version control!

## Migration Steps

### Step 1: Analyze the Data

```bash
npm run analyze
```

This will show you:
- Total number of clubs
- Missing data percentages
- Potential duplicates
- Overall data quality score

### Step 2: Transform the Data

```bash
npm run transform
```

This script:
- Cleans and normalizes all fields
- Generates URL-friendly slugs
- Infers categories (academic, cultural, arts, etc.)
- Creates tags for discovery
- Assigns vibes (casual, competitive, etc.)
- Parses meeting schedules
- Structures officer information
- Outputs `clubs-transformed.json`

**Smart Features:**
- Auto-categorizes clubs based on name and description
- Generates relevant tags for matching algorithm
- Normalizes social media links
- Infers time commitment levels
- Provides sensible defaults for missing data

### Step 3: Import to Firestore

```bash
npm run import
```

This will:
- Upload all clubs to Firestore
- Create initial admin configuration
- Generate sample quiz questions
- Set up proper timestamps

**Or run everything at once:**

```bash
npm run migrate
```

## What Gets Created

### Collections

1. **clubs** - All 55 PLU clubs with enriched data
2. **quizQuestions** - 5 sample quiz questions for matching
3. **config** - Admin configuration

### Data Enhancements

Each club gets:
- ✅ Smart categorization (9 categories)
- ✅ Auto-generated tags for discovery
- ✅ Vibe assignments for personality matching
- ✅ Time commitment inference
- ✅ Structured meeting schedules
- ✅ Normalized social links
- ✅ URL-friendly slugs
- ✅ Default values for missing fields

## Categories Generated

- `academic` - STEM, pre-health, academic clubs
- `cultural` - Identity-based organizations
- `faith` - Religious and spiritual groups
- `arts` - Music, theatre, dance, visual arts
- `recreational` - Sports and outdoor activities
- `professional` - Business, career-focused clubs
- `service` - Community service organizations
- `gaming` - Gaming and strategy clubs
- `special_interest` - Everything else

## Post-Migration Tasks

### 1. Verify Data in Firebase Console

1. Go to Firestore Database
2. Check the `clubs` collection
3. Verify a few random clubs look correct

### 2. Update Admin Emails

Edit `firestore-import.js` line 87 to add your admin email:

```javascript
emails: [
  'youremail@plu.edu'  // Add your email here
]
```

Then re-run: `npm run import`

### 3. Assign Club Leaders

Run this script to match officer emails with user accounts:

```javascript
// After users start signing up, run this to assign club leader roles
const assignClubLeaders = async () => {
  const clubsSnapshot = await db.collection('clubs').get();
  
  for (const clubDoc of clubsSnapshot.docs) {
    const club = clubDoc.data();
    const officerEmails = club.officers.map(o => o.email);
    
    // Find users with these emails
    const usersSnapshot = await db.collection('users')
      .where('email', 'in', officerEmails)
      .get();
    
    for (const userDoc of usersSnapshot.docs) {
      await db.collection('users').doc(userDoc.id).update({
        role: 'club_leader',
        clubLeaderOf: admin.firestore.FieldValue.arrayUnion(clubDoc.id)
      });
    }
  }
};
```

### 4. Manual Data Enrichment

Some clubs need manual attention:

- **2 clubs** need descriptions (marked with `needsDescription: true`)
- **Men's Lacrosse** appears twice (IDs 21 and 32) - remove duplicate
- Add club logos and cover images
- Verify meeting times are current
- Update any outdated information

### 5. Set Up Security Rules

Copy the security rules from `ARCHITECTURE.md` to your Firebase Console:

1. Go to Firestore Database > Rules
2. Paste the rules from the architecture document
3. Publish

## Troubleshooting

### "serviceAccountKey.json not found"

Download it from Firebase Console > Project Settings > Service Accounts

### "Permission denied" errors

Make sure your service account has Firestore Admin permissions

### Duplicate clubs

The CSV has 2 Men's Lacrosse entries. After import, manually delete one:
- Keep the one with more complete information
- Update any references

### Missing data

Some clubs are missing:
- Email addresses (3 clubs)
- Websites/social media (11 clubs)
- Meeting times (many clubs)

These will show as "TBD" or null. Club leaders can update them later through the portal.

## Data Quality Report

Based on the CSV analysis:

- **Total Clubs**: 55
- **Complete Contact Info**: ~95%
- **Has Meeting Schedule**: ~60%
- **Needs Description**: 2 clubs
- **Overall Quality**: Good ✓

## Next Steps

After migration:

1. ✅ Set up Firebase Authentication
2. ✅ Deploy security rules
3. ✅ Build the frontend
4. ✅ Create admin portal
5. ✅ Test quiz matching algorithm
6. ✅ Invite club leaders to claim their clubs

## Support

If you encounter issues:

1. Check the Firebase Console for error messages
2. Verify your service account permissions
3. Review the transformed JSON before importing
4. Check Firestore quotas (free tier limits)

---

**Ready to migrate?** Run `npm run migrate` and watch the magic happen! ✨
