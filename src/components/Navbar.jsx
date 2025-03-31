import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isPro, setIsPro] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetch('https://api.dailyping.org/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.pro) setIsPro(true);
        })
        .catch(() => {});
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">DailyPing</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-2">
            {token && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/respond">Respond</Link>
                </li>
                {isPro && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/pro-settings">Pro Settings</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback">Feedback</Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm">Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
