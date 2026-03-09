import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RouteFallback from './components/RouteFallback';

const PostListPage = lazy(() => import('./pages/posts/PostListPage'));
const PostCreatePage = lazy(() => import('./pages/posts/PostCreatePage'));
const PostDetailPage = lazy(() => import('./pages/posts/PostDetailPage'));
const PostEditPage = lazy(() => import('./pages/posts/PostEditPage'));
const GuestbookPage = lazy(() => import('./pages/GuestbookPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route
          path="/posts/new"
          element={
            <RequireAuth>
              <PostCreatePage />
            </RequireAuth>
          }
        />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route
          path="/posts/:id/edit"
          element={
            <RequireAuth>
              <PostEditPage />
            </RequireAuth>
          }
        />
        <Route path="/guestbook" element={<GuestbookPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
        <Route path="/blog" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
