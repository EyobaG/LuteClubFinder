import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuizQuestions } from '../hooks/useQuiz';
import { useClubs } from '../hooks/useClubs';
import { submitQuizResults } from '../lib/firebase';
import { getClubMatches } from '../lib/quizMatcher';
import { QuizLanding, QuizProgress, QuizQuestionCard, QuizResults } from '../components/quiz';
import { PageLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import type { UserPreferences, ClubMatch, QuizQuestion } from '../types';

// ============================================
// STATE & REDUCER
// ============================================

type Step = 'landing' | 'quiz' | 'results';

interface QuizState {
  step: Step;
  currentIndex: number;
  answers: Record<string, string | string[]>; // keyed by question id
  preferences: UserPreferences | null;
  matches: ClubMatch[];
  saved: boolean;
}

type QuizAction =
  | { type: 'START' }
  | { type: 'SET_ANSWER'; questionId: string; value: string | string[] }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'COMPUTE_RESULTS'; preferences: UserPreferences; matches: ClubMatch[] }
  | { type: 'MARK_SAVED' }
  | { type: 'RETAKE' };

const initialState: QuizState = {
  step: 'landing',
  currentIndex: 0,
  answers: {},
  preferences: null,
  matches: [],
  saved: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return { ...initialState, step: 'quiz' };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case 'NEXT':
      return { ...state, currentIndex: state.currentIndex + 1 };
    case 'PREV':
      return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) };
    case 'COMPUTE_RESULTS':
      return {
        ...state,
        step: 'results',
        preferences: action.preferences,
        matches: action.matches,
      };
    case 'MARK_SAVED':
      return { ...state, saved: true };
    case 'RETAKE':
      return { ...initialState, step: 'quiz' };
    default:
      return state;
  }
}

// ============================================
// ANSWER → PREFERENCES MAPPER
// ============================================

function buildPreferences(
  answers: Record<string, string | string[]>,
  questions: QuizQuestion[],
): UserPreferences {
  const prefs: UserPreferences = {
    timeCommitment: 'medium',
    interests: [],
    vibes: [],
    experienceLevel: 'beginner',
    meetingPreferences: [],
  };

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    switch (q.matchingAttribute) {
      case 'timeCommitment':
        prefs.timeCommitment = (typeof answer === 'string' ? answer : answer[0]) as UserPreferences['timeCommitment'];
        break;
      case 'tags':
        prefs.interests = Array.isArray(answer) ? answer : [answer];
        break;
      case 'vibes':
        prefs.vibes = Array.isArray(answer) ? answer : [answer];
        break;
      case 'experienceRequired':
        prefs.experienceLevel = (typeof answer === 'string' ? answer : answer[0]) as UserPreferences['experienceLevel'];
        break;
      case 'meetingPreferences':
        prefs.meetingPreferences = Array.isArray(answer) ? answer : [answer];
        break;
    }
  }

  return prefs;
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function QuizPage() {
  const navigate = useNavigate();
  const { user, userData, refreshUserData } = useAuth();
  const { data: questions, isLoading: loadingQs, error: questionsError } = useQuizQuestions();
  const { data: allClubs, isLoading: loadingClubs } = useClubs();

  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [saving, setSaving] = useReducer((_: boolean, v: boolean) => v, false);

  // Current question shortcut
  const currentQ = questions?.[state.currentIndex] ?? null;
  const currentAnswer = currentQ ? state.answers[currentQ.id] : undefined;
  const isLastQuestion = questions ? state.currentIndex === questions.length - 1 : false;

  // Has the user already selected something for the current question?
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== '' &&
    !(Array.isArray(currentAnswer) && currentAnswer.length === 0);

  // Build previous matches for the landing page (from userData if available)
  const previousMatches = useMemo(() => {
    if (!userData?.quizCompleted || !userData.quizResults?.matchScores || !allClubs) {
      return [];
    }
    // Reconstruct ClubMatch objects from saved scores
    const scores = userData.quizResults.matchScores as Record<string, number>;
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([clubId, score]) => {
        const club = allClubs.find((c) => c.id === clubId);
        if (!club) return null;
        return {
          club,
          score,
          percentage: Math.round(score * 100),
          reasons: [] as string[],
        } satisfies ClubMatch;
      })
      .filter(Boolean) as ClubMatch[];
  }, [userData, allClubs]);

  // Compute results when user finishes quiz
  const computeResults = useCallback(() => {
    if (!questions || !allClubs) return;
    const preferences = buildPreferences(state.answers, questions);
    const matches = getClubMatches(preferences, allClubs, 10);
    dispatch({ type: 'COMPUTE_RESULTS', preferences, matches });
  }, [questions, allClubs, state.answers]);

  // Save results to Firestore
  const saveResults = useCallback(async () => {
    if (!state.preferences || state.matches.length === 0) return;

    // If not logged in, redirect to login with a return path
    if (!user) {
      // Stash pending results in sessionStorage so they survive the login redirect
      sessionStorage.setItem(
        'quizPending',
        JSON.stringify({
          preferences: state.preferences,
          matchScores: Object.fromEntries(
            state.matches.map((m) => [m.club.id, m.score]),
          ),
        }),
      );
      navigate('/login', { state: { from: '/quiz' } });
      return;
    }

    setSaving(true);
    try {
      const matchScores = Object.fromEntries(
        state.matches.map((m) => [m.club.id, m.score]),
      );
      await submitQuizResults(user.uid, state.preferences, matchScores);
      await refreshUserData();
      dispatch({ type: 'MARK_SAVED' });
    } catch (err) {
      console.error('Failed to save quiz results:', err);
    } finally {
      setSaving(false);
    }
  }, [state.preferences, state.matches, user, navigate, refreshUserData]);

  // Auto-save pending results after returning from login
  useEffect(() => {
    const raw = sessionStorage.getItem('quizPending');
    if (!raw || !user) return;

    (async () => {
      try {
        const { preferences, matchScores } = JSON.parse(raw) as {
          preferences: UserPreferences;
          matchScores: Record<string, number>;
        };
        await submitQuizResults(user.uid, preferences, matchScores);
        await refreshUserData();
        sessionStorage.removeItem('quizPending');
      } catch (err) {
        console.error('Auto-save quiz failed:', err);
      }
    })();
  }, [user, refreshUserData]);

  // ------------------------------------------
  // Render
  // ------------------------------------------

  if (loadingQs || loadingClubs) {
    return <PageLoader />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Unavailable</h1>
        <p className="text-gray-500">
          {questionsError
            ? `Error loading questions: ${(questionsError as Error).message}`
            : "Quiz questions haven't been set up yet. Check back soon!"}
        </p>
      </div>
    );
  }

  // LANDING -------------------------------------------------------
  if (state.step === 'landing') {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <QuizLanding
          hasResults={!!userData?.quizCompleted}
          previousMatches={previousMatches}
          onStart={() => dispatch({ type: 'START' })}
        />
      </div>
    );
  }

  // RESULTS -------------------------------------------------------
  if (state.step === 'results') {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <QuizResults
          matches={state.matches}
          onRetake={() => dispatch({ type: 'RETAKE' })}
          onSave={saveResults}
          isSaving={saving}
          isSaved={state.saved}
        />
      </div>
    );
  }

  // QUIZ (one question at a time) ---------------------------------
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12">
      <QuizProgress current={state.currentIndex} total={questions.length} />

      {/* Question card with slide animation */}
      <div className="relative overflow-hidden">
        <div
          key={state.currentIndex}
          className="animate-fadeSlideIn"
        >
          {currentQ && (
            <QuizQuestionCard
              question={currentQ}
              value={currentAnswer ?? (currentQ.type === 'multiple_choice' ? [] : '')}
              onChange={(val) =>
                dispatch({ type: 'SET_ANSWER', questionId: currentQ.id, value: val })
              }
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between max-w-xl mx-auto mt-10">
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'PREV' })}
          disabled={state.currentIndex === 0}
        >
          ← Back
        </Button>

        {isLastQuestion ? (
          <Button onClick={computeResults} disabled={!hasAnswer}>
            See My Matches 🎉
          </Button>
        ) : (
          <Button
            onClick={() => dispatch({ type: 'NEXT' })}
            disabled={!hasAnswer}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
