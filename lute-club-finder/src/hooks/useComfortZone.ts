import { useMemo } from 'react';
import { useClubs } from './useClubs';
import { useAuth } from '../context/AuthContext';
import { getComfortZoneRecommendations, getExploredCategories } from '../lib/comfortZone';
import type { Club, UserPreferences, ComfortZoneMatch } from '../types';

/**
 * Compute "Out of Comfort Zone" recommendations for the current user.
 *
 * Returns an empty array when:
 * - The user hasn't completed the quiz yet
 * - Clubs haven't loaded
 * - No recommendations match the criteria
 */
export function useComfortZone(limit = 10): {
  recommendations: ComfortZoneMatch[];
  isLoading: boolean;
  isQuizCompleted: boolean;
} {
  const { userData } = useAuth();
  const { data: allClubs, isLoading: clubsLoading } = useClubs();

  const isQuizCompleted = !!userData?.quizCompleted;

  const recommendations = useMemo(() => {
    if (!isQuizCompleted || !allClubs || allClubs.length === 0) return [];

    const preferences = userData!.preferences as UserPreferences;
    // Guard: if preferences are incomplete, bail out
    if (!preferences?.interests || !preferences?.vibes) return [];

    const clubs = allClubs as Club[];

    // Build explored categories from saved clubs + quiz interests
    const savedClubObjects = clubs.filter((c) =>
      (userData!.savedClubs ?? []).includes(c.id),
    );
    const exploredCategories = getExploredCategories(
      savedClubObjects,
      preferences.interests,
    );

    return getComfortZoneRecommendations(
      preferences,
      clubs,
      {
        viewedClubs: userData!.viewedClubs ?? [],
        savedClubs: userData!.savedClubs ?? [],
      },
      exploredCategories,
      limit,
    );
  }, [isQuizCompleted, allClubs, userData, limit]);

  return {
    recommendations,
    isLoading: clubsLoading,
    isQuizCompleted,
  };
}
