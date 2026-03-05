import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLeaderAnnouncements, useLeaderClubs } from '../../hooks/useLeader';
import { useDeleteAnnouncement } from '../../hooks/useAnnouncements';
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
import { formatAnnouncementDate } from '../../components/announcements';
import type { Announcement } from '../../types';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'club', label: 'Club' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const priorityBadgeColor: Record<string, 'default' | 'warning' | 'danger'> = {
  normal: 'default',
  high: 'warning',
  urgent: 'danger',
};

export default function LeaderAnnouncements() {
  const navigate = useNavigate();
  const { data: announcements, isLoading } = useLeaderAnnouncements();
  const { data: leaderClubs } = useLeaderClubs();
  const deleteAnnouncement = useDeleteAnnouncement();


  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const clubOptions = useMemo(() => {
    if (!leaderClubs || leaderClubs.length <= 1) return [];
    return [
      { value: '', label: 'All Clubs' },
      ...leaderClubs.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [leaderClubs]);

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];
    let result = [...announcements];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.clubName?.toLowerCase().includes(term)
      );
    }

    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter);
    }

    if (priorityFilter) {
      result = result.filter((a) => a.priority === priorityFilter);
    }

    if (clubFilter) {
      result = result.filter((a) => a.clubId === clubFilter);
    }

    return result;
  }, [announcements, search, typeFilter, priorityFilter, clubFilter]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteAnnouncement.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.title}" has been deleted`);
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error('Failed to delete announcement');
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">
            {announcements ? `${announcements.length} announcements total` : 'Loading...'}
          </p>
        </div>
        <Link to="/leader/announcements/new">
          <Button>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Announcement
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className={`grid grid-cols-1 gap-3 mb-6 ${clubOptions.length > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        />
        <Select
          options={PRIORITY_OPTIONS}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        />
        {clubOptions.length > 0 && (
          <Select
            options={clubOptions}
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
          />
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTableRows rows={5} cols={5} />
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          {announcements && announcements.length === 0 ? (
            <div>
              <span className="text-4xl block mb-3">📢</span>
              <p className="text-gray-500 mb-4">No announcements yet. Post your first one!</p>
              <Link to="/leader/announcements/new">
                <Button>Post Announcement</Button>
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">No announcements matched your filters.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Club</TableHeaderCell>
              <TableHeaderCell>Priority</TableHeaderCell>
              <TableHeaderCell>Pinned</TableHeaderCell>
              <TableHeaderCell>Published</TableHeaderCell>
              <TableHeaderCell>Views</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAnnouncements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>
                  <div className="font-medium text-gray-900 max-w-[200px] truncate">
                    {announcement.title}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 max-w-[150px] truncate block">
                    {announcement.clubName || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge color={priorityBadgeColor[announcement.priority] || 'default'}>
                    {announcement.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {announcement.pinned ? (
                    <span className="text-amber-600 text-sm font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-400 text-sm">No</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatAnnouncementDate(announcement)}
                  </span>
                </TableCell>
                <TableCell>{announcement.views || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/leader/announcements/${announcement.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(announcement)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteAnnouncement.isPending}
      />
    </div>
  );
}
