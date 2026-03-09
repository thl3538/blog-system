import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasAuthToken } from '../lib/auth';

function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();

  if (!hasAuthToken()) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}

export default RequireAuth;
