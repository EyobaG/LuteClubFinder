import { useMemo } from 'react';
import { useAllClubs, useAllUsers, useAdminStats } from './useAdmin';
import { useAllEvents } from './useEvents';
import { useAllAnnouncements } from './useAnnouncements';
import { CATEGORIES } from '../types';
import type { Club, ClubEvent, Announcement, UserData, ClubCategory } from '../types';

// ============================================
// ADMIN-LEVEL ANALYTICS
// ============================================

export function useAnalyticsData() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: clubs, isLoading: loadingClubs } = useAllClubs();
  const { data: users, isLoading: loadingUsers } = useAllUsers();
  const { data: events, isLoading: loadingEvents } = useAllEvents();
  const { data: announcements, isLoading: loadingAnnouncements } = useAllAnnouncements();

  const isLoading = loadingStats || loadingClubs || loadingUsers || loadingEvents || loadingAnnouncements;

  // ---- Platform summary ----
  const totalClubViews = useMemo(
    () => clubs?.reduce((sum, c) => sum + (c.views || 0), 0) ?? 0,
    [clubs]
  );
  const totalClubSaves = useMemo(
    () => clubs?.reduce((sum, c) => sum + (c.saves || 0), 0) ?? 0,
    [clubs]
  );
  const totalEventViews = useMemo(
    () => events?.reduce((sum, e) => sum + ((e as ClubEvent).views || 0), 0) ?? 0,
    [events]
  );
  const totalAnnouncementViews = useMemo(
    () => announcements?.reduce((sum, a) => sum + ((a as Announcement).views || 0), 0) ?? 0,
    [announcements]
  );
  const totalEventInterest = useMemo(
    () => events?.reduce((sum, e) => sum + ((e as ClubEvent).interestedCount || 0), 0) ?? 0,
    [events]
  );

  const quizRate = useMemo(() => {
    if (!stats || stats.totalUsers === 0) return 0;
    return Math.round((stats.quizCompletions / stats.totalUsers) * 100);
  }, [stats]);

  // ---- Users by role (non-exclusive) ----
  // A user can be counted in multiple categories (e.g. an admin who leads clubs
  // appears in both Admins and Club Leaders).
  const usersByRole = useMemo(() => {
    if (!users) return { student: 0, club_leader: 0, admin: 0 };
    const counts = { student: 0, club_leader: 0, admin: 0 };
    users.forEach((u: UserData) => {
      if (u.role === 'admin') counts.admin++;
      if (u.role === 'club_leader' || (u.clubLeaderOf && u.clubLeaderOf.length > 0)) counts.club_leader++;
      if (u.role === 'student') counts.student++;
    });
    return counts;
  }, [users]);

  // ---- Top clubs ----
  const topViewedClubs = useMemo(() => {
    if (!clubs) return [];
    return [...clubs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  }, [clubs]);

  const topSavedClubs = useMemo(() => {
    if (!clubs) return [];
    return [...clubs].sort((a, b) => (b.saves || 0) - (a.saves || 0)).slice(0, 10);
  }, [clubs]);

  // ---- Category distributions ----
  const clubsByCategory = useMemo(() => {
    if (!clubs) return [];
    const map: Record<string, number> = {};
    clubs.forEach((c: Club) => { map[c.category] = (map[c.category] || 0) + 1; });
    return CATEGORIES.map((cat) => ({
      category: cat.value,
      label: cat.label,
      count: map[cat.value] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [clubs]);

  const viewsByCategoryData = useMemo(() => {
    if (!clubs) return [];
    const viewMap: Record<string, number> = {};
    const saveMap: Record<string, number> = {};
    clubs.forEach((c: Club) => {
      viewMap[c.category] = (viewMap[c.category] || 0) + (c.views || 0);
      saveMap[c.category] = (saveMap[c.category] || 0) + (c.saves || 0);
    });
    return CATEGORIES.map((cat) => ({
      name: cat.label,
      views: viewMap[cat.value] || 0,
      saves: saveMap[cat.value] || 0,
    })).filter((d) => d.views > 0 || d.saves > 0);
  }, [clubs]);

  // ---- Events analytics ----
  const topEventsByInterest = useMemo(() => {
    if (!events) return [];
    return [...(events as ClubEvent[])]
      .sort((a, b) => (b.interestedCount || 0) - (a.interestedCount || 0))
      .slice(0, 10);
  }, [events]);

  const eventsByType = useMemo(() => {
    if (!events) return [];
    const map: Record<string, number> = {};
    (events as ClubEvent[]).forEach((e) => { map[e.eventType] = (map[e.eventType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [events]);

  // ---- Announcements analytics ----
  const topAnnouncementsByViews = useMemo(() => {
    if (!announcements) return [];
    return [...(announcements as Announcement[])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
  }, [announcements]);

  const announcementsByType = useMemo(() => {
    if (!announcements) return [];
    const map: Record<string, number> = {};
    (announcements as Announcement[]).forEach((a) => { map[a.type] = (map[a.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name === 'plu-spotlight' ? 'PLU Spotlight' : name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [announcements]);

  // ---- Quiz match frequency ----
  const quizMatchFrequency = useMemo(() => {
    if (!users || !clubs) return [];
    const frequency: Record<string, number> = {};
    users.forEach((u: UserData) => {
      if (u.quizResults?.matchScores) {
        Object.keys(u.quizResults.matchScores).forEach((clubId) => {
          frequency[clubId] = (frequency[clubId] || 0) + 1;
        });
      }
    });
    const clubMap = new Map(clubs.map((c: Club) => [c.id, c]));
    return Object.entries(frequency)
      .map(([clubId, count]) => ({
        clubId,
        clubName: clubMap.get(clubId)?.name ?? clubId,
        category: clubMap.get(clubId)?.category as ClubCategory | undefined,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [users, clubs]);

  return {
    isLoading,
    stats,
    clubs,
    users,
    events: events as ClubEvent[] | undefined,
    announcements: announcements as Announcement[] | undefined,
    // Summary
    totalClubViews,
    totalClubSaves,
    totalEventViews,
    totalAnnouncementViews,
    totalEventInterest,
    quizRate,
    // Distributions
    usersByRole,
    clubsByCategory,
    viewsByCategoryData,
    eventsByType,
    announcementsByType,
    // Rankings
    topViewedClubs,
    topSavedClubs,
    topEventsByInterest,
    topAnnouncementsByViews,
    quizMatchFrequency,
  };
}
