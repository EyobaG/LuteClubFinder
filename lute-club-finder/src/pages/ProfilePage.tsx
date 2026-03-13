import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { updateUserData } from '../lib/firebase';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, userData, signOut, refreshUserData } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) {
    return null; // ProtectedRoute will redirect
  }

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  async function handleSaveName() {
    if (!displayName.trim() || !user) return;
    setSaving(true);
    try {
      await updateUserData(user.uid, { displayName: displayName.trim() });
      await refreshUserData();
      setEditingName(false);
      toast.success('Name updated');
    } catch (err) {
      console.error('Failed to update name:', err);
      toast.error('Failed to update name');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Failed to sign out:', err);
      setSigningOut(false);
    }
  }

  const roleBadgeColor =
    userData.role === 'admin'
      ? 'danger' as const
      : userData.role === 'club_leader'
        ? 'warning' as const
        : 'default' as const;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-2xl shrink-0">
            {userData.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Display Name */}
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName} isLoading={saving}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingName(false);
                    setDisplayName(userData.displayName);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {userData.displayName}
                </h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit name"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}

            <p className="text-gray-500 text-sm truncate">{userData.email}</p>

            <div className="mt-2">
              <Badge color={roleBadgeColor}>
                {userData.role === 'admin'
                  ? 'Admin'
                  : userData.role === 'club_leader'
                    ? 'Club Leader'
                    : 'Student'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => navigate('/saved')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center hover:border-amber-300 hover:shadow-md transition-all"
        >
          <p className="text-3xl font-bold text-amber-600">
            {userData.savedClubs?.length || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Saved Clubs →</p>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">
            {userData.quizCompleted ? '✅' : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {userData.quizCompleted ? 'Quiz Completed' : 'Quiz Not Taken'}
          </p>
        </div>

        <button
          onClick={() => navigate('/leader')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center hover:border-amber-300 hover:shadow-md transition-all"
        >
          <p className="text-3xl font-bold text-amber-600">
            {userData.clubLeaderOf?.length || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Clubs Led →</p>
        </button>
      </div>

      {/* Quiz CTA */}
      {!userData.quizCompleted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-amber-800 mb-1">
            Find your perfect club!
          </h3>
          <p className="text-amber-700 text-sm mb-3">
            Take our quick quiz to get personalized club recommendations based on
            your interests.
          </p>
          <Button size="sm" onClick={() => navigate('/quiz')}>
            Take the Quiz
          </Button>
        </div>
      )}

      {userData.quizCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-green-800 mb-1">
            Quiz Completed!
          </h3>
          <p className="text-green-700 text-sm mb-3">
            You've found your top club matches. View your results or retake the
            quiz at any time.
          </p>
          <Button size="sm" onClick={() => navigate('/quiz')}>
            View Results / Retake
          </Button>
        </div>
      )}

      {/* Sign Out */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        isLoading={signingOut}
        className="w-full sm:w-auto"
      >
        Sign Out
      </Button>
    </div>
  );
}
