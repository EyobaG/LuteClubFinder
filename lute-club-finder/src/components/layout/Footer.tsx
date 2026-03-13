import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../types';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 mt-auto" role="contentinfo">
      {/* PLU gold top accent line */}
      <div className="border-t-2 border-plu-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand — full width, untouched */}
        <div className="flex flex-col items-center justify-center text-center mb-10 -mt-8 sm:-mt-24">
          <img src="/lute-club-finder.png" alt="LuteClubFinder logo" className="h-36 w-auto object-contain mb-0" style={{marginTop: 0}} />
          <span className="text-3xl font-extrabold text-white mb-2" style={{marginTop: '-1.25rem'}}>
            Lute<span className="text-plu-gold">Club</span>Finder
          </span>
          <p className="text-base max-w-xl mt-2 text-white font-medium">
            Helping Pacific Lutheran University students discover, join, and engage
            with campus clubs through intelligent matching and personalized
            recommendations.
          </p>
          <p className="mt-4 text-xs font-semibold text-plu-gold/70 tracking-widest uppercase">
            Go Lutes!
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Explore + Quick Links side by side on mobile */}
          <div className="grid grid-cols-2 gap-8 lg:contents">
            {/* Explore */}
            <div>
              <h3 className="text-plu-gold font-bold text-sm mb-3 uppercase tracking-wider">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/discover" className="text-white hover:text-plu-gold transition-colors">Browse Clubs</Link></li>
                <li><Link to="/quiz" className="text-white hover:text-plu-gold transition-colors">Take the Quiz</Link></li>
                <li><Link to="/events" className="text-white hover:text-plu-gold transition-colors">Events</Link></li>
                <li><Link to="/announcements" className="text-white hover:text-plu-gold transition-colors">Announcements</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-plu-gold font-bold text-sm mb-3 uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/profile" className="text-white hover:text-plu-gold transition-colors">Profile</Link></li>
                <li><Link to="/saved" className="text-white hover:text-plu-gold transition-colors">Saved Clubs</Link></li>
                <li><Link to="/leader" className="text-white hover:text-plu-gold transition-colors">Club Leader Portal</Link></li>
                <li>
                  <a href="https://www.plu.edu" target="_blank" rel="noopener noreferrer" className="text-white hover:text-plu-gold transition-colors">
                    PLU Website ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Categories — 2-col wrap on mobile */}
          <div>
            <h3 className="text-plu-gold font-bold text-sm mb-3 uppercase tracking-wider">Categories</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link to={`/discover?category=${cat.value}`} className="text-white hover:text-plu-gold transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Full-width gold copyright bar */}
      <div className="bg-plu-gold w-full py-4 px-4 text-center">
        <p className="text-sm font-semibold text-plu-black">
          &copy; {new Date().getFullYear()} Lute Club Finder - Built with ❤️ by Job Menjigso (Eyob) for Pacific Lutheran University
        </p>
      </div>
    </footer>
  );
}
