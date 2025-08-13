import { useState, useEffect } from 'react';
import { confirmSignUp } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

export default function ConfirmSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem("emailToVerify");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setMessage("Account confirmed! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="card-wrapper">
      <div className="card-content">
        <div className="container">
          <div className="form-side">
            <div className="form-wrapper">
              <h2>Email Verification</h2>
              <p className="subtext">Check your email for a 6-digit code</p>
              <form onSubmit={handleConfirm}>
                <label>Email</label>
                <div className="input-group">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <label>Verification Code</label>
                <div className="input-group">
                  <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} />
                </div>

                <button className="btn-primary">Confirm Account</button>
                <p style={{ color: message.includes("confirmed") ? "green" : "red" }}>{message}</p>
              </form>
            </div>
          </div>
          <div className="image-side register-image"></div>
        </div>
      </div>
    </div>
  );
}
