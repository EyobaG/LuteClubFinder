import { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import type { Announcement } from '../../types';

const PRIORITY_STYLES: Record<string, { label: string; color: 'default' | 'warning' | 'danger' }> = {
  normal: { label: 'Normal', color: 'default' },
  high: { label: 'High', color: 'warning' },
  urgent: { label: 'Urgent', color: 'danger' },
};

const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  platform: { label: 'Platform', className: 'bg-indigo-100 text-indigo-700' },
  club: { label: 'Club', className: 'bg-amber-100 text-amber-700' },
  news: { label: 'News', className: 'bg-emerald-100 text-emerald-700' },
  'plu-spotlight': { label: 'PLU Spotlight', className: 'bg-purple-100 text-purple-700' },
};

export function formatAnnouncementDate(announcement: Announcement): string {
  const date = announcement.publishedAt?.toDate
    ? announcement.publishedAt.toDate()
    : new Date(announcement.publishedAt);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityStyle = PRIORITY_STYLES[announcement.priority] ?? PRIORITY_STYLES.normal;
  const typeStyle = TYPE_STYLES[announcement.type] ?? TYPE_STYLES.platform;

  const contentPreview = announcement.content.length > 150
    ? announcement.content.slice(0, 150) + '...'
    : announcement.content;

  return (
    <Card className="flex flex-col h-full">
      <div className="p-5 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle.className}`}>
            {typeStyle.label}
          </span>
          {announcement.priority !== 'normal' && (
            <Badge color={priorityStyle.color}>{priorityStyle.label}</Badge>
          )}
          {announcement.pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.828 3.414a1 1 0 011.344 0l5.414 5.414a1 1 0 010 1.344l-5.414 5.414a1 1 0 01-1.344 0L4.414 10.172a1 1 0 010-1.344L9.828 3.414z" />
              </svg>
              Pinned
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {announcement.title}
        </h3>

        {/* Author & club name */}
        <p className="text-sm text-amber-600 font-medium mb-2">
          {announcement.clubName ? announcement.clubName : 'PLU Administration'}
          <span className="text-gray-400 font-normal"> · {announcement.authorName}</span>
        </p>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
          {expanded ? announcement.content : contentPreview}
        </p>
        {announcement.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium mb-3 self-start"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Image */}
        {announcement.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{formatAnnouncementDate(announcement)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{announcement.views || 0} views</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
