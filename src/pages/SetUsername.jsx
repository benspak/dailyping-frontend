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
        navigate('/goals'); // now user should be hydrated with username
      } else {
        console.warn('Unexpected response:', res.data);
        setError(res.data.message || 'Unexpected error occurred.');
      }
    } catch (err) {
      console.error('Username submission failed:', err);

      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        if (status === 409) {
          setError('That username is already taken. Try something else.');
        } else if (status === 400) {
          setError(serverMessage || 'Invalid input.');
        } else {
          setError('A server error occurred. Please try again.');
        }

        console.warn('Server responded with:', status, serverMessage);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
        console.warn('No response received:', err.request);
      } else {
        setError('An unexpected error occurred.');
        console.warn('Error config:', err.config);
      }
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
