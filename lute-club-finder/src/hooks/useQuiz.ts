import { useQuery } from '@tanstack/react-query';
import { getQuizQuestions } from '../lib/firebase';
import type { QuizQuestion } from '../types';

/**
 * Fetch all active quiz questions ordered by `order` field.
 */
export function useQuizQuestions() {
  return useQuery<QuizQuestion[]>({
    queryKey: ['quizQuestions'],
    queryFn: async () => {
      const data = await getQuizQuestions();
      return data as QuizQuestion[];
    },
    staleTime: 30 * 60 * 1000, // 30 min — questions rarely change
  });
}
