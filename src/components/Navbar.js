// src/components/Navbar.js
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from 'aws-amplify/auth';
import awsExports from '../aws-exports';
import logo from "../assets/logo.png";

export default function Navbar() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    const name = localStorage.getItem("userName") || "User";
    setUserEmail(email);
    setUserName(name);
  }, []);

  const handleLogout = async () => {
    try {
      // end local Cognito session (and provider session when possible)
      await signOut({ global: true });
    } catch (_) {}

    const { oauth, aws_user_pools_web_client_id } = awsExports;

    // pick a sign-out redirect that matches this origin
    const signOutUrls = oauth.redirectSignOut.split(',');
    const redirectUri =
      signOutUrls.find(u => u.startsWith(window.location.origin)) ||
      signOutUrls.find(u => u.includes('localhost')) ||
      signOutUrls[0];

    const url =
      `https://${oauth.domain}/logout` +
      `?client_id=${encodeURIComponent(aws_user_pools_web_client_id)}` + // <-- real client id
      `&logout_uri=${encodeURIComponent(redirectUri)}`;

    window.location.assign(url);
  };

  const linkClass = ({ isActive }) =>
    "nav-link fw-semibold px-3" + (isActive ? " active" : "");

  return (
    <nav className="navbar navbar-expand-lg shadow-sm">
      <div className="container justify-content-center">
        <NavLink className="navbar-brand" to="/">
          <img src={logo} alt="Logo" width="120" />
        </NavLink>

        <div className="collapse navbar-collapse justify-content-between" id="navbarContent">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item"><NavLink className={linkClass} to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/upload">Upload</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/expenses">Expenses</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/about">About Us</NavLink></li>
          </ul>

          <div className="dropdown">
            <a
              href="#"
              className="d-flex align-items-center text-decoration-none"
              id="dropdownUser"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="user"
                width="32"
                height="32"
                className="rounded-circle"
              />
            </a>
            <ul className="dropdown-menu dropdown-menu-end text-small" aria-labelledby="dropdownUser">
              <li className="profile-info px-3">
                <strong>{userName || "User"}</strong>
                <small className="d-block">{userEmail}</small>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#">Account Settings</a></li>
              <li><a className="dropdown-item" href="#">Team</a></li>
              <li><a className="dropdown-item" href="#">Signatures</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-danger" href="#" onClick={handleLogout}>
                  Log out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
