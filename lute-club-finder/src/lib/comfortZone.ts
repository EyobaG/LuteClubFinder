import type { UserPreferences, Club, ComfortZoneMatch, ClubCategory } from '../types';
import { calculateClubMatch, generateMatchExplanation } from './quizMatcher';

// ============================================
// INTEREST → CATEGORY MAPPING
// ============================================

/**
 * Maps common quiz interest tags to the club category they most
 * closely belong to.  Used to determine which categories the user
 * has already "explored" via their quiz preferences.
 */
const INTEREST_TO_CATEGORY: Record<string, ClubCategory> = {
  // academic / professional
  technology: 'academic',
  science: 'academic',
  tutoring: 'academic',
  research: 'academic',
  career: 'professional',
  networking: 'professional',
  leadership: 'professional',
  business: 'professional',

  // arts
  music: 'arts',
  dance: 'arts',
  theater: 'arts',
  'visual-arts': 'arts',
  creative: 'arts',
  writing: 'arts',

  // cultural
  cultural: 'cultural',
  'language-learning': 'cultural',
  diversity: 'cultural',

  // faith
  faith: 'faith',
  spirituality: 'faith',

  // recreational
  sports: 'recreational',
  outdoors: 'recreational',
  fitness: 'recreational',

  // service
  'community-service': 'service',
  volunteering: 'service',
  advocacy: 'service',

  // gaming
  gaming: 'gaming',
  esports: 'gaming',

  // special interest
  learning: 'special_interest',
  'personal-growth': 'special_interest',
};

// ============================================
// EXPLORED CATEGORIES
// ============================================

/**
 * Build the set of categories a user has already "explored", derived from:
 * 1. Categories of clubs the user has saved
 * 2. Categories mapped from the user's quiz interest tags
 */
export function getExploredCategories(
  savedClubs: Club[],
  userInterests: string[],
): Set<string> {
  const categories = new Set<string>();

  // From saved clubs
  for (const club of savedClubs) {
    categories.add(club.category);
  }

  // From quiz interests → category mapping
  for (const interest of userInterests) {
    const cat = INTEREST_TO_CATEGORY[interest];
    if (cat) categories.add(cat);
  }

  return categories;
}

// ============================================
// NOVELTY REASON GENERATOR
// ============================================

function generateNoveltyReason(
  club: Club,
  preferences: UserPreferences,
  exploredCategories: Set<string>,
): string {
  // New category
  if (!exploredCategories.has(club.category)) {
    const label = club.category.replace(/_/g, ' ');
    return `Explore ${label} clubs`;
  }

  // Different tags
  const newTags = club.tags.filter(
    (tag) => !preferences.interests.includes(tag),
  );
  if (newTags.length > 0) {
    return `Try ${newTags[0].replace(/-/g, ' ')}`;
  }

  // Different vibes
  const newVibes = club.vibes.filter(
    (vibe) => !preferences.vibes.includes(vibe),
  );
  if (newVibes.length > 0) {
    return `Experience a ${newVibes[0].replace(/-/g, ' ')} environment`;
  }

  return 'Discover something new';
}

// ============================================
// COMFORT ZONE RECOMMENDATIONS
// ============================================

interface UserHistory {
  viewedClubs: string[];
  savedClubs: string[];
}

/**
 * Find clubs that are *compatible but different* — scores 30-70%,
 * not already viewed/saved, and outside the user's explored categories.
 */
export function getComfortZoneRecommendations(
  preferences: UserPreferences,
  allClubs: Club[],
  userHistory: UserHistory,
  exploredCategories: Set<string>,
  maxResults = 10,
): ComfortZoneMatch[] {
  const viewedSet = new Set(userHistory.viewedClubs);
  const savedSet = new Set(userHistory.savedClubs);

  return allClubs
    .filter((club) => {
      // Skip already viewed / saved
      if (viewedSet.has(club.id) || savedSet.has(club.id)) return false;
      // Skip explored categories
      if (exploredCategories.has(club.category)) return false;
      return true;
    })
    .map((club) => {
      const score = calculateClubMatch(preferences, club);
      return {
        club,
        score,
        percentage: Math.round(score * 100),
        reasons: generateMatchExplanation(preferences, club),
        noveltyReason: generateNoveltyReason(club, preferences, exploredCategories),
      };
    })
    .filter((r) => r.score >= 0.3 && r.score <= 0.7)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
