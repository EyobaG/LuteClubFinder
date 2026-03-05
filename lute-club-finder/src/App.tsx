import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { ToastProvider } from './components/ui';

// Pages
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

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClubs from './pages/admin/AdminClubs';
import AdminClubEdit from './pages/admin/AdminClubEdit';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventEdit from './pages/admin/AdminEventEdit';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnnouncementEdit from './pages/admin/AdminAnnouncementEdit';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Leader Pages
import LeaderLayout from './pages/leader/LeaderLayout';
import LeaderDashboard from './pages/leader/LeaderDashboard';
import LeaderClubEdit from './pages/leader/LeaderClubEdit';
import LeaderEvents from './pages/leader/LeaderEvents';
import LeaderEventEdit from './pages/leader/LeaderEventEdit';
import LeaderAnnouncements from './pages/leader/LeaderAnnouncements';
import LeaderAnnouncementEdit from './pages/leader/LeaderAnnouncementEdit';
import LeaderAnalytics from './pages/leader/LeaderAnalytics';

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
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'clubs', element: <AdminClubs /> },
          { path: 'clubs/new', element: <AdminClubEdit /> },
          { path: 'clubs/:id/edit', element: <AdminClubEdit /> },
          { path: 'events', element: <AdminEvents /> },
          { path: 'events/new', element: <AdminEventEdit /> },
          { path: 'events/:id/edit', element: <AdminEventEdit /> },
          { path: 'announcements', element: <AdminAnnouncements /> },
          { path: 'announcements/new', element: <AdminAnnouncementEdit /> },
          { path: 'announcements/:id/edit', element: <AdminAnnouncementEdit /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'analytics', element: <AdminAnalytics /> },
        ],
      },
      {
        path: 'leader',
        element: <LeaderLayout />,
        children: [
          { index: true, element: <LeaderDashboard /> },
          { path: 'clubs/:id/edit', element: <LeaderClubEdit /> },
          { path: 'events', element: <LeaderEvents /> },
          { path: 'events/new', element: <LeaderEventEdit /> },
          { path: 'events/:id/edit', element: <LeaderEventEdit /> },
          { path: 'announcements', element: <LeaderAnnouncements /> },
          { path: 'announcements/new', element: <LeaderAnnouncementEdit /> },
          { path: 'announcements/:id/edit', element: <LeaderAnnouncementEdit /> },
          { path: 'analytics', element: <LeaderAnalytics /> },
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
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
