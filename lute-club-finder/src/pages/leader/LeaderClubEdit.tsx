import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClub } from '../../hooks/useClubs';
import { useUpdateClub, useUploadClubImage } from '../../hooks/useAdmin';
import { useAuth } from '../../context/AuthContext';
import {
  Button,
  Input,
  Textarea,
  Select,
  Toggle,
  ImageUpload,
  LoadingSpinner,
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';

// ============================================
// Zod Schema — leader version (no admin-only fields)
// ============================================

const officerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email').or(z.literal('')),
});

const leaderClubSchema = z.object({
  shortDescription: z.string().min(1, 'Short description is required').max(200, 'Max 200 characters'),
  description: z.string().min(1, 'Description is required'),
  contactEmail: z.string().email('Invalid email').or(z.literal('')).nullable().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  tags: z.string(),
  vibes: z.string(),
  meetingDay: z.string(),
  meetingTime: z.string(),
  meetingLocation: z.string(),
  meetingFrequency: z.string(),
  meetingVirtual: z.boolean(),
  instagram: z.string().optional(),
  discord: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  timeCommitment: z.string(),
  experienceRequired: z.string(),
  groupSize: z.string(),
  activityType: z.string(),
  bestFor: z.string(),
  officers: z.array(officerSchema),
  memberCount: z.coerce.number().int().min(0).optional(),
});

type LeaderClubFormData = z.infer<typeof leaderClubSchema>;

// ============================================
// Options
// ============================================

const FREQUENCY_OPTIONS = [
  { value: '', label: 'Select frequency' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'multiple_weekly', label: 'Multiple per Week' },
  { value: 'varies', label: 'Varies' },
];

const DAY_OPTIONS = [
  { value: '', label: 'Select day' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Varies', label: 'Varies' },
];

const TIME_COMMITMENT_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const GROUP_SIZE_OPTIONS = [
  { value: '', label: 'Select size' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

// ============================================
// Component
// ============================================

export default function LeaderClubEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { userData } = useAuth();

  // Verify this leader owns this club
  const isAuthorized =
    userData?.role === 'admin' ||
    (id && userData?.clubLeaderOf?.includes(id));

  const { data: existingClub, isLoading: loadingClub } = useClub(id || '');
  const updateClub = useUpdateClub();
  const uploadImage = useUploadClubImage();

  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leaderClubSchema),
    defaultValues: {
      shortDescription: '',
      description: '',
      contactEmail: '',
      website: '',
      tags: '',
      vibes: '',
      meetingDay: '',
      meetingTime: '',
      meetingLocation: '',
      meetingFrequency: '',
      meetingVirtual: false,
      instagram: '',
      discord: '',
      facebook: '',
      twitter: '',
      youtube: '',
      timeCommitment: '',
      experienceRequired: '',
      groupSize: '',
      activityType: '',
      bestFor: '',
      officers: [],
      memberCount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'officers',
  });

  // Populate form when club data loads
  useEffect(() => {
    if (existingClub) {
      const club = existingClub as any;
      reset({
        shortDescription: club.shortDescription || '',
        description: club.description || '',
        contactEmail: club.contactEmail || '',
        website: club.website || '',
        tags: club.tags?.join(', ') || '',
        vibes: club.vibes?.join(', ') || '',
        meetingDay: club.meetingSchedule?.dayOfWeek || '',
        meetingTime: club.meetingSchedule?.time || '',
        meetingLocation: club.meetingSchedule?.location || '',
        meetingFrequency: club.meetingSchedule?.frequency || '',
        meetingVirtual: club.meetingSchedule?.virtual || false,
        instagram: club.socialLinks?.instagram || '',
        discord: club.socialLinks?.discord || '',
        facebook: club.socialLinks?.facebook || '',
        twitter: club.socialLinks?.twitter || '',
        youtube: club.socialLinks?.youtube || '',
        timeCommitment: club.attributes?.timeCommitment || '',
        experienceRequired: club.attributes?.experienceRequired || '',
        groupSize: club.attributes?.groupSize || '',
        activityType: club.attributes?.activityType?.join(', ') || '',
        bestFor: club.attributes?.bestFor?.join(', ') || '',
        officers: club.officers || [],
        memberCount: club.memberCount || 0,
      });
      setLogoUrl(club.logo);
      setCoverUrl(club.coverImage);
    }
  }, [existingClub, reset]);

  async function onSubmit(formData: LeaderClubFormData) {
    if (!id) return;

    const parseCsv = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    // Leader update: only allowed fields (preserve existing admin-only fields)
    const clubData: Record<string, any> = {
      shortDescription: formData.shortDescription,
      description: formData.description,
      contactEmail: formData.contactEmail || null,
      website: formData.website || null,
      tags: parseCsv(formData.tags),
      vibes: parseCsv(formData.vibes),
      memberCount: formData.memberCount,
      officers: formData.officers,
      meetingSchedule: formData.meetingDay
        ? {
            dayOfWeek: formData.meetingDay,
            time: formData.meetingTime,
            location: formData.meetingLocation,
            frequency: formData.meetingFrequency,
            virtual: formData.meetingVirtual,
          }
        : null,
      socialLinks: Object.fromEntries(
        Object.entries({
          instagram: formData.instagram || '',
          discord: formData.discord || '',
          facebook: formData.facebook || '',
          twitter: formData.twitter || '',
          youtube: formData.youtube || '',
        }).filter(([, v]) => v !== '')
      ),
      attributes: {
        timeCommitment: formData.timeCommitment || 'medium',
        experienceRequired: formData.experienceRequired || 'beginner',
        groupSize: formData.groupSize || 'medium',
        activityType: parseCsv(formData.activityType),
        bestFor: parseCsv(formData.bestFor),
      },
      logo: logoUrl || null,
      coverImage: coverUrl || null,
    };

    try {
      await updateClub.mutateAsync({ clubId: id, data: clubData });
      addToast('Club updated successfully', 'success');
      navigate('/leader');
    } catch (err: any) {
      addToast(err.message || 'Failed to update club', 'error');
    }
  }

  async function handleImageUpload(file: File, type: 'logo' | 'cover'): Promise<string> {
    if (!id) throw new Error('Cannot upload without club ID');
    const url = await uploadImage.mutateAsync({ clubId: id, file, imageType: type });
    if (type === 'logo') setLogoUrl(url);
    else setCoverUrl(url);
    return url;
  }

  if (!id) {
    return <Navigate to="/leader" replace />;
  }

  if (loadingClub) {
    return <LoadingSpinner className="py-12" />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Your Club</h1>
          <p className="text-gray-500">You can only edit clubs you are assigned to lead.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Club: {existingClub?.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Update your club's information below. Category, status, and featured flags are managed by admins.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Short Description *"
                error={errors.shortDescription?.message}
                helperText="Max 200 characters. Shown on club cards."
                {...register('shortDescription')}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Full Description *"
                error={errors.description?.message}
                rows={6}
                {...register('description')}
              />
            </div>
            <Input
              label="Contact Email"
              type="email"
              error={errors.contactEmail?.message}
              {...register('contactEmail')}
            />
            <Input
              label="Website"
              type="url"
              placeholder="https://..."
              error={errors.website?.message}
              {...register('website')}
            />
            <Input
              label="Member Count"
              type="number"
              error={errors.memberCount?.message}
              {...register('memberCount')}
            />
          </div>
        </section>

        {/* Tags & Vibes */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Tags & Vibes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tags"
              helperText="Comma-separated (e.g., music, performance, ensemble)"
              error={errors.tags?.message}
              {...register('tags')}
            />
            <Input
              label="Vibes"
              helperText="Comma-separated (e.g., chill, creative, collaborative)"
              error={errors.vibes?.message}
              {...register('vibes')}
            />
          </div>
        </section>

        {/* Meeting Schedule */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Meeting Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Day of Week"
              options={DAY_OPTIONS}
              {...register('meetingDay')}
            />
            <Input
              label="Time"
              placeholder="e.g., 7:00 PM"
              {...register('meetingTime')}
            />
            <Input
              label="Location"
              placeholder="e.g., Xavier Hall 200"
              {...register('meetingLocation')}
            />
            <Select
              label="Frequency"
              options={FREQUENCY_OPTIONS}
              {...register('meetingFrequency')}
            />
            <div>
              <ToggleField
                label="Virtual meetings available"
                name="meetingVirtual"
                control={control}
                setValue={setValue}
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Social Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Instagram" placeholder="@handle or URL" {...register('instagram')} />
            <Input label="Discord" placeholder="Invite link" {...register('discord')} />
            <Input label="Facebook" placeholder="Page URL" {...register('facebook')} />
            <Input label="Twitter / X" placeholder="@handle or URL" {...register('twitter')} />
            <Input label="YouTube" placeholder="Channel URL" {...register('youtube')} />
          </div>
        </section>

        {/* Attributes */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Attributes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Time Commitment"
              options={TIME_COMMITMENT_OPTIONS}
              {...register('timeCommitment')}
            />
            <Select
              label="Experience Required"
              options={EXPERIENCE_OPTIONS}
              {...register('experienceRequired')}
            />
            <Select
              label="Group Size"
              options={GROUP_SIZE_OPTIONS}
              {...register('groupSize')}
            />
            <div className="md:col-span-3">
              <Input
                label="Activity Types"
                helperText="Comma-separated (e.g., meetings, performances, workshops)"
                {...register('activityType')}
              />
            </div>
            <div className="md:col-span-3">
              <Input
                label="Best For"
                helperText="Comma-separated (e.g., beginners, music lovers)"
                {...register('bestFor')}
              />
            </div>
          </div>
        </section>

        {/* Officers */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Officers
          </h2>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Name"
                    error={errors.officers?.[index]?.name?.message}
                    {...register(`officers.${index}.name`)}
                  />
                  <Input
                    placeholder="Role (e.g., President)"
                    error={errors.officers?.[index]?.role?.message}
                    {...register(`officers.${index}.role`)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    error={errors.officers?.[index]?.email?.message}
                    {...register(`officers.${index}.email`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove officer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', role: '', email: '' })}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Officer
            </Button>
          </div>
        </section>

        {/* Images */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Club Logo"
              currentUrl={logoUrl}
              onUpload={(file) => handleImageUpload(file, 'logo')}
              onRemove={() => setLogoUrl(undefined)}
            />
            <ImageUpload
              label="Cover Image"
              currentUrl={coverUrl}
              onUpload={(file) => handleImageUpload(file, 'cover')}
              onRemove={() => setCoverUrl(undefined)}
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" isLoading={isSubmitting}>
            Update Club
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/leader')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================
// Internal Toggle field wrapper
// ============================================

function ToggleField({
  label,
  name,
  control,
  setValue,
}: {
  label: string;
  name: string;
  control: any;
  setValue: any;
}) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const value = control._formValues[name];
    setChecked(!!value);
  }, [control._formValues, name]);

  return (
    <Toggle
      label={label}
      checked={checked}
      onChange={(val) => {
        setChecked(val);
        setValue(name, val, { shouldDirty: true });
      }}
    />
  );
}
