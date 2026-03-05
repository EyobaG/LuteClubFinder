import { useMemo } from 'react';
import { useLeaderClubs, useLeaderEvents, useLeaderAnnouncements } from '../../hooks/useLeader';
import { useAllUsers } from '../../hooks/useAdmin';
import { LoadingSpinner, Badge } from '../../components/ui';
import { CATEGORIES } from '../../types';
import type { ClubCategory, UserData } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

export default function LeaderAnalytics() {
  const { data: clubs, isLoading: loadingClubs } = useLeaderClubs();
  const { data: events, isLoading: loadingEvents } = useLeaderEvents();
  const { data: announcements, isLoading: loadingAnnouncements } = useLeaderAnnouncements();
  const { data: users } = useAllUsers();

  const isLoading = loadingClubs || loadingEvents || loadingAnnouncements;

  // ---- Per-club comparison data ----
  const clubComparisonData = useMemo(() => {
    if (!clubs) return [];
    return clubs.map((c) => ({
      name: c.name.length > 18 ? c.name.slice(0, 16) + '…' : c.name,
      views: c.views || 0,
      saves: c.saves || 0,
      members: c.memberCount || 0,
    }));
  }, [clubs]);

  // ---- Total stats ----
  const totals = useMemo(() => {
    if (!clubs || !events || !announcements) return { views: 0, saves: 0, members: 0, eventViews: 0, eventInterest: 0, announcementViews: 0 };
    return {
      views: clubs.reduce((s, c) => s + (c.views || 0), 0),
      saves: clubs.reduce((s, c) => s + (c.saves || 0), 0),
      members: clubs.reduce((s, c) => s + (c.memberCount || 0), 0),
      eventViews: events.reduce((s, e) => s + (e.views || 0), 0),
      eventInterest: events.reduce((s, e) => s + (e.interestedCount || 0), 0),
      announcementViews: announcements.reduce((s, a) => s + (a.views || 0), 0),
    };
  }, [clubs, events, announcements]);

  // ---- Events ranked by interest ----
  const eventsRanked = useMemo(() => {
    if (!events) return [];
    return [...events]
      .sort((a, b) => (b.interestedCount || 0) - (a.interestedCount || 0))
      .slice(0, 10);
  }, [events]);

  // ---- Events by type ----
  const eventsByType = useMemo(() => {
    if (!events) return [];
    const map: Record<string, number> = {};
    events.forEach((e) => { map[e.eventType] = (map[e.eventType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [events]);

  // ---- Announcements ranked by views ----
  const announcementsRanked = useMemo(() => {
    if (!announcements) return [];
    return [...announcements]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
  }, [announcements]);

  // ---- Announcements by type ----
  const announcementsByType = useMemo(() => {
    if (!announcements) return [];
    const map: Record<string, number> = {};
    announcements.forEach((a) => { map[a.type] = (map[a.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name === 'plu-spotlight' ? 'PLU Spotlight' : name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [announcements]);

  // ---- Quiz match frequency for leader's clubs ----
  const quizMatchFrequency = useMemo(() => {
    if (!users || !clubs) return [];
    const clubIds = new Set(clubs.map((c) => c.id));
    const frequency: Record<string, number> = {};
    users.forEach((u: UserData) => {
      if (u.quizResults?.matchScores) {
        Object.keys(u.quizResults.matchScores).forEach((clubId) => {
          if (clubIds.has(clubId)) {
            frequency[clubId] = (frequency[clubId] || 0) + 1;
          }
        });
      }
    });
    const clubMap = new Map(clubs.map((c) => [c.id, c]));
    return Object.entries(frequency)
      .map(([clubId, count]) => ({
        clubId,
        clubName: clubMap.get(clubId)?.name ?? clubId,
        category: clubMap.get(clubId)?.category as ClubCategory | undefined,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [users, clubs]);

  // ---- Quiz match frequency chart data ----
  const quizMatchChartData = useMemo(() => {
    return quizMatchFrequency.map((item) => ({
      name: item.clubName.length > 18 ? item.clubName.slice(0, 16) + '…' : item.clubName,
      matches: item.count,
    }));
  }, [quizMatchFrequency]);

  // ---- Quiz completion stats (users who matched leader's clubs) ----
  const quizStats = useMemo(() => {
    if (!users) return { totalQuizUsers: 0, matchedUsers: 0 };
    const totalQuizUsers = users.filter((u: UserData) => u.quizCompleted).length;
    const clubIds = new Set(clubs?.map((c) => c.id) ?? []);
    const matchedUsers = users.filter((u: UserData) =>
      u.quizResults?.matchScores && Object.keys(u.quizResults.matchScores).some((id) => clubIds.has(id))
    ).length;
    return { totalQuizUsers, matchedUsers };
  }, [users, clubs]);

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Performance insights for your clubs.</p>
      </div>

      {/* ===== Overview Stat Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Club Views" value={totals.views} icon="👁️" />
        <StatCard label="Club Saves" value={totals.saves} icon="❤️" />
        <StatCard label="Total Members" value={totals.members} icon="👥" />
        <StatCard label="Event Views" value={totals.eventViews} icon="📅" />
        <StatCard label="Event Interest" value={totals.eventInterest} icon="🙋" />
        <StatCard label="Announcement Views" value={totals.announcementViews} icon="📢" />
      </div>

      {/* ===== Per-Club Stat Cards ===== */}
      {clubs && clubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Per-Club Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">{club.name}</h3>
                  <Badge variant="category" category={club.category as ClubCategory}>
                    {CATEGORIES.find((c) => c.value === club.category)?.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{club.views || 0}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-pink-600">{club.saves || 0}</p>
                    <p className="text-xs text-gray-500">Saves</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{club.memberCount || 0}</p>
                    <p className="text-xs text-gray-500">Members</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Club Comparison Chart ===== */}
      {clubComparisonData.length > 1 && (
        <ChartPanel title="Club Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clubComparisonData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#6366f1" name="Views" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saves" fill="#f59e0b" name="Saves" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}

      {/* ===== Quiz Analytics + Events by Type ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quiz Analytics */}
        <ChartPanel title="Quiz Analytics">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-700">{quizStats.matchedUsers}</p>
              <p className="text-xs text-indigo-500 mt-1">Users Matched</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{quizStats.totalQuizUsers}</p>
              <p className="text-xs text-amber-500 mt-1">Total Quiz Takers</p>
            </div>
          </div>
          {quizMatchChartData.length > 0 ? (
            <>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Match Frequency</h4>
              <ResponsiveContainer width="100%" height={Math.max(180, quizMatchChartData.length * 36)}>
                <BarChart data={quizMatchChartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="matches" fill="#6366f1" name="Matches" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-400 text-sm py-4 text-center">No quiz data yet.</p>
          )}
        </ChartPanel>

        {/* Events by Type */}
        <ChartPanel title="Events by Type">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{totals.eventViews}</p>
              <p className="text-xs text-green-500 mt-1">Total Event Views</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{totals.eventInterest}</p>
              <p className="text-xs text-blue-500 mt-1">Total Interested</p>
            </div>
          </div>
          {eventsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eventsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {eventsByType.map((_e, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No events yet.</p>
          )}
        </ChartPanel>
      </div>

      {/* ===== Top Events + Announcements by Type ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Events by Interest */}
        <ChartPanel title="Top Events by Interest">
          {eventsRanked.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(250, eventsRanked.length * 36)}>
              <BarChart
                data={eventsRanked.map((e) => ({
                  name: e.title.length > 22 ? e.title.slice(0, 20) + '…' : e.title,
                  interested: e.interestedCount || 0,
                  views: e.views || 0,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="interested" fill="#10b981" name="Interested" radius={[0, 4, 4, 0]} />
                <Bar dataKey="views" fill="#6366f1" name="Views" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No events yet.</p>
          )}
        </ChartPanel>

        {/* Announcements by Type */}
        <ChartPanel title="Announcements Analytics">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{totals.announcementViews}</p>
              <p className="text-xs text-purple-500 mt-1">Total Views</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-pink-700">{announcements?.length ?? 0}</p>
              <p className="text-xs text-pink-500 mt-1">Announcements</p>
            </div>
          </div>
          {announcementsByType.length > 0 ? (
            <>
              <h4 className="text-sm font-medium text-gray-600 mb-2">By Type</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={announcementsByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {announcementsByType.map((_a, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No announcements yet.</p>
          )}
        </ChartPanel>
      </div>

      {/* ===== Top Announcements by Views ===== */}
      <ChartPanel title="Top Announcements by Views">
        {announcementsRanked.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(250, announcementsRanked.length * 36)}>
            <BarChart
              data={announcementsRanked.map((a) => ({
                name: a.title.length > 22 ? a.title.slice(0, 20) + '…' : a.title,
                views: a.views || 0,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#8b5cf6" name="Views" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">No announcements yet.</p>
        )}
      </ChartPanel>
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
