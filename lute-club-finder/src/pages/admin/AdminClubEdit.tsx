import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClub } from '../../hooks/useClubs';
import { useCreateClub, useUpdateClub, useUploadClubImage } from '../../hooks/useAdmin';
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
import { CATEGORIES } from '../../types';

// ============================================
// Zod Schema
// ============================================

const officerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email').or(z.literal('')),
});

const clubSchema = z.object({
  name: z.string().min(1, 'Club name is required'),
  shortDescription: z.string().min(1, 'Short description is required').max(200, 'Max 200 characters'),
  description: z.string().min(1, 'Description is required'),
  contactEmail: z.string().email('Invalid email').or(z.literal('')).nullable().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive', 'pending_approval']),
  featured: z.boolean(),
  verified: z.boolean(),
  tags: z.string(), // Comma-separated
  vibes: z.string(), // Comma-separated
  // Meeting schedule
  meetingDay: z.string(),
  meetingTime: z.string(),
  meetingLocation: z.string(),
  meetingFrequency: z.string(),
  meetingVirtual: z.boolean(),
  // Social links
  instagram: z.string().optional(),
  discord: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  // Attributes
  timeCommitment: z.string(),
  experienceRequired: z.string(),
  groupSize: z.string(),
  activityType: z.string(), // Comma-separated
  bestFor: z.string(), // Comma-separated
  // Officers
  officers: z.array(officerSchema),
  // Member count
  memberCount: z.coerce.number().min(0).default(0),
});

type ClubFormData = z.infer<typeof clubSchema>;

// ============================================
// Options
// ============================================

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending_approval', label: 'Pending Approval' },
];

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

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

// ============================================
// Component
// ============================================

export default function AdminClubEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { addToast } = useToast();

  const { data: existingClub, isLoading: loadingClub } = useClub(id || '');
  const createClub = useCreateClub();
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
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      contactEmail: '',
      website: '',
      category: '',
      status: 'active',
      featured: false,
      verified: false,
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
    if (isEditMode && existingClub) {
      const club = existingClub as any;
      reset({
        name: club.name || '',
        shortDescription: club.shortDescription || '',
        description: club.description || '',
        contactEmail: club.contactEmail || '',
        website: club.website || '',
        category: club.category || '',
        status: club.status || 'active',
        featured: club.featured || false,
        verified: club.verified || false,
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
  }, [isEditMode, existingClub, reset]);

  async function onSubmit(formData: ClubFormData) {
    // Transform form data back into the Club shape
    const parseCsv = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const clubData: Record<string, any> = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      shortDescription: formData.shortDescription,
      description: formData.description,
      contactEmail: formData.contactEmail || null,
      website: formData.website || null,
      category: formData.category,
      status: formData.status,
      featured: formData.featured,
      verified: formData.verified,
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
      if (isEditMode && id) {
        await updateClub.mutateAsync({ clubId: id, data: clubData });
        addToast(`"${formData.name}" updated successfully`, 'success');
      } else {
        await createClub.mutateAsync(clubData);
        addToast(`"${formData.name}" created successfully`, 'success');
      }
      navigate('/admin/clubs');
    } catch (err: any) {
      addToast(err.message || 'Failed to save club', 'error');
    }
  }

  async function handleImageUpload(file: File, type: 'logo' | 'cover'): Promise<string> {
    // For new clubs, use a temp ID; for existing clubs, use the real ID
    const clubId = id || `new-${Date.now()}`;
    const url = await uploadImage.mutateAsync({ clubId, file, imageType: type });
    if (type === 'logo') setLogoUrl(url);
    else setCoverUrl(url);
    return url;
  }

  if (isEditMode && loadingClub) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Club' : 'Create New Club'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode
            ? 'Update the club details below.'
            : 'Fill in the details to create a new club.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Club Name *"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
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

        {/* Classification */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Classification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category *"
              options={CATEGORY_OPTIONS}
              placeholder="Select a category"
              error={errors.category?.message}
              {...register('category')}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status')}
            />
            <div className="flex items-center gap-6">
              <ToggleField
                label="Featured"
                name="featured"
                control={control}
                setValue={setValue}
                register={register}
              />
              <ToggleField
                label="Verified"
                name="verified"
                control={control}
                setValue={setValue}
                register={register}
              />
            </div>
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
                register={register}
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
            {isEditMode ? 'Update Club' : 'Create Club'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/clubs')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================
// Internal Toggle field wrapper for react-hook-form
// ============================================

function ToggleField({
  label,
  name,
  control: _control,
  setValue,
  register: _register,
}: {
  label: string;
  name: string;
  control: any;
  setValue: any;
  register: any;
}) {
  // We use a hidden input + Toggle to bridge react-hook-form
  const reg = _register(name);

  return (
    <div>
      <input type="hidden" {...reg} />
      <ToggleControlled label={label} name={name} control={_control} setValue={setValue} />
    </div>
  );
}

function ToggleControlled({
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
  // Use watch from the form via a simpler approach
  const [checked, setChecked] = useState(false);

  // Sync with form on mount via control
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
