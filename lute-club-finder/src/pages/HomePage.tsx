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
      <section className="bg-gradient-to-br from-plu-gold-light via-white to-plu-gold-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-plu-black mb-6 tracking-tight">
            Find Your <span className="text-plu-gold-deep">Perfect Club</span>
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center border-t-4 border-t-plu-gold"
            >
              <div className="text-2xl font-extrabold text-plu-black">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-plu-black mb-2">Browse by Category</h2>
          <p className="text-gray-600">Explore clubs organized by interest area</p>
        </div>
        {/* Mobile: horizontal scroll pills — Desktop: full grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const colors = CATEGORY_COLORS[cat.value];
            return (
              <Link
                key={cat.value}
                to={`/discover?category=${cat.value}`}
                className={`group flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-3 sm:p-5 transition-all hover:shadow-md hover:scale-[1.03] hover:border-plu-gold/50 ${colors}`}
              >
                <span className="text-2xl sm:text-3xl">{CATEGORY_ICONS[cat.value]}</span>
                <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-plu-black">Featured Clubs</h2>
          <Link to="/discover" className="text-sm text-plu-gold-deep hover:text-plu-black font-semibold transition-colors">
            View All →
          </Link>
        </div>
        {clubs && clubs.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {clubs.map((club) => (
              <div key={club.id} className="snap-start shrink-0 w-[75vw] sm:w-auto">
                <ClubCard club={club} hideSave />
              </div>
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
            <h2 className="text-2xl font-extrabold text-plu-black">Latest Announcements</h2>
            <Link to="/announcements" className="text-sm text-plu-gold-deep hover:text-plu-black font-semibold transition-colors">
              View All →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {announcements.map((a) => (
              <div key={a.id} className="snap-start shrink-0 w-[75vw] sm:w-auto">
                <AnnouncementCard announcement={a} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-plu-black">Upcoming Events</h2>
          <Link to="/events" className="text-sm text-plu-gold-deep hover:text-plu-black font-semibold transition-colors">
            View All →
          </Link>
        </div>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="snap-start shrink-0 w-[75vw] sm:w-auto">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming events right now. Check back later!</p>
        )}
      </section>

      {/* Out of Comfort Zone CTA */}
      {user && userData?.quizCompleted && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-plu-black rounded-2xl p-8 sm:p-12 text-center text-white border border-plu-gold/20">
            <div className="inline-block px-3 py-1 rounded-full bg-plu-gold/15 text-plu-gold text-xs font-bold uppercase tracking-widest mb-4">
              Personalized for You
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Step Outside Your Comfort Zone
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-6">
              Discover clubs you'd never expect to love. Our algorithm finds
              compatible-but-different clubs to broaden your horizons.
            </p>
            <Link to="/comfort-zone">
              <button className="inline-flex items-center justify-center rounded-lg font-bold px-6 py-3 text-lg bg-plu-gold text-plu-black hover:bg-plu-gold-deep transition-colors duration-200">
                Explore Recommendations
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
