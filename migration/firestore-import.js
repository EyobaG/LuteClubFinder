// Firestore Import Script
// Imports cleaned club data into Firebase Firestore

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and save it as 'serviceAccountKey.json' in this directory

try {
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✓ Firebase Admin initialized');
} catch (error) {
  console.error('Error: serviceAccountKey.json not found!');
  console.error('Download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

async function importClubs() {
  try {
    // Read transformed data
    const clubsData = JSON.parse(
      fs.readFileSync('clubs-transformed.json', 'utf8')
    );

    console.log(`Starting import of ${clubsData.length} clubs...`);

    // Use batched writes for efficiency (max 500 per batch)
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;
    let totalImported = 0;

    for (const club of clubsData) {
      // Create document reference with auto-generated ID
      const clubRef = db.collection('clubs').doc();
      
      // Prepare data for Firestore
      const firestoreData = {
        ...club,
        // Add Firestore timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: 'migration_script'
      };

      // Remove null values (Firestore doesn't like them)
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key] === null) {
          delete firestoreData[key];
        }
      });

      batch.set(clubRef, firestoreData);
      operationCount++;
      totalImported++;

      // Commit batch when it reaches size limit
      if (operationCount === batchSize) {
        await batch.commit();
        console.log(`  Imported ${totalImported} clubs...`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`\n✓ Successfully imported ${totalImported} clubs to Firestore!`);
    
    // Create initial admin user (optional)
    await createInitialAdmin();
    
    // Create sample quiz questions
    await createSampleQuizQuestions();

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

async function createInitialAdmin() {
  console.log('\nCreating initial admin configuration...');
  
  // Store admin emails in a config document
  await db.collection('config').doc('admins').set({
    emails: [
      // Add your admin email here
      'admin@plu.edu'
    ],
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✓ Admin config created');
}

async function createSampleQuizQuestions() {
  console.log('\nCreating sample quiz questions...');

  const questions = [
    {
      question: 'How much time can you commit to club activities per week?',
      type: 'single_choice',
      order: 1,
      options: [
        { id: 'opt_1', text: '1-2 hours (low commitment)', value: 'low', weight: 1 },
        { id: 'opt_2', text: '3-5 hours (moderate commitment)', value: 'medium', weight: 2 },
        { id: 'opt_3', text: '6+ hours (high commitment)', value: 'high', weight: 3 }
      ],
      matchingAttribute: 'timeCommitment',
      category: 'logistics',
      active: true
    },
    {
      question: 'What are your main interests? (Select all that apply)',
      type: 'multiple_choice',
      order: 2,
      options: [
        { id: 'opt_1', text: 'Technology & Coding', value: 'technology', weight: 1 },
        { id: 'opt_2', text: 'Arts & Performance', value: 'creative', weight: 1 },
        { id: 'opt_3', text: 'Sports & Fitness', value: 'fitness', weight: 1 },
        { id: 'opt_4', text: 'Community Service', value: 'volunteering', weight: 1 },
        { id: 'opt_5', text: 'Cultural & Diversity', value: 'diversity', weight: 1 },
        { id: 'opt_6', text: 'Business & Career', value: 'career', weight: 1 },
        { id: 'opt_7', text: 'Faith & Spirituality', value: 'spirituality', weight: 1 },
        { id: 'opt_8', text: 'Gaming & Strategy', value: 'gaming', weight: 1 }
      ],
      matchingAttribute: 'tags',
      category: 'interests',
      active: true
    },
    {
      question: 'What kind of vibe are you looking for?',
      type: 'multiple_choice',
      order: 3,
      options: [
        { id: 'opt_1', text: 'Casual and relaxed', value: 'casual', weight: 1 },
        { id: 'opt_2', text: 'Competitive and driven', value: 'competitive', weight: 1 },
        { id: 'opt_3', text: 'Professional and career-focused', value: 'professional', weight: 1 },
        { id: 'opt_4', text: 'Creative and expressive', value: 'creative', weight: 1 },
        { id: 'opt_5', text: 'Community-focused', value: 'community-focused', weight: 1 }
      ],
      matchingAttribute: 'vibes',
      category: 'personality',
      active: true
    },
    {
      question: 'What\'s your experience level?',
      type: 'single_choice',
      order: 4,
      options: [
        { id: 'opt_1', text: 'Beginner - I\'m new to this', value: 'beginner', weight: 1 },
        { id: 'opt_2', text: 'Intermediate - I have some experience', value: 'intermediate', weight: 2 },
        { id: 'opt_3', text: 'Advanced - I\'m experienced', value: 'advanced', weight: 3 }
      ],
      matchingAttribute: 'experienceRequired',
      category: 'experience',
      active: true
    },
    {
      question: 'When do you prefer to meet?',
      type: 'multiple_choice',
      order: 5,
      options: [
        { id: 'opt_1', text: 'Weekday mornings', value: 'weekday_morning', weight: 1 },
        { id: 'opt_2', text: 'Weekday afternoons', value: 'weekday_afternoon', weight: 1 },
        { id: 'opt_3', text: 'Weekday evenings', value: 'weekday_evening', weight: 1 },
        { id: 'opt_4', text: 'Weekends', value: 'weekend', weight: 1 }
      ],
      matchingAttribute: 'meetingPreferences',
      category: 'logistics',
      active: true
    }
  ];

  const batch = db.batch();
  
  questions.forEach(question => {
    const questionRef = db.collection('quizQuestions').doc();
    batch.set(questionRef, {
      ...question,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`✓ Created ${questions.length} quiz questions`);
}

// Run the import
importClubs()
  .then(() => {
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
