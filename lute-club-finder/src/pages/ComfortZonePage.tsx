import { Link } from 'react-router-dom';
import { useComfortZone } from '../hooks/useComfortZone';
import { useSavedClubs } from '../hooks/useSavedClubs';
import { Badge, Button, LoadingSpinner, Breadcrumb } from '../components/ui';
import { CATEGORIES } from '../types';

export default function ComfortZonePage() {
  const { recommendations, isLoading, isQuizCompleted } = useComfortZone(10);
  const { savedSet, toggleSave, isAuthenticated } = useSavedClubs();

  // Gate: quiz not completed
  if (!isQuizCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl mb-4 block">🧭</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Take the Quiz First
        </h1>
        <p className="text-gray-600 mb-6">
          We need your quiz results to find clubs outside your comfort zone.
          Complete the 5-question quiz and come back!
        </p>
        <Link to="/quiz">
          <Button size="lg">Take the Quiz</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Comfort Zone' },
        ]}
      />

      {/* Header */}
      <div className="text-center mt-6 mb-10">
        <span className="text-5xl mb-4 block">🌟</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Step Outside Your Comfort Zone
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          These clubs are compatible with your personality but different from
          what you usually explore. Give something new a try!
        </p>
      </div>

      {recommendations.length === 0 ? (
        /* Empty state */
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <span className="text-4xl mb-3 block">🎯</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            You've explored it all!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            We couldn't find enough unexplored clubs right now. Browse new
            categories or retake the quiz to recalibrate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/discover">
              <Button variant="outline">Browse All Clubs</Button>
            </Link>
            <Link to="/quiz">
              <Button variant="secondary">Retake Quiz</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Recommendation cards */}
          <div className="space-y-4 mb-10">
            {recommendations.map((match, index) => {
              const categoryLabel =
                CATEGORIES.find((c) => c.value === match.club.category)?.label ??
                match.club.category;

              return (
                <div
                  key={match.club.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 text-purple-700 font-bold text-lg flex items-center justify-center">
                      {index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/clubs/${match.club.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-purple-700 transition-colors truncate"
                        >
                          {match.club.name}
                        </Link>
                        <Badge variant="category" category={match.club.category}>
                          {categoryLabel}
                        </Badge>
                      </div>

                      {/* Novelty reason pill */}
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 mb-2">
                        ✨ {match.noveltyReason}
                      </span>

                      {/* Match reasons */}
                      {match.reasons.length > 0 && (
                        <ul className="text-sm text-gray-500 space-y-0.5">
                          {match.reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-400 mt-0.5">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Score + Save */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <MatchCircle percentage={match.percentage} />
                      {isAuthenticated && (
                        <button
                          onClick={() => toggleSave(match.club.id)}
                          className="text-gray-400 hover:text-amber-500 transition-colors"
                          title={savedSet.has(match.club.id) ? 'Unsave' : 'Save'}
                        >
                          {savedSet.has(match.club.id) ? (
                            <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/discover">
              <Button variant="outline">Browse All Clubs</Button>
            </Link>
            <Link to="/quiz">
              <Button variant="secondary">Retake Quiz</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Circular percentage indicator (purple theme)
// ============================================

function MatchCircle({ percentage }: { percentage: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-14 w-14">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 52 52">
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200"
        />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-purple-500 transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
        {percentage}%
      </span>
    </div>
  );
}
