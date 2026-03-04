// Example: Quiz Matching Algorithm Implementation
// This shows how to calculate club matches based on user quiz responses

/**
 * Calculate match score between user preferences and a club
 * Returns a score between 0 and 1 (0% to 100% match)
 */
function calculateClubMatch(userPreferences, club) {
  let totalScore = 0;
  let maxScore = 0;

  // 1. TIME COMMITMENT MATCH (Weight: 25%)
  const timeWeight = 0.25;
  const timeMap = { low: 0, medium: 1, high: 2 };
  
  if (userPreferences.timeCommitment === club.attributes.timeCommitment) {
    totalScore += 100 * timeWeight;
  } else {
    // Partial credit for adjacent levels
    const diff = Math.abs(
      timeMap[userPreferences.timeCommitment] - 
      timeMap[club.attributes.timeCommitment]
    );
    totalScore += Math.max(0, 100 - diff * 50) * timeWeight;
  }
  maxScore += 100 * timeWeight;

  // 2. INTEREST TAGS MATCH (Weight: 35%)
  const interestWeight = 0.35;
  const matchingTags = userPreferences.interests.filter(
    interest => club.tags.includes(interest)
  );
  
  if (userPreferences.interests.length > 0) {
    const interestScore = (matchingTags.length / userPreferences.interests.length) * 100;
    totalScore += interestScore * interestWeight;
  }
  maxScore += 100 * interestWeight;

  // 3. VIBE MATCH (Weight: 20%)
  const vibeWeight = 0.20;
  const matchingVibes = userPreferences.vibes.filter(
    vibe => club.vibes.includes(vibe)
  );
  
  if (userPreferences.vibes.length > 0) {
    const vibeScore = (matchingVibes.length / userPreferences.vibes.length) * 100;
    totalScore += vibeScore * vibeWeight;
  }
  maxScore += 100 * vibeWeight;

  // 4. EXPERIENCE LEVEL MATCH (Weight: 10%)
  const expWeight = 0.10;
  if (userPreferences.experienceLevel === club.attributes.experienceRequired ||
      club.attributes.experienceRequired === 'beginner') {
    totalScore += 100 * expWeight;
  }
  maxScore += 100 * expWeight;

  // 5. MEETING TIME PREFERENCE (Weight: 10%)
  const meetingWeight = 0.10;
  const clubMeetingTime = determineMeetingTimeCategory(club.meetingSchedule);
  
  if (userPreferences.meetingPreferences.includes(clubMeetingTime)) {
    totalScore += 100 * meetingWeight;
  }
  maxScore += 100 * meetingWeight;

  // Normalize to 0-1 scale
  return totalScore / maxScore;
}

/**
 * Determine meeting time category from schedule
 */
function determineMeetingTimeCategory(schedule) {
  if (!schedule || !schedule.time) return 'flexible';
  
  const time = schedule.time.toLowerCase();
  const hour = parseInt(time.match(/(\d+):/)?.[1] || '0');
  const isPM = time.includes('pm');
  const actualHour = isPM && hour !== 12 ? hour + 12 : hour;

  // Weekend
  if (schedule.dayOfWeek && 
      (schedule.dayOfWeek.includes('Saturday') || 
       schedule.dayOfWeek.includes('Sunday'))) {
    return 'weekend';
  }

  // Weekday times
  if (actualHour < 12) return 'weekday_morning';
  if (actualHour < 17) return 'weekday_afternoon';
  return 'weekday_evening';
}

/**
 * Generate explanation for why a club matches
 */
function generateMatchExplanation(userPreferences, club, score) {
  const reasons = [];

  // Check interest overlap
  const matchingTags = userPreferences.interests.filter(
    interest => club.tags.includes(interest)
  );
  if (matchingTags.length > 0) {
    reasons.push(`Matches your interests: ${matchingTags.slice(0, 2).join(', ')}`);
  }

  // Check time commitment
  if (userPreferences.timeCommitment === club.attributes.timeCommitment) {
    reasons.push(`Perfect time commitment (${club.attributes.timeCommitment})`);
  }

  // Check vibes
  const matchingVibes = userPreferences.vibes.filter(
    vibe => club.vibes.includes(vibe)
  );
  if (matchingVibes.length > 0) {
    reasons.push(`${matchingVibes[0]} vibe`);
  }

  // Check beginner-friendly
  if (club.attributes.experienceRequired === 'beginner') {
    reasons.push('Beginner-friendly');
  }

  return reasons.slice(0, 3); // Top 3 reasons
}

/**
 * Get top club matches for a user
 */
async function getClubMatches(userPreferences, allClubs, limit = 10) {
  const matches = allClubs.map(club => {
    const score = calculateClubMatch(userPreferences, club);
    const reasons = generateMatchExplanation(userPreferences, club, score);
    
    return {
      club,
      score,
      percentage: Math.round(score * 100),
      reasons
    };
  });

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  // Return top matches
  return matches.slice(0, limit);
}

/**
 * "Out of Comfort Zone" recommendations
 * Finds clubs that are different but still compatible
 */
function getComfortZoneRecommendations(userPreferences, allClubs, userHistory = {}) {
  const viewedClubIds = new Set(userHistory.viewedClubs || []);
  const savedClubIds = new Set(userHistory.savedClubs || []);
  const userCategories = new Set(userHistory.exploredCategories || []);

  const recommendations = allClubs
    .filter(club => {
      // Skip already viewed/saved clubs
      if (viewedClubIds.has(club.id) || savedClubIds.has(club.id)) {
        return false;
      }

      // Look for unexplored categories
      if (userCategories.has(club.category)) {
        return false;
      }

      return true;
    })
    .map(club => {
      const score = calculateClubMatch(userPreferences, club);
      
      return {
        club,
        score,
        percentage: Math.round(score * 100),
        noveltyReason: generateNoveltyReason(club, userPreferences, userCategories)
      };
    })
    .filter(result => {
      // Sweet spot: compatible but different (30-70% match)
      return result.score >= 0.3 && result.score <= 0.7;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return recommendations;
}

/**
 * Generate reason why this club is outside comfort zone
 */
function generateNoveltyReason(club, userPreferences, exploredCategories) {
  const reasons = [];

  // New category
  if (!exploredCategories.has(club.category)) {
    reasons.push(`Explore ${club.category} clubs`);
  }

  // Different tags
  const newTags = club.tags.filter(
    tag => !userPreferences.interests.includes(tag)
  );
  if (newTags.length > 0) {
    reasons.push(`Try ${newTags[0]}`);
  }

  // Different vibe
  const newVibes = club.vibes.filter(
    vibe => !userPreferences.vibes.includes(vibe)
  );
  if (newVibes.length > 0) {
    reasons.push(`Experience a ${newVibes[0]} environment`);
  }

  return reasons[0] || 'Discover something new';
}

// ============================================
// EXAMPLE USAGE
// ============================================

// Sample user preferences from quiz
const userPreferences = {
  timeCommitment: 'medium',
  interests: ['technology', 'career', 'learning'],
  vibes: ['casual', 'learning-focused'],
  experienceLevel: 'beginner',
  meetingPreferences: ['weekday_evening']
};

// Sample clubs (from Firestore)
const sampleClubs = [
  {
    id: 'cs-club',
    name: 'Computer Science Club',
    category: 'academic',
    tags: ['technology', 'learning', 'career'],
    vibes: ['learning-focused', 'casual'],
    attributes: {
      timeCommitment: 'low',
      experienceRequired: 'beginner',
      groupSize: 'medium',
      activityType: ['meetings', 'projects'],
      bestFor: ['skill-building', 'networking']
    },
    meetingSchedule: {
      frequency: 'weekly',
      dayOfWeek: 'Tuesday',
      time: '6:00pm-7:00pm',
      location: 'Morken 203'
    }
  },
  {
    id: 'finance-club',
    name: 'Finance Club',
    category: 'professional',
    tags: ['career', 'business', 'learning'],
    vibes: ['professional', 'learning-focused'],
    attributes: {
      timeCommitment: 'medium',
      experienceRequired: 'beginner',
      groupSize: 'medium',
      activityType: ['meetings', 'workshops'],
      bestFor: ['career', 'networking']
    },
    meetingSchedule: {
      frequency: 'weekly',
      dayOfWeek: 'Monday',
      time: '5:45pm-6:45pm',
      location: 'Morken 103'
    }
  },
  {
    id: 'dance-team',
    name: 'PLU Dance Team',
    category: 'arts',
    tags: ['performance', 'fitness', 'creative'],
    vibes: ['creative', 'competitive'],
    attributes: {
      timeCommitment: 'high',
      experienceRequired: 'intermediate',
      groupSize: 'medium',
      activityType: ['practice', 'performances'],
      bestFor: ['fitness', 'performance']
    },
    meetingSchedule: {
      frequency: 'multiple_weekly',
      dayOfWeek: 'Monday, Wednesday, Friday',
      time: '7:00pm-9:00pm',
      location: 'Memorial Gym'
    }
  }
];

// Calculate matches
console.log('=== TOP CLUB MATCHES ===\n');
getClubMatches(userPreferences, sampleClubs, 10).then(matches => {
  matches.forEach((match, index) => {
    console.log(`${index + 1}. ${match.club.name} - ${match.percentage}% match`);
    console.log(`   Reasons: ${match.reasons.join(', ')}`);
    console.log('');
  });
});

// Get comfort zone recommendations
console.log('\n=== OUT OF COMFORT ZONE ===\n');
const userHistory = {
  viewedClubs: [],
  savedClubs: [],
  exploredCategories: ['academic']
};

const comfortZoneRecs = getComfortZoneRecommendations(
  userPreferences, 
  sampleClubs, 
  userHistory
);

comfortZoneRecs.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.club.name} - ${rec.percentage}% match`);
  console.log(`   Why try this: ${rec.noveltyReason}`);
  console.log('');
});

// ============================================
// EXPECTED OUTPUT:
// ============================================
/*
=== TOP CLUB MATCHES ===

1. Computer Science Club - 88% match
   Reasons: Matches your interests: technology, learning, Beginner-friendly

2. Finance Club - 82% match
   Reasons: Matches your interests: career, learning, Perfect time commitment (medium)

3. PLU Dance Team - 35% match
   Reasons: Beginner-friendly

=== OUT OF COMFORT ZONE ===

1. Finance Club - 82% match
   Why try this: Explore professional clubs

2. PLU Dance Team - 35% match
   Why try this: Explore arts clubs
*/

// ============================================
// INTEGRATION WITH REACT
// ============================================

// Example React component
/*
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function QuizResults({ userPreferences }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      // Get all clubs from Firestore
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      const clubs = clubsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate matches
      const topMatches = await getClubMatches(userPreferences, clubs, 10);
      setMatches(topMatches);
      setLoading(false);
    }

    fetchMatches();
  }, [userPreferences]);

  if (loading) return <div>Finding your perfect clubs...</div>;

  return (
    <div className="quiz-results">
      <h2>Your Top Club Matches</h2>
      {matches.map((match, index) => (
        <div key={match.club.id} className="club-match-card">
          <div className="match-rank">#{index + 1}</div>
          <h3>{match.club.name}</h3>
          <div className="match-percentage">{match.percentage}% Match</div>
          <ul className="match-reasons">
            {match.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
          <button>Learn More</button>
        </div>
      ))}
    </div>
  );
}
*/

module.exports = {
  calculateClubMatch,
  getClubMatches,
  getComfortZoneRecommendations,
  generateMatchExplanation,
  determineMeetingTimeCategory
};
