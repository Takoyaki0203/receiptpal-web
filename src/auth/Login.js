// src/auth/Login.js
import '../styles/style.css';
import logo from '../assets/logo.png';
import { useState, useEffect } from 'react';
import {
  signIn,
  signOut,
  signInWithRedirect,
  getCurrentUser,
  fetchAuthSession
} from 'aws-amplify/auth';
import awsExports from '../aws-exports';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('OAuth config at runtime:', awsExports.oauth);
    
    (async () => {
      try {
        const user = await getCurrentUser(); // throws if not signed in
        let storedEmail = user?.username || '';

        try {
          const session = await fetchAuthSession();
          const payload = session?.tokens?.idToken?.payload || {};
          storedEmail = payload.email || payload['cognito:username'] || storedEmail;
        } catch {
          /* ignore */
        }

        localStorage.setItem('userEmail', storedEmail || 'user');
        localStorage.setItem('userName', storedEmail || 'User');
        window.location.href = '/upload';
      } catch {
        // not signed in yet
      }
    })();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signOut(); // clear any stale session
      const user = await signIn({ username: email, password });
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', user.username || 'User');
      setMessage('Login successful! Redirecting...');
      setTimeout(() => (window.location.href = '/upload'), 1200);
    } catch (err) {
      console.error('Login error:', err);
      setMessage(err.message || 'Login failed.');
    }
  };

  const handleGoogle = async () => {
    try {
      setMessage('Redirecting to Google…');
      await signInWithRedirect({ provider: 'Google' });
      // After redirect back, useEffect above will run and route to /upload.
    } catch (err) {
      console.error('Google sign-in error:', err);
      setMessage(err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="card-wrapper">
      <div className="card-content">
        <div className="container">
          {/* LEFT: form */}
          <div className="form-side">
            {/* logo + tagline */}
            <div className="logo-inside-card">
              <img className="logo-img" src={logo} alt="ReceiptPal" />
            </div>

            <div className="form-wrapper">
              <p className="subtext">Start your journey</p>
              <h2 className='login-title'>Sign In to ReceiptPal</h2>

              {/* Email/Password form */}
              <form onSubmit={handleLogin}>
                <label>Email</label>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <i className="fa-solid fa-envelope" />
                </div>

                <label>Password</label>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <i className="fa-solid fa-eye" />
                </div>

                <button className="btn-primary">Sign In</button>
                <p style={{ color: /Redirecting|successful/i.test(message) ? 'green' : 'red' }}>{message}</p>
              </form>

              {/* Divider */}
              <div className="divider">or sign in with</div>

              {/* Social buttons row */}
              <div className="social-buttons">
                <button className="social-btn" aria-label="Continue with Google" onClick={handleGoogle}>
                  {/* Inline Google “G” so you don’t need an icon pack */}
                  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M44.5 20H24v8.5h11.8C34.8 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.8 4.2 29.7 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11.3 0 21-8.2 21-22 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/>
                    <path d="M6.3 14.7l7 5.1C15 16 18.3 13 24 13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.8 4.2 29.7 2 24 2 16 2 8.8 6.6 6.3 14.7z" fill="#FF3D00"/>
                    <path d="M24 46c6 0 11-2 14.7-5.4l-6.8-5.6C29.7 36.9 27.1 38 24 38c-6.1 0-10.8-4.1-12.5-9.6l-7.1 5.5C7 41.4 14.7 46 24 46z" fill="#4CAF50"/>
                    <path d="M44.5 20H24v8.5h11.8c-1 4.1-4.7 7-11.8 7-6.1 0-10.8-4.1-12.5-9.6l-7.1 5.5C7 41.4 14.7 46 24 46c11.3 0 21-8.2 21-22 0-1.3-.1-2.7-.5-4z" fill="#1976D2"/>
                  </svg>
                </button>
              </div>

              {/* Bottom link */}
              <div className="card-bottom-left">
                Don’t have an account? <a href="/register">Sign up</a>
              </div>
            </div>
          </div>

          {/* RIGHT: hero image */}
          <div className="image-side">
            <div className="image-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}
