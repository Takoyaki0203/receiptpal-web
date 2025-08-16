// src/auth/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const decide = async () => {
      // If we’re returning from Cognito (?code=...), let the page mount.
      if (location.search.includes('code=')) {
        if (!cancelled) setState({ loading: false, ok: true });
        return;
      }

      // Try a few short times in case hydration is still happening
      for (let i = 0; i < 8; i++) { // ~1.2s total
        try {
          const session = await fetchAuthSession();
          if (session?.tokens?.idToken) {
            if (!cancelled) setState({ loading: false, ok: true });
            return;
          }
        } catch { /* ignore; retry */ }
        await sleep(150);
      }

      if (!cancelled) setState({ loading: false, ok: false });
    };

    decide();
    return () => { cancelled = true; };
  }, [location.search]);

  if (state.loading) return <div className="container mt-5">Checking session…</div>;
  return state.ok ? children : <Navigate to="/login" replace />;
}
