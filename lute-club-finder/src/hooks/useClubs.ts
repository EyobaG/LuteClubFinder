import { useQuery } from '@tanstack/react-query';
import { getClubs, getClub, searchClubs } from '../lib/firebase';
import type { Club, ClubCategory } from '../types';

// ============================================
// Fetch all clubs (with optional filters)
// ============================================

interface ClubFilters {
  category?: ClubCategory;
  status?: string;
  featured?: boolean;
  limitCount?: number;
}

export function useClubs(filters?: ClubFilters) {
  return useQuery<Club[]>({
    queryKey: ['clubs', filters ?? {}],
    queryFn: async () => {
      const data = await getClubs(filters);
      return data as Club[];
    },
  });
}

// ============================================
// Fetch a single club by ID
// ============================================

export function useClub(id: string | undefined) {
  return useQuery<Club>({
    queryKey: ['club', id],
    queryFn: async () => {
      if (!id) throw new Error('No club ID provided');
      const data = await getClub(id);
      return data as Club;
    },
    enabled: !!id,
  });
}

// ============================================
// Search clubs (client-side filter)
// ============================================

export function useSearchClubs(term: string) {
  return useQuery<Club[]>({
    queryKey: ['clubs', 'search', term],
    queryFn: async () => {
      if (!term.trim()) {
        const data = await getClubs({ status: 'active' });
        return data as Club[];
      }
      const data = await searchClubs(term);
      return data as Club[];
    },
  });
}
