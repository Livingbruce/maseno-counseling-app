import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Mock authentication for demo
      if (email === 'admin@maseno.ac.ke' && password === '123456') {
        const mockUser = {
          id: 1,
          name: 'Admin User',
          email: 'admin@maseno.ac.ke',
          is_admin: true
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return { data: { token: mockToken, counselor: mockUser } };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      // Clear any existing auth data on login failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };