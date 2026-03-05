const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function test() {
  try {
    // Test 1: simple query without ordering (no index needed)
    const snap1 = await db.collection('events').where('status', '==', 'upcoming').get();
    console.log('Simple query (status only):', snap1.size, 'docs');

    // Test 2: the compound query (status + orderBy startTime)
    const snap2 = await db.collection('events')
      .where('status', '==', 'upcoming')
      .orderBy('startTime', 'asc')
      .limit(6)
      .get();
    console.log('Compound query (status + orderBy):', snap2.size, 'docs');
    snap2.docs.forEach(d => console.log(' -', d.data().title));
  } catch (err) {
    console.error('ERROR:', err.code, err.message);
  }
  process.exit(0);
}

test();
