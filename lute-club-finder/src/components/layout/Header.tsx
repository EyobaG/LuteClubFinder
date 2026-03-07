import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import UserMenu from './UserMenu';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/events', label: 'Events' },
  { to: '/announcements', label: 'News' },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userData } = useAuth();

  return (
    <header className="bg-plu-black sticky top-0 z-50 border-b-2 border-plu-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/lute-club-finder.png" alt="LuteClubFinder logo" className="h-28 w-auto object-contain -mr-14" />
            <span className="text-xl font-extrabold text-white tracking-tight">
              Lute<span className="text-plu-gold">Club</span>Finder
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${
                    location.pathname === link.to
                      ? 'bg-plu-gold/15 text-plu-gold'
                      : 'text-gray-300 hover:text-plu-gold hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {(userData?.role === 'club_leader' || userData?.role === 'admin') && (
              <Link
                to="/leader"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${
                    location.pathname.startsWith('/leader')
                      ? 'bg-plu-gold/15 text-plu-gold'
                      : 'text-gray-300 hover:text-plu-gold hover:bg-white/5'
                  }`}
              >
                My Clubs
              </Link>
            )}
            {userData?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-plu-gold/15 text-plu-gold'
                      : 'text-gray-300 hover:text-plu-gold hover:bg-white/5'
                  }`}
              >
                Admin
              </Link>
            )}
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-plu-gold hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav aria-label="Mobile navigation" className="md:hidden border-t border-plu-gold/30 bg-plu-black">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold transition-colors
                  ${
                    location.pathname === link.to
                      ? 'bg-plu-gold/15 text-plu-gold'
                      : 'text-gray-300 hover:text-plu-gold hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-plu-gold/20">
              {(userData?.role === 'club_leader' || userData?.role === 'admin') && (
                <Link
                  to="/leader"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-semibold transition-colors
                    ${
                      location.pathname.startsWith('/leader')
                        ? 'bg-plu-gold/15 text-plu-gold'
                        : 'text-gray-300 hover:text-plu-gold hover:bg-white/5'
                    }`}
                >
                  My Clubs
                </Link>
              )}
              {userData?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-semibold transition-colors
                    ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-plu-gold/15 text-plu-gold'
                        : 'text-gray-300 hover:text-plu-gold hover:bg-white/5'
                    }`}
                >
                  Admin
                </Link>
              )}
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-gray-300 hover:text-plu-gold"
                >
                  Profile
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-2" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
