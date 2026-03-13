import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../types';

const LinkedInPill = (
  <a
    href="https://www.linkedin.com/in/eyob-m-a3b530349"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-plu-gold/40 text-plu-gold text-xs font-semibold hover:bg-plu-gold/10 hover:border-plu-gold transition-colors"
  >
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
    Connect on LinkedIn
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 mt-auto" role="contentinfo">
      {/* PLU gold top accent line */}
      <div className="border-t-2 border-plu-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── MOBILE LAYOUT (hidden on sm+) ── */}
        <div className="sm:hidden">
          {/* Brand — centered */}
          <div className="flex flex-col items-center justify-center text-center mb-10 -mt-8">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center">
              <img src="/lute-club-finder.png" alt="LuteClubFinder logo" className="h-36 w-auto object-contain mb-0" style={{marginTop: 0}} />
              <span className="text-3xl font-extrabold text-white mb-2" style={{marginTop: '-1.25rem'}}>
                Lute<span className="text-plu-gold">Club</span>Finder
              </span>
            </Link>
            <p className="text-base max-w-xl mt-2 text-white font-medium">
              Helping Pacific Lutheran University students discover, join, and engage
              with campus clubs through intelligent matching and personalized
              recommendations.
            </p>
            <p className="mt-4 text-xs font-semibold text-plu-gold/70 tracking-widest uppercase">
              Go Lutes!
            </p>
            {LinkedInPill}
          </div>

          {/* Explore + Quick Links side by side */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-plu-gold font-bold text-sm mb-3 uppercase tracking-wider">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/discover" className="text-white hover:text-plu-gold transition-colors">Browse Clubs</Link></li>
                <li><Link to="/quiz" className="text-white hover:text-plu-gold transition-colors">Take the Quiz</Link></li>
                <li><Link to="/events" className="text-white hover:text-plu-gold transition-colors">Events</Link></li>
                <li><Link to="/announcements" className="text-white hover:text-plu-gold transition-colors">Announcements</Link></li>
              </ul>
            </div>
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

          {/* Categories — 2-col grid */}
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

        {/* ── DESKTOP LAYOUT (hidden on mobile, shown on sm+) ── */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand — col-span-2, original style */}
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center text-center" style={{marginTop: '-6rem'}}>
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center">
              <img src="/lute-club-finder.png" alt="LuteClubFinder logo" className="h-36 w-auto object-contain mb-0" style={{marginTop: 0}} />
              <span className="text-3xl font-extrabold text-white mb-2" style={{marginTop: '-1.25rem'}}>
                Lute<span className="text-plu-gold">Club</span>Finder
              </span>
            </Link>
            <p className="text-base max-w-xl mt-2 text-white font-medium">
              Helping Pacific Lutheran University students discover, join, and engage
              with campus clubs through intelligent matching and personalized
              recommendations.
            </p>
            <p className="mt-4 text-xs font-semibold text-plu-gold/70 tracking-widest uppercase">
              Go Lutes!
            </p>
            {LinkedInPill}
          </div>

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

          {/* Categories */}
          <div>
            <h3 className="text-plu-gold font-bold text-sm mb-3 uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link to={`/discover?category=${cat.value}`} className="text-white hover:text-plu-gold transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
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
