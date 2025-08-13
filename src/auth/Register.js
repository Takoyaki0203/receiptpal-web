// src/auth/Register.js
import '../styles/style.css';
import heroLeft from '../assets/background_2.jpg';
import { useState, useEffect } from 'react';
import { signUp, signInWithRedirect, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession().catch(() => null);
        const payload = session?.tokens?.idToken?.payload || {};
        const who = payload.email || payload['cognito:username'] || user?.username || 'user';
        localStorage.setItem('userEmail', who);
        localStorage.setItem('userName', who);
        window.location.href = '/upload';
      } catch {}
    })();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setMessage('Passwords do not match.');
    try {
      await signUp({ username: email, password, attributes: { email } });
      localStorage.setItem('emailToVerify', email);
      setMessage('Registered successfully. Check your email for the code.');
      setTimeout(() => (window.location.href = '/confirm'), 1200);
    } catch (err) {
      setMessage(err.message || 'Registration failed.');
    }
  };

  const handleGoogleRegister = async () => {
    setMessage('Redirecting to Google…');
    await signInWithRedirect({ provider: 'Google' });
  };

  return (
    <div className="card-wrapper">
      <div className="card-content">
        <div className="container">

          {/* LEFT: image */}
          <div
            className="image-side image-left"
            style={{ backgroundImage: `url(${heroLeft})` }}
          >
            <div className="image-overlay" />
          </div>

          {/* RIGHT: form */}
          <div className="form-side">
            <div className="form-wrapper">
              <h2 className="register-title">Create Your Account</h2>
              <p className="subtext">Join us to track receipts smarter</p>

              <form onSubmit={handleRegister}>
                <label>Email</label>
                <div className="input-group">
                  <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                  <i className="fa-solid fa-envelope"></i>
                </div>

                <label>Password</label>
                <div className="input-group">
                  <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
                  <i className="fa-solid fa-lock"></i>
                </div>

                <label>Confirm Password</label>
                <div className="input-group">
                  <input type="password" required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
                  <i className="fa-solid fa-lock"></i>
                </div>

                <button className="btn-primary">Register</button>
                <p style={{ color: /Redirecting|success|code/i.test(message) ? 'green' : 'red' }}>{message}</p>
              </form>

              <div className="divider">or sign up with</div>

              <div className="social-buttons">
                <button className="social-btn" aria-label="Continue with Google" onClick={handleGoogleRegister}>
                  {/* Google “G” */}
                  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M44.5 20H24v8.5h11.8C34.8 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.8 4.2 29.7 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11.3 0 21-8.2 21-22 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/>
                    <path d="M6.3 14.7l7 5.1C15 16 18.3 13 24 13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.8 4.2 29.7 2 24 2 16 2 8.8 6.6 6.3 14.7z" fill="#FF3D00"/>
                    <path d="M24 46c6 0 11-2 14.7-5.4l-6.8-5.6C29.7 36.9 27.1 38 24 38c-6.1 0-10.8-4.1-12.5-9.6l-7.1 5.5C7 41.4 14.7 46 24 46z" fill="#4CAF50"/>
                    <path d="M44.5 20H24v8.5h11.8c-1 4.1-4.7 7-11.8 7-6.1 0-10.8-4.1-12.5-9.6l-7.1 5.5C7 41.4 14.7 46 24 46c11.3 0 21-8.2 21-22 0-1.3-.1-2.7-.5-4z" fill="#1976D2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
