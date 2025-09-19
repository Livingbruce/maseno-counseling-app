import React, { createContext, useContext, useState, useEffect } from 'react'

// Version 1.0.5 - Final fix for JSON parse error and function hoisting - FORCE NEW BUILD - 2025-01-19 15:47

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Mock API response for demo
        const mockUser = {
          id: 1,
          name: 'Admin User',
          email: 'admin@maseno.ac.ke',
          is_admin: true
        };
        
        // Simulate API call
        setTimeout(() => {
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(mockUser));
        }, 100);
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const loginUser = async (email, password) => {
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
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: 'Login error: ' + error.message
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    loginUser,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
