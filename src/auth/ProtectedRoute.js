import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });
  const location = useLocation();

  useEffect(() => {
    (async () => {
      // Let the OAuth callback (/upload?code=...) render so it can finish login.
      if (location.search.includes('code=')) {
        setState({ loading: false, ok: true });
        return;
      }

      try {
        const session = await fetchAuthSession();
        const hasIdToken = !!session?.tokens?.idToken;
        setState({ loading: false, ok: hasIdToken });
      } catch {
        setState({ loading: false, ok: false });
      }
    })();
  }, [location.search]);

  if (state.loading) return <div className="container mt-5">Checking session…</div>;
  return state.ok ? children : <Navigate to="/login" />;
}
