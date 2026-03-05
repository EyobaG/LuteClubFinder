import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { saveClub, unsaveClub } from '../lib/firebase';

/**
 * Hook that provides save/unsave functionality for clubs.
 * Returns a set of saved club IDs and a toggle function.
 */
export function useSavedClubs() {
  const { user, userData, refreshUserData } = useAuth();

  const savedSet = useMemo(
    () => new Set<string>(userData?.savedClubs ?? []),
    [userData?.savedClubs]
  );

  const toggleSave = useCallback(
    async (clubId: string) => {
      if (!user) return;
      try {
        if (savedSet.has(clubId)) {
          await unsaveClub(user.uid, clubId);
        } else {
          await saveClub(user.uid, clubId);
        }
        await refreshUserData();
      } catch (err) {
        console.error('Failed to toggle save:', err);
        toast.error('Failed to update saved clubs');
      }
    },
    [user, savedSet, refreshUserData]
  );

  return {
    savedSet,
    toggleSave,
    isAuthenticated: !!user,
  };
}
