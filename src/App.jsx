import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { tokenService } from './services/api'
import Login from './pages/auth/Login'
import MainPage from './pages/MainPage/MainPage'
import BookBoxDetail from './pages/bookbox/BookBoxDetail'
import BookBoxStats from './pages/bookbox/BookBoxStats'
import RegisterBookBox from './pages/bookbox/RegisterBookBox'
import UpdateBookBoxPage from './pages/bookbox/UpdateBookBoxPage'
import LookupTransactions from './pages/transactions/LookupTransactions'
import ProtectedRoute from './utils/ProtectedRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const authenticated = tokenService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/main" replace /> : <Login />
          } 
        />
        <Route 
          path="/main" 
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book-box/:id" 
          element={
            <ProtectedRoute>
              <BookBoxDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book-box/:id/stats" 
          element={
            <ProtectedRoute>
              <BookBoxStats />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register-book-box" 
          element={
            <ProtectedRoute>
              <RegisterBookBox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/update-book-box/:id" 
          element={
            <ProtectedRoute>
              <UpdateBookBoxPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lookup-transactions" 
          element={
            <ProtectedRoute>
              <LookupTransactions />
            </ProtectedRoute>
          } 
        />
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
