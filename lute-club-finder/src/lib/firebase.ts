import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider (restricted to @plu.edu)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'plu.edu',
});

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Sign in with Google (restricted to @plu.edu)
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email;

  // Double-check domain client-side
  if (!email?.endsWith('@plu.edu')) {
    await firebaseSignOut(auth);
    throw new Error('Only @plu.edu email addresses are allowed');
  }

  await createOrUpdateUserDocument(result.user);
  return result.user;
}

/**
 * Sign up with email and password (@plu.edu only)
 */
export async function signUpWithEmail(email: string, password: string) {
  if (!email.endsWith('@plu.edu')) {
    throw new Error('Only @plu.edu email addresses are allowed');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  await createOrUpdateUserDocument(userCredential.user);
  return userCredential.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await updateDoc(doc(db, 'users', userCredential.user.uid), {
    lastActive: serverTimestamp(),
  });
  return userCredential.user;
}

/**
 * Sign out
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Create or update user doc in Firestore on login
 */
async function createOrUpdateUserDocument(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Student',
      role: 'student',
      clubLeaderOf: [],
      preferences: {},
      savedClubs: [],
      quizCompleted: false,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      lastActive: serverTimestamp(),
    });
  }
}

// ============================================
// CLUBS
// ============================================

export async function getClubs(filters?: {
  category?: string;
  status?: string;
  featured?: boolean;
  limitCount?: number;
}) {
  // Fetch all clubs and filter client-side to avoid composite index requirements
  const snapshot = await getDocs(collection(db, 'clubs'));
  let clubs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  // Default to active if no status specified
  const status = filters?.status ?? 'active';
  clubs = clubs.filter((c: any) => c.status === status);

  if (filters?.category) {
    clubs = clubs.filter((c: any) => c.category === filters.category);
  }
  if (filters?.featured) {
    clubs = clubs.filter((c: any) => c.featured === true);
  }
  if (filters?.limitCount) {
    clubs = clubs.slice(0, filters.limitCount);
  }

  return clubs;
}

export async function getClub(clubId: string) {
  const clubDoc = await getDoc(doc(db, 'clubs', clubId));
  if (!clubDoc.exists()) throw new Error('Club not found');
  return { id: clubDoc.id, ...clubDoc.data() };
}

export async function searchClubs(searchTerm: string) {
  const allClubs = await getClubs({ status: 'active' });
  const term = searchTerm.toLowerCase();
  return allClubs.filter(
    (club: any) =>
      club.name?.toLowerCase().includes(term) ||
      club.description?.toLowerCase().includes(term) ||
      club.tags?.some((tag: string) => tag.toLowerCase().includes(term))
  );
}

export async function updateClub(clubId: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'clubs', clubId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function incrementClubViews(clubId: string) {
  await updateDoc(doc(db, 'clubs', clubId), {
    views: increment(1),
  });
}

// ============================================
// VIEW TRACKING
// ============================================

/**
 * Track that a user viewed a club detail page.
 * Uses arrayUnion so each club ID is stored at most once.
 */
export async function trackClubView(userId: string, clubId: string) {
  await updateDoc(doc(db, 'users', userId), {
    viewedClubs: arrayUnion(clubId),
  });
}

// ============================================
// BOOKMARKS
// ============================================

export async function saveClub(userId: string, clubId: string) {
  // Atomically add to user's savedClubs array
  await updateDoc(doc(db, 'users', userId), {
    savedClubs: arrayUnion(clubId),
  });

  // Best-effort increment on club doc (may fail if user lacks write permission)
  try {
    await updateDoc(doc(db, 'clubs', clubId), { saves: increment(1) });
  } catch {
    // Non-critical — counter is cosmetic
  }
}

export async function unsaveClub(userId: string, clubId: string) {
  // Atomically remove from user's savedClubs array
  await updateDoc(doc(db, 'users', userId), {
    savedClubs: arrayRemove(clubId),
  });

  // Best-effort decrement on club doc
  try {
    await updateDoc(doc(db, 'clubs', clubId), { saves: increment(-1) });
  } catch {
    // Non-critical — counter is cosmetic
  }
}

// ============================================
// QUIZ
// ============================================

export async function getQuizQuestions() {
  // Fetch all quiz questions and filter/sort client-side.
  // This avoids needing a Firestore composite index (active + order)
  // and there are only ~5 questions so the overhead is negligible.
  const snapshot = await getDocs(collection(db, 'quizQuestions'));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((q: any) => q.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
}

export async function submitQuizResults(
  userId: string,
  preferences: Record<string, any>,
  matchScores: Record<string, number>
) {
  await updateDoc(doc(db, 'users', userId), {
    preferences,
    quizCompleted: true,
    quizResults: {
      completedAt: serverTimestamp(),
      matchScores,
    },
  });
}

// ============================================
// EVENTS
// ============================================

export async function getUpcomingEvents(clubId?: string, limitCount?: number) {
  // Use a single equality filter to avoid composite index requirements.
  // Sort and limit client-side since upcoming event sets are small.
  const constraints: any[] = [where('status', '==', 'upcoming')];
  if (clubId) constraints.push(where('clubId', '==', clubId));

  const q = query(collection(db, 'events'), ...constraints);
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sort by startTime ascending
  events.sort((a: any, b: any) => {
    const aTime = a.startTime?.toDate?.() ?? new Date(a.startTime);
    const bTime = b.startTime?.toDate?.() ?? new Date(b.startTime);
    return aTime.getTime() - bTime.getTime();
  });

  return limitCount ? events.slice(0, limitCount) : events;
}

export async function getEvents(filters?: {
  clubId?: string;
  eventType?: string;
  status?: string;
}) {
  // Fetch all events then filter/sort client-side to avoid composite index requirements
  const snapshot = await getDocs(collection(db, 'events'));
  let events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  if (filters?.clubId) {
    events = events.filter((e: any) => e.clubId === filters.clubId);
  }
  if (filters?.eventType) {
    events = events.filter((e: any) => e.eventType === filters.eventType);
  }
  if (filters?.status) {
    events = events.filter((e: any) => e.status === filters.status);
  }

  // Sort by startTime descending
  events.sort((a: any, b: any) => {
    const aTime = a.startTime?.toDate?.() ?? new Date(a.startTime);
    const bTime = b.startTime?.toDate?.() ?? new Date(b.startTime);
    return bTime.getTime() - aTime.getTime();
  });

  return events;
}

export async function getAllEvents() {
  const snapshot = await getDocs(collection(db, 'events'));
  const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  events.sort((a: any, b: any) => {
    const aTime = a.startTime?.toDate?.() ?? new Date(a.startTime);
    const bTime = b.startTime?.toDate?.() ?? new Date(b.startTime);
    return bTime.getTime() - aTime.getTime();
  });

  return events;
}

export async function getEvent(eventId: string) {
  const eventDoc = await getDoc(doc(db, 'events', eventId));
  if (!eventDoc.exists()) throw new Error('Event not found');
  return { id: eventDoc.id, ...eventDoc.data() };
}

export async function incrementEventViews(eventId: string) {
  await updateDoc(doc(db, 'events', eventId), {
    views: increment(1),
  });
}

export async function createEvent(data: Record<string, any>) {
  const docRef = await addDoc(collection(db, 'events'), {
    ...data,
    interestedCount: 0,
    views: 0,
    currentAttendees: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEvent(eventId: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'events', eventId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(eventId: string) {
  await deleteDoc(doc(db, 'events', eventId));
}

export async function toggleEventInterest(eventId: string, userId: string, isInterested: boolean) {
  if (isInterested) {
    // Remove interest
    await updateDoc(doc(db, 'events', eventId), {
      interestedCount: increment(-1),
    });
    await updateDoc(doc(db, 'users', userId), {
      interestedEvents: arrayRemove(eventId),
    });
  } else {
    // Add interest
    await updateDoc(doc(db, 'events', eventId), {
      interestedCount: increment(1),
    });
    await updateDoc(doc(db, 'users', userId), {
      interestedEvents: arrayUnion(eventId),
    });
  }
}

export async function uploadEventImage(eventId: string, file: File) {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `events/${eventId}/${timestamp}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function getAnnouncements(filters?: { clubId?: string; type?: string; limitCount?: number }) {
  // Fetch all announcements and filter/sort client-side to avoid composite index requirements
  const snapshot = await getDocs(collection(db, 'announcements'));
  let announcements = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  if (filters?.clubId) {
    announcements = announcements.filter((a: any) => a.clubId === filters.clubId);
  }
  if (filters?.type) {
    announcements = announcements.filter((a: any) => a.type === filters.type);
  }

  // Sort by pinned first, then by publishedAt descending
  announcements.sort((a: any, b: any) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const aTime = a.publishedAt?.toDate?.() ?? new Date(a.publishedAt ?? 0);
    const bTime = b.publishedAt?.toDate?.() ?? new Date(b.publishedAt ?? 0);
    return bTime.getTime() - aTime.getTime();
  });

  if (filters?.limitCount) {
    announcements = announcements.slice(0, filters.limitCount);
  }

  return announcements;
}

export async function getAllAnnouncements() {
  const snapshot = await getDocs(collection(db, 'announcements'));
  const announcements = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  announcements.sort((a: any, b: any) => {
    const aTime = a.publishedAt?.toDate?.() ?? new Date(a.publishedAt ?? 0);
    const bTime = b.publishedAt?.toDate?.() ?? new Date(b.publishedAt ?? 0);
    return bTime.getTime() - aTime.getTime();
  });

  return announcements;
}

export async function getAnnouncement(announcementId: string) {
  const announcementDoc = await getDoc(doc(db, 'announcements', announcementId));
  if (!announcementDoc.exists()) throw new Error('Announcement not found');
  return { id: announcementDoc.id, ...announcementDoc.data() };
}

export async function incrementAnnouncementViews(announcementId: string) {
  await updateDoc(doc(db, 'announcements', announcementId), {
    views: increment(1),
  });
}

export async function createAnnouncement(data: Record<string, any>) {
  const docRef = await addDoc(collection(db, 'announcements'), {
    ...data,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAnnouncement(announcementId: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'announcements', announcementId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(announcementId: string) {
  await deleteDoc(doc(db, 'announcements', announcementId));
}

export async function uploadAnnouncementImage(announcementId: string, file: File) {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `announcements/${announcementId}/${timestamp}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

// ============================================
// USERS
// ============================================

export async function getUserData(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUserData(userId: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'users', userId), data);
}

// ============================================
// ADMIN — CLUBS
// ============================================

/**
 * Get ALL clubs regardless of status (for admin table)
 */
export async function getAllClubs() {
  const q = query(collection(db, 'clubs'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new club
 */
export async function createClub(data: Record<string, any>) {
  const docRef = await addDoc(collection(db, 'clubs'), {
    ...data,
    views: 0,
    saves: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Delete a club by ID
 */
export async function deleteClub(clubId: string) {
  await deleteDoc(doc(db, 'clubs', clubId));
}

// ============================================
// ADMIN — USERS
// ============================================

/**
 * Get all users (for admin user table)
 */
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: 'student' | 'club_leader' | 'admin') {
  await updateDoc(doc(db, 'users', userId), { role });
}

/**
 * Assign a user as a club leader for a specific club
 */
export async function assignClubLeader(userId: string, clubId: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'club_leader',
    clubLeaderOf: arrayUnion(clubId),
  });
}

/**
 * Remove a user's leadership from a specific club
 */
export async function removeClubLeader(userId: string, clubId: string) {
  await updateDoc(doc(db, 'users', userId), {
    clubLeaderOf: arrayRemove(clubId),
  });
}

// ============================================
// ADMIN — IMAGE UPLOAD
// ============================================

/**
 * Upload a club image (logo or cover) to Firebase Storage
 * Returns the download URL
 */
export async function uploadClubImage(
  clubId: string,
  file: File,
  imageType: 'logo' | 'cover'
) {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `clubs/${clubId}/${imageType}_${timestamp}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

/**
 * Delete a club image from Firebase Storage by URL
 */
export async function deleteClubImage(imageUrl: string) {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch {
    // Image may already be deleted or URL invalid — non-critical
  }
}

// ============================================
// ADMIN — STATS
// ============================================

/**
 * Get aggregate admin stats
 */
export async function getAdminStats() {
  const [clubsSnap, usersSnap, eventsSnap] = await Promise.all([
    getDocs(collection(db, 'clubs')),
    getDocs(collection(db, 'users')),
    getDocs(query(collection(db, 'events'), where('status', '==', 'upcoming'))),
  ]);

  let quizCompletions = 0;
  usersSnap.docs.forEach((d) => {
    if (d.data().quizCompleted) quizCompletions++;
  });

  return {
    totalClubs: clubsSnap.size,
    totalUsers: usersSnap.size,
    activeEvents: eventsSnap.size,
    quizCompletions,
  };
}

// Re-export Firestore utilities for use in hooks
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
};

export default app;
