import { useState, useMemo } from 'react';
import { useAllUsers, useAllClubs, useUpdateUserRole, useAssignClubLeader, useRemoveClubLeader } from '../../hooks/useAdmin';
import {
  Button,
  Badge,
  Input,
  Select,
  SkeletonTableRows,
  Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell,
  ConfirmDialog,
} from '../../components/ui';
import { toast } from 'sonner';
import type { UserData } from '../../types';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'club_leader', label: 'Club Leader' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_CHANGE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'club_leader', label: 'Club Leader' },
  { value: 'admin', label: 'Admin' },
];

const roleBadgeColor: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
  student: 'default',
  club_leader: 'info',
  admin: 'warning',
};

function formatDate(timestamp: any): string {
  if (!timestamp) return 'Never';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminUsers() {
  const { data: users, isLoading } = useAllUsers();
  const { data: clubs } = useAllClubs();
  const updateRole = useUpdateUserRole();
  const assignLeader = useAssignClubLeader();
  const removeLeader = useRemoveClubLeader();


  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleChange, setRoleChange] = useState<{ user: UserData; newRole: string } | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [assignClubId, setAssignClubId] = useState('');

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let result = [...users];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Sort admins first, then leaders, then students
    const rolePriority: Record<string, number> = { admin: 0, club_leader: 1, student: 2 };
    result.sort((a, b) => (rolePriority[a.role] ?? 3) - (rolePriority[b.role] ?? 3));

    return result;
  }, [users, search, roleFilter]);

  function handleRoleChangeConfirm() {
    if (!roleChange) return;
    updateRole.mutate(
      { userId: roleChange.user.uid, role: roleChange.newRole as any },
      {
        onSuccess: () => {
          toast.success(
            `${roleChange.user.displayName}'s role updated to ${roleChange.newRole}`
          );
          setRoleChange(null);
        },
        onError: () => {
          toast.error('Failed to update user role');
        },
      }
    );
  }

  function handleAssignClub(userId: string) {
    if (!assignClubId) return;
    assignLeader.mutate(
      { userId, clubId: assignClubId },
      {
        onSuccess: () => {
          toast.success('Club leader assigned');
          setAssignClubId('');
        },
        onError: () => toast.error('Failed to assign club leader'),
      }
    );
  }

  function handleRemoveClub(userId: string, clubId: string) {
    removeLeader.mutate(
      { userId, clubId },
      {
        onSuccess: () => toast.success('Club leadership removed'),
        onError: () => toast.error('Failed to remove club leadership'),
      }
    );
  }

  const clubOptions = useMemo(() => {
    if (!clubs) return [];
    return [
      { value: '', label: 'Select a club...' },
      ...clubs.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [clubs]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">
          {users ? `${users.length} users total` : 'Loading...'}
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTableRows rows={5} cols={5} />
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Quiz</TableHeaderCell>
              <TableHeaderCell>Last Active</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <>
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{user.displayName || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge color={roleBadgeColor[user.role] || 'default'}>
                      {user.role === 'club_leader' ? 'Club Leader' : user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.quizCompleted ? (
                      <Badge color="success">Completed</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">Not taken</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.lastActive)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        options={ROLE_CHANGE_OPTIONS}
                        value={user.role}
                        onChange={(e) => {
                          if (e.target.value !== user.role) {
                            setRoleChange({ user, newRole: e.target.value });
                          }
                        }}
                        className="w-32 !py-1 text-xs"
                      />
                      {(user.role === 'club_leader' || user.clubLeaderOf?.length > 0) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setExpandedUser(expandedUser === user.uid ? null : user.uid)
                          }
                        >
                          {expandedUser === user.uid ? 'Hide Clubs' : 'Clubs'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {/* Expanded club leader section */}
                {expandedUser === user.uid && (
                  <tr key={`${user.uid}-clubs`}>
                    <td colSpan={6} className="px-4 py-3 bg-gray-50">
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Assigned Clubs:</p>
                        {user.clubLeaderOf?.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {user.clubLeaderOf.map((clubId) => {
                              const club = clubs?.find((c) => c.id === clubId);
                              return (
                                <span
                                  key={clubId}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm"
                                >
                                  {club?.name || clubId}
                                  <button
                                    onClick={() => handleRemoveClub(user.uid, clubId)}
                                    className="text-red-400 hover:text-red-600 ml-1"
                                    aria-label={`Remove ${club?.name || clubId}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 mb-3">No clubs assigned yet.</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Select
                            options={clubOptions}
                            value={assignClubId}
                            onChange={(e) => setAssignClubId(e.target.value)}
                            className="w-60 !py-1 text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignClub(user.uid)}
                            disabled={!assignClubId}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Role Change Confirmation */}
      <ConfirmDialog
        isOpen={!!roleChange}
        onClose={() => setRoleChange(null)}
        onConfirm={handleRoleChangeConfirm}
        title="Change User Role"
        message={`Change ${roleChange?.user.displayName}'s role from "${roleChange?.user.role}" to "${roleChange?.newRole}"?`}
        confirmLabel="Update Role"
        variant="primary"
        isLoading={updateRole.isPending}
      />
    </div>
  );
}
