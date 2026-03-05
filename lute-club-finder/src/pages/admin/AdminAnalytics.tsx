import { useAnalyticsData } from '../../hooks/useAnalytics';
import { Badge, LoadingSpinner } from '../../components/ui';
import { CATEGORIES } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

export default function AdminAnalytics() {
  const {
    isLoading,
    stats,
    totalClubViews,
    totalClubSaves,
    totalEventViews,
    totalAnnouncementViews,
    totalEventInterest,
    quizRate,
    usersByRole,
    clubsByCategory,
    viewsByCategoryData,
    topViewedClubs,
    topSavedClubs,
    topEventsByInterest,
    topAnnouncementsByViews,
    eventsByType,
    announcementsByType,
    quizMatchFrequency,
  } = useAnalyticsData();

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  const allRoleData = [
    { name: 'Students', value: usersByRole.student, color: '#6b7280' },
    { name: 'Club Leaders', value: usersByRole.club_leader, color: '#3b82f6' },
    { name: 'Admins', value: usersByRole.admin, color: '#f59e0b' },
  ];
  const roleChartData = allRoleData.filter((r) => r.value > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform statistics and insights.</p>
      </div>

      {/* ===== Overview Stat Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon="👥" />
        <StatCard label="Quiz Completion" value={`${quizRate}%`} icon="📊" />
        <StatCard label="Club Views" value={totalClubViews} icon="👁️" />
        <StatCard label="Club Saves" value={totalClubSaves} icon="❤️" />
        <StatCard label="Event Views" value={totalEventViews} icon="📅" />
        <StatCard label="Announcement Views" value={totalAnnouncementViews} icon="📢" />
      </div>

      {/* ===== Row 1: Views & Saves by Category + Users by Role ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Views & Saves by Category (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Views & Saves by Category</h3>
          {viewsByCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsByCategoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#6366f1" name="Views" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saves" fill="#f59e0b" name="Saves" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet.</p>
          )}
        </div>

        {/* Users by Role (1/3) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={roleChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {roleChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {allRoleData.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-gray-600">{r.name}</span>
                <span className="ml-auto font-medium text-gray-900">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Row 2: Top Viewed + Top Saved Clubs ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartPanel title="Most Viewed Clubs">
          {topViewedClubs.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(250, topViewedClubs.length * 36)}>
              <BarChart data={topViewedClubs.map((c) => ({ name: c.name.length > 22 ? c.name.slice(0, 20) + '…' : c.name, views: c.views || 0 }))} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#6366f1" name="Views" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet.</p>
          )}
        </ChartPanel>

        <ChartPanel title="Most Saved Clubs">
          {topSavedClubs.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(250, topSavedClubs.length * 36)}>
              <BarChart data={topSavedClubs.map((c) => ({ name: c.name.length > 22 ? c.name.slice(0, 20) + '…' : c.name, saves: c.saves || 0 }))} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="saves" fill="#f59e0b" name="Saves" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet.</p>
          )}
        </ChartPanel>
      </div>

      {/* ===== Row 3: Club Category Distribution + Quiz Analytics ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartPanel title="Club Category Distribution">
          {clubsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={clubsByCategory.map((c) => ({ name: c.label, value: c.count }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {clubsByCategory.map((_entry, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet.</p>
          )}
        </ChartPanel>

        <ChartPanel title="Quiz Analytics">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-700">{stats?.quizCompletions ?? 0}</p>
              <p className="text-xs text-indigo-500 mt-1">Completions</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{quizRate}%</p>
              <p className="text-xs text-amber-500 mt-1">Completion Rate</p>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Most Matched Clubs</h4>
          <div className="space-y-2">
            {quizMatchFrequency.length > 0 ? quizMatchFrequency.slice(0, 5).map((item, i) => (
              <div key={item.clubId} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.clubName}</p>
                </div>
                {item.category && (
                  <Badge variant="category" category={item.category} className="text-[10px]">
                    {CATEGORIES.find((c) => c.value === item.category)?.label}
                  </Badge>
                )}
                <span className="text-sm font-semibold text-indigo-600">{item.count}×</span>
              </div>
            )) : (
              <p className="text-gray-400 text-sm">No quiz data yet.</p>
            )}
          </div>
        </ChartPanel>
      </div>

      {/* ===== Row 4: Events Analytics + Announcements Analytics ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Events */}
        <ChartPanel title="Events Analytics">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{totalEventViews}</p>
              <p className="text-xs text-green-500 mt-1">Total Event Views</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{totalEventInterest}</p>
              <p className="text-xs text-blue-500 mt-1">Total Interested</p>
            </div>
          </div>
          {eventsByType.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Events by Type</h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={eventsByType} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {eventsByType.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
          <h4 className="text-sm font-medium text-gray-600 mb-2 mt-3">Top Events by Interest</h4>
          <div className="space-y-2">
            {topEventsByInterest.length > 0 ? topEventsByInterest.slice(0, 5).map((evt, i) => (
              <div key={evt.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                <p className="text-sm font-medium text-gray-900 truncate flex-1">{evt.title}</p>
                <span className="text-xs text-gray-500">{evt.clubName}</span>
                <span className="text-sm font-semibold text-green-600">{evt.interestedCount}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-sm">No events yet.</p>
            )}
          </div>
        </ChartPanel>

        {/* Announcements */}
        <ChartPanel title="Announcements Analytics">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{totalAnnouncementViews}</p>
              <p className="text-xs text-purple-500 mt-1">Total Views</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-pink-700">{topAnnouncementsByViews.length}</p>
              <p className="text-xs text-pink-500 mt-1">Announcements</p>
            </div>
          </div>
          {announcementsByType.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-600 mb-2">By Type</h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={announcementsByType} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {announcementsByType.map((_a, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
          <h4 className="text-sm font-medium text-gray-600 mb-2 mt-3">Top Announcements by Views</h4>
          <div className="space-y-2">
            {topAnnouncementsByViews.length > 0 ? topAnnouncementsByViews.slice(0, 5).map((ann, i) => (
              <div key={ann.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                <p className="text-sm font-medium text-gray-900 truncate flex-1">{ann.title}</p>
                <span className="text-sm font-semibold text-purple-600">{ann.views} views</span>
              </div>
            )) : (
              <p className="text-gray-400 text-sm">No announcements yet.</p>
            )}
          </div>
        </ChartPanel>
      </div>
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
