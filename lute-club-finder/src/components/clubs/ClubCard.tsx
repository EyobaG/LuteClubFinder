import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import type { Club, ClubCategory } from '../../types';
import { CATEGORIES } from '../../types';

interface ClubCardProps {
  club: Club;
  /** Render a save/bookmark toggle in the top-right */
  onToggleSave?: (clubId: string) => void;
  isSaved?: boolean;
  /** Hide the save button entirely (e.g. for unauthenticated users) */
  hideSave?: boolean;
}

export default function ClubCard({
  club,
  onToggleSave,
  isSaved = false,
  hideSave = false,
}: ClubCardProps) {
  const navigate = useNavigate();

  const categoryLabel =
    CATEGORIES.find((c) => c.value === club.category)?.label ?? club.category;

  return (
    <Card
      hoverable
      onClick={() => navigate(`/clubs/${club.id}`)}
      className="relative flex flex-col h-full"
    >
      {/* Save button */}
      {!hideSave && onToggleSave && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(club.id);
          }}
          className="absolute top-2 right-2 p-2.5 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label={isSaved ? 'Unsave club' : 'Save club'}
        >
          {isSaved ? (
            <svg className="h-5 w-5 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400 hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category badge */}
        <div className="mb-3">
          <Badge variant="category" category={club.category as ClubCategory}>
            {categoryLabel}
          </Badge>
        </div>

        {/* Club name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {club.name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {club.shortDescription || club.description}
        </p>

        {/* Tags (first 3) */}
        {club.tags && club.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {club.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {club.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-gray-400 text-xs">
                +{club.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meeting info */}
        {club.meetingSchedule && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {club.meetingSchedule.dayOfWeek}
              {club.meetingSchedule.time ? ` · ${club.meetingSchedule.time}` : ''}
              {club.meetingSchedule.frequency !== 'weekly'
                ? ` · ${club.meetingSchedule.frequency}`
                : ''}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
