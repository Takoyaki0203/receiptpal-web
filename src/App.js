import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./auth/Register.js";
import Login from "./auth/Login.js";
import ConfirmSignup from "./auth/ConfirmSignup.js";
import ResetPassword from "./auth/ResetPassword.js"; 
import Home from "./pages/Home.jsx";
import Upload from "./pages/Upload.js";
import Expenses from "./pages/Expenses.jsx";
import About from "./pages/About.js";
import AccountSettings from "./pages/AccountSettings.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.js";
import Layout from "./components/Layout.js";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Router>
        <Routes>
          {/* Public auth routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/confirm" element={<ConfirmSignup />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* Public pages */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />

          {/* Protected pages */}
          <Route
            path="/expenses"
            element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>}
          />
          <Route
            path="/upload"
            element={<ProtectedRoute><Layout><Upload /></Layout></ProtectedRoute>}
          />
          <Route
            path='/settings'
            element={<ProtectedRoute><Layout><AccountSettings/></Layout></ProtectedRoute>}
          />
        </Routes>
      </Router>
    </div>
  );
}
