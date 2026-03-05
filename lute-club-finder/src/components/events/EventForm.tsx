import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Textarea,
  Select,
  Toggle,
  ImageUpload,
} from '../ui';
import type { ClubEvent } from '../../types';

// ============================================
// Zod Schema
// ============================================

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  clubId: z.string().min(1, 'Club is required'),
  clubName: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  virtual: z.boolean(),
  virtualLink: z.string().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  requiresRegistration: z.boolean(),
  registrationLink: z.string().optional(),
  maxAttendees: z.string().optional(),
  tags: z.string(), // Comma-separated
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']),
}).refine(
  (data) => {
    if (data.endTime && data.startTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  { message: 'End time must be after start time', path: ['endTime'] }
).refine(
  (data) => {
    if (data.virtual && !data.virtualLink) return false;
    return true;
  },
  { message: 'Virtual link is required for virtual events', path: ['virtualLink'] }
);

type EventFormData = z.infer<typeof eventSchema>;

// ============================================
// Options
// ============================================

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'social', label: 'Social' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'service', label: 'Service' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ============================================
// Props
// ============================================

interface ClubOption {
  id: string;
  name: string;
}

interface EventFormProps {
  existingEvent?: ClubEvent;
  clubs: ClubOption[];
  isEditMode: boolean;
  onSubmit: (data: Record<string, any>, imageUrl?: string) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onUploadImage?: (file: File) => Promise<string>;
}

// Helper: convert Firestore Timestamp or Date to datetime-local string
function toDatetimeLocal(val: any): string {
  if (!val) return '';
  const date = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(date.getTime())) return '';
  // Format: ADJUST to local time for datetime-local input
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

// ============================================
// Component
// ============================================

export default function EventForm({
  existingEvent,
  clubs,
  isEditMode,
  onSubmit,
  isSubmitting,
  onCancel,
  onUploadImage,
}: EventFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(existingEvent?.imageUrl);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      clubId: '',
      clubName: '',
      startTime: '',
      endTime: '',
      location: '',
      virtual: false,
      virtualLink: '',
      eventType: '',
      requiresRegistration: false,
      registrationLink: '',
      maxAttendees: '',
      tags: '',
      status: 'upcoming',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingEvent && isEditMode) {
      reset({
        title: existingEvent.title ?? '',
        description: existingEvent.description ?? '',
        clubId: existingEvent.clubId ?? '',
        clubName: existingEvent.clubName ?? '',
        startTime: toDatetimeLocal(existingEvent.startTime),
        endTime: toDatetimeLocal(existingEvent.endTime),
        location: existingEvent.location ?? '',
        virtual: existingEvent.virtual ?? false,
        virtualLink: existingEvent.virtualLink ?? '',
        eventType: existingEvent.eventType ?? '',
        requiresRegistration: existingEvent.requiresRegistration ?? false,
        registrationLink: existingEvent.registrationLink ?? '',
        maxAttendees: existingEvent.maxAttendees != null ? String(existingEvent.maxAttendees) : '',
        tags: existingEvent.tags?.join(', ') ?? '',
        status: existingEvent.status ?? 'upcoming',
      });
      setImageUrl(existingEvent.imageUrl);
    }
  }, [existingEvent, isEditMode, reset]);

  const isVirtual = watch('virtual');
  const requiresRegistration = watch('requiresRegistration');

  async function handleFormSubmit(data: EventFormData) {
    // Resolve club name from clubs list
    const club = clubs.find((c) => c.id === data.clubId);
    const eventData: Record<string, any> = {
      title: data.title,
      description: data.description,
      clubId: data.clubId,
      clubName: club?.name ?? data.clubName ?? '',
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : null,
      location: data.location,
      virtual: data.virtual,
      virtualLink: data.virtual ? data.virtualLink || null : null,
      eventType: data.eventType,
      requiresRegistration: data.requiresRegistration,
      registrationLink: data.requiresRegistration ? data.registrationLink || null : null,
      maxAttendees: data.requiresRegistration && data.maxAttendees ? Number(data.maxAttendees) || null : null,
      tags: data.tags
        ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
      status: data.status,
      featured: false,
    };

    if (imageUrl) {
      eventData.imageUrl = imageUrl;
    }

    onSubmit(eventData, imageUrl);
  }

  async function handleImageUpload(file: File): Promise<string> {
    if (!onUploadImage) return '';
    const url = await onUploadImage(file);
    setImageUrl(url);
    return url;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* ===== Basic Info ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input {...register('title')} placeholder="Event title" />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea {...register('description')} placeholder="Describe the event..." rows={4} />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club <span className="text-red-500">*</span>
              </label>
              <Select
                {...register('clubId')}
                options={[
                  { value: '', label: 'Select a club' },
                  ...clubs.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              {errors.clubId && (
                <p className="text-sm text-red-500 mt-1">{errors.clubId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <Select {...register('eventType')} options={EVENT_TYPE_OPTIONS} />
              {errors.eventType && (
                <p className="text-sm text-red-500 mt-1">{errors.eventType.message}</p>
              )}
            </div>
          </div>

          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select {...register('status')} options={STATUS_OPTIONS} />
            </div>
          )}
        </div>
      </section>

      {/* ===== Date & Time ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('startTime')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.startTime && (
              <p className="text-sm text-red-500 mt-1">{errors.startTime.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              {...register('endTime')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.endTime && (
              <p className="text-sm text-red-500 mt-1">{errors.endTime.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== Location ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <Input {...register('location')} placeholder="e.g. Xavier 201, Anderson Hall" />
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>

          <Toggle
            label="Virtual event"
            checked={isVirtual}
            onChange={(checked) => setValue('virtual', checked)}
          />

          {isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Virtual Link <span className="text-red-500">*</span>
              </label>
              <Input {...register('virtualLink')} placeholder="https://zoom.us/..." />
              {errors.virtualLink && (
                <p className="text-sm text-red-500 mt-1">{errors.virtualLink.message}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== Registration ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
        <div className="space-y-4">
          <Toggle
            label="Requires registration"
            checked={requiresRegistration}
            onChange={(checked) => setValue('requiresRegistration', checked)}
          />

          {requiresRegistration && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Link
                </label>
                <Input {...register('registrationLink')} placeholder="https://forms.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attendees
                </label>
                <Input
                  type="number"
                  {...register('maxAttendees')}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Tags & Image ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <Input {...register('tags')} placeholder="Comma-separated tags (e.g. social, food, open-to-all)" />
          </div>

          {onUploadImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
              <ImageUpload
                currentUrl={imageUrl}
                onUpload={handleImageUpload}
                onRemove={() => setImageUrl(undefined)}
                label="Upload event image"
              />
            </div>
          )}
        </div>
      </section>

      {/* ===== Actions ===== */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
