// Firebase Configuration Template
// Copy this to your React app and fill in your Firebase project details

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Get these values from Firebase Console > Project Settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign in with Google (restricted to @plu.edu)
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  
  // Restrict to PLU domain
  provider.setCustomParameters({
    hd: 'plu.edu' // Hosted domain
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    // Double-check domain (client-side validation)
    if (!email.endsWith('@plu.edu')) {
      await firebaseSignOut(auth);
      throw new Error('Only @plu.edu email addresses are allowed');
    }

    // Create or update user document
    await createOrUpdateUserDocument(result.user);

    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password) {
  // Validate PLU email
  if (!email.endsWith('@plu.edu')) {
    throw new Error('Only @plu.edu email addresses are allowed');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Create user document
    await createOrUpdateUserDocument(userCredential.user);

    return userCredential.user;
  } catch (error) {
    console.error('Sign-up error:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

/**
 * Create or update user document in Firestore
 */
async function createOrUpdateUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // New user - create document
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: 'student', // Default role
      clubLeaderOf: [],
      preferences: {},
      savedClubs: [],
      quizCompleted: false,
      createdAt: new Date(),
      lastActive: new Date()
    });
  } else {
    // Existing user - update last active
    await updateDoc(userRef, {
      lastActive: new Date()
    });
  }
}

/**
 * Get current user's data from Firestore
 */
export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  return userDoc.exists() ? userDoc.data() : null;
}

// ============================================
// CLUB FUNCTIONS
// ============================================

/**
 * Get all clubs with optional filters
 */
export async function getClubs(filters = {}) {
  let q = collection(db, 'clubs');

  // Apply filters
  const constraints = [];
  
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  } else {
    constraints.push(where('status', '==', 'active'));
  }

  if (filters.featured) {
    constraints.push(where('featured', '==', true));
  }

  // Add ordering
  if (filters.orderBy) {
    constraints.push(orderBy(filters.orderBy, filters.order || 'asc'));
  }

  // Add limit
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }

  q = query(q, ...constraints);

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get a single club by ID
 */
export async function getClub(clubId) {
  const clubRef = doc(db, 'clubs', clubId);
  const clubDoc = await getDoc(clubRef);

  if (!clubDoc.exists()) {
    throw new Error('Club not found');
  }

  return {
    id: clubDoc.id,
    ...clubDoc.data()
  };
}

/**
 * Search clubs by name or tags
 */
export async function searchClubs(searchTerm) {
  // Note: Firestore doesn't support full-text search natively
  // For production, consider using Algolia or similar
  
  const allClubs = await getClubs({ status: 'active' });
  
  const term = searchTerm.toLowerCase();
  return allClubs.filter(club => 
    club.name.toLowerCase().includes(term) ||
    club.description?.toLowerCase().includes(term) ||
    club.tags?.some(tag => tag.toLowerCase().includes(term))
  );
}

/**
 * Save/bookmark a club
 */
export async function saveClub(clubId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const savedClubs = userDoc.data()?.savedClubs || [];

  if (!savedClubs.includes(clubId)) {
    await updateDoc(userRef, {
      savedClubs: [...savedClubs, clubId]
    });
  }
}

/**
 * Unsave/unbookmark a club
 */
export async function unsaveClub(clubId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const savedClubs = userDoc.data()?.savedClubs || [];

  await updateDoc(userRef, {
    savedClubs: savedClubs.filter(id => id !== clubId)
  });
}

/**
 * Get user's saved clubs
 */
export async function getSavedClubs() {
  const user = auth.currentUser;
  if (!user) return [];

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const savedClubIds = userDoc.data()?.savedClubs || [];

  if (savedClubIds.length === 0) return [];

  // Fetch all saved clubs
  const clubPromises = savedClubIds.map(id => getClub(id));
  return Promise.all(clubPromises);
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

/**
 * Get quiz questions
 */
export async function getQuizQuestions() {
  const q = query(
    collection(db, 'quizQuestions'),
    where('active', '==', true),
    orderBy('order', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Submit quiz answers and save results
 */
export async function submitQuiz(answers, matchScores) {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const userRef = doc(db, 'users', user.uid);
  
  await updateDoc(userRef, {
    preferences: answers,
    quizCompleted: true,
    quizResults: {
      completedAt: new Date(),
      matchScores
    }
  });
}

// ============================================
// EVENT FUNCTIONS
// ============================================

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(clubId = null) {
  let q = collection(db, 'events');
  const constraints = [
    where('status', '==', 'upcoming'),
    where('startTime', '>=', new Date()),
    orderBy('startTime', 'asc')
  ];

  if (clubId) {
    constraints.unshift(where('clubId', '==', clubId));
  }

  q = query(q, ...constraints);

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ============================================
// ANNOUNCEMENT FUNCTIONS
// ============================================

/**
 * Get recent announcements
 */
export async function getAnnouncements(clubId = null) {
  let q = collection(db, 'announcements');
  const constraints = [
    orderBy('publishedAt', 'desc'),
    limit(20)
  ];

  if (clubId) {
    constraints.unshift(where('clubId', '==', clubId));
  }

  q = query(q, ...constraints);

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const userData = await getCurrentUserData();
  return userData?.role === 'admin';
}

/**
 * Check if current user is club leader
 */
export async function isClubLeader(clubId = null) {
  const userData = await getCurrentUserData();
  
  if (userData?.role === 'admin') return true;
  if (userData?.role !== 'club_leader') return false;
  
  if (clubId) {
    return userData.clubLeaderOf?.includes(clubId) || false;
  }
  
  return userData.clubLeaderOf?.length > 0;
}

// ============================================
// EXAMPLE USAGE IN REACT
// ============================================

/*
// In your React component:

import { useState, useEffect } from 'react';
import { 
  signInWithGoogle, 
  getClubs, 
  saveClub,
  auth 
} from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Load clubs
  useEffect(() => {
    async function loadClubs() {
      const allClubs = await getClubs({ status: 'active' });
      setClubs(allClubs);
    }
    loadClubs();
  }, []);

  // Handle sign in
  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert(error.message);
    }
  }

  // Handle save club
  async function handleSaveClub(clubId) {
    try {
      await saveClub(clubId);
      alert('Club saved!');
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      {!user ? (
        <button onClick={handleSignIn}>Sign In with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.email}</p>
          <div className="clubs">
            {clubs.map(club => (
              <div key={club.id}>
                <h3>{club.name}</h3>
                <p>{club.shortDescription}</p>
                <button onClick={() => handleSaveClub(club.id)}>
                  Save Club
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
*/

export default app;
