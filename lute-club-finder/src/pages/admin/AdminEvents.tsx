import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAllEvents, useDeleteEvent } from '../../hooks/useEvents';
import { useAllClubs } from '../../hooks/useAdmin';
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
import { formatEventDate } from '../../components/events';
import type { ClubEvent } from '../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'social', label: 'Social' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'service', label: 'Service' },
  { value: 'other', label: 'Other' },
];

const statusBadgeColor: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  upcoming: 'success',
  ongoing: 'warning',
  completed: 'default',
  cancelled: 'danger',
};

export default function AdminEvents() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useAllEvents();
  const { data: clubs } = useAllClubs();
  const deleteEvent = useDeleteEvent();


  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ClubEvent | null>(null);

  const clubOptions = useMemo(() => {
    if (!clubs) return [];
    return [
      { value: '', label: 'All Clubs' },
      ...clubs.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [clubs]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let result = [...events];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.clubName?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter((e) => e.eventType === typeFilter);
    }

    if (clubFilter) {
      result = result.filter((e) => e.clubId === clubFilter);
    }

    return result;
  }, [events, search, statusFilter, typeFilter, clubFilter]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteEvent.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.title}" has been deleted`);
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error('Failed to delete event');
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">
            {events ? `${events.length} events total` : 'Loading...'}
          </p>
        </div>
        <Link to="/admin/events/new">
          <Button>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={clubOptions}
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
        />
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTableRows rows={5} cols={7} />
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No events found matching your filters.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Club</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Interested</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="font-medium text-gray-900 max-w-[200px] truncate">
                    {event.title}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 max-w-[150px] truncate block">
                    {event.clubName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatEventDate(event)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 capitalize">
                    {event.eventType}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge color={statusBadgeColor[event.status] || 'default'}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>{event.interestedCount || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(event)}
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
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteEvent.isPending}
      />
    </div>
  );
}
