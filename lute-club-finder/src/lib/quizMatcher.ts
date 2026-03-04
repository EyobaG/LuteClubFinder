import type { UserPreferences, Club, ClubMatch, MeetingSchedule } from '../types';

// ============================================
// MATCHING WEIGHTS
// ============================================

const WEIGHTS = {
  interests: 0.35,
  time: 0.25,
  vibes: 0.20,
  experience: 0.10,
  meetingTime: 0.10,
} as const;

// ============================================
// MEETING TIME HELPERS
// ============================================

/**
 * Determine a meeting time category from a club's schedule.
 * Returns one of: weekday_morning, weekday_afternoon, weekday_evening, weekend, flexible
 */
export function determineMeetingTimeCategory(
  schedule: MeetingSchedule | null,
): string {
  if (!schedule?.time) return 'flexible';

  const time = schedule.time.toLowerCase();
  const hourMatch = time.match(/(\d+):/);
  const hour = parseInt(hourMatch?.[1] || '0', 10);
  const isPM = time.includes('pm');
  const actualHour = isPM && hour !== 12 ? hour + 12 : hour;

  // Weekend check
  if (
    schedule.dayOfWeek &&
    (schedule.dayOfWeek.includes('Saturday') ||
      schedule.dayOfWeek.includes('Sunday'))
  ) {
    return 'weekend';
  }

  // Weekday time ranges
  if (actualHour < 12) return 'weekday_morning';
  if (actualHour < 17) return 'weekday_afternoon';
  return 'weekday_evening';
}

// ============================================
// SCORE CALCULATION
// ============================================

/**
 * Calculate a 0-1 match score between user preferences and a single club.
 */
export function calculateClubMatch(
  preferences: UserPreferences,
  club: Club,
): number {
  let totalScore = 0;
  let maxScore = 0;

  // 1. Interest / tag overlap (35%)
  if (preferences.interests.length > 0) {
    const matchCount = preferences.interests.filter((i) =>
      club.tags.includes(i),
    ).length;
    totalScore += (matchCount / preferences.interests.length) * 100 * WEIGHTS.interests;
  }
  maxScore += 100 * WEIGHTS.interests;

  // 2. Time commitment (25%)
  const timeMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
  if (preferences.timeCommitment === club.attributes.timeCommitment) {
    totalScore += 100 * WEIGHTS.time;
  } else {
    const diff = Math.abs(
      (timeMap[preferences.timeCommitment] ?? 1) -
        (timeMap[club.attributes.timeCommitment] ?? 1),
    );
    totalScore += Math.max(0, 100 - diff * 50) * WEIGHTS.time;
  }
  maxScore += 100 * WEIGHTS.time;

  // 3. Vibe match (20%)
  if (preferences.vibes.length > 0) {
    const matchCount = preferences.vibes.filter((v) =>
      club.vibes.includes(v),
    ).length;
    totalScore += (matchCount / preferences.vibes.length) * 100 * WEIGHTS.vibes;
  }
  maxScore += 100 * WEIGHTS.vibes;

  // 4. Experience level (10%)
  if (
    preferences.experienceLevel === club.attributes.experienceRequired ||
    club.attributes.experienceRequired === 'beginner'
  ) {
    totalScore += 100 * WEIGHTS.experience;
  }
  maxScore += 100 * WEIGHTS.experience;

  // 5. Meeting time preference (10%)
  const clubTimeCategory = determineMeetingTimeCategory(club.meetingSchedule);
  if (preferences.meetingPreferences.includes(clubTimeCategory)) {
    totalScore += 100 * WEIGHTS.meetingTime;
  }
  maxScore += 100 * WEIGHTS.meetingTime;

  return maxScore > 0 ? totalScore / maxScore : 0;
}

// ============================================
// EXPLANATION GENERATOR
// ============================================

/**
 * Build up to 3 human-readable reasons explaining a club match.
 */
export function generateMatchExplanation(
  preferences: UserPreferences,
  club: Club,
): string[] {
  const reasons: string[] = [];

  // Interest overlap
  const matchingTags = preferences.interests.filter((i) =>
    club.tags.includes(i),
  );
  if (matchingTags.length > 0) {
    reasons.push(
      `Matches your interests: ${matchingTags.slice(0, 2).join(', ')}`,
    );
  }

  // Time commitment
  if (preferences.timeCommitment === club.attributes.timeCommitment) {
    reasons.push(
      `Perfect time commitment (${club.attributes.timeCommitment})`,
    );
  }

  // Vibe
  const matchingVibes = preferences.vibes.filter((v) =>
    club.vibes.includes(v),
  );
  if (matchingVibes.length > 0) {
    reasons.push(`${matchingVibes[0]} vibe`);
  }

  // Beginner friendly
  if (club.attributes.experienceRequired === 'beginner') {
    reasons.push('Beginner-friendly');
  }

  return reasons.slice(0, 3);
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Rank all clubs against user preferences and return the top `limit` results.
 */
export function getClubMatches(
  preferences: UserPreferences,
  clubs: Club[],
  limit = 10,
): ClubMatch[] {
  return clubs
    .map((club) => {
      const score = calculateClubMatch(preferences, club);
      const reasons = generateMatchExplanation(preferences, club);
      return {
        club,
        score,
        percentage: Math.round(score * 100),
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
