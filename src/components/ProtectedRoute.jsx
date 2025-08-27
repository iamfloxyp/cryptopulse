// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  const loc = useLocation();
  if (!isAuthed) {
    // send user to /auth and remember where they wanted to go
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }
  return children;
}