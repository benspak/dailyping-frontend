// src/pages/Verify.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Verify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      navigate('/');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.post('https://api.dailyping.org/auth/verify', { token });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user); // update context
        navigate('/goals');
      } catch (err) {
        console.error('❌ Verification failed:', err.message);
        alert('Login link is invalid or expired.');
        navigate('/');
      }
    };

    verifyToken();
  }, [params, navigate, setUser]);

  return <div className="container mt-5">Verifying...</div>;
}
