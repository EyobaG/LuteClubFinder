import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../lib/firebase';
import type { Announcement } from '../types';

// ============================================
// QUERIES
// ============================================

export function useAnnouncements(filters?: { clubId?: string; type?: string; limitCount?: number }) {
  return useQuery<Announcement[]>({
    queryKey: ['announcements', filters ?? {}],
    queryFn: async () => {
      const data = await getAnnouncements(filters);
      return data as Announcement[];
    },
  });
}

export function useAllAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: ['admin', 'announcements'],
    queryFn: async () => {
      const data = await getAllAnnouncements();
      return data as Announcement[];
    },
  });
}

export function useAnnouncement(id: string | undefined) {
  return useQuery<Announcement>({
    queryKey: ['announcement', id],
    queryFn: async () => {
      if (!id) throw new Error('No announcement ID provided');
      const data = await getAnnouncement(id);
      return data as Announcement;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, data }: { announcementId: string; data: Record<string, any> }) =>
      updateAnnouncement(announcementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcement'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
