import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnnouncement, useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useAnnouncements';
import { useLeaderClubs } from '../../hooks/useLeader';
import { useAuth } from '../../context/AuthContext';
import { uploadAnnouncementImage } from '../../lib/firebase';
import { LoadingSpinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { AnnouncementForm } from '../../components/announcements';

export default function LeaderAnnouncementEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { addToast } = useToast();
  const { user, userData } = useAuth();

  const { data: existingAnnouncement, isLoading: loadingAnnouncement } = useAnnouncement(id);
  const { data: leaderClubs, isLoading: loadingClubs } = useLeaderClubs();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();

  const [submitting, setSubmitting] = useState(false);

  // Verify leader owns this announcement's club (for edit mode)
  const clubIds = userData?.clubLeaderOf ?? [];
  const isAuthorized =
    userData?.role === 'admin' ||
    !isEditMode ||
    (existingAnnouncement && clubIds.includes(existingAnnouncement.clubId ?? ''));

  async function handleSubmit(announcementData: Record<string, any>) {
    setSubmitting(true);
    try {
      // Leaders can only post club-type announcements
      announcementData.type = 'club';

      if (isEditMode && id) {
        await updateAnnouncement.mutateAsync({ announcementId: id, data: announcementData });
        addToast('Announcement updated successfully', 'success');
      } else {
        announcementData.authorId = user?.uid ?? '';
        announcementData.authorName = userData?.displayName ?? user?.displayName ?? 'Club Leader';
        await createAnnouncement.mutateAsync(announcementData);
        addToast('Announcement posted successfully', 'success');
      }
      navigate('/leader/announcements');
    } catch {
      addToast(`Failed to ${isEditMode ? 'update' : 'create'} announcement`, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadImage(file: File): Promise<string> {
    const announcementId = id ?? `temp_${Date.now()}`;
    return uploadAnnouncementImage(announcementId, file);
  }

  if (isEditMode && loadingAnnouncement) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadingClubs) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authorized</h1>
          <p className="text-gray-500">You can only edit announcements for clubs you lead.</p>
        </div>
      </div>
    );
  }

  // Only leader's clubs in the dropdown
  const clubOptions = (leaderClubs ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Announcement' : 'Post Announcement'}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <AnnouncementForm
          existingAnnouncement={isEditMode ? existingAnnouncement : undefined}
          clubs={clubOptions}
          isEditMode={isEditMode}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          onCancel={() => navigate('/leader/announcements')}
          onUploadImage={handleUploadImage}
          leaderMode
        />
      </div>
    </div>
  );
}
