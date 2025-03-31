// components/RequirePro.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function RequirePro({ children }) {
  const [authorized, setAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthorized(false);
      return;
    }

    axios.get('https://api.dailyping.org/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setAuthorized(res.data.pro === true);
    }).catch(() => {
      setAuthorized(false);
    });
  }, []);

  if (authorized === null) return <div className="container py-5 text-center">Checking access...</div>;
  if (!authorized) return <Navigate to="/" />;

  return children;
}
