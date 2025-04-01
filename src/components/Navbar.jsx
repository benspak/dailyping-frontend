// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null); // Clear auth context
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">DailyPing</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/respond">Respond</Link>
                </li>
                {user.pro && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/pro-settings">Pro Settings</Link>
                  </li>
                )}
                {user.isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/feedback">Feedback</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm">Logout</button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
