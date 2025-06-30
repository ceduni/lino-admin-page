import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { tokenService } from './services/api'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import RegisterBookBox from './components/RegisterBookBox'
import ManageBookBoxes from './components/ManageBookBoxes'
import LookupTransactions from './components/LookupTransactions'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  // If user is already authenticated, redirect to dashboard
  const isAuthenticated = tokenService.isAuthenticated()

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/register-book-box" 
          element={
            <ProtectedRoute>
              <RegisterBookBox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/manage-book-boxes" 
          element={
            <ProtectedRoute>
              <ManageBookBoxes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/lookup-transactions" 
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
