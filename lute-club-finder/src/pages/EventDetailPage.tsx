import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useEvent, useToggleEventInterest } from '../hooks/useEvents';
import { useAuth } from '../context/AuthContext';
import { incrementEventViews } from '../lib/firebase';
import { Badge, Button, LoadingSpinner, Breadcrumb } from '../components/ui';
import { formatEventTime } from '../components/events';
import type { EventType } from '../types';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: 'Meeting',
  social: 'Social',
  competition: 'Competition',
  workshop: 'Workshop',
  service: 'Service',
  other: 'Other',
};

const STATUS_BADGE: Record<string, { label: string; color: 'success' | 'warning' | 'danger' | 'default' }> = {
  upcoming: { label: 'Upcoming', color: 'success' },
  ongoing: { label: 'Ongoing', color: 'warning' },
  completed: { label: 'Completed', color: 'default' },
  cancelled: { label: 'Cancelled', color: 'danger' },
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userData, refreshUserData } = useAuth();
  const { data: event, isLoading, error } = useEvent(id);
  const toggleInterest = useToggleEventInterest();

  // Increment views once on mount
  const viewTracked = useRef(false);
  useEffect(() => {
    if (id && !viewTracked.current) {
      viewTracked.current = true;
      incrementEventViews(id).catch(() => {});
    }
  }, [id]);

  const isInterested = useMemo(
    () => userData?.interestedEvents?.includes(id ?? '') ?? false,
    [userData?.interestedEvents, id]
  );

  async function handleToggleInterest() {
    if (!user || !id) return;
    try {
      await toggleInterest.mutateAsync({ eventId: id, userId: user.uid, isInterested });
      await refreshUserData();
    } catch (err) {
      console.error('Failed to toggle interest:', err);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-5xl block mb-4">😕</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
        <p className="text-gray-500 mb-6">
          The event you're looking for doesn't exist or may have been removed.
        </p>
        <Button onClick={() => navigate('/events')}>Browse All Events</Button>
      </div>
    );
  }

  const statusInfo = STATUS_BADGE[event.status] ?? STATUS_BADGE.upcoming;
  const startDate = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);

  const fullDateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Events', to: '/events' },
          { label: event.title },
        ]}
      />

      {/* ===== Hero ===== */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {EVENT_TYPE_LABELS[event.eventType] ?? 'Event'}
            </span>
            <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
            {event.virtual && (
              <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                Virtual
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <Link
            to={`/clubs/${event.clubId}`}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            {event.clubName}
          </Link>
        </div>

        {user && (
          <Button
            variant={isInterested ? 'outline' : 'primary'}
            onClick={handleToggleInterest}
            className="shrink-0"
          >
            {isInterested ? '★ Interested' : '☆ I\'m Interested'}
          </Button>
        )}
      </div>

      {/* ===== Date & Time ===== */}
      <section className="bg-amber-50 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Date & Time
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Date:</span>{' '}
            <span className="text-gray-600">{fullDateStr}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Time:</span>{' '}
            <span className="text-gray-600">{formatEventTime(event)}</span>
          </div>
        </div>
      </section>

      {/* ===== Location ===== */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Location
        </h2>
        <p className="text-gray-700">{event.location || 'TBD'}</p>
        {event.virtual && event.virtualLink && (
          <a
            href={event.virtualLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            🔗 Join Virtual Meeting
          </a>
        )}
      </section>

      {/* ===== Description ===== */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      </section>

      {/* ===== Registration ===== */}
      {event.requiresRegistration && (
        <section className="bg-blue-50 rounded-xl p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Registration</h2>
          <div className="space-y-2 text-sm">
            {event.maxAttendees && (
              <p className="text-gray-700">
                <span className="font-medium">Capacity:</span>{' '}
                {event.currentAttendees ?? 0} / {event.maxAttendees} attendees
              </p>
            )}
            {event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2"
              >
                <Button size="sm">Register Now</Button>
              </a>
            )}
          </div>
        </section>
      )}

      {/* ===== Tags ===== */}
      {event.tags && event.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ===== Interested Count ===== */}
      <section className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        {event.interestedCount || 0} people are interested
      </section>

      {/* ===== Host Club ===== */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hosted By</h2>
        <Link
          to={`/clubs/${event.clubId}`}
          className="inline-flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
            {event.clubName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{event.clubName}</p>
            <p className="text-sm text-amber-600">View Club →</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
