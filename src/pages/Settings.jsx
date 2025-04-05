import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TonePreview from '../components/TonePreview';
import AdminPanel from "../components/AdminPanel";

export default function ProSettings() {
  const [preferences, setPreferences] = useState({
    pingTime: '',
    tone: '',
    timezone: '',
    weeklySummary: true
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return (window.location.href = '/login');

    axios.get('https://api.dailyping.org/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const prefs = res.data.preferences || {};
      setPreferences({
        pingTime: prefs.pingTime || '08:00',
        tone: prefs.tone || 'gentle',
        timezone: res.data.timezone || 'America/New_York',
        weeklySummary: prefs.weeklySummary !== false
      });
      setIsAdmin(res.data.isAdmin || false);
    }).catch(() => {
      window.location.href = '/';
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const savePreferences = async () => {
    const token = localStorage.getItem('token');
    try {
      setStatus('Saving...');
      await axios.post('https://api.dailyping.org/api/preferences', preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('✅ Preferences saved');
      setTimeout(() => setStatus(''), 2000);
    } catch {
      setStatus('❌ Error saving preferences');
    }
  };

  if (loading) return <div className="container py-5 text-center">Loading...</div>;

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4">Settings</h2>

        <div className="mb-3">
          <label className="form-label">Ping Time</label>
          <input
            type="time"
            className="form-control"
            name="pingTime"
            value={preferences.pingTime}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tone</label>
          <TonePreview
            selectedTone={preferences.tone}
            onToneChange={(newTone) => setPreferences((p) => ({ ...p, tone: newTone }))}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Timezone</label>
          <select
            className="form-select"
            name="timezone"
            value={preferences.timezone}
            onChange={handleChange}
          >
            {Intl.supportedValuesOf('timeZone').map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div className="form-check form-switch mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="weeklySummary"
            name="weeklySummary"
            checked={preferences.weeklySummary}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="weeklySummary">
            Send weekly summary email
          </label>
        </div>

        <button className="btn btn-dark" onClick={savePreferences}>Save Settings</button>
        {status && <p className="mt-3 text-muted">{status}</p>}
      </div>

      {isAdmin && (
        <div className="container mt-5">
          <AdminPanel />
        </div>
      )}
    </>
  );
}
