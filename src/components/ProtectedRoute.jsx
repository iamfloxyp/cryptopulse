
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  const loc = useLocation();
  if (!isAuthed) {
    
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }
  return children;
}