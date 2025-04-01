import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Verify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      axios.post(`https://api.dailyping.org/auth/verify`, { token })
        .then(res => {
          login(res.data.token, res.data.user);
          navigate('/dashboard');
        })
        .catch(() => {
          alert('Verification failed');
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [params, navigate, login]);

  return <div className="container mt-5">Verifying...</div>;
}
