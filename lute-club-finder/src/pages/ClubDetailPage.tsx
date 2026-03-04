import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useMemo, useCallback } from 'react';
import { useClub, useClubs } from '../hooks/useClubs';
import { useAuth } from '../context/AuthContext';
import { incrementClubViews, saveClub, unsaveClub } from '../lib/firebase';
import { Badge, Button, LoadingSpinner } from '../components/ui';
import { ClubCard } from '../components/clubs';
import { CATEGORIES, type Club, type ClubCategory } from '../types';

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userData, refreshUserData } = useAuth();
  const { data: club, isLoading, error } = useClub(id);
  const { data: allClubs } = useClubs();

  // Track page view
  useEffect(() => {
    if (id) {
      incrementClubViews(id).catch(() => {});
    }
  }, [id]);

  // Related clubs (same category, exclude current)
  const relatedClubs = useMemo(() => {
    if (!allClubs || !club) return [];
    return (allClubs as Club[])
      .filter((c) => c.category === club.category && c.id !== club.id)
      .slice(0, 4);
  }, [allClubs, club]);

  // Save toggle
  const isSaved = useMemo(
    () => userData?.savedClubs?.includes(id ?? '') ?? false,
    [userData?.savedClubs, id]
  );

  const handleToggleSave = useCallback(async () => {
    if (!user || !id) return;
    try {
      if (isSaved) {
        await unsaveClub(user.uid, id);
      } else {
        await saveClub(user.uid, id);
      }
      await refreshUserData();
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  }, [user, id, isSaved, refreshUserData]);

  // Save toggle for related cards
  const savedSet = useMemo(
    () => new Set<string>(userData?.savedClubs ?? []),
    [userData?.savedClubs]
  );

  const handleToggleSaveRelated = useCallback(
    async (clubId: string) => {
      if (!user) return;
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

  // ---- Loading / Error states ----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-5xl block mb-4">😕</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Club not found</h2>
        <p className="text-gray-500 mb-6">
          The club you're looking for doesn't exist or may have been removed.
        </p>
        <Button onClick={() => navigate('/discover')}>Browse All Clubs</Button>
      </div>
    );
  }

  const categoryLabel =
    CATEGORIES.find((c) => c.value === club.category)?.label ?? club.category;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/discover"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Discover
      </Link>

      {/* ===== Hero ===== */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Badge variant="category" category={club.category as ClubCategory} className="mb-3">
            {categoryLabel}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
          {club.status !== 'active' && (
            <Badge color="warning" className="mb-2">
              {club.status === 'inactive' ? 'Inactive' : 'Pending Approval'}
            </Badge>
          )}
        </div>

        {user && (
          <Button
            variant={isSaved ? 'outline' : 'primary'}
            onClick={handleToggleSave}
            className="shrink-0"
          >
            {isSaved ? '♥ Saved' : '♡ Save Club'}
          </Button>
        )}
      </div>

      {/* ===== Description ===== */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {club.description}
        </p>
      </section>

      {/* ===== Meeting Schedule ===== */}
      {club.meetingSchedule && (
        <section className="bg-amber-50 rounded-xl p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Meeting Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Day:</span>{' '}
              <span className="text-gray-600">{club.meetingSchedule.dayOfWeek || 'TBD'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Time:</span>{' '}
              <span className="text-gray-600">{club.meetingSchedule.time || 'TBD'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>{' '}
              <span className="text-gray-600">{club.meetingSchedule.location || 'TBD'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Frequency:</span>{' '}
              <span className="text-gray-600 capitalize">{club.meetingSchedule.frequency?.replace('_', ' ')}</span>
            </div>
            {club.meetingSchedule.virtual && (
              <div className="sm:col-span-2">
                <Badge color="info">Virtual option available</Badge>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Officers ===== */}
      {club.officers && club.officers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Officers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {club.officers.map((officer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium text-sm shrink-0">
                  {officer.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {officer.name}
                  </p>
                  <p className="text-xs text-gray-500">{officer.role}</p>
                  {officer.email && (
                    <a
                      href={`mailto:${officer.email}`}
                      className="text-xs text-amber-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {officer.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Social Links ===== */}
      {(club.website || club.contactEmail || club.socialLinks) && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Links & Contact</h2>
          <div className="flex flex-wrap gap-3">
            {club.website && (
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                🌐 Website
              </a>
            )}
            {club.contactEmail && (
              <a
                href={`mailto:${club.contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ✉️ Email
              </a>
            )}
            {club.socialLinks?.instagram && (
              <a
                href={club.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-pink-50 rounded-lg text-sm text-pink-700 hover:bg-pink-100 transition-colors"
              >
                📷 Instagram
              </a>
            )}
            {club.socialLinks?.discord && (
              <a
                href={club.socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                💬 Discord
              </a>
            )}
            {club.socialLinks?.facebook && (
              <a
                href={club.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
              >
                📘 Facebook
              </a>
            )}
            {club.socialLinks?.twitter && (
              <a
                href={club.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 rounded-lg text-sm text-sky-700 hover:bg-sky-100 transition-colors"
              >
                🐦 Twitter
              </a>
            )}
            {club.socialLinks?.youtube && (
              <a
                href={club.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 rounded-lg text-sm text-red-700 hover:bg-red-100 transition-colors"
              >
                ▶️ YouTube
              </a>
            )}
          </div>
        </section>
      )}

      {/* ===== Tags ===== */}
      {club.tags && club.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {club.tags.map((tag) => (
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

      {/* ===== Vibes ===== */}
      {club.vibes && club.vibes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Vibes</h2>
          <div className="flex flex-wrap gap-2">
            {club.vibes.map((vibe) => (
              <span
                key={vibe}
                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
              >
                ✨ {vibe}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ===== Attributes ===== */}
      {club.attributes && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">At a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Time Commitment</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {club.attributes.timeCommitment}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Experience</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {club.attributes.experienceRequired}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Group Size</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {club.attributes.groupSize}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== Related Clubs ===== */}
      {relatedClubs.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            More in {categoryLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedClubs.map((rc: Club) => (
              <ClubCard
                key={rc.id}
                club={rc}
                isSaved={savedSet.has(rc.id)}
                onToggleSave={user ? handleToggleSaveRelated : undefined}
                hideSave={!user}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
