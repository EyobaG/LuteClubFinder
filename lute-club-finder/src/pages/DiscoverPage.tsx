import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClubs } from '../hooks/useClubs';
import { useAuth } from '../context/AuthContext';
import { saveClub, unsaveClub } from '../lib/firebase';
import { ClubCard } from '../components/clubs';
import { Input, Badge } from '../components/ui';
import { CATEGORIES, type Club, type ClubCategory } from '../types';

type SortOption = 'a-z' | 'z-a' | 'most-saved' | 'most-viewed';

export default function DiscoverPage() {
  const { user, userData, refreshUserData } = useAuth();
  const { data: clubs, isLoading, error } = useClubs();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('a-z');

  // Initialize category from URL query param
  useEffect(() => {
    const cat = searchParams.get('category') as ClubCategory | null;
    if (cat && CATEGORIES.some((c) => c.value === cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter & sort clubs
  const filteredClubs = useMemo(() => {
    if (!clubs) return [];

    let result = [...clubs];

    // Search filter
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (c: Club) =>
          c.name?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.shortDescription?.toLowerCase().includes(term) ||
          c.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((c: Club) => c.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'a-z':
        result.sort((a: Club, b: Club) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        result.sort((a: Club, b: Club) => b.name.localeCompare(a.name));
        break;
      case 'most-saved':
        result.sort((a: Club, b: Club) => (b.saves ?? 0) - (a.saves ?? 0));
        break;
      case 'most-viewed':
        result.sort((a: Club, b: Club) => (b.views ?? 0) - (a.views ?? 0));
        break;
    }

    return result;
  }, [clubs, debouncedSearch, selectedCategory, sortBy]);

  // Save / unsave handler
  const savedSet = useMemo(
    () => new Set<string>(userData?.savedClubs ?? []),
    [userData?.savedClubs]
  );

  const handleToggleSave = useCallback(
    async (clubId: string) => {
      if (!user) return; // guard; login prompt handled at UI layer
      try {
        if (savedSet.has(clubId)) {
          await unsaveClub(user.uid, clubId);
        } else {
          await saveClub(user.uid, clubId);
        }
        await refreshUserData();
      } catch (err) {
        console.error('Failed to toggle save:', err);
      }
    },
    [user, savedSet, refreshUserData]
  );

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('a-z');
  };

  // ---- Render ----

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-600">Failed to load clubs. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Clubs</h1>
      <p className="text-gray-600 mb-8">
        Browse, search, and filter all 55+ clubs at PLU.
      </p>

      {/* ===== Search & Filters ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8 space-y-4">
        {/* Search bar + sort row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <Input
              placeholder="Search clubs by name, description, or tag…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="a-z">A → Z</option>
            <option value="z-a">Z → A</option>
            <option value="most-saved">Most Saved</option>
            <option value="most-viewed">Most Viewed</option>
          </select>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.value ? 'all' : cat.value
                )
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="font-medium text-gray-700">{filteredClubs.length}</span>{' '}
          club{filteredClubs.length !== 1 ? 's' : ''}
          {debouncedSearch && (
            <>
              {' '}
              for "<span className="font-medium text-gray-700">{debouncedSearch}</span>"
            </>
          )}
          {selectedCategory !== 'all' && (
            <>
              {' '}
              in{' '}
              <Badge variant="category" category={selectedCategory}>
                {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
              </Badge>
            </>
          )}
        </p>
      )}

      {/* ===== Club Grid ===== */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-5 bg-gray-100 rounded-md w-14" />
                <div className="h-5 bg-gray-100 rounded-md w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl block mb-4">🔍</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clubs found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={resetFilters}
            className="text-amber-600 font-medium hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club: Club) => (
            <ClubCard
              key={club.id}
              club={club}
              isSaved={savedSet.has(club.id)}
              onToggleSave={user ? handleToggleSave : undefined}
              hideSave={!user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
