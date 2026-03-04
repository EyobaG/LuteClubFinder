import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function QuizPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <span className="text-5xl mb-6 block">🎯</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Club</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
        Answer 5 quick questions and we'll match you with clubs that fit your
        interests, schedule, and vibe.
      </p>
      <Button size="lg" disabled>
        Start Quiz (Coming in Phase 3)
      </Button>
      <p className="mt-6 text-sm text-gray-400">
        Or{' '}
        <Link to="/discover" className="text-amber-600 hover:text-amber-700 underline">
          browse all clubs
        </Link>
      </p>
    </div>
  );
}
