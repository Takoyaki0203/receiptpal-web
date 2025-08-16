import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });
  const location = useLocation();

  const hasOAuthCode =
    location.search.includes('code=') || location.hash.includes('code=');

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setState({ loading: false, ok: true });
      } catch {
        setState({ loading: false, ok: false });
      }
    })();
  }, []);

  if (state.loading) return <div className="container mt-5">Checking session…</div>;
  if (state.ok || hasOAuthCode) return children;  // let /upload mount to complete login
  return <Navigate to="/login" />;
}
