import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Feedback() {
  const [subject, setSubject] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('https://api.dailyping.org/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setLoggedIn(true);
    }).catch(() => {
      setLoggedIn(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post('https://api.dailyping.org/api/feedback', { subject, feedback }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('✅ Feedback sent!');
      setSubject('');
      setFeedback('');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to send feedback.');
    }
  };

  if (!loggedIn) return <div className="container py-5 text-center">You must be logged in to give feedback.</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Send Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-control"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Feedback</label>
          <textarea
            className="form-control"
            rows="5"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark">Submit Feedback</button>
        {status && <div className="mt-3 text-muted">{status}</div>}
      </form>
    </div>
  );
}
