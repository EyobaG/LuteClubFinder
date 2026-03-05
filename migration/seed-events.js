// Seed Events Script
// Creates sample events in Firestore for testing

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already)
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✓ Firebase Admin initialized');
  } catch (error) {
    console.error('Error: serviceAccountKey.json not found!');
    process.exit(1);
  }
}

const db = admin.firestore();

// Helper: create a date relative to now
function futureDate(daysFromNow, hour = 18, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return admin.firestore.Timestamp.fromDate(d);
}

function pastDate(daysAgo, hour = 18, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return admin.firestore.Timestamp.fromDate(d);
}

async function seedEvents() {
  console.log('Fetching clubs from Firestore...');

  // Pull real club IDs + names
  const clubsSnap = await db.collection('clubs').limit(20).get();
  const clubs = [];
  clubsSnap.forEach((doc) => {
    clubs.push({ id: doc.id, name: doc.data().name });
  });

  if (clubs.length === 0) {
    console.error('No clubs found in Firestore. Import clubs first.');
    process.exit(1);
  }

  console.log(`Found ${clubs.length} clubs. Creating events...`);

  // Pick clubs by index (wraps around if fewer than needed)
  const pick = (i) => clubs[i % clubs.length];

  const events = [
    // ===== UPCOMING EVENTS =====
    {
      title: 'Spring Welcome Social',
      description:
        'Kick off the spring semester with snacks, games, and an opportunity to meet fellow members. All students welcome — no prior membership required!',
      clubId: pick(0).id,
      clubName: pick(0).name,
      startTime: futureDate(3, 17, 0),
      endTime: futureDate(3, 19, 0),
      location: 'Anderson University Center, Room 203',
      virtual: false,
      eventType: 'social',
      requiresRegistration: false,
      tags: ['social', 'food', 'open-to-all'],
      status: 'upcoming',
      featured: true,
      interestedCount: 12,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Weekly Strategy Meeting',
      description:
        'Our regular weekly meeting to discuss upcoming projects, assign tasks, and plan outreach. Members are encouraged to bring ideas for the semester.',
      clubId: pick(1).id,
      clubName: pick(1).name,
      startTime: futureDate(1, 18, 30),
      endTime: futureDate(1, 19, 30),
      location: 'Ramstad Hall 105',
      virtual: true,
      virtualLink: 'https://zoom.us/j/1234567890',
      eventType: 'meeting',
      requiresRegistration: false,
      tags: ['weekly', 'planning'],
      status: 'upcoming',
      featured: false,
      interestedCount: 5,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Introduction to Watercolor Workshop',
      description:
        'Learn the basics of watercolor painting in this beginner-friendly workshop. All supplies provided — just bring your creativity! Limited to 25 participants.',
      clubId: pick(2).id,
      clubName: pick(2).name,
      startTime: futureDate(5, 14, 0),
      endTime: futureDate(5, 16, 30),
      location: 'Ingram Hall Art Studio',
      virtual: false,
      eventType: 'workshop',
      requiresRegistration: true,
      registrationLink: 'https://forms.gle/example1',
      maxAttendees: 25,
      tags: ['art', 'beginner-friendly', 'workshop'],
      status: 'upcoming',
      featured: true,
      interestedCount: 18,
      currentAttendees: 14,
      createdBy: 'seed_script',
    },
    {
      title: 'Intramural Volleyball Tournament',
      description:
        'Annual spring volleyball tournament — form a team of 6 or sign up as a free agent. Prizes for the winning team! Double-elimination bracket.',
      clubId: pick(3).id,
      clubName: pick(3).name,
      startTime: futureDate(10, 10, 0),
      endTime: futureDate(10, 16, 0),
      location: 'Olson Gym',
      virtual: false,
      eventType: 'competition',
      requiresRegistration: true,
      registrationLink: 'https://forms.gle/example2',
      maxAttendees: 48,
      tags: ['sports', 'competition', 'team'],
      status: 'upcoming',
      featured: true,
      interestedCount: 32,
      currentAttendees: 30,
      createdBy: 'seed_script',
    },
    {
      title: 'Park Clean-Up Day',
      description:
        'Join us for a community service morning at Spanaway Park. We will pick up litter, mulch trails, and plant native shrubs. Lunch provided afterwards!',
      clubId: pick(4).id,
      clubName: pick(4).name,
      startTime: futureDate(7, 9, 0),
      endTime: futureDate(7, 12, 0),
      location: 'Spanaway Park (meet at main parking lot)',
      virtual: false,
      eventType: 'service',
      requiresRegistration: true,
      registrationLink: 'https://forms.gle/example3',
      maxAttendees: 40,
      tags: ['service', 'outdoors', 'community'],
      status: 'upcoming',
      featured: false,
      interestedCount: 9,
      currentAttendees: 15,
      createdBy: 'seed_script',
    },
    {
      title: 'Guest Speaker: Careers in Data Science',
      description:
        'Dr. Maria Chen from Microsoft will share her journey from PLU to Big Tech and give practical advice for breaking into data science. Q&A session included.',
      clubId: pick(5).id,
      clubName: pick(5).name,
      startTime: futureDate(8, 16, 0),
      endTime: futureDate(8, 17, 30),
      location: 'Morken Center 103',
      virtual: true,
      virtualLink: 'https://teams.microsoft.com/l/meetup-join/example',
      eventType: 'workshop',
      requiresRegistration: false,
      tags: ['career', 'tech', 'guest-speaker'],
      status: 'upcoming',
      featured: true,
      interestedCount: 45,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Board Game Night',
      description:
        'Bring your favorite board games or try something new from our collection. Snacks and drinks provided. A great low-key Friday evening!',
      clubId: pick(6).id,
      clubName: pick(6).name,
      startTime: futureDate(4, 19, 0),
      endTime: futureDate(4, 22, 0),
      location: 'Cave (AUC Lower Level)',
      virtual: false,
      eventType: 'social',
      requiresRegistration: false,
      tags: ['games', 'social', 'chill'],
      status: 'upcoming',
      featured: false,
      interestedCount: 15,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Fundraiser Bake Sale',
      description:
        'Help us raise funds for our annual conference trip! Stop by for homemade cookies, brownies, and cupcakes. All proceeds go directly to travel costs.',
      clubId: pick(7).id,
      clubName: pick(7).name,
      startTime: futureDate(6, 11, 0),
      endTime: futureDate(6, 14, 0),
      location: 'Red Square',
      virtual: false,
      eventType: 'other',
      requiresRegistration: false,
      tags: ['fundraiser', 'food'],
      status: 'upcoming',
      featured: false,
      interestedCount: 7,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Open Mic Night',
      description:
        'Share your poetry, music, comedy, or spoken word at our open mic night. Sign up at the door or just come to watch and support your fellow Lutes!',
      clubId: pick(8).id,
      clubName: pick(8).name,
      startTime: futureDate(12, 19, 30),
      endTime: futureDate(12, 21, 30),
      location: 'The Cave',
      virtual: false,
      eventType: 'social',
      requiresRegistration: false,
      tags: ['music', 'arts', 'performance', 'open-to-all'],
      status: 'upcoming',
      featured: true,
      interestedCount: 22,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Yoga & Mindfulness Session',
      description:
        'De-stress before finals with a guided yoga and mindfulness session. All experience levels welcome. Mats provided, but feel free to bring your own.',
      clubId: pick(9).id,
      clubName: pick(9).name,
      startTime: futureDate(14, 7, 0),
      endTime: futureDate(14, 8, 0),
      location: 'Columbia Center Multipurpose Room',
      virtual: false,
      eventType: 'workshop',
      requiresRegistration: true,
      registrationLink: 'https://forms.gle/example4',
      maxAttendees: 30,
      tags: ['wellness', 'mindfulness', 'beginner-friendly'],
      status: 'upcoming',
      featured: false,
      interestedCount: 11,
      currentAttendees: 8,
      createdBy: 'seed_script',
    },
    {
      title: 'Resume Review Drop-In',
      description:
        'Bring your resume for one-on-one feedback from club members and alumni mentors. No appointment needed — first come, first served.',
      clubId: pick(10).id,
      clubName: pick(10).name,
      startTime: futureDate(2, 15, 0),
      endTime: futureDate(2, 17, 0),
      location: 'Ramstad 201',
      virtual: false,
      eventType: 'workshop',
      requiresRegistration: false,
      tags: ['career', 'resume', 'drop-in'],
      status: 'upcoming',
      featured: false,
      interestedCount: 6,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Movie Screening: Hidden Figures',
      description:
        'Join us for a screening of Hidden Figures followed by a facilitated discussion on representation in STEM fields. Popcorn provided!',
      clubId: pick(11).id,
      clubName: pick(11).name,
      startTime: futureDate(9, 19, 0),
      endTime: futureDate(9, 21, 30),
      location: 'Leraas Lecture Hall',
      virtual: false,
      eventType: 'social',
      requiresRegistration: false,
      tags: ['film', 'discussion', 'STEM'],
      status: 'upcoming',
      featured: false,
      interestedCount: 14,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },

    // ===== ONGOING EVENT =====
    {
      title: 'Spring Art Exhibition',
      description:
        'A week-long exhibition showcasing student artwork from the fall and spring semesters. Free admission — stop by anytime during gallery hours.',
      clubId: pick(2).id,
      clubName: pick(2).name,
      startTime: pastDate(2, 10, 0),
      endTime: futureDate(5, 18, 0),
      location: 'University Gallery',
      virtual: false,
      eventType: 'other',
      requiresRegistration: false,
      tags: ['art', 'exhibition', 'free'],
      status: 'ongoing',
      featured: true,
      interestedCount: 28,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },

    // ===== PAST / COMPLETED EVENTS =====
    {
      title: 'Fall Semester Wrap Party',
      description:
        'End-of-semester celebration with food, music, and awards for outstanding members. Thanks for a great fall semester!',
      clubId: pick(0).id,
      clubName: pick(0).name,
      startTime: pastDate(90, 18, 0),
      endTime: pastDate(90, 21, 0),
      location: 'Anderson University Center Regency Room',
      virtual: false,
      eventType: 'social',
      requiresRegistration: false,
      tags: ['celebration', 'food', 'awards'],
      status: 'completed',
      featured: false,
      interestedCount: 35,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
    {
      title: 'Hackathon 2025',
      description:
        '24-hour hackathon where teams built apps addressing campus sustainability. Over 50 participants and 12 project submissions!',
      clubId: pick(5).id,
      clubName: pick(5).name,
      startTime: pastDate(60, 9, 0),
      endTime: pastDate(59, 9, 0),
      location: 'Morken Center Labs',
      virtual: false,
      eventType: 'competition',
      requiresRegistration: true,
      maxAttendees: 60,
      tags: ['hackathon', 'coding', 'sustainability'],
      status: 'completed',
      featured: false,
      interestedCount: 52,
      currentAttendees: 51,
      createdBy: 'seed_script',
    },
    {
      title: 'Holiday Food Drive',
      description:
        'Our annual food drive collected over 500 cans for the Pierce County Food Bank. Thank you to everyone who contributed!',
      clubId: pick(4).id,
      clubName: pick(4).name,
      startTime: pastDate(100, 8, 0),
      endTime: pastDate(100, 15, 0),
      location: 'AUC Lobby',
      virtual: false,
      eventType: 'service',
      requiresRegistration: false,
      tags: ['service', 'food-drive', 'community'],
      status: 'completed',
      featured: false,
      interestedCount: 41,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },

    // ===== CANCELLED EVENT =====
    {
      title: 'Outdoor Movie Night (Cancelled)',
      description:
        'Unfortunately cancelled due to forecasted severe weather. We will reschedule for later in the semester — stay tuned!',
      clubId: pick(6).id,
      clubName: pick(6).name,
      startTime: futureDate(2, 20, 0),
      endTime: futureDate(2, 22, 30),
      location: 'Foss Field',
      virtual: false,
      eventType: 'social',
      requiresRegistration: false,
      tags: ['movie', 'outdoors'],
      status: 'cancelled',
      featured: false,
      interestedCount: 19,
      currentAttendees: 0,
      createdBy: 'seed_script',
    },
  ];

  // Batch write
  const batch = db.batch();

  for (const event of events) {
    const ref = db.collection('events').doc();
    batch.set(ref, {
      ...event,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`\n✓ Successfully created ${events.length} test events!`);
  console.log(`  - ${events.filter((e) => e.status === 'upcoming').length} upcoming`);
  console.log(`  - ${events.filter((e) => e.status === 'ongoing').length} ongoing`);
  console.log(`  - ${events.filter((e) => e.status === 'completed').length} completed`);
  console.log(`  - ${events.filter((e) => e.status === 'cancelled').length} cancelled`);
  console.log(`  - ${events.filter((e) => e.featured).length} featured`);

  process.exit(0);
}

seedEvents().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
