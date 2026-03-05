import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClubs } from '../hooks/useClubs';
import { useSavedClubs } from '../hooks/useSavedClubs';
import { ClubCard } from '../components/clubs';
import { SkeletonCard, Button } from '../components/ui';
import type { Club } from '../types';

export default function SavedClubsPage() {
  const { data: allClubs, isLoading } = useClubs();
  const { savedSet, toggleSave, isAuthenticated } = useSavedClubs();

  // Filter to only saved clubs
  const savedClubs = useMemo(() => {
    if (!allClubs) return [];
    return (allClubs as Club[]).filter((c) => savedSet.has(c.id));
  }, [allClubs, savedSet]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Clubs</h1>
      <p className="text-gray-600 mb-8">Your bookmarked clubs in one place.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : savedClubs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-5xl block mb-4">❤️</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No saved clubs yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start exploring and save the clubs that interest you!
          </p>
          <Link to="/discover">
            <Button>Browse Clubs</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-medium text-gray-700">{savedClubs.length}</span> saved
            club{savedClubs.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isSaved={true}
                onToggleSave={isAuthenticated ? toggleSave : undefined}
                hideSave={!isAuthenticated}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
