import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnnouncement, useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useAnnouncements';
import { useAllClubs } from '../../hooks/useAdmin';
import { useAuth } from '../../context/AuthContext';
import { uploadAnnouncementImage } from '../../lib/firebase';
import { LoadingSpinner } from '../../components/ui';
import { toast } from 'sonner';
import { AnnouncementForm } from '../../components/announcements';

export default function AdminAnnouncementEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { user, userData } = useAuth();

  const { data: existingAnnouncement, isLoading: loadingAnnouncement } = useAnnouncement(id);
  const { data: clubs, isLoading: loadingClubs } = useAllClubs();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(announcementData: Record<string, any>) {
    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateAnnouncement.mutateAsync({ announcementId: id, data: announcementData });
        toast.success('Announcement updated successfully');
      } else {
        announcementData.authorId = user?.uid ?? '';
        announcementData.authorName = userData?.displayName ?? user?.displayName ?? 'Admin';
        await createAnnouncement.mutateAsync(announcementData);
        toast.success('Announcement posted successfully');
      }
      navigate('/admin/announcements');
    } catch {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} announcement`);
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

  const clubOptions = (clubs ?? []).map((c) => ({ id: c.id, name: c.name }));

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
          onCancel={() => navigate('/admin/announcements')}
          onUploadImage={handleUploadImage}
        />
      </div>
    </div>
  );
}
