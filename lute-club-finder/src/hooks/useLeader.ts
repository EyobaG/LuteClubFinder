import { useQuery } from '@tanstack/react-query';
import { getClub, getAllEvents, getAllAnnouncements } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { Club, ClubEvent, Announcement } from '../types';

/**
 * Fetch clubs managed by the current leader (from userData.clubLeaderOf)
 */
export function useLeaderClubs() {
  const { userData } = useAuth();
  const clubIds = userData?.clubLeaderOf ?? [];

  return useQuery<Club[]>({
    queryKey: ['leader', 'clubs', clubIds],
    queryFn: async () => {
      if (clubIds.length === 0) return [];
      const clubs = await Promise.all(
        clubIds.map(async (id) => {
          try {
            return (await getClub(id)) as Club;
          } catch {
            return null;
          }
        })
      );
      return clubs.filter(Boolean) as Club[];
    },
    enabled: clubIds.length > 0,
  });
}

/**
 * Fetch events belonging to the leader's clubs
 */
export function useLeaderEvents() {
  const { userData } = useAuth();
  const clubIds = userData?.clubLeaderOf ?? [];

  return useQuery<ClubEvent[]>({
    queryKey: ['leader', 'events', clubIds],
    queryFn: async () => {
      if (clubIds.length === 0) return [];
      const allEvents = (await getAllEvents()) as ClubEvent[];
      return allEvents.filter((e) => clubIds.includes(e.clubId));
    },
    enabled: clubIds.length > 0,
  });
}

/**
 * Fetch announcements belonging to the leader's clubs
 */
export function useLeaderAnnouncements() {
  const { userData } = useAuth();
  const clubIds = userData?.clubLeaderOf ?? [];

  return useQuery<Announcement[]>({
    queryKey: ['leader', 'announcements', clubIds],
    queryFn: async () => {
      if (clubIds.length === 0) return [];
      const allAnnouncements = (await getAllAnnouncements()) as Announcement[];
      return allAnnouncements.filter((a) => a.clubId && clubIds.includes(a.clubId));
    },
    enabled: clubIds.length > 0,
  });
}

/**
 * Aggregate stats for leader's clubs
 */
export function useLeaderStats() {
  const { data: clubs } = useLeaderClubs();
  const { data: events } = useLeaderEvents();
  const { data: announcements } = useLeaderAnnouncements();

  const stats = {
    totalClubs: clubs?.length ?? 0,
    totalViews: clubs?.reduce((sum, c) => sum + (c.views ?? 0), 0) ?? 0,
    totalSaves: clubs?.reduce((sum, c) => sum + (c.saves ?? 0), 0) ?? 0,
    upcomingEvents: events?.filter((e) => e.status === 'upcoming').length ?? 0,
    totalAnnouncements: announcements?.length ?? 0,
  };

  return stats;
}
