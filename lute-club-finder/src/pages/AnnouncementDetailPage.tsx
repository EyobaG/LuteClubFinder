import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAnnouncement } from '../hooks/useAnnouncements';
import { incrementAnnouncementViews } from '../lib/firebase';
import { Badge, LoadingSpinner, Button } from '../components/ui';

const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  platform: { label: 'Platform', className: 'bg-indigo-100 text-indigo-700' },
  club: { label: 'Club', className: 'bg-amber-100 text-amber-700' },
  news: { label: 'News', className: 'bg-emerald-100 text-emerald-700' },
  'plu-spotlight': { label: 'PLU Spotlight', className: 'bg-purple-100 text-purple-700' },
};

const PRIORITY_STYLES: Record<string, { label: string; color: 'default' | 'warning' | 'danger' }> = {
  normal: { label: 'Normal', color: 'default' },
  high: { label: 'High', color: 'warning' },
  urgent: { label: 'Urgent', color: 'danger' },
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: announcement, isLoading, error } = useAnnouncement(id);

  // Increment views once on mount
  useEffect(() => {
    if (id) {
      incrementAnnouncementViews(id).catch(() => {});
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-5xl block mb-4">📢</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Announcement not found</h2>
        <p className="text-gray-500 mb-6">
          The announcement you're looking for doesn't exist or may have been removed.
        </p>
        <Button onClick={() => navigate('/announcements')}>Browse All Announcements</Button>
      </div>
    );
  }

  const typeStyle = TYPE_STYLES[announcement.type] ?? TYPE_STYLES.platform;
  const priorityStyle = PRIORITY_STYLES[announcement.priority] ?? PRIORITY_STYLES.normal;

  const publishedDate = announcement.publishedAt?.toDate
    ? announcement.publishedAt.toDate()
    : new Date(announcement.publishedAt);

  const fullDateStr = publishedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const expiresAt = announcement.expiresAt
    ? (announcement.expiresAt?.toDate ? announcement.expiresAt.toDate() : new Date(announcement.expiresAt))
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/announcements"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Announcements
      </Link>

      {/* ===== Header ===== */}
      <div className="mb-8">
        {/* Badges */}
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{announcement.title}</h1>

        <p className="text-amber-600 font-medium">
          {announcement.clubName ?? 'PLU Administration'}
          <span className="text-gray-400 font-normal"> · {announcement.authorName}</span>
        </p>
      </div>

      {/* ===== Image ===== */}
      {announcement.imageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={announcement.imageUrl}
            alt={announcement.title}
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* ===== Content ===== */}
      <section className="mb-8">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
          {announcement.content}
        </p>
      </section>

      {/* ===== Meta Info ===== */}
      <section className="bg-gray-50 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Published:</span>{' '}
            <span className="text-gray-600">{fullDateStr}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Audience:</span>{' '}
            <span className="text-gray-600 capitalize">
              {announcement.audience === 'all' ? 'All Students' : announcement.audience === 'members' ? 'Club Members' : 'Club Leaders'}
            </span>
          </div>
          {expiresAt && (
            <div>
              <span className="font-medium text-gray-700">Expires:</span>{' '}
              <span className="text-gray-600">
                {expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Views:</span>{' '}
            <span className="text-gray-600">{announcement.views || 0}</span>
          </div>
        </div>
      </section>

      {/* ===== Club Link (if club type) ===== */}
      {announcement.clubId && announcement.clubName && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h2>
          <Link
            to={`/clubs/${announcement.clubId}`}
            className="inline-flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
              {announcement.clubName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{announcement.clubName}</p>
              <p className="text-sm text-amber-600">View Club →</p>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
