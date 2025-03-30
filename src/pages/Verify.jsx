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

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="lead">Verifying your login link...</p>
      </div>
    </div>
  );
}
