import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGoogleCalendarLink } from '../../lib/calendar';
import { toast } from 'sonner';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import type { ClubEvent, EventType } from '../../types';

const EVENT_TYPE_STYLES: Record<EventType, { label: string; className: string }> = {
  meeting: { label: 'Meeting', className: 'bg-blue-100 text-blue-700' },
  social: { label: 'Social', className: 'bg-pink-100 text-pink-700' },
  competition: { label: 'Competition', className: 'bg-red-100 text-red-700' },
  workshop: { label: 'Workshop', className: 'bg-purple-100 text-purple-700' },
  service: { label: 'Service', className: 'bg-green-100 text-green-700' },
  other: { label: 'Other', className: 'bg-gray-100 text-gray-700' },
};

export function formatEventDate(event: ClubEvent): string {
  const start = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);
  return start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatEventTime(event: ClubEvent): string {
  const start = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);
  const end = event.endTime?.toDate ? event.endTime.toDate() : event.endTime ? new Date(event.endTime) : null;

  const startStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (end) {
    const endStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${startStr} – ${endStr}`;
  }
  return startStr;
}

interface EventCardProps {
  event: ClubEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const typeStyle = EVENT_TYPE_STYLES[event.eventType] ?? EVENT_TYPE_STYLES.other;

  function handleAddToCalendar(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add events to your calendar.');
      navigate('/login');
      return;
    }
    window.open(getGoogleCalendarLink(event), '_blank', 'noopener');
  }

  return (
    <Card
      hoverable
      onClick={() => navigate(`/events/${event.id}`)}
      className="flex flex-col h-full"
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Type badge + Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle.className}`}>
            {typeStyle.label}
          </span>
          {event.status === 'cancelled' && (
            <Badge color="danger">Cancelled</Badge>
          )}
          {event.virtual && (
            <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
              Virtual
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {event.title}
        </h3>

        {/* Club name */}
        <p className="text-sm text-amber-600 font-medium mb-3">{event.clubName}</p>

        {/* Date & Time */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span>{formatEventDate(event)} · {formatEventTime(event)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="truncate">{event.location || 'TBD'}</span>
        </div>

        {/* Footer: Interested count + Add to Calendar */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span>{event.interestedCount || 0} interested</span>
          <span className="text-gray-300">·</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddToCalendar}
            className="px-2 py-1 text-xs gap-1 border border-gray-200 hover:bg-gray-100"
            style={{ minHeight: 0, height: '24px', lineHeight: '1.1' }}
          >
            <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="ml-1">Add to Calendar</span>
          </Button>
          {event.requiresRegistration && (
            <>
              <span className="text-gray-300">·</span>
              <span>Registration required</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
