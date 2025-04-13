import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    // const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    setUser(null);
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
          aria-controls="navbarSupportedContent"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/backlog" onClick={() => setExpanded(false)}>Backlog</Link>
                </li>
                {/*<li className="nav-item">
                  <Link className="nav-link" to="/projects" onClick={() => setExpanded(false)}>🚧 Projects</Link>
                </li>*/}
                <li className="nav-item">
                  <Link className="nav-link" to="/goals" onClick={() => setExpanded(false)}>Goals</Link>
                </li>
                {/*<li className="nav-item">
                  <Link className="nav-link" to="/calendar" onClick={() => setExpanded(false)}>Calendar</Link>
                </li>*/}
                {/*<li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={() => setExpanded(false)}>🚧 Dashboard</Link>
                </li>*/}
                  <li className="nav-item">
                    <Link className="nav-link" to="/settings" onClick={() => setExpanded(false)}>Settings</Link>
                  </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/changelog" onClick={() => setExpanded(false)}>Changelog</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback" onClick={() => setExpanded(false)}>Feedback</Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={() => setExpanded(false)}>Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
