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
        // Try to verify token with API
        const response = await fetch('https://maseno-counseling-api.onrender.com/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const responseText = await response.text()
          console.log('API Response:', responseText) // Debug log
          
          if (!responseText || responseText === 'undefined' || responseText.trim() === '') {
            console.error('Invalid API response:', responseText)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return
          }
          
          try {
            const data = JSON.parse(responseText)
            // Handle the actual API response format
            const user = data.user
            if (user) {
              setUser(user)
              setIsAuthenticated(true)
              localStorage.setItem('user', JSON.stringify(user))
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response:', responseText)
            console.error('Response length:', responseText.length)
            console.error('Response type:', typeof responseText)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
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
      const response = await fetch('https://maseno-counseling-api.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const responseText = await response.text()
      if (!responseText || responseText === 'undefined') {
        console.error('Invalid API response:', responseText)
        return { 
          success: false, 
          error: 'Invalid server response' 
        }
      }
      
      try {
        const data = JSON.parse(responseText)
        
        if (response.ok && data.message === 'Login successful') {
          // Handle the actual API response format
          const token = data.token
          const user = data.user
          
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          setUser(user)
          setIsAuthenticated(true)
          return { success: true }
        } else {
          return { 
            success: false, 
            error: data.error || 'Login failed' 
          }
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText)
        console.error('Response length:', responseText.length)
        console.error('Response type:', typeof responseText)
        return { 
          success: false, 
          error: 'Invalid server response format' 
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: 'Network error: ' + error.message
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
