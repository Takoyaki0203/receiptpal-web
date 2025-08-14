// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./auth/Register";
import Login from "./auth/Login";
import ConfirmSignup from "./auth/ConfirmSignup";
import Upload from "./pages/Upload";
import Expenses from "./pages/Expenses";
import About from "./pages/About";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";

// (Optional) simple placeholders
const Home = () => <div className="container mt-5"><h1>Welcome to Receipt Scanner</h1></div>;

function App() {
  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Router>
        <Routes>
          {/* Public auth routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/confirm" element={<ConfirmSignup />} />

          {/* All app pages share the same Layout (Navbar + Footer) */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <Expenses />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <Upload />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
