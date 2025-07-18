import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { tokenService, adminAPI } from '../services/api'

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      const token = tokenService.getToken()
      
      if (!token) {
        setIsAuthenticated(false)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)

      // Double-check admin status as a safety measure
      try {
        const adminStatus = await adminAPI.checkAdmin()
        setIsAdmin(adminStatus)
      } catch (error) {
        // If admin check fails, clear token and redirect to login
        tokenService.removeToken()
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
      
      setIsLoading(false)
    }
    
    checkAuthAndAdmin()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    // User has token but is not admin, redirect to login
    tokenService.removeToken()
    return <Navigate to="/" replace />
  }
  
  return children
}

export default ProtectedRoute
