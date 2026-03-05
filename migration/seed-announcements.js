// Seed Announcements Script
// Creates sample announcements in Firestore for testing

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

// Helpers: create a date relative to now
function pastDate(daysAgo, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return admin.firestore.Timestamp.fromDate(d);
}

function futureDate(daysFromNow, hour = 23, minute = 59) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return admin.firestore.Timestamp.fromDate(d);
}

async function seedAnnouncements() {
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

  console.log(`Found ${clubs.length} clubs. Creating announcements...`);

  const pick = (i) => clubs[i % clubs.length];

  const announcements = [
    // ==========================================
    // PLATFORM ANNOUNCEMENTS
    // ==========================================
    {
      title: 'Welcome to Lute Club Finder!',
      content:
        'We are thrilled to launch Lute Club Finder — your one-stop hub for discovering and joining student clubs at Pacific Lutheran University. Take the matching quiz to find clubs that fit your interests, browse upcoming events, and save your favorites. Have feedback? Reach out to us through the profile page!',
      type: 'platform',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'high',
      pinned: true,
      authorId: 'system',
      authorName: 'PLU Student Life',
      publishedAt: pastDate(1, 9, 0),
      expiresAt: null,
      views: 142,
    },
    {
      title: 'Club Registration Deadline — Spring 2026',
      content:
        'All student organizations must complete their annual re-registration by March 21, 2026. Visit the Student Involvement & Leadership office in AUC 150 or submit your renewal form online. Clubs that do not re-register will be moved to inactive status and will lose access to funding and room reservations.',
      type: 'platform',
      clubId: null,
      clubName: null,
      audience: 'leaders',
      priority: 'urgent',
      pinned: true,
      authorId: 'system',
      authorName: 'Office of Student Life',
      publishedAt: pastDate(3, 10, 0),
      expiresAt: futureDate(17),
      views: 87,
    },
    {
      title: 'New Feature: Event RSVPs',
      content:
        'You can now mark "I\'m Interested" on any upcoming event to keep track of activities you want to attend. Event organizers can see interest counts to plan accordingly. Try it out on the Events page!',
      type: 'platform',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'Lute Club Finder Team',
      publishedAt: pastDate(5, 14, 0),
      expiresAt: null,
      views: 63,
    },
    {
      title: 'System Maintenance — Saturday March 7',
      content:
        'Lute Club Finder will undergo scheduled maintenance on Saturday, March 7, from 2:00 AM to 6:00 AM PST. The site may be intermittently unavailable during this window. No action is needed on your part.',
      type: 'platform',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'Lute Club Finder Team',
      publishedAt: pastDate(0, 8, 30),
      expiresAt: futureDate(4),
      views: 21,
    },

    // ==========================================
    // CLUB ANNOUNCEMENTS
    // ==========================================
    {
      title: `${pick(0).name} — New Meeting Time`,
      content:
        'Starting this week, our regular meetings have moved to Thursdays at 5:30 PM in Ramstad 201. We made this change based on the scheduling survey results. See you there!',
      type: 'club',
      clubId: pick(0).id,
      clubName: pick(0).name,
      audience: 'members',
      priority: 'high',
      pinned: false,
      authorId: 'seed_script',
      authorName: 'Club President',
      publishedAt: pastDate(2, 17, 0),
      expiresAt: null,
      views: 34,
    },
    {
      title: `${pick(1).name} — Officer Elections Open`,
      content:
        'Nominations for next year\'s officer positions are now open! We are looking for a President, Vice President, Treasurer, and Secretary. If you\'re interested, please submit your nomination form by March 15. Elections will be held at our March 20 meeting.',
      type: 'club',
      clubId: pick(1).id,
      clubName: pick(1).name,
      audience: 'members',
      priority: 'high',
      pinned: true,
      authorId: 'seed_script',
      authorName: 'Elections Committee',
      publishedAt: pastDate(1, 12, 0),
      expiresAt: futureDate(16),
      views: 52,
    },
    {
      title: `Join ${pick(2).name} This Semester!`,
      content:
        'Thinking about joining a new club? We welcome new members at any point during the semester — no experience necessary! Drop by one of our meetings to see what we\'re all about. Check our club page for the full meeting schedule.',
      type: 'club',
      clubId: pick(2).id,
      clubName: pick(2).name,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'seed_script',
      authorName: 'Membership Chair',
      publishedAt: pastDate(7, 11, 0),
      expiresAt: null,
      views: 29,
    },
    {
      title: `${pick(3).name} — Fundraiser Update`,
      content:
        'Thank you to everyone who supported our bake sale last week! We raised $347 toward our spring conference trip. We still need about $200 more — stay tuned for our next fundraiser event coming in two weeks.',
      type: 'club',
      clubId: pick(3).id,
      clubName: pick(3).name,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'seed_script',
      authorName: 'Treasurer',
      publishedAt: pastDate(4, 15, 30),
      expiresAt: null,
      views: 18,
    },
    {
      title: `${pick(4).name} Seeks Volunteers`,
      content:
        'We are partnering with the Tacoma Rescue Mission for a weekend volunteer project on March 15-16. Shifts available from 8 AM–12 PM and 1 PM–5 PM both days. Sign up at our next meeting or DM us on Instagram. Community service hours provided!',
      type: 'club',
      clubId: pick(4).id,
      clubName: pick(4).name,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'seed_script',
      authorName: 'Service Coordinator',
      publishedAt: pastDate(2, 9, 0),
      expiresAt: futureDate(12),
      views: 41,
    },
    {
      title: `${pick(5).name} — Spring Competition Roster`,
      content:
        'The roster for our spring competition team has been finalized. If you were selected, check your PLU email for practice schedules and travel details. Congratulations to everyone who tried out — even if you didn\'t make the travel roster, you\'re still a valued member of the club!',
      type: 'club',
      clubId: pick(5).id,
      clubName: pick(5).name,
      audience: 'members',
      priority: 'normal',
      pinned: false,
      authorId: 'seed_script',
      authorName: 'Team Captain',
      publishedAt: pastDate(6, 16, 0),
      expiresAt: null,
      views: 37,
    },

    // ==========================================
    // NEWS ANNOUNCEMENTS
    // ==========================================
    {
      title: 'Student Involvement Fair — March 12',
      content:
        'The Spring Student Involvement Fair is happening Wednesday, March 12 from 11 AM to 2 PM in Red Square (rain location: Olson Gym). Over 40 clubs will have tables set up with info, demos, and free swag. It\'s the perfect opportunity to explore new interests and meet club members face-to-face.',
      type: 'news',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'high',
      pinned: true,
      authorId: 'system',
      authorName: 'Student Involvement & Leadership',
      publishedAt: pastDate(1, 10, 0),
      expiresAt: futureDate(9),
      views: 98,
    },
    {
      title: 'ASPLU Approves Increased Club Funding for 2026-27',
      content:
        'Great news for student organizations! ASPLU has voted to increase the total club funding pool by 15% for the 2026-27 academic year. The new budget allocation means more resources for events, travel, and supplies. Funding applications for fall semester will open in September.',
      type: 'news',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'ASPLU',
      publishedAt: pastDate(3, 13, 0),
      expiresAt: null,
      views: 76,
    },
    {
      title: 'Campus Construction Update: AUC Renovations',
      content:
        'Phase 2 of Anderson University Center renovations begins March 10. Rooms 203-210 will be unavailable through April 15. Clubs that normally meet in these rooms should contact the reservations office at auc-reservations@plu.edu to arrange alternative meeting spaces. The Cave and Regency Room are unaffected.',
      type: 'news',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'high',
      pinned: false,
      authorId: 'system',
      authorName: 'Campus Facilities',
      publishedAt: pastDate(2, 8, 0),
      expiresAt: futureDate(42),
      views: 55,
    },
    {
      title: 'New Club Application Period Opens April 1',
      content:
        'Interested in starting a brand-new student organization? The application window for new clubs opens April 1 and closes April 30. You\'ll need at least 10 interested students, a faculty advisor, and a completed constitution. Stop by the Student Life office for a starter kit or attend the info session on April 3.',
      type: 'news',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'Office of Student Life',
      publishedAt: pastDate(0, 11, 0),
      expiresAt: futureDate(57),
      views: 33,
    },

    // ==========================================
    // PLU SPOTLIGHT ANNOUNCEMENTS
    // ==========================================
    {
      title: 'Spotlight: How the Debate Club Won Regionals',
      content:
        'PLU\'s Debate Club brought home the Regional Championship trophy last weekend after defeating teams from 12 other universities in Portland. Team captain Sarah Kim (\'27) led the squad through four rounds of competition. "Our preparation this semester was intense, but the teamwork made it all possible," said Kim. Congratulations to the entire team!',
      type: 'plu-spotlight',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'PLU Student Media',
      publishedAt: pastDate(1, 15, 0),
      expiresAt: null,
      views: 112,
    },
    {
      title: 'Spotlight: Behind the Scenes of PLU\'s K-Pop Dance Team',
      content:
        'PLU\'s K-Pop Dance Team has grown from 8 members to over 35 in just two years. We sat down with founder and president Alex Park (\'26) to learn about the group\'s explosive growth, their viral TikTok videos, and what it takes to learn a full choreography in under a week. "Everyone is welcome regardless of dance experience — we\'re here to have fun and share a love of K-Pop culture," says Park.',
      type: 'plu-spotlight',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'PLU Student Media',
      publishedAt: pastDate(5, 14, 0),
      expiresAt: null,
      views: 89,
    },
    {
      title: 'Spotlight: Sustainability Club Plants 200 Trees on Campus',
      content:
        'The Sustainability Club completed their ambitious "200 Trees for 200 Years" planting project last Saturday, adding native Pacific Northwest species across south campus. The project, funded by an ASPLU sustainability grant and a matching donation from the alumni association, took over three months of planning. "These trees will be here long after we graduate," said project lead Jamie Torres (\'27).',
      type: 'plu-spotlight',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: true,
      authorId: 'system',
      authorName: 'PLU Student Media',
      publishedAt: pastDate(3, 10, 30),
      expiresAt: null,
      views: 95,
    },
    {
      title: 'Spotlight: Student Entrepreneur Launches App from PLU Coding Club',
      content:
        'Junior CS major and Coding Club member Marcus Lee launched "StudyPal," a peer tutoring matching app born out of a club hackathon project last fall. The app now has over 300 PLU students signed up. "The Coding Club gave me the skills and the confidence to turn an idea into something real," Lee shared. StudyPal is available for free on the App Store and Google Play.',
      type: 'plu-spotlight',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'PLU Student Media',
      publishedAt: pastDate(8, 9, 0),
      expiresAt: null,
      views: 67,
    },
    {
      title: 'Spotlight: International Club\'s Cultural Festival Draws Record Crowd',
      content:
        'Over 600 students, faculty, and community members attended the International Club\'s annual Cultural Festival in Olson Gym last Friday — a new record. The event featured food from 15 countries, traditional dance performances, a fashion show, and interactive cultural booths. "This is exactly what PLU\'s global community looks like," said festival organizer Priya Sharma (\'26). Planning for next year\'s festival is already underway.',
      type: 'plu-spotlight',
      clubId: null,
      clubName: null,
      audience: 'all',
      priority: 'normal',
      pinned: false,
      authorId: 'system',
      authorName: 'PLU Student Media',
      publishedAt: pastDate(10, 16, 0),
      expiresAt: null,
      views: 134,
    },
  ];

  // Batch write
  const batch = db.batch();

  for (const announcement of announcements) {
    const ref = db.collection('announcements').doc();
    batch.set(ref, {
      ...announcement,
      imageUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  const byType = (t) => announcements.filter((a) => a.type === t).length;
  const pinned = announcements.filter((a) => a.pinned).length;

  console.log(`\n✓ Successfully created ${announcements.length} announcements!`);
  console.log(`  - ${byType('platform')} platform`);
  console.log(`  - ${byType('club')} club`);
  console.log(`  - ${byType('news')} news`);
  console.log(`  - ${byType('plu-spotlight')} PLU spotlight`);
  console.log(`  - ${pinned} pinned`);

  process.exit(0);
}

seedAnnouncements().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
