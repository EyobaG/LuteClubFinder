import { useState, useMemo } from 'react';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { AnnouncementCard } from '../components/announcements';
import { Input, Select, SkeletonCard } from '../components/ui';
import type { Announcement } from '../types';

const TYPE_PILLS = [
  { value: '', label: 'All' },
  { value: 'platform', label: 'Platform' },
  { value: 'club', label: 'Club' },
  { value: 'news', label: 'News' },
  { value: 'plu-spotlight', label: 'PLU Spotlight' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const filtered = useMemo(() => {
    if (!announcements) return { pinned: [], unpinned: [] };
    let result = [...announcements];

    // Search
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.clubName?.toLowerCase().includes(term) ||
          a.authorName?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter) {
      result = result.filter((a) => a.priority === priorityFilter);
    }

    // Separate pinned from unpinned
    const pinned = result.filter((a) => a.pinned);
    const unpinned = result.filter((a) => !a.pinned);

    // Sort
    const sortFn = (a: Announcement, b: Announcement) => {
      const aTime = a.publishedAt?.toDate?.() ?? new Date(a.publishedAt ?? 0);
      const bTime = b.publishedAt?.toDate?.() ?? new Date(b.publishedAt ?? 0);
      return sort === 'newest'
        ? bTime.getTime() - aTime.getTime()
        : aTime.getTime() - bTime.getTime();
    };

    pinned.sort(sortFn);
    unpinned.sort(sortFn);

    return { pinned, unpinned };
  }, [announcements, search, typeFilter, priorityFilter, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
      <p className="text-gray-600 mb-8">Latest news from clubs and the platform.</p>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Type filter pills */}
          <div className="flex gap-2">
            {TYPE_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setTypeFilter(pill.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === pill.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 ml-auto">
            <Select
              options={PRIORITY_OPTIONS}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            />
            <Select
              options={SORT_OPTIONS}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (filtered.pinned.length === 0 && filtered.unpinned.length === 0) ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl block mb-4">📢</span>
          <p className="text-gray-500 mb-2">No announcements found.</p>
          {(search || typeFilter || priorityFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setPriorityFilter(''); }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned announcements */}
          {filtered.pinned.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.pinned.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
            </div>
          )}

          {/* Regular announcements */}
          {filtered.unpinned.length > 0 && (
            <div>
              {filtered.pinned.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Recent
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.unpinned.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
