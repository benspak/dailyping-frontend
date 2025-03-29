// pages/Login.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://api.dailyping.org/auth/request-login`, { email });
      setStatus('Check your email for the login link!');
    } catch (err) {
      setStatus('Error sending email.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="mb-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-dark">
          Send Login Link
        </button>
      </form>
      {status && <div className="alert alert-info mt-3">{status}</div>}
    </div>
  );
}
