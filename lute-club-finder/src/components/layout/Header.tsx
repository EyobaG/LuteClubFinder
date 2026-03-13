import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import UserMenu from './UserMenu';
import BugReportModal from './BugReportModal';

const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/discover', label: 'Discover', icon: '🔍' },
  { to: '/quiz', label: 'Quiz', icon: '✨' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/announcements', label: 'News', icon: '📢' },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);
  const { user, userData } = useAuth();

  return (
    <header className="bg-[#000000] sticky top-0 z-50 border-b-2 border-plu-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/lute-club-finder.png" alt="LuteClubFinder logo" className="h-28 w-[199px] sm:w-auto object-contain -mr-14 shrink-0" />
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
            <button
              onClick={() => setBugModalOpen(true)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-plu-gold hover:bg-white/5 transition-colors flex items-center gap-1.5"
              title="Report a bug"
            >
              🐛 Bug
            </button>
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

      {bugModalOpen && <BugReportModal onClose={() => setBugModalOpen(false)} />}

      {/* Mobile Menu — slide down with animation */}
      <nav
        aria-label="Mobile navigation"
        className={`md:hidden border-t border-plu-gold/30 bg-[#000000] overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {/* Main nav links with icons + gold left border on active */}
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all border-l-2 ${
                  isActive
                    ? 'border-plu-gold bg-plu-gold/10 text-plu-gold'
                    : 'border-transparent text-gray-300 hover:text-plu-gold hover:bg-white/5 hover:border-plu-gold/40'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={() => { setBugModalOpen(true); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-gray-300 hover:text-plu-gold hover:bg-white/5 border-l-2 border-transparent hover:border-plu-gold/40 transition-all"
          >
            <span className="text-lg">🐛</span>
            Report a Bug
          </button>

          {/* Divider + user section */}
          <div className="pt-3 mt-1 border-t border-plu-gold/20 space-y-1">
            {(userData?.role === 'club_leader' || userData?.role === 'admin') && (
              <Link
                to="/leader"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all border-l-2 ${
                  location.pathname.startsWith('/leader')
                    ? 'border-plu-gold bg-plu-gold/10 text-plu-gold'
                    : 'border-transparent text-gray-300 hover:text-plu-gold hover:bg-white/5 hover:border-plu-gold/40'
                }`}
              >
                <span className="text-lg">🏆</span>
                My Clubs
              </Link>
            )}
            {userData?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all border-l-2 ${
                  location.pathname.startsWith('/admin')
                    ? 'border-plu-gold bg-plu-gold/10 text-plu-gold'
                    : 'border-transparent text-gray-300 hover:text-plu-gold hover:bg-white/5 hover:border-plu-gold/40'
                }`}
              >
                <span className="text-lg">⚙️</span>
                Admin
              </Link>
            )}
            {user ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-gray-300 hover:text-plu-gold hover:bg-white/5 border-l-2 border-transparent hover:border-plu-gold/40 transition-all"
              >
                <span className="text-lg">👤</span>
                Profile
              </Link>
            ) : (
              <div className="px-2 pt-1 pb-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
