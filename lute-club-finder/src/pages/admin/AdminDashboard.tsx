import { Link } from 'react-router-dom';
import { useAdminStats } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui';

const statCards = [
  { key: 'totalClubs' as const, label: 'Total Clubs', icon: '🎭', color: 'bg-amber-50 text-amber-700' },
  { key: 'totalUsers' as const, label: 'Total Users', icon: '👥', color: 'bg-blue-50 text-blue-700' },
  { key: 'activeEvents' as const, label: 'Active Events', icon: '📅', color: 'bg-green-50 text-green-700' },
  { key: 'quizCompletions' as const, label: 'Quiz Completions', icon: '✅', color: 'bg-purple-50 text-purple-700' },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform at a glance.</p>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.color}`}>
                  {card.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.[card.key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/clubs/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Add New Club</p>
              <p className="text-sm text-gray-500">Create a new club listing</p>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">View and update user roles</p>
            </div>
          </Link>
          <Link
            to="/admin/announcements/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 01-1.006-.275 11.865 11.865 0 01-1.6-4.267m5.651 0A12.04 12.04 0 0021 12a12.04 12.04 0 00-3.01-3.84" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Post Announcement</p>
              <p className="text-sm text-gray-500">Share news with students</p>
            </div>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Platform statistics and trends</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
