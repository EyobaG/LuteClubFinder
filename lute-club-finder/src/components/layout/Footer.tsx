import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../types';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎵</span>
              <span className="text-lg font-bold text-white">
                Lute<span className="text-amber-500">Club</span>Finder
              </span>
            </div>
            <p className="text-sm max-w-md">
              Helping Pacific Lutheran University students discover, join, and engage
              with campus clubs through intelligent matching and personalized
              recommendations.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover" className="hover:text-white transition-colors">
                  Browse Clubs
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-white transition-colors">
                  Take the Quiz
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-white transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link
                    to={`/discover?category=${cat.value}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-white transition-colors">
                  Saved Clubs
                </Link>
              </li>
              <li>
                <Link to="/leader" className="hover:text-white transition-colors">
                  Club Leader Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://www.plu.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  PLU Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Lute Club Finder &mdash; Built with
            ❤️ at Pacific Lutheran University
          </p>
        </div>
      </div>
    </footer>
  );
}
