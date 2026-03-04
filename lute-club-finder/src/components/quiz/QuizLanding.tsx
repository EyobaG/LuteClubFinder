import { Link } from 'react-router-dom';
import type { ClubMatch } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface QuizLandingProps {
  /** True if the user has previously completed the quiz */
  hasResults: boolean;
  /** Top 3 previous matches (only used when hasResults is true) */
  previousMatches?: ClubMatch[];
  onStart: () => void;
}

export default function QuizLanding({
  hasResults,
  previousMatches = [],
  onStart,
}: QuizLandingProps) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <span className="text-5xl mb-6 block">🎯</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Find Your Perfect Club
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Answer 5 quick questions and we'll match you with clubs that fit your
        interests, schedule, and vibe.
      </p>

      {/* Previous results summary */}
      {hasResults && previousMatches.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 text-left">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Your previous top matches
          </h3>
          <ul className="space-y-3">
            {previousMatches.map((m, i) => (
              <li key={m.club.id}>
                <Link
                  to={`/clubs/${m.club.id}`}
                  className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-gray-900 font-medium truncate flex-1">
                    {m.club.name}
                  </span>
                  <Badge variant="category" category={m.club.category}>
                    {m.club.category}
                  </Badge>
                  <span className="text-sm font-semibold text-amber-600">
                    {m.percentage}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={onStart}>
          {hasResults ? 'Retake Quiz' : 'Start Quiz'}
        </Button>
      </div>

      <p className="mt-6 text-sm text-gray-400">
        Or{' '}
        <Link
          to="/discover"
          className="text-amber-600 hover:text-amber-700 underline"
        >
          browse all clubs
        </Link>
      </p>
    </div>
  );
}
