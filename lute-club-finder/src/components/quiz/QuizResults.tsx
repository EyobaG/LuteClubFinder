import { Link } from 'react-router-dom';
import type { ClubMatch } from '../../types';
import { CATEGORY_COLORS } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface QuizResultsProps {
  matches: ClubMatch[];
  onRetake: () => void;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export default function QuizResults({
  matches,
  onRetake,
  onSave,
  isSaving,
  isSaved,
}: QuizResultsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🎉</span>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Top Club Matches
        </h2>
        <p className="text-gray-500">
          Based on your answers, here are the clubs we think you'll love.
        </p>
      </div>

      {/* Match cards */}
      <div className="space-y-4 mb-8">
        {matches.map((match, index) => (
          <Link
            key={match.club.id}
            to={`/clubs/${match.club.id}`}
            className="block"
          >
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 p-5 flex items-start gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center">
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {match.club.name}
                  </h3>
                  <Badge variant="category" category={match.club.category}>
                    {match.club.category}
                  </Badge>
                </div>

                {/* Reasons */}
                <ul className="text-sm text-gray-500 space-y-0.5">
                  {match.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-center">
                <MatchCircle percentage={match.percentage} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!isSaved && (
          <Button onClick={onSave} isLoading={isSaving}>
            Save My Results
          </Button>
        )}
        {isSaved && (
          <Button variant="outline" disabled>
            ✓ Results Saved
          </Button>
        )}
        <Button variant="secondary" onClick={onRetake}>
          Retake Quiz
        </Button>
        <Link to="/discover">
          <Button variant="ghost" className="w-full">
            Browse All Clubs
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================
// Circular percentage indicator
// ============================================

function MatchCircle({ percentage }: { percentage: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on score
  let color = 'text-red-400';
  if (percentage >= 70) color = 'text-green-500';
  else if (percentage >= 45) color = 'text-amber-500';

  return (
    <div className="relative h-14 w-14">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 52 52">
        {/* Background ring */}
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200"
        />
        {/* Progress ring */}
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
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
        {percentage}%
      </span>
    </div>
  );
}
