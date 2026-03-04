import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAllClubs, useDeleteClub } from '../../hooks/useAdmin';
import {
  Button,
  Badge,
  Input,
  Select,
  LoadingSpinner,
  Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell,
  ConfirmDialog,
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { CATEGORIES } from '../../types';
import type { Club, ClubCategory } from '../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending_approval', label: 'Pending Approval' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES,
];

const statusBadgeColor: Record<string, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  inactive: 'danger',
  pending_approval: 'warning',
};

export default function AdminClubs() {
  const navigate = useNavigate();
  const { data: clubs, isLoading } = useAllClubs();
  const deleteClub = useDeleteClub();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);

  const filteredClubs = useMemo(() => {
    if (!clubs) return [];
    let result = [...clubs];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.shortDescription?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter) {
      result = result.filter((c) => c.category === categoryFilter);
    }

    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result;
  }, [clubs, search, categoryFilter, statusFilter]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteClub.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast(`"${deleteTarget.name}" has been deleted`, 'success');
        setDeleteTarget(null);
      },
      onError: () => {
        addToast('Failed to delete club', 'error');
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
          <p className="text-gray-500 mt-1">
            {clubs ? `${clubs.length} clubs total` : 'Loading...'}
          </p>
        </div>
        <Link to="/admin/clubs/new">
          <Button>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Club
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Input
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={CATEGORY_OPTIONS}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No clubs found matching your filters.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Officers</TableHeaderCell>
              <TableHeaderCell>Views</TableHeaderCell>
              <TableHeaderCell>Saves</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell>
                  <div className="font-medium text-gray-900 max-w-[200px] truncate">
                    {club.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="category" category={club.category as ClubCategory}>
                    {CATEGORIES.find((c) => c.value === club.category)?.label || club.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color={statusBadgeColor[club.status] || 'default'}>
                    {club.status === 'pending_approval' ? 'Pending' : club.status}
                  </Badge>
                </TableCell>
                <TableCell>{club.officers?.length || 0}</TableCell>
                <TableCell>{club.views || 0}</TableCell>
                <TableCell>{club.saves || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/clubs/${club.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(club)}
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
        title="Delete Club"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteClub.isPending}
      />
    </div>
  );
}
