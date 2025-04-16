import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Footer() {
  const [goalsCompleted, setGoalsCompleted] = useState(null);

  useEffect(() => {
    axios.get('https://api.dailyping.org/api/stats/today')
      .then(res => setGoalsCompleted(res.data.goalsCompleted))
      .catch(err => console.error('Failed to fetch daily stats:', err));
  }, []);

  return (
    <footer className="bg-light text-muted border-top mt-5 py-4">
      <div className="container text-center text-md-start">
        <div className="row">
          {/* DailyPing Info */}
          <div className="col-md-4 mb-3">
            <h5 className="text-dark">DailyPing</h5>
            <p>Your ADHD-friendly productivity buddy. Just one goal a day.</p>
            {goalsCompleted !== null && (
              <p className="fw-bold mt-3">
                ✅ {goalsCompleted.toLocaleString()} goals completed today
              </p>
            )}
          </div>

          {/* Links */}
          <div className="col-md-4 mb-3">
            <h6 className="text-dark">Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/faq" className="text-reset text-decoration-none">FAQ</Link></li>
              <li><Link to="/privacy" className="text-reset text-decoration-none">Privacy Policy</Link></li>
              {/*<li><Link to="/terms" className="text-reset text-decoration-none">Terms of Service</Link></li>*/}
            </ul>
          </div>

          {/* Contact / Social */}
          <div className="col-md-4 mb-3">
            <h6 className="text-dark">Connect</h6>
            <ul className="list-unstyled">
              <li><a href="https://x.com/benvspak" target="_blank" rel="noopener noreferrer" className="text-reset text-decoration-none">X</a></li>
              <li><a href="https://github.com/benspak" target="_blank" rel="noopener noreferrer" className="text-reset text-decoration-none">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-3">
          <small>© {new Date().getFullYear()} DailyPing. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
