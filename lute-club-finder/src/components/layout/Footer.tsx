import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../types';

export default function Footer() {
  return (
    <footer className="bg-black text-amber-400 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center text-center" style={{marginTop: '-6rem'}}>
            <img src="/lute-club-finder.png" alt="LuteClubFinder logo" className="h-36 w-auto object-contain mb-0" style={{marginTop: 0}} />
            <span className="text-3xl font-extrabold text-amber-400 mb-2" style={{marginTop: '-1.25rem'}}>
              Lute<span className="text-white">Club</span>Finder
            </span>
            <p className="text-base max-w-xl mt-2 text-white font-medium">
              Helping Pacific Lutheran University students discover, join, and engage
              with campus clubs through intelligent matching and personalized
              recommendations.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-amber-400 font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover" className="text-white hover:text-amber-400 transition-colors">
                  Browse Clubs
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-white hover:text-amber-400 transition-colors">
                  Take the Quiz
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white hover:text-amber-400 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-white hover:text-amber-400 transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-amber-400 font-semibold text-sm mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((cat) => {
                const isSpecialInterest = cat.value === 'special_interest';
                return (
                  <li
                    key={cat.value}
                    className={`text-white ${isSpecialInterest ? 'pb-4' : ''}`}
                  >
                    <Link
                      to={`/discover?category=${cat.value}`}
                      className="text-white hover:text-amber-400 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-amber-400 font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/profile" className="text-white hover:text-amber-400 transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/saved" className="text-white hover:text-amber-400 transition-colors">
                  Saved Clubs
                </Link>
              </li>
              <li>
                <Link to="/leader" className="text-white hover:text-amber-400 transition-colors">
                  Club Leader Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://www.plu.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-amber-400 transition-colors"
                >
                  PLU Website
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-gray-800 text-sm text-center bg-amber-400 text-black">
        <p className="py-2">
          &copy; {new Date().getFullYear()} Lute Club Finder &ndash; Built with
          <span role="img" aria-label="love" className="mx-1">❤️</span>
          by Job Menjigso (Eyob) to Pacific Lutheran University
        </p>
      </div>
    </footer>
  );
}
