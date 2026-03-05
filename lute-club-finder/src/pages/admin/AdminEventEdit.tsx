import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useCreateEvent, useUpdateEvent } from '../../hooks/useEvents';
import { useAllClubs } from '../../hooks/useAdmin';
import { useAuth } from '../../context/AuthContext';
import { uploadEventImage } from '../../lib/firebase';
import { LoadingSpinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import EventForm from '../../components/events/EventForm';

export default function AdminEventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { addToast } = useToast();
  const { user } = useAuth();

  const { data: existingEvent, isLoading: loadingEvent } = useEvent(id);
  const { data: clubs, isLoading: loadingClubs } = useAllClubs();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(eventData: Record<string, any>) {
    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateEvent.mutateAsync({ eventId: id, data: eventData });
        addToast('Event updated successfully', 'success');
      } else {
        eventData.createdBy = user?.uid ?? '';
        await createEvent.mutateAsync(eventData);
        addToast('Event created successfully', 'success');
      }
      navigate('/admin/events');
    } catch (err) {
      addToast(`Failed to ${isEditMode ? 'update' : 'create'} event`, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadImage(file: File): Promise<string> {
    // Use a temp ID for new events; real ID for edits
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

  const clubOptions = (clubs ?? []).map((c) => ({ id: c.id, name: c.name }));

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
          onCancel={() => navigate('/admin/events')}
          onUploadImage={handleUploadImage}
        />
      </div>
    </div>
  );
}
