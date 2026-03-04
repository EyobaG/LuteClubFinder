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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
  const constraints: Parameters<typeof query>[1][] = [];

  if (filters?.category) {
    constraints.push(where('category', '==', filters.category));
  }
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  } else {
    constraints.push(where('status', '==', 'active'));
  }
  if (filters?.featured) {
    constraints.push(where('featured', '==', true));
  }
  if (filters?.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  const q = query(collection(db, 'clubs'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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

export async function getUpcomingEvents(clubId?: string) {
  const constraints: any[] = [
    where('status', '==', 'upcoming'),
    where('startTime', '>=', new Date()),
    orderBy('startTime', 'asc'),
  ];
  if (clubId) constraints.unshift(where('clubId', '==', clubId));

  const q = query(collection(db, 'events'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function getAnnouncements(clubId?: string) {
  const constraints: any[] = [orderBy('publishedAt', 'desc'), limit(20)];
  if (clubId) constraints.unshift(where('clubId', '==', clubId));

  const q = query(collection(db, 'announcements'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
