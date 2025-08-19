import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Try multiple times in case Amplify is still hydrating
        for (let i = 0; i < 8; i++) {
          const s = await fetchAuthSession();
          const authed = !!(s?.tokens?.idToken || s?.tokens?.accessToken);
          console.log("PR check", i, authed);
          if (authed) {
            if (alive) setOk(true);
            break;
          }
          await sleep(300);
        }
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (checking) return null;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}
