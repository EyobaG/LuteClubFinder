import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllClubs,
  createClub,
  updateClub,
  deleteClub,
  getAllUsers,
  updateUserRole,
  assignClubLeader,
  removeClubLeader,
  uploadClubImage,
  getAdminStats,
} from '../lib/firebase';
import type { Club, UserData } from '../types';

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all clubs (all statuses) for the admin table
 */
export function useAllClubs() {
  return useQuery<Club[]>({
    queryKey: ['admin', 'clubs'],
    queryFn: async () => {
      const data = await getAllClubs();
      return data as Club[];
    },
  });
}

/**
 * Fetch all users for the admin user table
 */
export function useAllUsers() {
  return useQuery<UserData[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const data = await getAllUsers();
      return data as UserData[];
    },
  });
}

/**
 * Fetch admin dashboard stats
 */
export function useAdminStats() {
  return useQuery<{
    totalClubs: number;
    totalUsers: number;
    activeEvents: number;
    quizCompletions: number;
  }>({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// MUTATIONS — CLUBS
// ============================================

/**
 * Create a new club
 */
export function useCreateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => createClub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/**
 * Update an existing club
 */
export function useUpdateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Record<string, any> }) =>
      updateClub(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
}

/**
 * Delete a club
 */
export function useDeleteClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: string) => deleteClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ============================================
// MUTATIONS — USERS
// ============================================

/**
 * Update a user's role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'student' | 'club_leader' | 'admin' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Assign a user as club leader
 */
export function useAssignClubLeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, clubId }: { userId: string; clubId: string }) =>
      assignClubLeader(userId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Remove a user's club leadership
 */
export function useRemoveClubLeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, clubId }: { userId: string; clubId: string }) =>
      removeClubLeader(userId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// ============================================
// MUTATIONS — IMAGE UPLOAD
// ============================================

/**
 * Upload a club image
 */
export function useUploadClubImage() {
  return useMutation({
    mutationFn: ({ clubId, file, imageType }: { clubId: string; file: File; imageType: 'logo' | 'cover' }) =>
      uploadClubImage(clubId, file, imageType),
  });
}
