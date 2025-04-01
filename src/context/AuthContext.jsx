// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('https://api.dailyping.org/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
