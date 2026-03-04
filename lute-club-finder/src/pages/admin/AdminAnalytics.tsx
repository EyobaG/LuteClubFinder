import { useMemo } from 'react';
import { useAllClubs, useAllUsers, useAdminStats } from '../../hooks/useAdmin';
import { Badge, LoadingSpinner } from '../../components/ui';
import { CATEGORIES } from '../../types';
import type { ClubCategory } from '../../types';

export default function AdminAnalytics() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: clubs, isLoading: loadingClubs } = useAllClubs();
  const { data: users, isLoading: loadingUsers } = useAllUsers();

  const isLoading = loadingStats || loadingClubs || loadingUsers;

  // Derived analytics
  const quizRate = useMemo(() => {
    if (!stats || stats.totalUsers === 0) return 0;
    return Math.round((stats.quizCompletions / stats.totalUsers) * 100);
  }, [stats]);

  const topViewedClubs = useMemo(() => {
    if (!clubs) return [];
    return [...clubs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  }, [clubs]);

  const topSavedClubs = useMemo(() => {
    if (!clubs) return [];
    return [...clubs].sort((a, b) => (b.saves || 0) - (a.saves || 0)).slice(0, 10);
  }, [clubs]);

  const usersByRole = useMemo(() => {
    if (!users) return { student: 0, club_leader: 0, admin: 0 };
    const counts = { student: 0, club_leader: 0, admin: 0 };
    users.forEach((u) => {
      if (u.role in counts) counts[u.role as keyof typeof counts]++;
    });
    return counts;
  }, [users]);

  const clubsByCategory = useMemo(() => {
    if (!clubs) return [];
    const map: Record<string, number> = {};
    clubs.forEach((c) => {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return CATEGORIES.map((cat) => ({
      category: cat.value,
      label: cat.label,
      count: map[cat.value] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [clubs]);

  const totalViews = useMemo(() => {
    if (!clubs) return 0;
    return clubs.reduce((sum, c) => sum + (c.views || 0), 0);
  }, [clubs]);

  const totalSaves = useMemo(() => {
    if (!clubs) return 0;
    return clubs.reduce((sum, c) => sum + (c.saves || 0), 0);
  }, [clubs]);

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform statistics and insights.</p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon="👥" />
        <StatCard label="Quiz Completion Rate" value={`${quizRate}%`} icon="📊" />
        <StatCard label="Total Club Views" value={totalViews} icon="👁️" />
        <StatCard label="Total Club Saves" value={totalSaves} icon="❤️" />
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Students</h3>
          <p className="text-3xl font-bold text-gray-900">{usersByRole.student}</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full"
              style={{
                width: `${((usersByRole.student / (stats?.totalUsers || 1)) * 100).toFixed(0)}%`,
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Club Leaders</h3>
          <p className="text-3xl font-bold text-blue-600">{usersByRole.club_leader}</p>
          <div className="mt-2 h-2 bg-blue-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${((usersByRole.club_leader / (stats?.totalUsers || 1)) * 100).toFixed(0)}%`,
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Admins</h3>
          <p className="text-3xl font-bold text-amber-600">{usersByRole.admin}</p>
          <div className="mt-2 h-2 bg-amber-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${((usersByRole.admin / (stats?.totalUsers || 1)) * 100).toFixed(0)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Viewed Clubs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Most Viewed Clubs</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {topViewedClubs.map((club, i) => (
              <div key={club.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-sm font-bold text-gray-400 w-6 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{club.name}</p>
                  <Badge variant="category" category={club.category as ClubCategory} className="mt-0.5">
                    {CATEGORIES.find((c) => c.value === club.category)?.label}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-gray-700">{club.views || 0} views</span>
              </div>
            ))}
            {topViewedClubs.length === 0 && (
              <p className="px-5 py-4 text-gray-400 text-sm">No data yet.</p>
            )}
          </div>
        </div>

        {/* Top Saved Clubs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Most Saved Clubs</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {topSavedClubs.map((club, i) => (
              <div key={club.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-sm font-bold text-gray-400 w-6 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{club.name}</p>
                  <Badge variant="category" category={club.category as ClubCategory} className="mt-0.5">
                    {CATEGORIES.find((c) => c.value === club.category)?.label}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-gray-700">{club.saves || 0} saves</span>
              </div>
            ))}
            {topSavedClubs.length === 0 && (
              <p className="px-5 py-4 text-gray-400 text-sm">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Clubs by Category */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Clubs by Category</h3>
        </div>
        <div className="p-5 space-y-3">
          {clubsByCategory.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <Badge variant="category" category={cat.category as ClubCategory} className="w-28 justify-center">
                {cat.label}
              </Badge>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((cat.count / (clubs?.length || 1)) * 100).toFixed(0)}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8 text-right">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Stat Card Helper
// ============================================

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
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
