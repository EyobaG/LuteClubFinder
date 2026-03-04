import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
  getUserData,
} from '../lib/firebase';
import type { UserData } from '../types';

interface AuthContextType {
  /** Firebase Auth user (null when signed out) */
  user: User | null;
  /** Firestore user document data */
  userData: UserData | null;
  /** True while initial auth state is being resolved */
  loading: boolean;
  /** Sign in with Google (@plu.edu only) */
  signInWithGoogle: () => Promise<User>;
  /** Sign in with email + password */
  signInWithEmail: (email: string, password: string) => Promise<User>;
  /** Create account with email + password (@plu.edu only) */
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Refresh the Firestore user data */
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Firestore user data for a given uid
  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const data = await getUserData(uid);
      setUserData(data as UserData | null);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setUserData(null);
    }
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserData]);

  // Refresh user data from Firestore (e.g. after profile edit)
  const refreshUserData = useCallback(async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  }, [user, fetchUserData]);

  // Wrap sign-out to clear local state
  const handleSignOut = useCallback(async () => {
    await firebaseSignOut();
    setUser(null);
    setUserData(null);
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut: handleSignOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context. Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
