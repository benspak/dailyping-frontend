import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">DailyPing</Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-controls="navbarNav"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={() => setExpanded(false)}>Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/respond" onClick={() => setExpanded(false)}>Respond</Link>
                </li>
                {user.pro && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/pro-settings" onClick={() => setExpanded(false)}>Pro Settings</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback" onClick={() => setExpanded(false)}>Feedback</Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
