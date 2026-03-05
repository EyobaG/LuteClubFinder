import { useState, useMemo, useEffect } from 'react';
import { useAllEvents } from '../hooks/useEvents';
import { useClubs } from '../hooks/useClubs';
import { EventCard } from '../components/events';
import { Input } from '../components/ui';
import type { ClubEvent, EventType } from '../types';

type DateFilter = 'upcoming' | 'past' | 'all';
type SortOption = 'soonest' | 'latest';

const EVENT_TYPES: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'social', label: 'Social' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'service', label: 'Service' },
  { value: 'other', label: 'Other' },
];

export default function EventsPage() {
  const { data: events, isLoading } = useAllEvents();
  const { data: clubs } = useClubs();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedClub, setSelectedClub] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const [sortBy, setSortBy] = useState<SortOption>('soonest');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let result = [...events];
    const now = new Date();

    // Search filter
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (e: ClubEvent) =>
          e.title?.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term) ||
          e.clubName?.toLowerCase().includes(term)
      );
    }

    // Event type filter
    if (selectedType !== 'all') {
      result = result.filter((e: ClubEvent) => e.eventType === selectedType);
    }

    // Club filter
    if (selectedClub) {
      result = result.filter((e: ClubEvent) => e.clubId === selectedClub);
    }

    // Date filter
    if (dateFilter === 'upcoming') {
      result = result.filter((e: ClubEvent) => {
        const start = e.startTime?.toDate ? e.startTime.toDate() : new Date(e.startTime);
        return start >= now && e.status !== 'completed' && e.status !== 'cancelled';
      });
    } else if (dateFilter === 'past') {
      result = result.filter((e: ClubEvent) => {
        const start = e.startTime?.toDate ? e.startTime.toDate() : new Date(e.startTime);
        return start < now || e.status === 'completed';
      });
    }

    // Sort
    result.sort((a: ClubEvent, b: ClubEvent) => {
      const aTime = a.startTime?.toDate ? a.startTime.toDate() : new Date(a.startTime);
      const bTime = b.startTime?.toDate ? b.startTime.toDate() : new Date(b.startTime);
      return sortBy === 'soonest'
        ? aTime.getTime() - bTime.getTime()
        : bTime.getTime() - aTime.getTime();
    });

    return result;
  }, [events, debouncedSearch, selectedType, selectedClub, dateFilter, sortBy]);

  function resetFilters() {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedType('all');
    setSelectedClub('');
    setDateFilter('upcoming');
    setSortBy('soonest');
  }

  const hasActiveFilters =
    debouncedSearch || selectedType !== 'all' || selectedClub || dateFilter !== 'upcoming';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
      <p className="text-gray-600 mb-8">
        Upcoming club events and activities at PLU.
      </p>

      {/* Search + Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {/* Club filter */}
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Clubs</option>
            {clubs?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="soonest">Soonest First</option>
            <option value="latest">Latest First</option>
          </select>
        </div>
      </div>

      {/* Event Type Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EVENT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === type.value
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Date Filter Pills */}
      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past', 'all'] as DateFilter[]).map((df) => (
          <button
            key={df}
            onClick={() => setDateFilter(df)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              dateFilter === df
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {df === 'upcoming' ? 'Upcoming' : df === 'past' ? 'Past' : 'All Dates'}
          </button>
        ))}
      </div>

      {/* Result Count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          {debouncedSearch && ` for "${debouncedSearch}"`}
        </p>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl block mb-4">📅</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? "Try adjusting your filters to find events."
              : "There are no upcoming events right now. Check back later!"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
