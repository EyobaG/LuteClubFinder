import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useCreateEvent, useUpdateEvent } from '../../hooks/useEvents';
import { useLeaderClubs } from '../../hooks/useLeader';
import { useAuth } from '../../context/AuthContext';
import { uploadEventImage } from '../../lib/firebase';
import { LoadingSpinner } from '../../components/ui';
import { toast } from 'sonner';
import EventForm from '../../components/events/EventForm';

export default function LeaderEventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { user, userData } = useAuth();

  const { data: existingEvent, isLoading: loadingEvent } = useEvent(id);
  const { data: leaderClubs, isLoading: loadingClubs } = useLeaderClubs();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [submitting, setSubmitting] = useState(false);

  // Verify leader owns this event's club (for edit mode)
  const clubIds = userData?.clubLeaderOf ?? [];
  const isAuthorized =
    userData?.role === 'admin' ||
    !isEditMode ||
    (existingEvent && clubIds.includes((existingEvent as any).clubId));

  async function handleSubmit(eventData: Record<string, any>) {
    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateEvent.mutateAsync({ eventId: id, data: eventData });
        toast.success('Event updated successfully');
      } else {
        eventData.createdBy = user?.uid ?? '';
        await createEvent.mutateAsync(eventData);
        toast.success('Event created successfully');
      }
      navigate('/leader/events');
    } catch {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadImage(file: File): Promise<string> {
    const eventId = id ?? `temp_${Date.now()}`;
    return uploadEventImage(eventId, file);
  }

  if (isEditMode && loadingEvent) {
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
          <p className="text-gray-500">You can only edit events for clubs you lead.</p>
        </div>
      </div>
    );
  }

  // Only leader's clubs in the dropdown
  const clubOptions = (leaderClubs ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Event' : 'Create Event'}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <EventForm
          existingEvent={isEditMode ? existingEvent : undefined}
          clubs={clubOptions}
          isEditMode={isEditMode}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          onCancel={() => navigate('/leader/events')}
          onUploadImage={handleUploadImage}
        />
      </div>
    </div>
  );
}
