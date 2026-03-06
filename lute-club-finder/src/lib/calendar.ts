// Utility to generate a Google Calendar event creation link from event details
import type { ClubEvent } from '../types';

export function getGoogleCalendarLink(event: ClubEvent) {
  const start = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);
  const end = event.endTime?.toDate ? event.endTime.toDate() : event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000); // default 1hr

  function formatDate(date: Date) {
    // Google Calendar expects: YYYYMMDDTHHmmssZ (UTC)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(start)}/${formatDate(end)}`,
    details: event.description || '',
    location: event.location || '',
    trp: 'false',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
