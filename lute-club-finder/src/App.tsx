import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { Toaster } from 'sonner';
import { ErrorBoundary, PageLoader } from './components/ui';

// Pages (eagerly loaded — student-facing)
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import ClubDetailPage from './pages/ClubDetailPage';
import QuizPage from './pages/QuizPage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ProfilePage from './pages/ProfilePage';
import SavedClubsPage from './pages/SavedClubsPage';
import ComfortZonePage from './pages/ComfortZonePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

import EventDetailPage from './pages/EventDetailPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';

// Admin Pages (lazy-loaded)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminClubs = lazy(() => import('./pages/admin/AdminClubs'));
const AdminClubEdit = lazy(() => import('./pages/admin/AdminClubEdit'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminEventEdit = lazy(() => import('./pages/admin/AdminEventEdit'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminAnnouncementEdit = lazy(() => import('./pages/admin/AdminAnnouncementEdit'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

// Leader Pages (lazy-loaded)
const LeaderLayout = lazy(() => import('./pages/leader/LeaderLayout'));
const LeaderDashboard = lazy(() => import('./pages/leader/LeaderDashboard'));
const LeaderClubEdit = lazy(() => import('./pages/leader/LeaderClubEdit'));
const LeaderEvents = lazy(() => import('./pages/leader/LeaderEvents'));
const LeaderEventEdit = lazy(() => import('./pages/leader/LeaderEventEdit'));
const LeaderAnnouncements = lazy(() => import('./pages/leader/LeaderAnnouncements'));
const LeaderAnnouncementEdit = lazy(() => import('./pages/leader/LeaderAnnouncementEdit'));
const LeaderAnalytics = lazy(() => import('./pages/leader/LeaderAnalytics'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <RootLayout>
        <ErrorBoundary>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Error</h2>
            <p className="text-gray-500 mb-4">Something went wrong loading this page.</p>
            <a href="/" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Go Home</a>
          </div>
        </ErrorBoundary>
      </RootLayout>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'clubs/:id', element: <ClubDetailPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'announcements/:id', element: <AnnouncementDetailPage /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'saved',
        element: (
          <ProtectedRoute>
            <SavedClubsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'comfort-zone',
        element: (
          <ProtectedRoute>
            <ComfortZonePage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'admin',
        element: <LazyPage><AdminLayout /></LazyPage>,
        children: [
          { index: true, element: <LazyPage><AdminDashboard /></LazyPage> },
          { path: 'clubs', element: <LazyPage><AdminClubs /></LazyPage> },
          { path: 'clubs/new', element: <LazyPage><AdminClubEdit /></LazyPage> },
          { path: 'clubs/:id/edit', element: <LazyPage><AdminClubEdit /></LazyPage> },
          { path: 'events', element: <LazyPage><AdminEvents /></LazyPage> },
          { path: 'events/new', element: <LazyPage><AdminEventEdit /></LazyPage> },
          { path: 'events/:id/edit', element: <LazyPage><AdminEventEdit /></LazyPage> },
          { path: 'announcements', element: <LazyPage><AdminAnnouncements /></LazyPage> },
          { path: 'announcements/new', element: <LazyPage><AdminAnnouncementEdit /></LazyPage> },
          { path: 'announcements/:id/edit', element: <LazyPage><AdminAnnouncementEdit /></LazyPage> },
          { path: 'users', element: <LazyPage><AdminUsers /></LazyPage> },
          { path: 'analytics', element: <LazyPage><AdminAnalytics /></LazyPage> },
        ],
      },
      {
        path: 'leader',
        element: <LazyPage><LeaderLayout /></LazyPage>,
        children: [
          { index: true, element: <LazyPage><LeaderDashboard /></LazyPage> },
          { path: 'clubs/:id/edit', element: <LazyPage><LeaderClubEdit /></LazyPage> },
          { path: 'events', element: <LazyPage><LeaderEvents /></LazyPage> },
          { path: 'events/new', element: <LazyPage><LeaderEventEdit /></LazyPage> },
          { path: 'events/:id/edit', element: <LazyPage><LeaderEventEdit /></LazyPage> },
          { path: 'announcements', element: <LazyPage><LeaderAnnouncements /></LazyPage> },
          { path: 'announcements/new', element: <LazyPage><LeaderAnnouncementEdit /></LazyPage> },
          { path: 'announcements/:id/edit', element: <LazyPage><LeaderAnnouncementEdit /></LazyPage> },
          { path: 'analytics', element: <LazyPage><LeaderAnalytics /></LazyPage> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="bottom-right" richColors />
          <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
