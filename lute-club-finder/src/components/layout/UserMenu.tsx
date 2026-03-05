import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UserMenu() {
  const { user, userData, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const initial =
    userData?.displayName?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    'U';

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  const isLeaderOrAdmin =
    userData?.role === 'club_leader' || userData?.role === 'admin';
  const isAdmin = userData?.role === 'admin';

  const menuItems: { to: string; label: string; show: boolean }[] = [
    { to: '/profile', label: 'Profile', show: true },
    { to: '/saved', label: 'Saved Clubs', show: true },
    { to: '/leader', label: 'My Clubs', show: isLeaderOrAdmin },
    { to: '/admin', label: 'Admin', show: isAdmin },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium text-sm hover:ring-2 hover:ring-amber-300 transition-all"
        aria-label="User menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User info */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userData?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          {menuItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-4 py-2 text-sm transition-colors ${
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + '/')
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}

          {/* Divider + Sign Out */}
          <div className="border-t border-gray-100 mt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
