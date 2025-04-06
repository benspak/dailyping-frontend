import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SetUsername() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://api.dailyping.org/api/set-username', { username }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err) {
      setStatus(err.response?.data?.error || '❌ Error saving username');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="mb-3 text-center">Pick your username</h2>
        <p className="text-muted text-center mb-4">
          This will be used for sharing your goals publicly (e.g. <code>dailyping.org/user/yourname</code>).
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="e.g. yourname123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button className="btn btn-dark w-100" type="submit">Save and continue</button>
        </form>

        {status && <p className="mt-3 text-center text-muted">{status}</p>}
      </div>
    </div>
  );
}
