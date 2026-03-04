import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function HomePage() {
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

      {/* Featured Clubs Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Clubs</h2>
        <p className="text-gray-500">
          Featured clubs will appear here once the club discovery feature is built.
        </p>
      </section>

      {/* Upcoming Events Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        <p className="text-gray-500">
          Events will appear here once the events system is built.
        </p>
      </section>
    </div>
  );
}
