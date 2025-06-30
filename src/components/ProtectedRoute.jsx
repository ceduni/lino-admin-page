import { Navigate } from 'react-router-dom'
import { tokenService } from '../services/api'

function ProtectedRoute({ children }) {
  const isAuthenticated = tokenService.isAuthenticated()
  
  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default ProtectedRoute
