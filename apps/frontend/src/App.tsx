import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RouteFallback from './components/RouteFallback';

const PostListPage = lazy(() => import('./pages/posts/PostListPage'));
const PostCreatePage = lazy(() => import('./pages/posts/PostCreatePage'));
const PostDetailPage = lazy(() => import('./pages/posts/PostDetailPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route path="/posts/new" element={<PostCreatePage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/blog" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
