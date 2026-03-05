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
import type { Announcement } from '../../types';

// ============================================
// Zod Schema
// ============================================

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.enum(['club', 'platform', 'news', 'plu-spotlight']),
  clubId: z.string().optional(),
  clubName: z.string().optional(),
  audience: z.enum(['all', 'members', 'leaders']),
  priority: z.enum(['normal', 'high', 'urgent']),
  pinned: z.boolean(),
  expiresAt: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'club' && !data.clubId) return false;
    return true;
  },
  { message: 'Club is required for club announcements', path: ['clubId'] }
).refine(
  (data) => {
    if (data.expiresAt && new Date(data.expiresAt) <= new Date()) return false;
    return true;
  },
  { message: 'Expiration date must be in the future', path: ['expiresAt'] }
);

type AnnouncementFormData = z.infer<typeof announcementSchema>;

// ============================================
// Options
// ============================================

const TYPE_OPTIONS = [
  { value: 'platform', label: 'Platform-wide' },
  { value: 'club', label: 'Club-specific' },
  { value: 'news', label: 'News' },
  { value: 'plu-spotlight', label: 'PLU Spotlight' },
];

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Students' },
  { value: 'members', label: 'Club Members Only' },
  { value: 'leaders', label: 'Club Leaders Only' },
];

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// ============================================
// Props
// ============================================

interface ClubOption {
  id: string;
  name: string;
}

interface AnnouncementFormProps {
  existingAnnouncement?: Announcement;
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
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

// ============================================
// Component
// ============================================

export default function AnnouncementForm({
  existingAnnouncement,
  clubs,
  isEditMode,
  onSubmit,
  isSubmitting,
  onCancel,
  onUploadImage,
}: AnnouncementFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(existingAnnouncement?.imageUrl);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'platform',
      clubId: '',
      clubName: '',
      audience: 'all',
      priority: 'normal',
      pinned: false,
      expiresAt: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingAnnouncement && isEditMode) {
      reset({
        title: existingAnnouncement.title ?? '',
        content: existingAnnouncement.content ?? '',
        type: existingAnnouncement.type ?? 'platform',
        clubId: existingAnnouncement.clubId ?? '',
        clubName: existingAnnouncement.clubName ?? '',
        audience: existingAnnouncement.audience ?? 'all',
        priority: existingAnnouncement.priority ?? 'normal',
        pinned: existingAnnouncement.pinned ?? false,
        expiresAt: toDatetimeLocal(existingAnnouncement.expiresAt),
      });
      setImageUrl(existingAnnouncement.imageUrl);
    }
  }, [existingAnnouncement, isEditMode, reset]);

  const announcementType = watch('type');
  const isPinned = watch('pinned');

  async function handleFormSubmit(data: AnnouncementFormData) {
    const club = clubs.find((c) => c.id === data.clubId);
    const announcementData: Record<string, any> = {
      title: data.title,
      content: data.content,
      type: data.type,
      clubId: data.type === 'club' ? data.clubId || null : null,
      clubName: data.type === 'club' ? (club?.name ?? data.clubName ?? null) : null,
      audience: data.audience,
      priority: data.priority,
      pinned: data.pinned,
      publishedAt: new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    };

    if (imageUrl) {
      announcementData.imageUrl = imageUrl;
    }

    onSubmit(announcementData, imageUrl);
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
            <Input {...register('title')} placeholder="Announcement title" />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <Textarea {...register('content')} placeholder="Write your announcement..." rows={6} />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== Targeting ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Targeting</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <Select {...register('type')} options={TYPE_OPTIONS} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audience <span className="text-red-500">*</span>
              </label>
              <Select {...register('audience')} options={AUDIENCE_OPTIONS} />
            </div>
          </div>

          {announcementType === 'club' && (
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
          )}
        </div>
      </section>

      {/* ===== Priority & Options ===== */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority & Options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <Select {...register('priority')} options={PRIORITY_OPTIONS} />
          </div>

          <Toggle
            label="Pin this announcement"
            checked={isPinned}
            onChange={(checked) => setValue('pinned', checked)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires At <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="datetime-local"
              {...register('expiresAt')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.expiresAt && (
              <p className="text-sm text-red-500 mt-1">{errors.expiresAt.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== Image ===== */}
      {onUploadImage && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Image</h3>
          <ImageUpload
            currentUrl={imageUrl}
            onUpload={handleImageUpload}
            onRemove={() => setImageUrl(undefined)}
            label="Upload announcement image"
          />
        </section>
      )}

      {/* ===== Actions ===== */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Announcement' : 'Post Announcement'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
