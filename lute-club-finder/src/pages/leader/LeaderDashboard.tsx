import { Link } from 'react-router-dom';
import { useLeaderClubs, useLeaderStats } from '../../hooks/useLeader';
import { SkeletonCard, Badge } from '../../components/ui';
import { CATEGORY_COLORS } from '../../types';

export default function LeaderDashboard() {
  const { data: clubs, isLoading } = useLeaderClubs();
  const stats = useLeaderStats();

  const statCards = [
    { label: 'My Clubs', value: stats.totalClubs, icon: '🎭', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Total Views', value: stats.totalViews, icon: '👁️', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Saves', value: stats.totalSaves, icon: '❤️', color: 'bg-pink-50 text-pink-700' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: '📅', color: 'bg-green-50 text-green-700' },
    { label: 'Announcements', value: stats.totalAnnouncements, icon: '📢', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Club Leader Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your clubs, events, and announcements.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.color}`}>
                {card.label}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/leader/events/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Event</p>
              <p className="text-sm text-gray-500">Schedule a new event for your club</p>
            </div>
          </Link>
          <Link
            to="/leader/announcements/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 01-1.006-.275 11.865 11.865 0 01-1.6-4.267m5.651 0A12.04 12.04 0 0021 12a12.04 12.04 0 00-3.01-3.84" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Post Announcement</p>
              <p className="text-sm text-gray-500">Share news with your club members</p>
            </div>
          </Link>
          <Link
            to="/leader/analytics"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Performance insights for your clubs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* My Clubs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Clubs</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !clubs || clubs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <span className="text-4xl block mb-3">🎵</span>
            <p className="text-gray-500">No clubs assigned to you yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Contact an admin to be assigned as a club leader.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{club.name}</h3>
                    <Badge
                      color={
                        (CATEGORY_COLORS[club.category as keyof typeof CATEGORY_COLORS] as any) ??
                        'default'
                      }
                      className="mt-1"
                    >
                      {club.category}
                    </Badge>
                  </div>
                  {club.logo && (
                    <img
                      src={club.logo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-lg object-cover ml-3 flex-shrink-0"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {club.shortDescription}
                </p>

                {/* Club stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {club.views ?? 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {club.saves ?? 0} saves
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {club.memberCount ?? 0} members
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/leader/clubs/${club.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Club
                  </Link>
                  <Link
                    to={`/clubs/${club.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    View Page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
