import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [preferences, setPreferences] = useState({ pingTime: '', tone: '' });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get('https://api.dailyping.org/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setPreferences({
          pingTime: res.data.preferences?.pingTime || '08:00',
          tone: res.data.preferences?.tone || 'gentle',
        });
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    };

    const fetchResponses = async () => {
      try {
        const res = await axios.get('https://api.dailyping.org/api/responses/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResponses(res.data);
      } catch {
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchResponses();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_id')) {
      setTimeout(() => {
        fetchUserData(); // re-fetch after Stripe return
        window.history.replaceState({}, document.title, '/dashboard');
      }, 3000);
    }
  }, []);

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const savePreferences = async () => {
    const token = localStorage.getItem('token');
    try {
      setSaveStatus('Saving...');
      const res = await axios.post(
        'https://api.dailyping.org/api/preferences',
        {
          pingTime: preferences.pingTime,
          tone: preferences.tone
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSaveStatus('✅ Preferences saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('❌ Failed to save preferences.');
    }
  };

  const upgradeToPro = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://api.dailyping.org/billing/create-checkout-session', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.url;
    } catch {
      alert('Error starting checkout session.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Welcome Card */}
      <div className="card shadow-sm p-4 mb-4">
        <h2 className="mb-3 text-center">Welcome, {user?.email}</h2>
        <div className="d-flex flex-wrap justify-content-center gap-4">
          <div>
            <p className="mb-1 fw-bold text-muted text-center">Current Streak</p>
            <span className="badge bg-success fs-5">{user?.streak?.current ?? 0} days</span>
          </div>
          <div>
            <p className="mb-1 fw-bold text-muted text-center">Pro Status</p>
            <span className={`badge fs-5 ${user?.pro ? 'bg-primary' : 'bg-secondary'}`}>
              {user?.pro ? '✅ Active' : '❌ Not active'}
            </span>
          </div>
        </div>
      </div>

      {/* 🚀 Call to Action for Pro Upgrade */}
      {!user?.pro && (
        <div className="alert alert-warning shadow-sm mb-4 text-center">
          <h5 className="mb-2">⭐ Unlock Pro</h5>
          <p className="mb-3">Customize your ping time, choose a tone, get weekly reports & more.</p>
          <button className="btn btn-primary btn-sm" onClick={upgradeToPro}>Go Pro for $5/month</button>
        </div>
      )}

      {/* ⚙️ Pro Preferences */}
      {user?.pro && (
        <div className="card shadow-sm p-4 mb-4">
          <h4 className="mb-3">Pro Settings</h4>
          <div className="mb-3">
            <label className="form-label">Ping Time (24h format)</label>
            <input
              type="time"
              className="form-control"
              name="pingTime"
              value={preferences.pingTime}
              onChange={handlePrefChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tone</label>
            <select
              className="form-select"
              name="tone"
              value={preferences.tone}
              onChange={handlePrefChange}
            >
              <option value="gentle">Gentle</option>
              <option value="motivational">Motivational</option>
              <option value="snarky">Snarky</option>
            </select>
          </div>
          <button className="btn btn-dark" onClick={savePreferences}>
            Save Preferences
          </button>
          {saveStatus && <div className="mt-2 text-muted">{saveStatus}</div>}
        </div>
      )}

      {/* Past Goals */}
      <div>
        <h4 className="mb-3">Your Past Goals</h4>
        {responses.length === 0 ? (
          <p className="text-muted">No responses yet.</p>
        ) : (
          <ul className="list-group">
            {responses.map((r) => (
              <li key={r._id} className="list-group-item">
                <strong>{r.date}:</strong> {r.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
