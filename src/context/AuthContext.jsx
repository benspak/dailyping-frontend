// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;

      try {
        const res = await axios.get('https://api.dailyping.org/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    };

    fetchMe();
  }, [token]);

  const handleSetToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken: handleSetToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
