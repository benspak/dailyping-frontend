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

    axios.get('https://api.dailyping.org/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      });

    axios.get('https://api.dailyping.org/api/responses/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setResponses(res.data))
      .catch(() => setResponses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Welcome, {user.email}</h1>

      <div className="mb-4">
        <strong>Streak:</strong> {user.streak.current} days
        <br />
        <strong>Pro Status:</strong> {user.pro ? '✅' : '❌'}
      </div>

      <h4 className="mt-4">Past Goals</h4>
      <ul className="list-group">
        {goals.map(goal => (
          <li key={goal._id} className="list-group-item">
            <small>{goal.date}</small><br />
            {goal.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
