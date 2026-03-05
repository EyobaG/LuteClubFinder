import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useUpcomingEvents } from '../hooks/useEvents';
import { useClubs } from '../hooks/useClubs';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { EventCard } from '../components/events';
import { ClubCard } from '../components/clubs';
import { AnnouncementCard } from '../components/announcements';

export default function HomePage() {
  const { data: upcomingEvents } = useUpcomingEvents(undefined, 6);
  const { data: clubs } = useClubs({ featured: true, limitCount: 4 });
  const { data: announcements } = useAnnouncements({ limitCount: 3 });

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Clubs', value: '55+' },
            { label: 'Categories', value: '9' },
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
    </div>
  );
}
