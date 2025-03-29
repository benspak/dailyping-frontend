// pages/Verify.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Verify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      axios.post(`https://api.dailyping.org/auth/verify`, { token })
        .then(res => {
          localStorage.setItem('token', res.data.token);
          navigate('/dashboard');
        })
        .catch(() => {
          alert('Verification failed');
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [params, navigate]);

  return <div className="container mt-5 px-3">Verifying...</div>;
}
