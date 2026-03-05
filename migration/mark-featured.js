const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function markFeatured() {
  const snap = await db.collection('clubs').get();
  const clubs = snap.docs.map(d => ({ id: d.id, name: d.data().name, category: d.data().category }));

  // Pick one club per category (up to 6) for variety
  const picks = [];
  const seen = new Set();
  for (const c of clubs) {
    if (!seen.has(c.category) && picks.length < 6) {
      picks.push(c);
      seen.add(c.category);
    }
  }

  const batch = db.batch();
  for (const p of picks) {
    batch.update(db.collection('clubs').doc(p.id), { featured: true });
  }
  await batch.commit();

  console.log('Marked ' + picks.length + ' clubs as featured:');
  picks.forEach(p => console.log('  - ' + p.name + ' (' + p.category + ')'));
  process.exit(0);
}

markFeatured().catch(err => { console.error(err); process.exit(1); });
