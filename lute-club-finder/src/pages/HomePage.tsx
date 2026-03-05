import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useUpcomingEvents } from '../hooks/useEvents';
import { useClubs } from '../hooks/useClubs';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/events';
import { ClubCard } from '../components/clubs';
import { AnnouncementCard } from '../components/announcements';
import { CATEGORIES, CATEGORY_COLORS, type ClubCategory } from '../types';

const CATEGORY_ICONS: Record<ClubCategory, string> = {
  academic: '📚',
  cultural: '🌍',
  faith: '⛪',
  arts: '🎨',
  recreational: '🏃',
  professional: '💼',
  service: '🤝',
  gaming: '🎮',
  special_interest: '⭐',
};

export default function HomePage() {
  const { data: upcomingEvents } = useUpcomingEvents(undefined, 3);
  const { data: clubs } = useClubs({ featured: true, limitCount: 4 });
  const { data: announcements } = useAnnouncements({ limitCount: 3 });
  const { user, userData } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find Your <span className="text-amber-600">Perfect Club</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Discover 55+ campus clubs at Pacific Lutheran University through
            intelligent matching and personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/quiz">
              <Button size="lg">Take the Quiz</Button>
            </Link>
            <Link to="/discover">
              <Button variant="outline" size="lg">
                Browse All Clubs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Clubs', value: '55+' },
            { label: 'Club Officers', value: '110+' },
            { label: 'Free to Join', value: '100%' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center"
            >
              <div className="text-2xl font-bold text-amber-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">Explore clubs organized by interest area</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const colors = CATEGORY_COLORS[cat.value];
            return (
              <Link
                key={cat.value}
                to={`/discover?category=${cat.value}`}
                className={`group flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-5 transition-all hover:shadow-md hover:scale-[1.03] ${colors}`}
              >
                <span className="text-3xl">{CATEGORY_ICONS[cat.value]}</span>
                <span className="text-sm font-semibold">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Clubs</h2>
          <Link to="/discover" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View All →
          </Link>
        </div>
        {clubs && clubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} hideSave />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No featured clubs yet.</p>
        )}
      </section>

      {/* Latest Announcements */}
      {announcements && announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Announcements</h2>
            <Link to="/announcements" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link to="/events" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View All →
          </Link>
        </div>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming events right now. Check back later!</p>
        )}
      </section>

      {/* Out of Comfort Zone CTA */}
      {user && userData?.quizCompleted && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Step Outside Your Comfort Zone
            </h2>
            <p className="text-purple-100 max-w-xl mx-auto mb-6">
              Discover clubs you'd never expect to love. Our algorithm finds
              compatible-but-different clubs to broaden your horizons.
            </p>
            <Link to="/comfort-zone">
              <button className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 text-lg bg-white text-purple-700 hover:bg-purple-50 transition-colors duration-200">
                Explore Recommendations
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
