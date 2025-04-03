import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false); // Collapse menu after click
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={handleNavClick}>DailyPing</Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          aria-controls="navbarNav"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={handleNavClick}>Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/respond" onClick={handleNavClick}>Respond</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback" onClick={handleNavClick}>Feedback</Link>
                </li>
                {user.pro && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/pro-settings" onClick={handleNavClick}>Pro Settings</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={handleNavClick}>Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
