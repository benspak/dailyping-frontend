import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('https://api.dailyping.org/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data);
        setLoading(false);

        // ✅ Redirect to set-username if no username
        if (!res.data.username && window.location.pathname !== '/set-username') {
          navigate('/set-username');
        }

      } catch (err) {
        console.error('Failed to fetch user:', err.message);
        setUser(null);
        setLoading(false);
        localStorage.removeItem('token');
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
