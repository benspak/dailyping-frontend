import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SetUsername() {
  const { user, refresh } = useAuth();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://api.dailyping.org/api/user/set-username',
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage(`You picked the username: ${username}`);
        setError('');
        await refresh();
        setTimeout(() => {
          navigate('/goals');
        }, 1500); // Wait a moment so user can see the success message
      } else {
        setError(res.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setError('Username may already be taken or server error.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Choose a Username</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <button className="btn btn-primary mt-2" type="submit">
          Save Username
        </button>
      </form>

      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}
