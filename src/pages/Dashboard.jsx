// pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    axios.get('/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      });

    axios.get('/api/responses/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setResponses(res.data))
      .catch(() => setResponses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Welcome, {user?.email}</h1>
      <p><strong>Streak:</strong> {user?.streak?.current ?? 0} days</p>
      <p><strong>Pro status:</strong> {user?.pro ? '✅ Active' : '❌ Not active'}</p>

      <h3 className="mt-5">Past Goals</h3>
      <ul className="list-group mt-3">
        {responses.map((r) => (
          <li key={r._id} className="list-group-item">
            <strong>{r.date}:</strong> {r.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
