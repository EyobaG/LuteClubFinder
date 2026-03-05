import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUpcomingEvents,
  getEvents,
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventInterest,
} from '../lib/firebase';
import type { ClubEvent } from '../types';

// ============================================
// QUERIES
// ============================================

export function useUpcomingEvents(clubId?: string, limitCount?: number) {
  return useQuery<ClubEvent[]>({
    queryKey: ['events', 'upcoming', clubId ?? 'all', limitCount ?? 'none'],
    queryFn: async () => {
      const data = await getUpcomingEvents(clubId, limitCount);
      return data as ClubEvent[];
    },
  });
}

export function useEvents(filters?: {
  clubId?: string;
  eventType?: string;
  status?: string;
}) {
  return useQuery<ClubEvent[]>({
    queryKey: ['events', filters ?? {}],
    queryFn: async () => {
      const data = await getEvents(filters);
      return data as ClubEvent[];
    },
  });
}

export function useAllEvents() {
  return useQuery<ClubEvent[]>({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const data = await getAllEvents();
      return data as ClubEvent[];
    },
  });
}

export function useEvent(id: string | undefined) {
  return useQuery<ClubEvent>({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('No event ID provided');
      const data = await getEvent(id);
      return data as ClubEvent;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Record<string, any> }) =>
      updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useToggleEventInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId, isInterested }: { eventId: string; userId: string; isInterested: boolean }) =>
      toggleEventInterest(eventId, userId, isInterested),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}
