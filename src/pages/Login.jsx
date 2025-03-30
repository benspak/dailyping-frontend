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
      setStatus('✅ Check your email for the login link!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Error sending login email.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '480px' }}>
        <div className="card shadow-sm p-4">
          <h2 className="mb-3 text-center">Login</h2>
          <p className="text-muted text-center mb-4">
            Enter your email to receive a secure login link.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label visually-hidden">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-dark w-100">
              Send Login Link
            </button>
          </form>
          {status && <div className="alert alert-info mt-4 text-center">{status}</div>}
        </div>
      </div>
    </div>
  );
}
