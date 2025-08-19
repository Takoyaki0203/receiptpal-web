// src/auth/ResetPassword.js
import '../styles/resetpassword.css';
import logo from '../assets/logo.png';
import resetImage from "../assets/resetpassword.png";
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";

export default function ResetPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("request"); // 'request' | 'confirm'
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const pre = search.get("email");
    if (pre) setEmail(pre);
  }, [search]);

  async function sendCode() {
    try {
      if (!email) return setMsg("Please enter your email.");
      await resetPassword({ username: email });
      setStage("confirm");
      setMsg("We sent a verification code to your email.");
    } catch (e) {
      setMsg(e.message || "Failed to send reset code.");
    }
  }

  async function changePassword() {
    try {
      if (!code) return setMsg("Enter the verification code.");
      if (!pwd || pwd.length < 8) return setMsg("Password must be at least 8 characters.");
      if (pwd !== pwd2) return setMsg("Passwords do not match.");
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword: pwd });
      setMsg("Password changed! Redirecting to sign in…");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setMsg(e.message || "Failed to change password.");
    }
  }

  return (
    <div className="reset-shell">
      {/* form column */}
      <div className="reset-left">
        <div className="reset-card">
          <div className="auth-logo">
            <img src={logo} alt="Logo" style={{ width: 150, marginBottom: "0.5m" }} />
          </div>
          <h1 className="reset-title">Reset your password</h1>
          <p className="reset-sub">Enter your email and check your inbox for instructions.</p>

          {/* request code (screenshot layout) */}
          {stage === "request" && (
            <>
              <div className="reset-input">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <i className="fa-solid fa-envelope" />
              </div>

              <button type="button" className="btn-primary w-100" onClick={sendCode}>
                Send
              </button>

              <div className="reset-footer">
                Already a member? <Link to="/login">Log in</Link>
              </div>
            </>
          )}

          {/* confirm code + new password */}
          {stage === "confirm" && (
            <>
              <label className="reset-label">Verification code</label>
              <div className="reset-input">
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <i className="fa-solid fa-key" />
              </div>

              <label className="reset-label">New password</label>
              <div className="reset-input">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                />
                <i className="fa-solid fa-lock" />
              </div>

              <label className="reset-label">Confirm new password</label>
              <div className="reset-input">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  required
                />
                <i className="fa-solid fa-lock" />
              </div>

              <button type="button" className="btn-primary w-100" onClick={changePassword}>
                Change password
              </button>

              <div className="reset-footer">
                <Link to="/login">Back to Sign In</Link>
              </div>
            </>
          )}

          {msg && (
            <p className="reset-msg" style={{ color: /sent|changed|Redirecting/i.test(msg) ? "green" : "red" }}>
              {msg}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: info column */}
      <div className="reset-right">
        <div className="reset-right-inner">
          <img
            src={resetImage}
            alt="Reset Password Illustration"
            style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: "12px" }}
          />
          <h2>Lost password?</h2>
          <p>No worries. Let’s get you a new one quickly!</p>
        </div>
      </div>
    </div>
  );
}
